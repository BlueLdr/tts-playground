import test from "ava";
import { UNCATEGORIZED_GROUP_NAME } from "~/common";
import TTS from "~/model/types";
import {
  import_data,
  validate_import_data,
} from "~/view/components/export/utils";

const categories_list = require("./data/message-categories.json");
const messages_list_ = require("./data/messages.json");
const uncat_messages_list = require("./data/messages-uncategorized.json");
const settings = require("./data/settings.json");

const messages_list = [...messages_list_, ...uncat_messages_list];

const uncat_category = {
  name: UNCATEGORIZED_GROUP_NAME,
  open: false,
  data: uncat_messages_list.map(m => m.id),
};

import {
  MESSAGE_CATEGORY_ONE,
  MESSAGE_CATEGORY_TWO,
  MESSAGE_CATEGORY_THREE,
  MESSAGE_CATEGORY_FOUR,
  MESSAGE_CATEGORY_FIVE,
  // @ts-expect-error:
} from "./data/message-categories.ts";
import {
  MESSAGE_FIVE,
  MESSAGE_FOUR,
  MESSAGE_ONE,
  MESSAGE_THREE,
  MESSAGE_TWO,
  // @ts-expect-error:
} from "./data/messages.ts";
import { get_uncategorized } from "./data/utils";

test("validate one category with messages", t => {
  const initial = MESSAGE_CATEGORY_ONE;
  const validated = validate_import_data(
    initial
  ) as TTS.ExportedMessageCategory;
  t.deepEqual(initial, validated);
});

test("validate one category with strings", t => {
  const initial = MESSAGE_CATEGORY_THREE;
  const validated = validate_import_data(
    initial
  ) as TTS.ExportedMessageCategory;
  t.deepEqual(initial, validated);
});

test("discard one empty category", t => {
  const validated = validate_import_data(
    MESSAGE_CATEGORY_FIVE
  ) as TTS.ExportedMessageCategory;
  t.deepEqual(null, validated);
});

test("validate one category with messages in array", t => {
  const initial = MESSAGE_CATEGORY_ONE;
  const validated = validate_import_data([
    initial,
  ]) as TTS.ExportedMessageCategory[];
  t.deepEqual([initial], validated);
});

test("validate one category with strings in array", t => {
  const initial = MESSAGE_CATEGORY_THREE;
  const validated = validate_import_data([
    initial,
  ]) as TTS.ExportedMessageCategory[];
  t.deepEqual([initial], validated);
});

test("discard one empty category in array", t => {
  const validated = validate_import_data([
    MESSAGE_CATEGORY_FIVE,
  ]) as TTS.ExportedMessageCategory[];
  t.deepEqual([], validated);
});

test("validate many categories with messages", t => {
  const initial = [MESSAGE_CATEGORY_ONE, MESSAGE_CATEGORY_TWO];
  const validated = validate_import_data(
    initial
  ) as TTS.ExportedMessageCategory[];
  t.deepEqual(initial, validated);
});

test("validate many categories with strings", t => {
  const initial = [MESSAGE_CATEGORY_THREE, MESSAGE_CATEGORY_FOUR];
  const validated = validate_import_data(
    initial
  ) as TTS.ExportedMessageCategory[];
  t.deepEqual(initial, validated);
});

test("validate mixed array of categories", t => {
  const initial = [MESSAGE_CATEGORY_ONE, MESSAGE_CATEGORY_THREE];
  const validated = validate_import_data([
    ...initial,
    MESSAGE_CATEGORY_FIVE,
  ]) as TTS.ExportedMessageCategory[];
  t.deepEqual(initial, validated);
});

test("import one message category", t => {
  const { __type, ...category_one } = MESSAGE_CATEGORY_ONE;
  const { __type: _1, ...message_one } = MESSAGE_ONE;
  const { __type: _2, ...message_two } = MESSAGE_TWO;
  const { __type: _3, ...message_three } = MESSAGE_THREE;
  const [
    settings_result,
    messages_result,
    snippets_result,
    categories_result,
    snippets_sections_result,
    uncat_result,
    dup_messages,
    rename_messages,
    dup_snippets,
    uncategorized_snippets,
  ] = import_data(
    MESSAGE_CATEGORY_ONE,
    settings,
    messages_list,
    [],
    categories_list,
    uncat_category,
    []
  );
  t.deepEqual(messages_result, [
    ...messages_list,
    message_one,
    message_two,
    message_three,
  ]);

  t.deepEqual(categories_result, [
    ...categories_list,
    {
      ...category_one,
      data: category_one.data.map(({ __type, ...m }) => m.id),
    },
  ]);
  t.deepEqual(
    get_uncategorized(messages_result, categories_result),
    uncat_messages_list
  );

  t.is(settings_result, undefined);
  t.is(snippets_result, undefined);
  t.is(snippets_sections_result, undefined);
  t.deepEqual(uncat_result, uncat_category);
  t.deepEqual(dup_messages, []);
  t.deepEqual(rename_messages, []);
  t.deepEqual(dup_snippets, []);
  t.deepEqual(uncategorized_snippets, []);
});

test("import one message category in array", t => {
  const { __type, ...category_one } = MESSAGE_CATEGORY_ONE;
  const { __type: _1, ...message_one } = MESSAGE_ONE;
  const { __type: _2, ...message_two } = MESSAGE_TWO;
  const { __type: _3, ...message_three } = MESSAGE_THREE;
  const [
    settings_result,
    messages_result,
    snippets_result,
    categories_result,
    snippets_sections_result,
    uncat_result,
    dup_messages,
    rename_messages,
    dup_snippets,
    uncategorized_snippets,
  ] = import_data(
    [MESSAGE_CATEGORY_ONE],
    settings,
    messages_list,
    [],
    categories_list,
    uncat_category,
    []
  );
  t.deepEqual(messages_result, [
    ...messages_list,
    message_one,
    message_two,
    message_three,
  ]);

  t.deepEqual(categories_result, [
    ...categories_list,
    {
      ...category_one,
      data: category_one.data.map(({ __type, ...m }) => m.id),
    },
  ]);
  t.deepEqual(
    get_uncategorized(messages_result, categories_result),
    uncat_messages_list
  );

  t.is(settings_result, undefined);
  t.is(snippets_result, undefined);
  t.is(snippets_sections_result, undefined);
  t.deepEqual(uncat_result, uncat_category);
  t.deepEqual(dup_messages, []);
  t.deepEqual(rename_messages, []);
  t.deepEqual(dup_snippets, []);
  t.deepEqual(uncategorized_snippets, []);
});

test("import many message categories in array", t => {
  const { __type: _a, ...category_one } = MESSAGE_CATEGORY_ONE;
  const { __type: _b, ...category_two } = MESSAGE_CATEGORY_TWO;
  const { __type: _1, ...message_one } = MESSAGE_ONE;
  const { __type: _2, ...message_two } = MESSAGE_TWO;
  const { __type: _3, ...message_three } = MESSAGE_THREE;
  const { __type: _4, ...message_four } = MESSAGE_FOUR;
  const [
    settings_result,
    messages_result,
    snippets_result,
    categories_result,
    snippets_sections_result,
    uncat_result,
    dup_messages,
    rename_messages,
    dup_snippets,
    uncategorized_snippets,
  ] = import_data(
    [MESSAGE_CATEGORY_ONE, MESSAGE_CATEGORY_TWO, MESSAGE_CATEGORY_FIVE],
    settings,
    messages_list,
    [],
    categories_list,
    uncat_category,
    []
  );

  t.deepEqual(messages_result, [
    ...messages_list,
    message_one,
    message_two,
    message_three,
    message_four,
  ]);

  t.deepEqual(categories_result, [
    ...categories_list,
    {
      ...category_one,
      data: category_one.data.map(({ __type, ...m }) => m.id),
    },

    {
      ...category_two,
      data: category_two.data.map(({ __type, ...m }) => m.id),
    },
  ]);
  t.deepEqual(
    get_uncategorized(messages_result, categories_result),
    uncat_messages_list
  );

  t.is(settings_result, undefined);
  t.is(snippets_result, undefined);
  t.is(snippets_sections_result, undefined);
  t.deepEqual(uncat_result, uncat_category);
  t.deepEqual(dup_messages, []);
  t.deepEqual(rename_messages, []);
  t.deepEqual(dup_snippets, []);
  t.deepEqual(uncategorized_snippets, []);
});

test("reject empty message category", t => {
  const [
    settings_result,
    messages_result,
    snippets_result,
    categories_result,
    snippets_sections_result,
    uncat_result,
    dup_messages,
    rename_messages,
    dup_snippets,
    uncategorized_snippets,
  ] = import_data(
    [MESSAGE_CATEGORY_FIVE],
    settings,
    messages_list,
    [],
    categories_list,
    uncat_category,
    []
  );

  t.is(messages_result, undefined);
  t.is(categories_result, undefined);
  t.is(settings_result, undefined);
  t.is(snippets_result, undefined);
  t.is(snippets_sections_result, undefined);
  t.deepEqual(uncat_result, uncat_category);
  t.deepEqual(dup_messages, []);
  t.deepEqual(rename_messages, []);
  t.deepEqual(dup_snippets, []);
  t.deepEqual(uncategorized_snippets, []);
});

test("import category that already exists with existing categorized message", t => {
  const { __type: _a, ...category_one } = MESSAGE_CATEGORY_ONE;
  const { __type: _b, ...category_four } = MESSAGE_CATEGORY_FOUR;
  const { __type: _1, ...message_one } = MESSAGE_ONE;
  const { __type: _2, ...message_two } = MESSAGE_TWO;
  const { __type: _3, ...message_three } = MESSAGE_THREE;
  const [
    settings_result,
    messages_result,
    snippets_result,
    categories_result,
    snippets_sections_result,
    uncat_result,
    dup_messages,
    rename_messages,
    dup_snippets,
    uncategorized_snippets,
  ] = import_data(
    [MESSAGE_CATEGORY_ONE],
    settings,
    [...messages_list, message_one, message_two, message_three],
    [],
    [
      ...categories_list,
      { ...category_one, data: [] },
      { ...category_four, data: category_one.data.map(m => m.id) },
    ],
    uncat_category,
    []
  );

  t.is(messages_result, undefined);
  t.is(settings_result, undefined);
  t.is(snippets_result, undefined);
  t.is(categories_result, undefined);
  t.is(snippets_sections_result, undefined);
  t.deepEqual(uncat_result, uncat_category);
  t.deepEqual(dup_messages, []);
  t.deepEqual(rename_messages, []);
  t.deepEqual(dup_snippets, []);
  t.deepEqual(uncategorized_snippets, []);
});

test("import categories with duplicate messages", t => {
  const { __type: _a, ...category_one } = MESSAGE_CATEGORY_ONE;
  const CAT_TWO = {
    ...MESSAGE_CATEGORY_TWO,
    data: [MESSAGE_TWO, MESSAGE_THREE, MESSAGE_FOUR],
  };
  const { __type: _b, ...category_two } = CAT_TWO;
  const { __type: _1, ...message_one } = MESSAGE_ONE;
  const { __type: _2, ...message_two } = MESSAGE_TWO;
  const { __type: _3, ...message_three } = MESSAGE_THREE;
  const { __type: _4, ...message_four } = MESSAGE_FOUR;
  const [
    settings_result,
    messages_result,
    snippets_result,
    categories_result,
    snippets_sections_result,
    uncat_result,
    dup_messages,
    rename_messages,
    dup_snippets,
    uncategorized_snippets,
  ] = import_data(
    [MESSAGE_CATEGORY_ONE, CAT_TWO],
    settings,
    messages_list,
    [],
    categories_list,
    uncat_category,
    []
  );

  t.deepEqual(messages_result, [
    ...messages_list,
    message_one,
    message_two,
    message_three,
    message_four,
  ]);
  t.deepEqual(categories_result, [
    ...categories_list,
    { ...category_one, data: category_one.data.map(d => d.id) },
    { ...category_two, data: [message_four.id] },
  ]);

  t.is(settings_result, undefined);
  t.is(snippets_result, undefined);
  t.is(snippets_sections_result, undefined);
  t.deepEqual(uncat_result, uncat_category);
  t.deepEqual(dup_messages, []);
  t.deepEqual(rename_messages, []);
  t.deepEqual(dup_snippets, []);
  t.deepEqual(uncategorized_snippets, []);
});

test("import category that already exists with existing uncategorized message", t => {
  const { __type: _a, ...category_one } = MESSAGE_CATEGORY_ONE;
  const { __type: _1, ...message_one } = MESSAGE_ONE;
  const { __type: _2, ...message_two } = MESSAGE_TWO;
  const { __type: _3, ...message_three } = MESSAGE_THREE;
  const [
    settings_result,
    messages_result,
    snippets_result,
    categories_result,
    snippets_sections_result,
    uncat_result,
    dup_messages,
    rename_messages,
    dup_snippets,
    uncategorized_snippets,
  ] = import_data(
    [MESSAGE_CATEGORY_ONE],
    settings,
    [...messages_list, message_one, message_two, message_three],
    [],
    [
      ...categories_list,
      { ...category_one, data: category_one.data.map(d => d.id).slice(0, 2) },
    ],
    {
      ...uncat_category,
      data: uncat_category.data.concat([message_three.id]),
    },
    []
  );

  t.deepEqual(categories_result, [
    ...categories_list,
    {
      ...category_one,
      data: category_one.data.map(({ __type, ...m }) => m.id),
    },
  ]);

  t.deepEqual(uncat_result, uncat_category);

  t.is(messages_result, undefined);
  t.is(settings_result, undefined);
  t.is(snippets_result, undefined);
  t.is(snippets_sections_result, undefined);
  t.deepEqual(dup_messages, []);
  t.deepEqual(rename_messages, []);
  t.deepEqual(dup_snippets, []);
  t.deepEqual(uncategorized_snippets, []);
});

test("import new category with existing categorized message(s)", t => {
  const { __type: _a, ...category_one } = MESSAGE_CATEGORY_ONE;
  const { __type: _b, ...category_four } = MESSAGE_CATEGORY_FOUR;
  const { __type: _1, ...message_one } = MESSAGE_ONE;
  const { __type: _2, ...message_two } = MESSAGE_TWO;
  const { __type: _3, ...message_three } = MESSAGE_THREE;
  const [
    settings_result,
    messages_result,
    snippets_result,
    categories_result,
    snippets_sections_result,
    uncat_result,
    dup_messages,
    rename_messages,
    dup_snippets,
    uncategorized_snippets,
  ] = import_data(
    [MESSAGE_CATEGORY_ONE],
    settings,
    [...messages_list, message_one, message_two, message_three],
    [],
    [
      ...categories_list,
      { ...category_four, data: category_one.data.map(m => m.id) },
    ],
    uncat_category,
    []
  );

  t.is(messages_result, undefined);
  t.is(categories_result, undefined);
  t.is(settings_result, undefined);
  t.is(snippets_result, undefined);
  t.is(snippets_sections_result, undefined);
  t.deepEqual(uncat_result, uncat_category);
  t.deepEqual(dup_messages, []);
  t.deepEqual(rename_messages, []);
  t.deepEqual(dup_snippets, []);
  t.deepEqual(uncategorized_snippets, []);
});

test("import new category with existing uncategorized message(s)", t => {
  const { __type: _a, ...category_one } = MESSAGE_CATEGORY_ONE;
  const { __type: _b, ...category_three } = MESSAGE_CATEGORY_THREE;
  const { __type: _1, ...message_one } = MESSAGE_ONE;
  const { __type: _2, ...message_two } = MESSAGE_TWO;
  const { __type: _3, ...message_three } = MESSAGE_THREE;
  const [
    settings_result,
    messages_result,
    snippets_result,
    categories_result,
    snippets_sections_result,
    uncat_result,
    dup_messages,
    rename_messages,
    dup_snippets,
    uncategorized_snippets,
  ] = import_data(
    [MESSAGE_CATEGORY_ONE],
    settings,
    [...messages_list, message_one, message_two, message_three],
    [],
    [...categories_list, { ...category_three, data: [message_one.id] }],
    {
      ...uncat_category,
      data: uncat_category.data.concat([message_two.id, message_three.id]),
    },
    []
  );

  t.deepEqual(categories_result, [
    ...categories_list,
    { ...category_three, data: [message_one.id] },
    { ...category_one, data: category_one.data.map(m => m.id).slice(1) },
  ]);

  t.deepEqual(uncat_result, uncat_category);

  t.is(messages_result, undefined);
  t.is(settings_result, undefined);
  t.is(snippets_result, undefined);
  t.is(snippets_sections_result, undefined);
  t.deepEqual(dup_messages, []);
  t.deepEqual(rename_messages, []);
  t.deepEqual(dup_snippets, []);
  t.deepEqual(uncategorized_snippets, []);
});

test("import mix of new/existing categories with mix of new/categorized/uncategorized messages", t => {
  const { __type: _a, ...category_one } = MESSAGE_CATEGORY_ONE;
  const { __type: _b, ...category_two } = MESSAGE_CATEGORY_TWO;
  const { __type: _1, ...message_one } = MESSAGE_ONE;
  const { __type: _2, ...message_two } = MESSAGE_TWO;
  const { __type: _3, ...message_three } = MESSAGE_THREE;
  const { __type: _4, ...message_four } = MESSAGE_FOUR;
  const { __type: _5, ...message_five } = MESSAGE_FIVE;
  const [
    settings_result,
    messages_result,
    snippets_result,
    categories_result,
    snippets_sections_result,
    uncat_result,
    dup_messages,
    rename_messages,
    dup_snippets,
    uncategorized_snippets,
  ] = import_data(
    [MESSAGE_CATEGORY_ONE, MESSAGE_CATEGORY_TWO, MESSAGE_FIVE],
    settings,
    [...messages_list, message_one, message_four],
    [],
    [...categories_list, { ...category_one, data: [message_one.id] }],
    {
      ...uncat_category,
      data: uncat_category.data.concat([message_four.id]),
    },
    []
  );

  t.deepEqual(categories_result, [
    ...categories_list,
    { ...category_one, data: category_one.data.map(m => m.id) },
    { ...category_two, data: category_two.data.map(m => m.id) },
  ]);
  t.deepEqual(messages_result, [
    ...messages_list,
    message_one,
    message_four,
    message_two,
    message_three,
    message_five,
  ]);

  t.deepEqual(uncat_result, {
    ...uncat_category,
    data: uncat_category.data.concat([message_five.id]),
  });

  t.is(settings_result, undefined);
  t.is(snippets_result, undefined);
  t.is(snippets_sections_result, undefined);
  t.deepEqual(dup_messages, []);
  t.deepEqual(rename_messages, []);
  t.deepEqual(dup_snippets, []);
  t.deepEqual(uncategorized_snippets, []);
});

test("reject category with ids but no message records", t => {
  const [
    settings_result,
    messages_result,
    snippets_result,
    categories_result,
    snippets_sections_result,
    uncat_result,
    dup_messages,
    rename_messages,
    dup_snippets,
    uncategorized_snippets,
  ] = import_data(
    [MESSAGE_CATEGORY_THREE],
    settings,
    messages_list,
    [],
    categories_list,
    uncat_category,
    []
  );

  t.is(messages_result, undefined);
  t.is(categories_result, undefined);
  t.is(settings_result, undefined);
  t.is(snippets_result, undefined);
  t.is(snippets_sections_result, undefined);
  t.deepEqual(uncat_result, uncat_category);
  t.deepEqual(dup_messages, []);
  t.deepEqual(rename_messages, []);
  t.deepEqual(dup_snippets, []);
  t.deepEqual(uncategorized_snippets, []);
});
