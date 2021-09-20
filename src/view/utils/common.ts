import { UNCATEGORIZED_GROUP_NAME, union_arrays } from "~/common";

export const ensure_number = (value: any, def: number) => {
  let num = value;
  if (typeof value === "string") {
    num = parseInt(value);
  }
  if (isNaN(num)) {
    return def ?? 0;
  }
  return num;
};

export const insert_text_at_selection = (
  text: string,
  snippet: string,
  max_length: number,
  input_ref: preact.RefObject<HTMLTextAreaElement>
) => {
  const { selectionStart = text.length, selectionEnd = text.length } =
    input_ref.current ?? {};

  const chars_allowed =
    max_length - (text.length - (selectionEnd - selectionStart));
  if (chars_allowed < 1) {
    input_ref.current?.focus();
    return [text, text.length] as const;
  }
  if (chars_allowed < snippet.length) {
    snippet = snippet.slice(0, chars_allowed);
  }
  const text_start = text?.slice(0, selectionStart) ?? "";
  let text_end = text?.slice(selectionEnd) ?? "";
  if (
    snippet.startsWith(" ") &&
    (!text || text_start.endsWith(" ") || selectionStart === 0)
  ) {
    snippet = snippet.slice(1);
  }
  if (snippet.endsWith(" ") && text_end.startsWith(" ")) {
    text_end = text_end.slice(1);
  }
  return [
    `${text_start}${snippet}${text_end}`.slice(0, max_length),
    `${text_start}${snippet}`.length,
  ] as const;
};

const UPPERCASE =
  /[A-ZÀ-ÞĀĂĄĆĈĊČĎĐĒĔĖĘĚĜĞĠĢĤĦĨĪĬĮİĲĴĶĹĻĽĿŁŃŅŇŊŌŎŐŒŔŖŘŚŜŞŠŢŤŦŨŪŬŮŰŲŴŶŸŹŻŽƁƂƄƆƇƉƊƋƎƏƐƑƓƔƖƗƘƜƝƟƠƢƤƦƧƩƬƮƯƱƲƳƵƷƸƼǄǇǊǍǏǑǓǕǗǙǛǞǠǢǤǦǨǪǬǮǱǴǶǷǸǺǼǾȀȂȄȆȈȊȌȎȐȒȔȖȘȚȜȞȠȢȤȦȨȪȬȮȰȲȺȻȽȾɁɃɄɅɆɈɊɌɎͰͲͶͿΆΈΉΊΌΎΏΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩΪΫϏϘϚϜϞϠϢϤϦϨϪϬϮϴ]/;
// taken/modified from https://stackoverflow.com/a/17265031
export const match_case = (
  text: string,
  pattern: string,
  discard?: string | RegExp
) => {
  let result = "";

  for (let i = 0; i < text.length; i++) {
    const c = text.charAt(i);
    const p = pattern.charAt(i);
    if (
      discard &&
      (typeof discard === "string"
        ? discard === c || discard.includes(c)
        : discard.test(c))
    ) {
      continue;
    }

    if (UPPERCASE.test(p)) {
      result += c.toLocaleUpperCase();
    } else {
      result += c.toLocaleLowerCase();
    }
  }

  return result;
};

export const get_uncategorized_messages = (
  messages: TTS.Message[],
  categories: TTS.MessageCategory[],
  uncategorized?: TTS.MessageCategory
): TTS.MessageCategory => {
  const uncat_msgs = messages
    .filter(m => !categories.some(c => c.data.includes(m.id)))
    .map(m => m.id);

  let data = union_arrays(
    uncategorized?.data.filter(
      id =>
        messages.some(m => m.id === id) &&
        !categories.some(c => c.data.includes(id))
    ) ?? [],
    uncat_msgs
  );

  return {
    ...(uncategorized ?? { name: UNCATEGORIZED_GROUP_NAME, open: false }),
    data,
  };
};

export const snippet_to_string = (snippet: TTS.Snippet): string =>
  `${snippet.options.space_before ? " " : ""}${snippet.options.prefix ?? ""}${
    snippet.text
  }${snippet.options.suffix ?? ""}${snippet.options.space_after ? " " : ""}`;
