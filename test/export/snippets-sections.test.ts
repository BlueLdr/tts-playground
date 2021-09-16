import test from "ava";
import TTS from "~/model/types";
import { UNCATEGORIZED_GROUP_NAME } from "~/common";
import {
  import_data,
  validate_import_data,
} from "~/view/components/export/utils";

const snippets_section_list = require("./data/snippets-sections.json");
const settings = require("./data/settings.json");

import {
  SNIPPET_SECTION_ONE,
  SNIPPET_SECTION_TWO,
  SNIPPET_SECTION_THREE,
  // @ts-expect-error:
} from "./data/snippets.ts";

const uncat_category = {
  name: UNCATEGORIZED_GROUP_NAME,
  open: false,
  data: [],
};

test("validate one snippet section", t => {
  const initial = SNIPPET_SECTION_ONE;
  const validated = validate_import_data(
    initial
  ) as TTS.ExportedSnippetsSection;
  t.deepEqual(initial, validated);
});

test("validate one snippet section in array", t => {
  const initial = [SNIPPET_SECTION_ONE];
  const validated = validate_import_data(
    initial
  ) as TTS.ExportedSnippetsSection[];
  t.deepEqual(initial, validated);
});

test("validate many snippet sections", t => {
  const initial = [
    SNIPPET_SECTION_ONE,
    SNIPPET_SECTION_TWO,
    SNIPPET_SECTION_THREE,
  ];
  const validated = validate_import_data(
    initial
  ) as TTS.ExportedSnippetsSection[];
  t.deepEqual(initial, validated);
});

test("import one snippet section", t => {
  const { __type, ...section_one } = SNIPPET_SECTION_ONE;
  const [
    settings_result,
    messages_result,
    snippets_result,
    categories_result,
    uncat_result,
    dup_messages,
    rename_messages,
    dup_snippets,
    uncategorized_snippets,
  ] = import_data(
    SNIPPET_SECTION_ONE,
    settings,
    [],
    snippets_section_list,
    [],
    uncat_category
  );
  t.deepEqual(snippets_result, [
    ...snippets_section_list,
    { ...section_one, data: section_one.data.map(({ __type: _, ...d }) => d) },
  ]);

  t.is(settings_result, undefined);
  t.is(messages_result, undefined);
  t.is(categories_result, undefined);
  t.deepEqual(uncat_result, uncat_category);
  t.deepEqual(dup_messages, []);
  t.deepEqual(rename_messages, []);
  t.deepEqual(dup_snippets, []);
  t.deepEqual(uncategorized_snippets, []);
});

test("import one snippet section in array", t => {
  const { __type, ...section_one } = SNIPPET_SECTION_ONE;
  const [
    settings_result,
    messages_result,
    snippets_result,
    categories_result,
    uncat_result,
    dup_messages,
    rename_messages,
    dup_snippets,
    uncategorized_snippets,
  ] = import_data(
    [SNIPPET_SECTION_ONE],
    settings,
    [],
    snippets_section_list,
    [],
    uncat_category
  );
  t.deepEqual(snippets_result, [
    ...snippets_section_list,
    { ...section_one, data: section_one.data.map(({ __type: _, ...d }) => d) },
  ]);

  t.is(settings_result, undefined);
  t.is(messages_result, undefined);
  t.is(categories_result, undefined);
  t.deepEqual(uncat_result, uncat_category);
  t.deepEqual(dup_messages, []);
  t.deepEqual(rename_messages, []);
  t.deepEqual(dup_snippets, []);
  t.deepEqual(uncategorized_snippets, []);
});

test("import many snippet sections", t => {
  const { __type, ...section_one } = SNIPPET_SECTION_ONE;
  const { __type: _1, ...section_two } = SNIPPET_SECTION_TWO;
  const { __type: _2, ...section_three } = SNIPPET_SECTION_THREE;
  const [
    settings_result,
    messages_result,
    snippets_result,
    categories_result,
    uncat_result,
    dup_messages,
    rename_messages,
    dup_snippets,
    uncategorized_snippets,
  ] = import_data(
    [SNIPPET_SECTION_ONE, SNIPPET_SECTION_TWO, SNIPPET_SECTION_THREE],
    settings,
    [],
    snippets_section_list,
    [],
    uncat_category
  );
  t.deepEqual(snippets_result, [
    ...snippets_section_list,
    { ...section_one, data: section_one.data.map(({ __type: _, ...d }) => d) },
    { ...section_two, data: section_two.data.map(({ __type: _, ...d }) => d) },
    {
      ...section_three,
      data: section_three.data.map(({ __type: _, ...d }) => d),
    },
  ]);

  t.is(settings_result, undefined);
  t.is(messages_result, undefined);
  t.is(categories_result, undefined);
  t.deepEqual(uncat_result, uncat_category);
  t.deepEqual(dup_messages, []);
  t.deepEqual(rename_messages, []);
  t.deepEqual(dup_snippets, []);
  t.deepEqual(uncategorized_snippets, []);
});
