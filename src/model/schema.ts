import { DEFAULT_BITS_STRING } from "~/common";

export type TypeString<T extends boolean | string | number> = T extends boolean
  ? "boolean"
  : T extends string
  ? "string"
  : T extends number
  ? "number"
  : never;

export type SchemaOfProperty<T extends boolean | string | number> = {
  type: TypeString<T>;
  default?: T;
};

export type SchemaProp<T extends object, K extends keyof T> = T[K] extends
  | boolean
  | string
  | number
  ? SchemaOfProperty<T[K]>
  : T[K] extends (infer F)[]
  ? F extends object
    ? { type: SchemaOf<F>; default: {} | null }
    : never
  : T[K] extends object
  ? { type: SchemaOf<T[K]>; default: {} | null }
  : never;

export type SchemaOf<T extends object> = {
  [K in keyof T]: SchemaProp<T, K>;
};

export const SETTINGS_SCHEMA: SchemaOf<TTS.EditorSettings> = {
  open: { type: "boolean", default: false },
  insert_at_cursor: { type: "boolean", default: false },
  trim_whitespace: { type: "boolean", default: false },
  voice: { type: "string", default: "Brian" },
  bits_string: { type: "string", default: DEFAULT_BITS_STRING },
};

export const SNIPPET_OPTIONS_SCHEMA: SchemaOf<TTS.SnippetOptions> = {
  prefix: { type: "string", default: "" },
  suffix: { type: "string", default: "" },
  space_before: { type: "boolean", default: false },
  space_after: { type: "boolean", default: false },
  default_count: { type: "number", default: 1 },
} as const;

export const SNIPPET_SCHEMA: SchemaOf<TTS.Snippet> = {
  text: { type: "string" },
  options: {
    type: SNIPPET_OPTIONS_SCHEMA,
    default: {},
  },
} as const;

export const SNIPPET_SECTION_SCHEMA: SchemaOf<TTS.SnippetsSection> = {
  name: { type: "string" },
  open: { type: "boolean", default: false },
  data: { type: SNIPPET_SCHEMA, default: null },
} as const;

export const MESSAGE_OPTIONS_SCHEMA: SchemaOf<TTS.MessageOptions> = {
  max_length: { type: "number", default: 255 },
  speed: { type: "boolean", default: false },
  bits: { type: "string", default: "" },
};

export const MESSAGE_SCHEMA: SchemaOf<TTS.Message> = {
  name: { type: "string" },
  text: { type: "string" },
  options: {
    type: MESSAGE_OPTIONS_SCHEMA,
    default: {},
  },
};

export const conform_to_schema = <T extends object, K extends object>(
  data: T,
  schema: SchemaOf<K>
): K | null => {
  // @ts-expect-error:
  const output: K = {};
  let failed = false;
  Object.entries(schema).forEach(<PK extends keyof K>([key, type]) => {
    if (failed) {
      return;
    }
    if (typeof type.type !== "string") {
      if (Array.isArray(data[key])) {
        const arr = [];
        data[key].forEach(d => {
          const conformed = conform_to_schema(d, type.type);
          if (conformed) {
            arr.push(conformed);
          }
        });
        output[key] = arr;
      } else if (key in data) {
        const conformed = conform_to_schema(data[key], type.type);
        if (conformed) {
          output[key] = conformed;
        } else if (!!type.default) {
          failed = true;
        }
      }
    } else if (!(key in data) || typeof data[key] !== type.type) {
      if (!("default" in type)) {
        failed = true;
      }
      output[key] = type.default;
    } else {
      output[key] = data[key];
    }
  });
  return failed ? null : output;
};