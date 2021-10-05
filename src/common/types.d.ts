type PropsOfType<T extends object, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

type RegexFilterFunction<T> = (item: T, regex: RegExp) => boolean;
type ScoredMatch<T> = { opt: T; score: number };
type StringPropOf<T extends object> = PropsOfType<T, string>;

type ObjectOf<T> = {
  [key: string]: T;
};
