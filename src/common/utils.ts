export type ArrayInsertPosSpecifier<T> =
  | "start"
  | "end"
  | ((a: T, b: T) => -1 | 0 | 1);

// helper functions to manipulate arrays without mutating the original copy
export const add_item_to = <T>(
  list: readonly T[],
  item: T,
  pos: ArrayInsertPosSpecifier<T> = "end"
): T[] => {
  if (!item) {
    return list ? list.slice() : [];
  }
  if (!list) {
    list = [];
  }
  if (list.length === 0) {
    return [item];
  }
  if (typeof pos === "function") {
    let index = -1;
    let i = 0;
    while (i < list.length && index < 0) {
      const comp = pos(item, list[i]);
      if (comp === 1) {
        i++;
      } else {
        index = i;
      }
    }
    if (index !== 0 && index !== list.length - 1) {
      return [...list.slice(0, index), item, ...list.slice(index)];
    }

    pos = index === 0 ? "start" : "end";
  }
  return pos === "start" ? [item].concat(list) : list.concat([item]);
};

export const remove_item_from = <T>(
  list: readonly T[],
  match: (item: T, index?: number) => boolean
): T[] => {
  const index = list.findIndex(match);
  if (index === -1) return list.slice();
  return list.slice(0, index).concat(list.slice(index + 1));
};

export const replace_item_in = <T>(
  list: readonly T[],
  match: (item: T, index?: number) => boolean,
  new_item: T,
  append_if_missing?: ArrayInsertPosSpecifier<T>
): T[] => {
  const index = list.findIndex(match);
  if (index === -1) {
    return append_if_missing
      ? add_item_to(list, new_item, append_if_missing)
      : list.slice();
  }
  return list
    .slice(0, index)
    .concat([new_item])
    .concat(list.slice(index + 1));
};

export const deep_equals = (
  a: any,
  b: any,
  max_depth: number = 10,
  assume_different_after_max_depth: boolean = false,
  depth: number = 0
) => {
  if (depth > max_depth) {
    return assume_different_after_max_depth;
  }
  if (a === b) {
    return true;
  }
  const ta = typeof a;
  const tb = typeof b;
  if (tb !== ta) {
    return false;
  }
  if (a === null || b === null) {
    return a === null && b === null;
  }
  if (Array.isArray(a) && Array.isArray(b)) {
    return (
      a.length === b.length &&
      a.every((v, i) =>
        deep_equals(
          v,
          b[i],
          max_depth,
          assume_different_after_max_depth,
          depth + 1
        )
      )
    );
  }
  if (ta === "object") {
    const ea = Object.entries(a);
    const eb = Object.entries(b);
    return (
      ea.length === eb.length &&
      ea.every(
        ([k, v]) =>
          k in b &&
          deep_equals(
            v,
            b[k],
            max_depth,
            assume_different_after_max_depth,
            depth + 1
          )
      )
    );
  }
  return a === b;
};
