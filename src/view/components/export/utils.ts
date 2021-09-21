import { deep_equals, generate_id } from "~/common";
import {
  conform_to_schema,
  MESSAGE_CATEGORY_SCHEMA,
  MESSAGE_SCHEMA,
  SETTINGS_SCHEMA,
  SNIPPET_SCHEMA,
  SNIPPET_SECTION_SCHEMA,
} from "~/model";
import { get_uncategorized_messages, snippet_to_string } from "~/view/utils";

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

export const export_message_category = (
  data: TTS.MessageCategory
): TTS.ExportedMessageCategory => {
  return {
    ...conform_to_schema(data, MESSAGE_CATEGORY_SCHEMA),
    __type: "message-category",
  };
};

export const export_message_categories = (
  data: TTS.MessageCategory[]
): TTS.ExportData["messageCategories"] => data.map(export_message_category);

export const export_snippet = (data: TTS.Snippet) => ({
  ...conform_to_schema(data, SNIPPET_SCHEMA),
  __type: "snippet" as const,
});

export const export_snippets = (
  data: TTS.Snippet[]
): TTS.ExportData["snippets"] => {
  return data.map(export_snippet);
};

export const export_snippets_section = (data: TTS.SnippetsSection) => ({
  ...conform_to_schema(data, SNIPPET_SECTION_SCHEMA),
  __type: "snippets-section" as const,
});

export const export_snippets_sections = (
  data: TTS.SnippetsSection[]
): TTS.ExportData["snippetsSections"] => {
  return data.map(export_snippets_section);
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
  snippets: TTS.Snippet[],
  categories: TTS.MessageCategory[],
  uncategorized_msgs: TTS.MessageCategory,
  snippets_sections: TTS.SnippetsSection[]
) => {
  let new_messages: TTS.Message[] = [];
  let new_categories: TTS.MessageCategory[] = [];
  let new_snippets: TTS.Snippet[] = [];
  let new_snippets_sections: TTS.SnippetsSection[] = [];
  let new_uncategorized_msgs: TTS.MessageCategory = {
    ...uncategorized_msgs,
    data: [...uncategorized_msgs.data],
  };

  const dup_messages: TTS.Message[] = [];
  const rename_messages: TTS.Message[] = [];
  const merge_categories: TTS.MessageCategory[] = [];
  const dup_snippets: TTS.Snippet[] = [];
  const merge_snippet_sections: TTS.SnippetsSection[] = [];

  const process_message = (msg: TTS.Message) => {
    const dupe =
      messages.find(m => is_duplicate_message(m, msg)) ||
      new_messages.find(m => is_duplicate_message(m, msg));
    const name_taken =
      messages.find(m => m.name === msg.name) ||
      new_messages.find(m => m.name === msg.name);
    if (dupe) {
      if (dupe.name !== msg.name && !name_taken) {
        dup_messages.push(msg);
      }
      return msg.id;
    }

    if (
      messages.find(m => m.id === msg.id) ||
      new_messages.find(m => m.id === msg.id)
    ) {
      msg = {
        ...msg,
        id: generate_id(msg.name),
      };
    }
    if (name_taken) {
      rename_messages.push(msg);
    } else {
      new_messages.push(msg);
    }
    return msg.id;
  };

  const process_message_category = (
    cat: TTS.MessageCategory | TTS.MessageCategoryPopulated
  ) => {
    const all_cats = categories.concat(new_categories);

    if (cat.name === uncategorized_msgs.name) {
      const category = {
        ...uncategorized_msgs,
        data: [...uncategorized_msgs.data],
      };
      cat.data.forEach(m => {
        let id: string = m;
        if (typeof m !== "string") {
          const { __type, ...msg } = m;
          id = process_message(msg);
        }
        if (
          !all_cats.find(c => c.data.includes(id)) &&
          !uncategorized_msgs.data.includes(id)
        ) {
          category.data.push(id);
        }
      });
      new_uncategorized_msgs = category;

      return;
    }

    const existing = new_categories.find(c => c.name == cat.name);

    const category = existing ??
      categories.find(c => c.name === cat.name) ?? {
        ...cat,
        data: [],
      };

    cat.data.forEach(m => {
      let id: string = m;
      if (typeof m !== "string") {
        const { __type, ...msg } = m;
        id = process_message(msg);
      }
      if (!all_cats.find(c => c.data.includes(id))) {
        category.data.push(id);
      }
    });

    if (!existing) {
      new_categories.push(category);
    }
    return category;
  };

  const process_snippet = (snip: TTS.Snippet) => {
    const dupe =
      snippets.find(s => is_duplicate_snippet(s, snip)) ||
      new_snippets.find(s => is_duplicate_snippet(s, snip));
    const exact =
      !!dupe &&
      deep_equals(
        { ...snip, id: "" },
        conform_to_schema({ ...dupe, id: "" }, SNIPPET_SCHEMA)
      );

    if (dupe) {
      if (!exact && !dup_snippets.some(s => is_duplicate_snippet(snip, s))) {
        dup_snippets.push(snip);
      }
      return snip.id;
    }

    if (
      snippets.some(s => s.id === snip.id) ||
      new_snippets.some(s => s.id === snip.id) /*||
      dup_snippets.some(s => s.id === snip.id)*/
    ) {
      snip = {
        ...snip,
        id: generate_id(snippet_to_string(snip)),
      };
    }

    new_snippets.push(snip);
    return snip.id;
  };

  const process_snippets_section = (
    sec: TTS.SnippetsSection | TTS.SnippetsSectionPopulated
  ) => {
    const all_sects = snippets_sections.concat(new_snippets_sections);

    const existing = new_snippets_sections.find(s => s.name === sec.name);
    const section = existing ??
      snippets_sections.find(s => s.name === sec.name) ?? {
        ...sec,
        data: [],
      };

    sec.data.forEach(s => {
      let id: string = s;
      if (typeof s !== "string") {
        const { __type, ...snip } = s;
        id = process_snippet(snip);
      }
      if (!all_sects.find(s => s.data.includes(id))) {
        section.data.push(id);
      }
    });

    if (!existing) {
      new_snippets_sections.push(section);
    }
    return section;
  };

  let settings_result: TTS.EditorSettings | undefined;
  let messages_result: TTS.Message[] | undefined;
  let categories_result: TTS.MessageCategory[] | undefined;
  let uncategorized_msgs_result: TTS.MessageCategory | undefined;
  let snippets_result: TTS.Snippet[] | undefined;
  let snippets_sections_result: TTS.SnippetsSection[] | undefined;
  if (!Array.isArray(data)) {
    if (data.__type === "export-data") {
      const {
        settings: new_settings,
        messages: imp_messages,
        messageCategories: imp_categories,
        snippets: imp_snippets,
        snippetsSections: imp_sections,
      } = data;

      if (new_settings) {
        const { __type, ...new_settings_ } = new_settings;
        settings_result = { ...settings, ...new_settings_ };
      }
      imp_messages?.forEach(({ __type, ...m }) => {
        if (__type === "message") {
          process_message(m);
        }
      });
      imp_categories?.forEach(({ __type, ...c }) => {
        if (__type === "message-category") {
          process_message_category(c as TTS.MessageCategory);
        }
      });
      imp_sections?.forEach(({ __type, ...s }) => {
        if (__type === "snippets-section") {
          process_snippets_section(s as TTS.SnippetsSection);
        }
      });
      imp_snippets?.forEach(({ __type, ...s }) => {
        if (__type === "snippet") {
          process_snippet(s);
        }
      });
    } else if (data.__type === "settings") {
      const { __type, ...new_settings } = data;
      settings_result = { ...settings, ...new_settings };
    } else if (data.__type === "message") {
      const { __type, ...new_message } = data;
      process_message(new_message);
    } else if (data.__type === "message-category") {
      const { __type, ...new_category } = data;
      // @ts-expect-error:
      process_message_category(new_category);
    } else if (data.__type === "snippets-section") {
      const { __type, ...new_section } = data;
      process_snippets_section(new_section as TTS.SnippetsSection);
    } else if (data.__type === "snippet") {
      const { __type, ...new_snippet } = data;
      process_snippet(new_snippet);
    }
  } else {
    data.forEach(({ __type, ...d }) => {
      if (__type === "message") {
        process_message(d as TTS.Message);
      } else if (__type === "message-category") {
        process_message_category(d as TTS.MessageCategory);
      } else if (__type === "snippets-section") {
        process_snippets_section(d as TTS.SnippetsSection);
      } else if (__type === "snippet") {
        process_snippet(d as TTS.Snippet);
      } else if (__type === "settings") {
        settings_result = { ...settings, ...d };
      }
    });
  }

  if (new_messages.length > 0) {
    messages_result = messages.concat(new_messages);
  }

  new_categories = new_categories
    .map(c => ({
      ...c,
      data: c.data.filter(m =>
        (messages_result ?? messages)
          .concat(dup_messages)
          .concat(rename_messages)
          .find(
            msg =>
              msg.id === (typeof m === "string" ? m : (m as TTS.Message).id)
          )
      ),
    }))
    .filter(nc => {
      if (nc.data.length === 0 || categories.find(c => c.name === nc.name)) {
        if (nc.data.length > 0) {
          merge_categories.push(nc);
        }
        return false;
      }
      return true;
    });
  if (merge_categories.length > 0) {
    categories_result = categories.map(c => {
      const new_data = merge_categories.find(nc => nc.name === c.name);
      if (!new_data) {
        return c;
      }
      return {
        ...c,
        data: c.data.concat(
          new_data.data
            .map(m => (typeof m === "string" ? m : (m as TTS.Message).id))
            .filter(m => !c.data.includes(m))
        ),
      };
    });
  }
  if (new_categories.length > 0) {
    categories_result = (categories_result ?? categories).concat(
      new_categories.map(c => ({
        ...c,
        data: c.data.map(m =>
          typeof m === "string" ? m : (m as TTS.Message).id
        ),
      }))
    );
  }

  uncategorized_msgs_result = {
    ...uncategorized_msgs,
    data: get_uncategorized_messages(
      messages_result ?? messages,
      categories_result ?? categories,
      new_uncategorized_msgs
    ).data,
  };

  const uncategorized_snippets = new_snippets.filter(
    sn =>
      !snippets_sections
        .concat(new_snippets_sections)
        .concat(merge_snippet_sections)
        .some(s =>
          s.data.some(
            snip =>
              sn.id ===
              (typeof snip === "string" ? snip : (snip as TTS.Snippet).id)
          )
        )
  );
  new_snippets = new_snippets.filter(
    s => !uncategorized_snippets.some(sn => sn.id === s.id)
  );

  if (new_snippets.length > 0) {
    snippets_result = snippets.concat(new_snippets);
  }
  new_snippets_sections = new_snippets_sections
    .map(s => ({
      ...s,
      data: s.data.filter(sn =>
        (snippets_result ?? snippets)
          .concat(dup_snippets)
          .find(
            snip =>
              snip.id === (typeof sn === "string" ? sn : (sn as TTS.Snippet).id)
          )
      ),
    }))
    .filter(ns => {
      if (
        ns.data.length === 0 ||
        snippets_sections.find(s => s.name === ns.name)
      ) {
        if (ns.data.length > 0) {
          merge_snippet_sections.push(ns);
        }
        return false;
      }
      return true;
    });

  if (merge_snippet_sections.length > 0) {
    snippets_sections_result = snippets_sections.map(s => {
      const new_data = merge_snippet_sections.find(ns => ns.name === s.name);
      if (!new_data) {
        return s;
      }
      return {
        ...s,
        data: s.data.concat(
          new_data.data
            .map(sn => (typeof sn === "string" ? sn : (sn as TTS.Snippet).id))
            .filter(sn => !s.data.includes(sn))
        ),
      };
    });
  }
  if (new_snippets_sections.length > 0) {
    snippets_sections_result = (
      snippets_sections_result ?? snippets_sections
    ).concat(
      new_snippets_sections.map(s => ({
        ...s,
        data: s.data.map(sn =>
          typeof sn === "string" ? sn : (sn as TTS.Snippet).id
        ),
      }))
    );
  }

  return [
    settings_result,
    messages_result,
    snippets_result,
    categories_result,
    snippets_sections_result,
    uncategorized_msgs_result,
    dup_messages,
    rename_messages,
    dup_snippets,
    uncategorized_snippets,
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
    return validated as
      | TTS.ExportData["messages"]
      | TTS.ExportData["snippets"]
      | TTS.ExportData["messageCategories"]
      | TTS.ExportData["snippetsSections"];
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
    if (
      !data["snippets"] &&
      !data["messages"] &&
      !data["settings"] &&
      !data["messageCategories"]
    ) {
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
    if (data["messageCategories"]) {
      const v_categories = validate_import_data(
        data["messageCategories"],
        depth + 1,
        "message-category"
      ) as TTS.ExportData["messageCategories"];
      if (v_categories) {
        output.messageCategories = v_categories;
      }
    }
    if (data["snippets"]) {
      output.snippets = validate_import_data(
        data["snippets"],
        depth + 1,
        "snippet"
      ) as TTS.ExportData["snippets"];
    }
    if (data["snippetsSections"]) {
      output.snippetsSections = validate_import_data(
        data["snippetsSections"],
        depth + 1,
        "snippets-section"
      ) as TTS.ExportData["snippetsSections"];
    }
    return output;
  }

  if (data["__type"] === "settings") {
    return { __type: "settings", ...conform_to_schema(data, SETTINGS_SCHEMA) };
  }

  if (data["__type"] === "message") {
    if (!data["id"] && data["name"]) {
      data["id"] = generate_id(data["name"]);
    }
    return { __type: "message", ...conform_to_schema(data, MESSAGE_SCHEMA) };
  }

  if (data["__type"] === "message-category") {
    const { data: msgs, ...category } = data as TTS.ExportedMessageCategory;
    // if category.data contains a mix of ids and messages, throw it out
    // @ts-expect-error:
    const data_type = msgs.reduce((cur, d) => {
      const this_type = typeof d === "string" ? "string" : "message";
      return !cur || cur === this_type ? this_type : "";
    }, "");
    if (data_type === "string") {
      return {
        __type: "message-category",
        ...conform_to_schema(data, MESSAGE_CATEGORY_SCHEMA),
      };
    }
    if (data_type === "message") {
      return {
        __type: "message-category",
        ...conform_to_schema(
          { ...category, data: [] },
          MESSAGE_CATEGORY_SCHEMA
        ),
        data: (msgs as TTS.ExportedMessage[])
          .filter(m => !!m)
          .map(m => validate_import_data(m, depth + 1, "message")),
      } as TTS.ExportedMessageCategory;
    }
  }

  if (data["__type"] === "snippet") {
    return { __type: "snippet", ...conform_to_schema(data, SNIPPET_SCHEMA) };
  }

  if (data["__type"] === "snippets-section") {
    const { data: snippets, ...section } = data as TTS.ExportedSnippetsSection;
    // if category.data contains a mix of ids and messages, throw it out
    // @ts-expect-error:
    const data_type = snippets.reduce((cur, d) => {
      const this_type = typeof d === "string" ? "string" : "snippet";
      return !cur || cur === this_type ? this_type : "";
    }, "");
    if (data_type === "string") {
      return {
        __type: "snippets-section",
        ...conform_to_schema(data, SNIPPET_SECTION_SCHEMA),
      };
    }

    if (data_type === "snippet") {
      return {
        __type: "snippets-section",
        ...conform_to_schema({ ...section, data: [] }, SNIPPET_SECTION_SCHEMA),
        data: (snippets as TTS.ExportedSnippet[])
          .filter(s => !!s)
          .map(
            s =>
              validate_import_data(
                s,
                depth + 1,
                "snippet"
              ) as TTS.ExportedSnippet
          )
          .filter(s => !!s),
      } as TTS.ExportedSnippetsSection;
    }
  }

  return null;
};

export const import_multiple_files = (
  ...data: TTS.AnyExportData[]
): TTS.AnyExportData => {
  const categories: TTS.ExportData["messageCategories"] = [];
  const messages: TTS.ExportData["messages"] = [];
  const snippets: TTS.ExportData["snippets"] = [];
  let settings: TTS.ExportData["settings"];

  const sort_item = item => {
    if (item["__type"] === "export-data") {
      if (!item["snippets"] && !item["messages"] && !item["settings"]) {
        return;
      }
      if (item["settings"]) {
        if (!settings) {
          // @ts-expect-error:
          settings = {};
        }
        settings = { ...settings, ...item["settings"] };
      }

      if (item["messages"]) {
        messages.push(...item["messages"]);
      }

      if (item["messageCategories"]) {
        categories.push(...item["messageCategories"]);
      }
      if (item["snippets"]) {
        snippets.push(...item["snippets"]);
      }
    } else if (item["__type"] === "settings") {
      return {
        __type: "settings",
        ...conform_to_schema(data, SETTINGS_SCHEMA),
      };
    } else if (item["__type"] === "message") {
      messages.push(item);
    } else if (item["__type"] === "message-category") {
      categories.push(item);
    } else if (item["__type"] === "snippet") {
      snippets.push(item);
    } else if (item["__type"] === "snippets-section") {
      snippets.push(item);
    }
  };

  for (let file of data) {
    if (Array.isArray(file)) {
      file.forEach(sort_item);
    } else {
      sort_item(file);
    }
  }

  const output: TTS.AnyExportData = [...messages, ...snippets];
  if (settings) {
    output.push(settings);
  }
  return output;
};
