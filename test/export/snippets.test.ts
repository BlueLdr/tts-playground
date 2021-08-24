import test from "ava";
import TTS from "~/model/types";
import {
  import_data,
  validate_import_data,
} from "~/view/components/export/utils";

const snippets_list = require("./data/snippets-sections.json");
const settings = require("./data/settings.json");

// @ts-expect-error:
import { SNIPPET_ONE, SNIPPET_TWO, SNIPPET_THREE } from "./data/snippets.ts";

test("validate one snippet", t => {
  const initial = SNIPPET_ONE;
  const validated = validate_import_data(initial) as TTS.ExportedSnippet;
  t.deepEqual(initial, validated);
});

test("validate one snippet in array", t => {
  const initial = [SNIPPET_ONE];
  const validated = validate_import_data(initial) as TTS.ExportData["snippets"];
  t.deepEqual(initial, validated);
});

test("validate many snippets", t => {
  const initial = [SNIPPET_ONE, SNIPPET_TWO, SNIPPET_THREE];
  const validated = validate_import_data(initial) as TTS.ExportData["snippets"];
  t.deepEqual(initial, validated);
});

test("import one snippet", t => {
  const { __type, ...snippet_one } = SNIPPET_ONE;
  const [
    settings_result,
    messages_result,
    snippets_result,
    categories_result,
    dup_messages,
    rename_messages,
    dup_snippets,
    uncategorized_snippets,
  ] = import_data(SNIPPET_ONE, settings, [], snippets_list, []);
  t.deepEqual(uncategorized_snippets, [snippet_one]);

  t.is(settings_result, undefined);
  t.is(messages_result, undefined);
  t.is(snippets_result, undefined);
  t.is(categories_result, undefined);
  t.deepEqual(dup_messages, []);
  t.deepEqual(rename_messages, []);
  t.deepEqual(dup_snippets, []);
});

test("import one snippet in array", t => {
  const { __type, ...snippet_one } = SNIPPET_ONE;
  const [
    settings_result,
    messages_result,
    snippets_result,
    categories_result,
    dup_messages,
    rename_messages,
    dup_snippets,
    uncategorized_snippets,
  ] = import_data([SNIPPET_ONE], settings, [], snippets_list, []);
  t.deepEqual(uncategorized_snippets, [snippet_one]);

  t.is(settings_result, undefined);
  t.is(messages_result, undefined);
  t.is(snippets_result, undefined);
  t.is(categories_result, undefined);
  t.deepEqual(dup_messages, []);
  t.deepEqual(rename_messages, []);
  t.deepEqual(dup_snippets, []);
});

test("import many snippets", t => {
  const { __type: _1, ...snippet_one } = SNIPPET_ONE;
  const { __type: _2, ...snippet_two } = SNIPPET_TWO;
  const { __type: _3, ...snippet_three } = SNIPPET_THREE;
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
    [SNIPPET_ONE, SNIPPET_TWO, SNIPPET_THREE],
    settings,
    [],
    snippets_list,
    []
  );
  t.deepEqual(uncategorized_snippets, [
    snippet_one,
    snippet_two,
    snippet_three,
  ]);

  t.is(settings_result, undefined);
  t.is(messages_result, undefined);
  t.is(snippets_result, undefined);
  t.is(categories_result, undefined);
  t.deepEqual(dup_messages, []);
  t.deepEqual(rename_messages, []);
  t.deepEqual(dup_snippets, []);
});
