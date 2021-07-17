import { deep_equals } from "~/common";
import {
  conform_to_schema,
  MESSAGE_SCHEMA,
  SETTINGS_SCHEMA,
  SNIPPET_SCHEMA,
  SNIPPET_SECTION_SCHEMA,
} from "~/model";

const MAX_TYPE_CHECK_DEPTH = 6;
export const MESSAGE_DUPE_PROPS: readonly (keyof TTS.MessageOptions)[] = [
  "speed",
  "max_length",
] as const;
export const SNIPPET_DUPE_PROPS: readonly (keyof TTS.SnippetOptions)[] = [
  "prefix",
  "suffix",
];

export const export_messages = (
  data: TTS.Message[]
): TTS.ExportData["messages"] => {
  return data.map(m => ({
    ...conform_to_schema(m, MESSAGE_SCHEMA),
    __type: "message",
  }));
};
export const export_snippets = (
  data: TTS.SnippetsSection[]
): TTS.ExportData["snippets"] => {
  return data.map(s => ({
    ...conform_to_schema({ ...s, data: [] }, SNIPPET_SECTION_SCHEMA),
    __type: "snippets-section" as const,
    data: s.data.map(sn => ({
      ...conform_to_schema(sn, SNIPPET_SCHEMA),
      __type: "snippet" as const,
    })),
  }));
};

export const generate_file = (data: object) => JSON.stringify(data, null, "  ");

export const is_duplicate_message = (a: TTS.Message, b: TTS.Message) =>
  a.text === b.text && MESSAGE_DUPE_PROPS.every(k => a[k] === b[k]);

export const is_duplicate_snippet = (a: TTS.Snippet, b: TTS.Snippet) =>
  a.text === b.text &&
  SNIPPET_DUPE_PROPS.every(k => a.options[k] === b.options[k]);

export const import_data = (
  data: TTS.AnyExportData,
  settings: TTS.EditorSettings,
  messages: TTS.Message[],
  snippets: TTS.SnippetsSection[]
) => {
  let new_messages: TTS.Message[] = [];
  let new_snippets: TTS.SnippetsSection[] = [];

  const dup_messages: TTS.Message[] = [];
  const rename_messages: TTS.Message[] = [];
  const uncategorized_snippets: TTS.Snippet[] = [];
  const dup_snippets_in_section: TTS.SnippetsSection[] = [];
  const merge_snippet_sections: TTS.SnippetsSection[] = [];

  const process_message = (msg: TTS.Message) => {
    const dupe =
      messages.find(m => is_duplicate_message(m, msg)) ||
      new_messages.find(m => is_duplicate_message(m, msg));
    if (dupe) {
      if (dupe.name !== msg.name) {
        dup_messages.push(msg);
      }
    } else if (
      messages.find(m => m.name === msg.name) ||
      new_messages.find(m => m.name === msg.name)
    ) {
      rename_messages.push(msg);
    } else {
      new_messages.push(msg);
    }
  };

  const process_snippet_section = (section: TTS.SnippetsSection) => {
    const existing = new_snippets.find(s => s.name === section.name);
    if (existing) {
      return existing;
    }
    const new_section = { ...section, data: [] };
    new_snippets.push(new_section);
    return new_section;
  };

  const process_snippet = (
    snip: TTS.Snippet,
    section?: TTS.SnippetsSection
  ) => {
    let search = uncategorized_snippets;
    if (section) {
      section = process_snippet_section(section);
      search = section.data;
    }
    const dupe =
      search.find(s => is_duplicate_snippet(s, snip)) ||
      snippets
        .find(sect => sect.name === section?.name)
        ?.data?.find(s => is_duplicate_snippet(s, snip));

    if (!dupe) {
      if (!section) {
        uncategorized_snippets.push(snip);
      } else {
        section.data.push(snip);
      }
      return;
    }
    if (deep_equals(snip, dupe)) {
      return;
    }
    if (!section) {
      return;
    }

    const existing = dup_snippets_in_section.find(s => s.name === section.name);
    if (existing) {
      existing.data.push(snip);
    } else {
      const new_section = { ...section, data: [snip] };
      dup_snippets_in_section.push(new_section);
    }
  };

  let settings_result;
  let messages_result;
  let snippets_result;
  if (!Array.isArray(data)) {
    if (data.__type === "export-data") {
      const {
        settings: new_settings,
        messages: imp_messages,
        snippets: imp_snippets,
      } = data;

      if (new_settings) {
        const { __type, ...new_settings_ } = new_settings;
        settings_result = { ...settings, ...new_settings_ };
      }
      imp_messages.forEach(({ __type, ...m }) => {
        if (__type === "message") {
          process_message(m);
        }
      });
      imp_snippets.forEach(({ __type, ...s }) => {
        if (__type === "snippets-section") {
          s.data.forEach(({ __type, ...snip }) => process_snippet(snip, s));
        }
      });
    } else if (data.__type === "settings") {
      const { __type, ...new_settings } = data;
      settings_result = { ...settings, ...new_settings };
    } else if (data.__type === "message") {
      const { __type, ...new_message } = data;
      process_message(new_message);
    } else if (data.__type === "snippets-section") {
      const { __type, ...new_section } = data;
      new_section.data.forEach(({ __type, ...snip }) =>
        process_snippet(snip, new_section)
      );
    } else if (data.__type === "snippet") {
      const { __type, ...new_snippet } = data;
      process_snippet(new_snippet);
    }
  } else {
    data.forEach(({ __type, ...d }) => {
      if (__type === "message") {
        process_message(d as TTS.Message);
      } else if (__type === "snippets-section") {
        d.data.forEach(({ __type, ...snip }) =>
          process_snippet(snip as TTS.Snippet, d as TTS.SnippetsSection)
        );
      } else if (__type === "snippet") {
        process_snippet(d as TTS.Snippet);
      }
    });
  }

  if (new_messages.length > 0) {
    messages_result = messages.concat(new_messages);
  }

  new_snippets = new_snippets.filter(ns => {
    if (snippets.find(s => s.name === ns.name)) {
      if (ns.data.length > 0) {
        merge_snippet_sections.push(ns);
      }
      return false;
    }
    return true;
  });

  if (merge_snippet_sections.length > 0) {
    snippets_result = snippets.map(s => {
      const new_data = merge_snippet_sections.find(ns => ns.name === s.name);
      if (!new_data) {
        return s;
      }
      return { ...s, data: s.data.concat(new_data.data) };
    });
  }
  if (new_snippets.length > 0) {
    snippets_result = (snippets_result ?? snippets).concat(new_snippets);
  }

  return [
    settings_result,
    messages_result,
    snippets_result,
    dup_messages,
    rename_messages,
    dup_snippets_in_section,
    uncategorized_snippets.filter(
      snip =>
        !(snippets_result ?? snippets ?? []).find(
          (sect: TTS.SnippetsSection) => {
            if (!sect.data) {
              console.log(`what is this doing in here: `, sect);
            } else {
              return !!sect.data.find(s => is_duplicate_snippet(s, snip));
            }
          }
        )
    ),
  ] as const;
};

// ensure the data has a shape that we expect
export const validate_import_data = (
  data: object | object[],
  depth: number = 0,
  expected_type?: string
): TTS.AnyExportData | null => {
  if (depth > MAX_TYPE_CHECK_DEPTH) {
    return null;
  }
  if (Array.isArray(data)) {
    const validated = data
      .map(d => validate_import_data(d, depth + 1, expected_type))
      .filter(d => !!d);
    // if (validated.length > 0 && validated.every((v) => !!v)) {
    return validated as TTS.ExportData["messages"] | TTS.ExportData["snippets"];
    // }
    // return null;
  }

  if (
    !("__type" in data) ||
    typeof data["__type"] !== "string" ||
    (!!expected_type && data["__type"] !== expected_type)
  ) {
    return null;
  }

  if (data["__type"] === "export-data") {
    if (!data["snippets"] && !data["messages"] && !data["settings"]) {
      return null;
    }
    const output: TTS.ExportData = { __type: "export-data" };
    if (data["settings"]) {
      output.settings = validate_import_data(
        data["settings"],
        depth + 1
      ) as TTS.ExportData["settings"];
    }
    if (data["messages"]) {
      output.messages = validate_import_data(
        data["messages"],
        depth + 1,
        "message"
      ) as TTS.ExportData["messages"];
    }
    if (data["snippets"]) {
      output.snippets = validate_import_data(
        data["snippets"],
        depth + 1,
        "snippets-section"
      ) as TTS.ExportData["snippets"];
    }
    return output;
  }

  if (data["__type"] === "settings") {
    return { __type: "settings", ...conform_to_schema(data, SETTINGS_SCHEMA) };
  }

  if (data["__type"] === "message") {
    return { __type: "message", ...conform_to_schema(data, MESSAGE_SCHEMA) };
  }

  if (data["__type"] === "snippet") {
    return { __type: "snippet", ...conform_to_schema(data, SNIPPET_SCHEMA) };
  }

  if (data["__type"] === "snippets-section") {
    const { data: snippets, ...section } = data as TTS.ExportedSnippetsSection;
    return {
      __type: "snippets-section",
      ...conform_to_schema({ ...section, data: [] }, SNIPPET_SECTION_SCHEMA),
      data: snippets
        .filter(s => !!s)
        .map(
          s =>
            validate_import_data(s, depth + 1, "snippet") as TTS.ExportedSnippet
        )
        .filter(s => !!s),
    } as TTS.ExportedSnippetsSection;
  }

  return null;
};
