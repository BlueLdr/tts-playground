export type ArrayInsertPosSpecifier<T> =
  | "start"
  | "end"
  | number
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
  let index = typeof pos === "number" ? pos : -1;
  if (typeof pos === "function") {
    let i = 0;
    while (i < list.length && index < 0) {
      const comp = pos(item, list[i]);
      if (comp === 1) {
        i++;
      } else {
        index = i;
      }
    }
  }
  if (index > 0 && index < list.length) {
    return [...list.slice(0, index), item, ...list.slice(index)];
  } else if (typeof pos !== "string") {
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

export const union_arrays = <T>(
  arr1: T[],
  arr2: T[],
  is_equal?: keyof T | ((a: T, b: T) => boolean)
) =>
  arr1.concat(
    arr2.filter(b => {
      if (arr1.length === 0) {
        return arr2;
      }
      if (arr2.length === 0) {
        return arr1;
      }
      if (is_equal != null) {
        if (typeof is_equal === "function") {
          return !arr1.some(a => is_equal(b, a));
        }
        return !arr1.some(a => a[is_equal] === b[is_equal]);
      }
      return !arr1.includes(b);
    })
  );

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

export const do_alert = (...args) => {
  const focused = document.activeElement;
  alert(...args);
  if (focused instanceof HTMLElement) {
    focused?.focus();
  }
};

export const do_confirm = (...args) => {
  const focused = document.activeElement;
  const result = confirm(...args);
  if (focused instanceof HTMLElement) {
    focused?.focus();
  }
  return result;
};

export const random_hex_str = (length: number) => {
  if (length <= 0) {
    return "";
  }
  const multiple = Math.pow(10, length * 2);
  const min = parseInt("f".repeat(length - 1), 16);

  let num;
  while ((num = Math.round(Math.random() * multiple)) <= min) {}

  return num.toString(16).slice(-length);
};

export const generate_id = (base: string) => {
  const d = Date.now().toString(16);
  const r = random_hex_str(16 - d.length);
  const rd = `${r.slice(0, Math.round(r.length / 2))}${d}${r.slice(
    Math.round(r.length / 2)
  )}`.split("");
  const n = base.split("").map(c => (c.charCodeAt(0) % 16).toString(16));
  if (n.length < 16) {
    n.push(...random_hex_str(16 - n.length).split(""));
  }
  return n
    .slice(0, 16)
    .map((c, i) => `${rd[i]}${c}`)
    .join("");
};
