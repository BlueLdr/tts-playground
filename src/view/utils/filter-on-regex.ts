// filters/sorts the options based on the text typed in the input
import { capitalize, comparator } from "~/common";

// https://stackoverflow.com/a/6969486
export const escape_regex_str = str =>
  str
    .replace(/[\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&")
    .replace(/(\[.*)-(.*\])/g, "$1\\-$2");

export const filter_options_with_score = <T>(
  text: string,
  options: readonly T[],
  test_option: (opt: T, regex: RegExp) => boolean
): ScoredMatch<T>[] => {
  if (!text) {
    return options.map(opt => ({ opt, score: 0 }));
  }
  //escape the text so it doesn't break the tester
  const esc_text = escape_regex_str(text);

  const rA = new RegExp(esc_text, "i");
  // regexes to determine how closely the text matches each option
  // 0. Matches the text exactly
  const r0 = new RegExp(`^${esc_text}$`, "i");
  // 1. Matches the very beginning of the option
  const r1 = new RegExp(`^${esc_text}`, "i");
  // 2. Text is preceded by a word boundary
  const r2 = new RegExp(`\b${esc_text}`, "i");
  // 3. Text is preceeded by any lowercase letter or number,
  // and first char of text is capitalized
  const r3 = new RegExp(`[a-z0-9]${escape_regex_str(capitalize(text))}`);
  // 4. Text is preceeded by any non-alphanumeric char
  const r4 = new RegExp(`[^\w]${esc_text}`, "i");

  const matches = options
    // filter out options that don't match at all
    .filter(opt => test_option(opt, rA))

    // get the score for each option
    .map((opt: T) => {
      if (test_option(opt, r0)) {
        return { score: 5, opt };
      }
      if (test_option(opt, r1)) {
        return { score: 4, opt };
      }
      if (test_option(opt, r2)) {
        return { score: 3, opt };
      }
      if (test_option(opt, r3)) {
        return { score: 2, opt };
      }
      if (test_option(opt, r4)) {
        return { score: 1, opt };
      }
      return { score: 0, opt };
    });

  // sort by score (descending) and return the result
  return matches.sort(comparator("score", "desc"));
};

export const filter_options = <T>(
  text: string,
  options: readonly T[],
  test_option: RegexFilterFunction<T>
): T[] =>
  filter_options_with_score(text, options, test_option).map(({ opt }) => opt);

export const filter_options_by_props = <T extends object>(
  text: string,
  options: T[],
  keys: StringPropOf<T>[]
): T[] => {
  if (!text) {
    return options;
  }
  const matches: { [K in StringPropOf<T>]?: ScoredMatch<T>[] } = {};
  keys.forEach(k => {
    matches[k] = filter_options_with_score(text, options, (opt, regex) =>
      // @ts-expect-error: even with the type dec, ts still doesn't think opt[k] is a string
      regex.test(opt[k])
    );
  });

  let results: ScoredMatch<T>[] = [];
  keys.forEach(k => {
    if (matches[k]) {
      results = results.concat(matches[k]);
    }
  });
  return results.sort(comparator("score", "desc")).map(({ opt }) => opt);
};
