import test from "ava";
import { UNCATEGORIZED_GROUP_NAME } from "~/common";
import TTS from "~/model/types";
import {
  import_data,
  validate_import_data,
} from "~/view/components/export/utils";

const messages_list_ = require("./data/messages.json");
const settings = require("./data/settings.json");
const message_categories = require("./data/message-categories.json");
const uncat_messages_list = require("./data/messages-uncategorized.json");

import {
  MESSAGE_ONE,
  MESSAGE_TWO,
  MESSAGE_THREE,
  MESSAGE_FOUR,
  // @ts-expect-error:
} from "./data/messages.ts";
import { get_uncategorized } from "./data/utils";

const messages_list = [...messages_list_, ...uncat_messages_list];
const uncat_category = {
  name: UNCATEGORIZED_GROUP_NAME,
  open: false,
  data: uncat_messages_list.map(m => m.id),
};

test("validate one message", t => {
  const initial = MESSAGE_ONE;
  const validated = validate_import_data(initial) as TTS.ExportedMessage;
  t.deepEqual(initial, validated);
});

test("validate one message in array", t => {
  const initial = [MESSAGE_ONE];
  const validated = validate_import_data(initial) as TTS.ExportData["messages"];
  t.deepEqual(initial, validated);
});

test("validate many messages", t => {
  const initial = [MESSAGE_ONE, MESSAGE_TWO, MESSAGE_THREE];
  const validated = validate_import_data(initial) as TTS.ExportData["messages"];
  t.deepEqual(initial, validated);
});

test("import one message", t => {
  const { __type, ...message_one } = MESSAGE_ONE;
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
    MESSAGE_ONE,
    settings,
    messages_list,
    [],
    message_categories,
    uncat_category,
    []
  );
  t.deepEqual(messages_result, [...messages_list, message_one]);
  t.deepEqual(get_uncategorized(messages_result, message_categories), [
    ...uncat_messages_list,
    message_one,
  ]);
  t.deepEqual(uncat_result, {
    ...uncat_category,
    data: uncat_category.data.concat([message_one.id]),
  });

  t.is(settings_result, undefined);
  t.is(snippets_result, undefined);
  t.is(snippets_sections_result, undefined);
  t.is(categories_result, undefined);
  t.deepEqual(dup_messages, []);
  t.deepEqual(rename_messages, []);
  t.deepEqual(dup_snippets, []);
  t.deepEqual(uncategorized_snippets, []);
});

test("import one message in array", t => {
  const { __type, ...message_one } = MESSAGE_ONE;
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
    [MESSAGE_ONE],
    settings,
    messages_list,
    [],
    message_categories,
    uncat_category,
    []
  );
  t.deepEqual(messages_result, [...messages_list, message_one]);
  t.deepEqual(get_uncategorized(messages_result, message_categories), [
    ...uncat_messages_list,
    message_one,
  ]);
  t.deepEqual(uncat_result, {
    ...uncat_category,
    data: uncat_category.data.concat([message_one.id]),
  });

  t.is(settings_result, undefined);
  t.is(snippets_result, undefined);
  t.is(snippets_sections_result, undefined);
  t.is(categories_result, undefined);
  t.deepEqual(dup_messages, []);
  t.deepEqual(rename_messages, []);
  t.deepEqual(dup_snippets, []);
  t.deepEqual(uncategorized_snippets, []);
});

test("import many messages", t => {
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
    [MESSAGE_ONE, MESSAGE_TWO, MESSAGE_THREE],
    settings,
    messages_list,
    [],
    message_categories,
    uncat_category,
    []
  );
  t.deepEqual(messages_result, [
    ...messages_list,
    message_one,
    message_two,
    message_three,
  ]);
  t.deepEqual(get_uncategorized(messages_result, message_categories), [
    ...uncat_messages_list,
    message_one,
    message_two,
    message_three,
  ]);

  t.deepEqual(uncat_result, {
    ...uncat_category,
    data: uncat_category.data.concat([
      message_one.id,
      message_two.id,
      message_three.id,
    ]),
  });

  t.is(settings_result, undefined);
  t.is(snippets_result, undefined);
  t.is(snippets_sections_result, undefined);
  t.is(categories_result, undefined);
  t.deepEqual(dup_messages, []);
  t.deepEqual(rename_messages, []);
  t.deepEqual(dup_snippets, []);
  t.deepEqual(uncategorized_snippets, []);
});

test("import message with duplicate text", t => {
  const { __type: _1, ...message_one } = MESSAGE_ONE;
  const duplicate: TTS.ExportedMessage = {
    ...MESSAGE_ONE,
    name: "duplicate text",
  };
  const { __type, ...dupe_result } = duplicate;
  const uncat_input = {
    ...uncat_category,
    data: uncat_category.data.concat([message_one.id]),
  };
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
    duplicate,
    settings,
    [...messages_list, message_one],
    [],
    message_categories,
    uncat_input,
    []
  );

  t.is(messages_result, undefined);
  t.deepEqual(dup_messages, [dupe_result]);

  t.is(categories_result, undefined);
  t.is(settings_result, undefined);
  t.is(snippets_result, undefined);
  t.is(snippets_sections_result, undefined);
  t.deepEqual(uncat_result, uncat_input);
  t.deepEqual(rename_messages, []);
  t.deepEqual(dup_snippets, []);
  t.deepEqual(uncategorized_snippets, []);
});

test("import message with duplicate name", t => {
  const { __type: _1, ...message_one } = MESSAGE_ONE;
  const duplicate: TTS.ExportedMessage = {
    ...MESSAGE_ONE,
    id: "duplicate-message-1",
    text: "duplicate name",
  };
  const { __type, ...dupe_result } = duplicate;
  const uncat_input = {
    ...uncat_category,
    data: uncat_category.data.concat([message_one.id]),
  };
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
    duplicate,
    settings,
    [...messages_list, message_one],
    [],
    message_categories,
    uncat_input,
    []
  );

  t.is(messages_result, undefined);
  t.deepEqual(rename_messages, [dupe_result]);

  t.is(settings_result, undefined);
  t.is(snippets_result, undefined);
  t.is(snippets_sections_result, undefined);
  t.is(categories_result, undefined);
  t.deepEqual(uncat_result, uncat_input);
  t.deepEqual(dup_messages, []);
  t.deepEqual(dup_snippets, []);
  t.deepEqual(uncategorized_snippets, []);
});

test("reject importing exact duplicate message", t => {
  const { __type: _1, ...message_one } = MESSAGE_ONE;
  const uncat_input = {
    ...uncat_category,
    data: uncat_category.data.concat([message_one.id]),
  };
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
    MESSAGE_ONE,
    settings,
    [...messages_list, message_one],
    [],
    message_categories,
    uncat_input,
    []
  );

  t.is(messages_result, undefined);
  t.is(settings_result, undefined);
  t.is(snippets_result, undefined);
  t.is(snippets_sections_result, undefined);
  t.is(categories_result, undefined);
  t.deepEqual(uncat_result, uncat_input);
  t.deepEqual(dup_messages, []);
  t.deepEqual(rename_messages, []);
  t.deepEqual(dup_snippets, []);
  t.deepEqual(uncategorized_snippets, []);
});

test("import mix of duplicate messages", t => {
  const { __type: _1, ...message_one } = MESSAGE_ONE;
  const duplicate_1: TTS.ExportedMessage = {
    ...MESSAGE_ONE,
    name: "duplicate text",
  };
  const { __type: _2, ...dupe_result_1 } = duplicate_1;
  const { __type: _3, ...message_two } = MESSAGE_TWO;
  const duplicate_2: TTS.ExportedMessage = {
    ...MESSAGE_TWO,
    text: "duplicate name",
  };
  const { __type: _4, ...dupe_result_2 } = duplicate_2;
  const { __type: _5, ...message_three } = MESSAGE_THREE;
  const duplicate_3: TTS.ExportedMessage = MESSAGE_THREE;
  const { __type: _6, ...message_four } = MESSAGE_FOUR;
  const duplicate_5: TTS.ExportedMessage = {
    ...MESSAGE_FOUR,
    text: "duplicate name",
  };
  const { __type: _8, ...dupe_result_5 } = duplicate_5;

  const initial_messages = [
    ...messages_list,
    message_one,
    message_two,
    message_three,
  ];
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
    [duplicate_1, duplicate_2, duplicate_3, MESSAGE_FOUR, duplicate_5],
    settings,
    initial_messages,
    [],
    message_categories,
    {
      ...uncat_category,
      data: uncat_category.data.concat([
        message_one.id,
        message_two.id,
        message_three.id,
      ]),
    },
    []
  );

  t.deepEqual(messages_result, [...initial_messages, message_four]);
  t.deepEqual(dup_messages, [dupe_result_1]);
  t.deepEqual(
    rename_messages.map(m => ({ ...m, id: "" })),
    [
      { ...dupe_result_2, id: "" },
      { ...dupe_result_5, id: "" },
    ]
  );
  t.true(rename_messages[0].id !== dupe_result_2.id);
  t.true(rename_messages[1].id !== dupe_result_5.id);
  t.deepEqual(get_uncategorized(messages_result, message_categories), [
    ...uncat_messages_list,
    message_one,
    message_two,
    message_three,
    message_four,
  ]);
  t.deepEqual(uncat_result, {
    ...uncat_category,
    data: uncat_category.data.concat([
      message_one.id,
      message_two.id,
      message_three.id,
      message_four.id,
    ]),
  });

  t.is(settings_result, undefined);
  t.is(snippets_result, undefined);
  t.is(snippets_sections_result, undefined);
  t.is(categories_result, undefined);
  t.deepEqual(dup_snippets, []);
  t.deepEqual(uncategorized_snippets, []);
});

test("create new id for different message with same id", t => {
  const { __type: _1, ...message_one } = MESSAGE_ONE;
  const { __type: _2, ...message_two } = MESSAGE_TWO;
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
    { ...MESSAGE_TWO, id: MESSAGE_ONE.id },
    settings,
    [...messages_list, message_one],
    [],
    message_categories,
    {
      ...uncat_category,
      data: uncat_category.data.concat([message_one.id]),
    },
    []
  );

  const new_msg = messages_result?.find(
    m => m.name === message_two.name && m.text === message_two.text
  );

  t.deepEqual(new_msg, { ...message_two, id: new_msg?.id });
  t.deepEqual(messages_result, [
    ...messages_list,
    message_one,
    { ...message_two, id: new_msg?.id },
  ]);
  t.deepEqual(uncat_result, {
    ...uncat_category,
    data: uncat_category.data.concat([message_one.id, new_msg?.id]),
  });

  t.is(settings_result, undefined);
  t.is(snippets_result, undefined);
  t.is(snippets_sections_result, undefined);
  t.is(categories_result, undefined);
  t.deepEqual(dup_messages, []);
  t.deepEqual(rename_messages, []);
  t.deepEqual(dup_snippets, []);
  t.deepEqual(uncategorized_snippets, []);
});

test("reject duplicate message with different id", t => {
  const { __type: _1, ...message_one } = MESSAGE_ONE;
  const M_TWO = { ...MESSAGE_ONE, id: "duplicate-id" };
  const uncat_input = {
    ...uncat_category,
    data: uncat_category.data.concat([message_one.id]),
  };
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
    M_TWO,
    settings,
    [...messages_list, message_one],
    [],
    message_categories,
    uncat_input,
    []
  );

  t.is(messages_result, undefined);
  t.is(settings_result, undefined);
  t.is(snippets_result, undefined);
  t.is(snippets_sections_result, undefined);
  t.is(categories_result, undefined);
  t.deepEqual(uncat_result, uncat_input);
  t.deepEqual(dup_messages, []);
  t.deepEqual(rename_messages, []);
  t.deepEqual(dup_snippets, []);
  t.deepEqual(uncategorized_snippets, []);
});

test("validate one message with missing id", t => {
  const initial = MESSAGE_ONE;
  const { id, ...message_one_input } = MESSAGE_ONE;
  const validated = validate_import_data(
    message_one_input
  ) as TTS.ExportedMessage;
  t.is(id.length, validated.id?.length);
  t.deepEqual(initial, { ...validated, id });
});
