import test from "ava";
import {
  conform_to_schema,
  MESSAGE_SCHEMA,
  SNIPPET_SCHEMA,
  SNIPPET_SECTION_SCHEMA,
} from "~/model";
import TTS from "~/model/types";
import { import_data } from "~/view/components/export/utils";

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
const messages_list = require("./data/messages.json");
const snippets_list = require("./data/snippets-sections.json");
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

test("successfully import array of mixed data", t => {
  const input = [MESSAGE_ONE, SNIPPET_TWO, SNIPPET_SECTION_TWO];
  const [
    settings_result,
    messages_result,
    snippets_result,
    dup_messages,
    rename_messages,
    dup_snippets,
    uncategorized_snippets,
  ] = import_data(input, settings, messages_list, snippets_list);

  t.is(settings_result, undefined);
  t.deepEqual(messages_result, [...messages_list, message_one]);
  t.deepEqual(snippets_result, [...snippets_list, snippet_section_two]);
  t.deepEqual(dup_messages, []);
  t.deepEqual(rename_messages, []);
  t.deepEqual(dup_snippets, []);
  t.deepEqual(uncategorized_snippets, [snippet_two]);
});

test("successfully import array of mixed data with duplicates", t => {
  const duplicate_m_one = { ...MESSAGE_ONE, text: "duplicate name" };
  const duplicate_m_two = { ...MESSAGE_TWO, name: "duplicate text" };
  const duplicate_m_three = { ...MESSAGE_THREE };
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

  const input = [
    duplicate_m_one,
    duplicate_m_two,
    duplicate_ss_one,
    duplicate_m_three,
    SNIPPET_SECTION_TWO,
    SNIPPET_TWO,
    MESSAGE_FOUR,
  ];
  const messages_before = [
    ...messages_list,
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
  const [
    settings_result,
    messages_result,
    snippets_result,
    dup_messages,
    rename_messages,
    dup_snippets,
    uncategorized_snippets,
  ] = import_data(input, settings, messages_before, snippets_before);

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
  t.deepEqual(dup_messages, [{ ...message_two, name: "duplicate text" }]);
  t.deepEqual(rename_messages, [{ ...message_one, text: "duplicate name" }]);
  t.deepEqual(dup_snippets, [
    { ...snippet_section_one, data: [duplicate_s_one_after] },
  ]);
  t.deepEqual(uncategorized_snippets, []);
});

test("successfully import ExportData object", t => {
  const duplicate_m_one = { ...MESSAGE_ONE, text: "duplicate name" };
  const duplicate_m_two = { ...MESSAGE_TWO, name: "duplicate text" };
  const duplicate_m_three = { ...MESSAGE_THREE };
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

  const export_data: TTS.ExportData = {
    __type: "export-data",
    messages: [
      duplicate_m_one,
      duplicate_m_two,
      duplicate_m_three,
      MESSAGE_FOUR,
    ],
    snippets: [duplicate_ss_one, SNIPPET_SECTION_TWO],
    settings: {
      __type: "settings",
      ...settings,
      trim_whitespace: !settings.trim_whitespace,
    },
  };
  const messages_before = [
    ...messages_list,
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
  const [
    settings_result,
    messages_result,
    snippets_result,
    dup_messages,
    rename_messages,
    dup_snippets,
    uncategorized_snippets,
  ] = import_data(export_data, settings, messages_before, snippets_before);

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
  t.deepEqual(dup_messages, [{ ...message_two, name: "duplicate text" }]);
  t.deepEqual(rename_messages, [{ ...message_one, text: "duplicate name" }]);
  t.deepEqual(dup_snippets, [
    { ...snippet_section_one, data: [duplicate_s_one_after] },
  ]);
  t.deepEqual(uncategorized_snippets, []);
});
