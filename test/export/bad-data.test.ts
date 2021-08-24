import test from "ava";
import { validate_import_data } from "~/view/components/export/utils";
// @ts-expect-error:
import { MESSAGE_CATEGORY_ONE } from "./data/message-categories.ts";
// @ts-expect-error:
import { MESSAGE_ONE, MESSAGE_TWO } from "./data/messages.ts";
// @ts-expect-error:
import { SNIPPET_ONE, SNIPPET_SECTION_ONE } from "./data/snippets.ts";

test("return null when validating data without a `__type`", t => {
  const { __type, ...data } = MESSAGE_ONE;
  const result = validate_import_data(data);
  t.is(result, null);
});

test("return null when validating data without a `__type` in an array", t => {
  const { __type, ...data } = MESSAGE_ONE;
  const result = validate_import_data([data, MESSAGE_TWO]);
  t.deepEqual(result, [MESSAGE_TWO]);
});

test("return null when validating snippet without a `__type` in a snippet section", t => {
  const { __type, ...s_one } = SNIPPET_ONE;
  const result = validate_import_data({
    ...SNIPPET_SECTION_ONE,
    data: [...SNIPPET_SECTION_ONE.data, s_one],
  });
  t.deepEqual(result, SNIPPET_SECTION_ONE);
});

test("return null when validating category with mix of ids and records", t => {
  const result = validate_import_data({
    ...MESSAGE_CATEGORY_ONE,
    data: [...MESSAGE_CATEGORY_ONE.data, "some-id"],
  });
  t.deepEqual(result, null);
});
