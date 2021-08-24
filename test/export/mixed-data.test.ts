import test from "ava";
import {
  conform_to_schema,
  MESSAGE_CATEGORY_SCHEMA,
  MESSAGE_SCHEMA,
  SNIPPET_SCHEMA,
  SNIPPET_SECTION_SCHEMA,
} from "~/model";
import TTS from "~/model/types";
import { import_data } from "~/view/components/export/utils";

import {
  MESSAGE_CATEGORY_FIVE,
  MESSAGE_CATEGORY_FOUR,
  MESSAGE_CATEGORY_ONE,
  MESSAGE_CATEGORY_THREE,
  MESSAGE_CATEGORY_TWO,
  // @ts-expect-error:
} from "./data/message-categories.ts";
import {
  MESSAGE_ONE,
  MESSAGE_TWO,
  MESSAGE_THREE,
  MESSAGE_FOUR,
  // @ts-expect-error:
} from "./data/messages.ts";
import {
  SNIPPET_ONE,
  SNIPPET_TWO,
  SNIPPET_SECTION_ONE,
  SNIPPET_SECTION_TWO,
  // @ts-expect-error:
} from "./data/snippets.ts";
import { map_category_msg_ids } from "./data/utils";
const messages_list = require("./data/messages.json");
const snippets_list = require("./data/snippets-sections.json");
const categories_list = require("./data/message-categories.json");
const uncat_messages_list = require("./data/messages-uncategorized.json");
const settings = require("./data/settings.json");

const message_one = conform_to_schema(MESSAGE_ONE, MESSAGE_SCHEMA);
const message_two = conform_to_schema(MESSAGE_TWO, MESSAGE_SCHEMA);
const message_three = conform_to_schema(MESSAGE_THREE, MESSAGE_SCHEMA);
const message_four = conform_to_schema(MESSAGE_FOUR, MESSAGE_SCHEMA);
const snippet_one = conform_to_schema(SNIPPET_ONE, SNIPPET_SCHEMA);
const snippet_two = conform_to_schema(SNIPPET_TWO, SNIPPET_SCHEMA);
const snippet_section_one = conform_to_schema(
  SNIPPET_SECTION_ONE,
  SNIPPET_SECTION_SCHEMA
);
const snippet_section_two = conform_to_schema(
  SNIPPET_SECTION_TWO,
  SNIPPET_SECTION_SCHEMA
);

const category_one = conform_to_schema(
  map_category_msg_ids(MESSAGE_CATEGORY_ONE),
  MESSAGE_CATEGORY_SCHEMA
);
const category_two = conform_to_schema(
  map_category_msg_ids(MESSAGE_CATEGORY_TWO),
  MESSAGE_CATEGORY_SCHEMA
);
const category_three = conform_to_schema(
  MESSAGE_CATEGORY_THREE,
  MESSAGE_CATEGORY_SCHEMA
);
const category_four = conform_to_schema(
  MESSAGE_CATEGORY_FOUR,
  MESSAGE_CATEGORY_SCHEMA
);
const category_five = conform_to_schema(
  MESSAGE_CATEGORY_FIVE,
  MESSAGE_CATEGORY_SCHEMA
);

const initial_messages = [...messages_list, ...uncat_messages_list];

test("successfully import array of mixed data", t => {
  const { skip_tutorials, ...some_settings } = settings;
  const settings_input = {
    __type: "settings",
    ...some_settings,
    trim_whitespace: !settings.trim_whitespace,
  };
  const input = [
    MESSAGE_ONE,
    SNIPPET_TWO,
    SNIPPET_SECTION_TWO,
    settings_input,
    MESSAGE_CATEGORY_THREE,
    MESSAGE_CATEGORY_TWO,
    MESSAGE_TWO,
    MESSAGE_THREE,
  ];

  const [
    settings_result,
    messages_result,
    snippets_result,
    categories_result,
    dup_messages,
    rename_messages,
    dup_snippets,
    uncategorized_snippets,
  ] = import_data(
    input,
    settings,
    [...initial_messages, message_two, message_four],
    snippets_list,
    [...categories_list, category_five]
  );

  const settings_output = {
    ...settings,
    trim_whitespace: !settings.trim_whitespace,
  };

  t.deepEqual(settings_result, settings_output);
  t.deepEqual(messages_result, [
    ...initial_messages,
    message_two,
    message_four,
    message_one,
    message_three,
  ]);
  t.deepEqual(categories_result, [
    ...categories_list,
    category_five,
    category_three,
    category_two,
  ]);
  t.deepEqual(snippets_result, [...snippets_list, snippet_section_two]);
  t.deepEqual(dup_messages, []);
  t.deepEqual(rename_messages, []);
  t.deepEqual(dup_snippets, []);
  t.deepEqual(uncategorized_snippets, [snippet_two]);
});

test("successfully import array of mixed data with duplicates", t => {
  const DUPLICATE_M_ONE = {
    ...MESSAGE_ONE,
    text: "duplicate name",
    id: "duplicate-msg-1",
  };
  const DUPLICATE_M_TWO = {
    ...MESSAGE_TWO,
    name: "duplicate text",
    id: "duplicate-msg-2",
  };
  const DUPLICATE_M_THREE = { ...MESSAGE_THREE, id: "duplicate-msg-3" };
  const { __type: _1, ...duplicate_m_one } = DUPLICATE_M_ONE;
  const { __type: _2, ...duplicate_m_two } = DUPLICATE_M_TWO;
  const duplicate_s_one = {
    ...SNIPPET_ONE,
    options: {
      ...SNIPPET_ONE.options,
      space_before: !SNIPPET_ONE.options.space_before,
    },
  };
  const duplicate_ss_one = {
    ...SNIPPET_SECTION_ONE,
    data: [duplicate_s_one, SNIPPET_TWO],
  };
  const CATEGORY_WITH_DUPS = {
    ...MESSAGE_CATEGORY_TWO,
    name: "Category with dups",
    data: [DUPLICATE_M_ONE.id, DUPLICATE_M_THREE.id],
  };
  const { __type: _c, ...category_with_dups } = CATEGORY_WITH_DUPS;

  const input = [
    DUPLICATE_M_ONE,
    DUPLICATE_M_TWO,
    duplicate_ss_one,
    DUPLICATE_M_THREE,
    SNIPPET_SECTION_TWO,
    SNIPPET_TWO,
    MESSAGE_FOUR,
    MESSAGE_CATEGORY_THREE,
    MESSAGE_CATEGORY_FOUR,
    CATEGORY_WITH_DUPS,
  ];
  const messages_before = [
    ...initial_messages,
    message_one,
    message_two,
    message_three,
  ];
  const snippets_before = [
    ...snippets_list,
    {
      ...snippet_section_one,
      data: [...snippet_section_one.data, snippet_one],
    },
  ];
  const categories_before = [...categories_list, category_one, category_five];
  const [
    settings_result,
    messages_result,
    snippets_result,
    categories_result,
    dup_messages,
    rename_messages,
    dup_snippets,
    uncategorized_snippets,
  ] = import_data(
    input,
    settings,
    messages_before,
    snippets_before,
    categories_before
  );

  const { __type, ...duplicate_s_one_after } = duplicate_s_one;

  t.is(settings_result, undefined);
  t.deepEqual(messages_result, [...messages_before, message_four]);
  t.deepEqual(snippets_result, [
    ...snippets_list,
    {
      ...snippet_section_one,
      data: [...snippet_section_one.data, snippet_one, snippet_two],
    },
    snippet_section_two,
  ]);
  t.deepEqual(categories_result, [
    ...categories_before,
    category_four,
    { ...category_with_dups, data: [duplicate_m_one.id] },
  ]);

  t.deepEqual(dup_messages, [duplicate_m_two]);
  t.deepEqual(rename_messages, [duplicate_m_one]);
  t.deepEqual(dup_snippets, [
    { ...snippet_section_one, data: [duplicate_s_one_after] },
  ]);
  t.deepEqual(uncategorized_snippets, []);
});

test("successfully import ExportData object", t => {
  const DUPLICATE_M_ONE = {
    ...MESSAGE_ONE,
    text: "duplicate name",
    id: "duplicate-msg-1",
  };
  const DUPLICATE_M_TWO = {
    ...MESSAGE_TWO,
    name: "duplicate text",
    id: "duplicate-msg-2",
  };
  const DUPLICATE_M_THREE = { ...MESSAGE_THREE, id: "duplicate-msg-3" };
  const { __type: _1, ...duplicate_m_one } = DUPLICATE_M_ONE;
  const { __type: _2, ...duplicate_m_two } = DUPLICATE_M_TWO;
  const duplicate_s_one = {
    ...SNIPPET_ONE,
    options: {
      ...SNIPPET_ONE.options,
      space_before: !SNIPPET_ONE.options.space_before,
    },
  };
  const duplicate_ss_one = {
    ...SNIPPET_SECTION_ONE,
    data: [duplicate_s_one, SNIPPET_TWO],
  };
  const CATEGORY_WITH_DUPS = {
    ...MESSAGE_CATEGORY_TWO,
    name: "Category with dups",
    data: [DUPLICATE_M_ONE.id, DUPLICATE_M_THREE.id],
  };
  const { __type: _c, ...category_with_dups } = CATEGORY_WITH_DUPS;

  const export_data: TTS.ExportData = {
    __type: "export-data",
    messages: [
      DUPLICATE_M_ONE,
      DUPLICATE_M_TWO,
      DUPLICATE_M_THREE,
      MESSAGE_FOUR,
    ],
    messageCategories: [
      MESSAGE_CATEGORY_THREE,
      MESSAGE_CATEGORY_FOUR,
      CATEGORY_WITH_DUPS,
    ],
    snippets: [duplicate_ss_one, SNIPPET_SECTION_TWO],
    settings: {
      __type: "settings",
      ...settings,
      trim_whitespace: !settings.trim_whitespace,
    },
  };
  const messages_before = [
    ...initial_messages,
    message_one,
    message_two,
    message_three,
  ];
  const snippets_before = [
    ...snippets_list,
    {
      ...snippet_section_one,
      data: [...snippet_section_one.data, snippet_one],
    },
  ];
  const categories_before = [...categories_list, category_one, category_five];
  const [
    settings_result,
    messages_result,
    snippets_result,
    categories_result,
    dup_messages,
    rename_messages,
    dup_snippets,
    uncategorized_snippets,
  ] = import_data(
    export_data,
    settings,
    messages_before,
    snippets_before,
    categories_before
  );

  const { __type, ...duplicate_s_one_after } = duplicate_s_one;

  t.deepEqual(settings_result, {
    ...settings,
    trim_whitespace: !settings.trim_whitespace,
  });
  t.deepEqual(messages_result, [...messages_before, message_four]);
  t.deepEqual(snippets_result, [
    ...snippets_list,
    {
      ...snippet_section_one,
      data: [...snippet_section_one.data, snippet_one, snippet_two],
    },
    snippet_section_two,
  ]);
  t.deepEqual(categories_result, [
    ...categories_before,
    category_four,
    { ...category_with_dups, data: [duplicate_m_one.id] },
  ]);

  t.deepEqual(dup_messages, [duplicate_m_two]);
  t.deepEqual(rename_messages, [duplicate_m_one]);
  t.deepEqual(dup_snippets, [
    { ...snippet_section_one, data: [duplicate_s_one_after] },
  ]);
  t.deepEqual(uncategorized_snippets, []);
});
