import test from "ava";
import {
  MESSAGE_SCHEMA,
  SETTINGS_SCHEMA,
  SNIPPET_SCHEMA,
  SNIPPET_SECTION_SCHEMA,
  conform_to_schema,
  MESSAGE_CATEGORY_SCHEMA,
} from "~/model";
// @ts-expect-error:
import { MESSAGE_CATEGORY_THREE } from "./data/message-categories.ts";

// @ts-expect-error:
import { MESSAGE_ONE } from "./data/messages.ts";
// @ts-expect-error:
import { SETTINGS } from "./data/settings.ts";
import {
  SNIPPET_ONE,
  SNIPPET_SECTION_ONE,
  SNIPPET_TWO,
  // @ts-expect-error:
} from "./data/snippets.ts";

test("conform valid message", t => {
  const { __type, ...initial } = MESSAGE_ONE;
  const conformed = conform_to_schema(initial, MESSAGE_SCHEMA);
  t.deepEqual(conformed, initial);
});

test("conform message with extra property", t => {
  const { __type, ...initial } = MESSAGE_ONE;
  const conformed = conform_to_schema(
    { ...initial, bad_property: "bad" },
    MESSAGE_SCHEMA
  );
  t.deepEqual(conformed, initial);
});

test("reject message with missing required property", t => {
  const { __type, name, ...initial } = MESSAGE_ONE;
  const conformed = conform_to_schema(initial, MESSAGE_SCHEMA);
  t.is(conformed, null);
});

test("conform message with extra property in options", t => {
  const { __type, ...initial } = MESSAGE_ONE;
  const conformed = conform_to_schema(
    { ...initial, options: { ...initial.options, bad_property: "bad" } },
    MESSAGE_SCHEMA
  );
  t.deepEqual(conformed, initial);
});

test("conform message with missing optional property in options", t => {
  const { __type, ...initial } = MESSAGE_ONE;
  const { speed, ...options } = initial.options;
  const conformed = conform_to_schema({ ...initial, options }, MESSAGE_SCHEMA);
  t.deepEqual(conformed, {
    ...initial,
    options: {
      ...initial.options,
      speed: MESSAGE_SCHEMA.options.type.speed.default,
    },
  });
});

test("conform valid snippet", t => {
  const { __type, ...initial } = SNIPPET_ONE;
  const conformed = conform_to_schema(initial, SNIPPET_SCHEMA);
  t.deepEqual(conformed, initial);
});

test("conform snippet with extra property", t => {
  const { __type, ...initial } = SNIPPET_ONE;
  const conformed = conform_to_schema(
    { ...initial, bad_property: "bad" },
    SNIPPET_SCHEMA
  );
  t.deepEqual(conformed, initial);
});

test("reject snippet with missing required property", t => {
  const { __type, text, ...initial } = SNIPPET_ONE;
  const conformed = conform_to_schema(initial, SNIPPET_SCHEMA);
  t.is(conformed, null);
});

test("conform snippet with extra property in options", t => {
  const { __type, ...initial } = SNIPPET_ONE;
  const conformed = conform_to_schema(
    { ...initial, options: { ...initial.options, bad_property: "bad" } },
    SNIPPET_SCHEMA
  );
  t.deepEqual(conformed, initial);
});

test("conform snippet with missing optional property in options", t => {
  const { __type, ...initial } = SNIPPET_ONE;
  const { default_count, ...options } = initial.options;
  const conformed = conform_to_schema({ ...initial, options }, SNIPPET_SCHEMA);
  t.deepEqual(conformed, {
    ...initial,
    options: {
      ...initial.options,
      default_count: SNIPPET_SCHEMA.options.type.default_count.default,
    },
  });
});

test("conform valid snippet section", t => {
  const { __type, ...section_one } = SNIPPET_SECTION_ONE;
  const initial = {
    ...section_one,
    data: section_one.data.map(({ __type: _, ...d }) => d),
  };
  const conformed = conform_to_schema(initial, SNIPPET_SECTION_SCHEMA);
  t.deepEqual(conformed, initial);
});

test("conform snippet section with extra property", t => {
  const { __type, ...section_one } = SNIPPET_SECTION_ONE;
  const initial = {
    ...section_one,
    data: section_one.data.map(({ __type: _, ...d }) => d),
  };
  const conformed = conform_to_schema(
    { ...initial, bad_property: "bad" },
    SNIPPET_SECTION_SCHEMA
  );
  t.deepEqual(conformed, initial);
});

test("conform snippet section with missing optional property", t => {
  const { __type, open, ...section_one } = SNIPPET_SECTION_ONE;
  const initial = {
    ...section_one,
    data: section_one.data.map(({ __type: _, ...d }) => d),
  };
  const conformed = conform_to_schema(initial, SNIPPET_SECTION_SCHEMA);
  t.deepEqual(conformed, {
    ...initial,
    open: SNIPPET_SECTION_SCHEMA.open.default,
  });
});

test("reject snippet section with missing required property", t => {
  const { __type, name, ...initial } = SNIPPET_SECTION_ONE;
  const conformed = conform_to_schema(initial, SNIPPET_SECTION_SCHEMA);
  t.is(conformed, null);
});

test("conform snippet section with snippet with extra property", t => {
  const { __type: _1, ...snippet_one } = SNIPPET_ONE;
  const { __type: _2, ...snippet_two } = SNIPPET_TWO;
  const { __type: _3, ...section } = SNIPPET_SECTION_ONE;
  const conformed = conform_to_schema(
    {
      ...section,
      data: [{ ...snippet_one, bad_property: "bad" }, snippet_two],
    },
    SNIPPET_SECTION_SCHEMA
  );
  t.deepEqual(conformed, { ...section, data: [snippet_one, snippet_two] });
});

test("conform snippet section with rejecting snippet with missing required property", t => {
  const { __type: _1, text, ...snippet_one } = SNIPPET_ONE;
  const { __type: _2, ...snippet_two } = SNIPPET_TWO;
  const { __type: _3, ...section } = SNIPPET_SECTION_ONE;
  const conformed = conform_to_schema(
    { ...section, data: [snippet_one, snippet_two] },
    SNIPPET_SECTION_SCHEMA
  );
  t.deepEqual(conformed, { ...section, data: [snippet_two] });
});

test("conform snippet section with conforming snippet with extra property in options", t => {
  const { __type: _1, ...snippet_one } = SNIPPET_ONE;
  const { __type: _2, ...snippet_two } = SNIPPET_TWO;
  const { __type: _3, ...section } = SNIPPET_SECTION_ONE;
  const conformed = conform_to_schema(
    {
      ...section,
      data: [
        {
          ...snippet_one,
          options: { ...snippet_one.options, bad_property: "bad" },
        },
        snippet_two,
      ],
    },
    SNIPPET_SECTION_SCHEMA
  );
  t.deepEqual(conformed, { ...section, data: [snippet_one, snippet_two] });
});

test("conform snippet section with conforming snippet with missing optional property in options", t => {
  const { __type: _1, ...snippet_one } = SNIPPET_ONE;
  const { __type: _2, ...snippet_two } = SNIPPET_TWO;
  const { __type: _3, ...section } = SNIPPET_SECTION_ONE;
  const { default_count, ...options } = snippet_one.options;
  const conformed = conform_to_schema(
    { ...section, data: [{ ...snippet_one, options }, snippet_two] },
    SNIPPET_SECTION_SCHEMA
  );
  t.deepEqual(conformed, {
    ...section,
    data: [
      {
        ...snippet_one,
        options: {
          ...snippet_one.options,
          default_count: SNIPPET_SCHEMA.options.type.default_count.default,
        },
      },
      snippet_two,
    ],
  });
});

test("conform valid settings", t => {
  const { __type, ...settings } = SETTINGS;
  const conformed = conform_to_schema(settings, SETTINGS_SCHEMA);
  t.deepEqual(conformed, settings);
});

test("conform settings with extra property", t => {
  const { __type, ...settings } = SETTINGS;
  const conformed = conform_to_schema(
    { ...settings, bad_property: "bad" },
    SETTINGS_SCHEMA
  );
  t.deepEqual(conformed, settings);
});

test("conform settings with missing property", t => {
  const { __type, history_steps, ...settings } = SETTINGS;
  const conformed = conform_to_schema(settings, SETTINGS_SCHEMA);
  t.deepEqual(conformed, {
    ...settings,
    history_steps: SETTINGS_SCHEMA.history_steps.default,
  });
});

test("conform valid message category", t => {
  const { __type, ...cat } = MESSAGE_CATEGORY_THREE;
  const conformed = conform_to_schema(cat, MESSAGE_CATEGORY_SCHEMA);
  t.deepEqual(conformed, cat);
});

test("conform message category with extra property", t => {
  const { __type, ...cat } = MESSAGE_CATEGORY_THREE;
  const conformed = conform_to_schema(
    { ...cat, extra: true },
    MESSAGE_CATEGORY_SCHEMA
  );
  t.deepEqual(conformed, cat);
});

test("conform message category with missing optional property", t => {
  const { __type, open, ...cat } = MESSAGE_CATEGORY_THREE;
  const conformed = conform_to_schema(cat, MESSAGE_CATEGORY_SCHEMA);
  t.deepEqual(conformed, { ...cat, open: false });
});

test("conform message category with missing multi property", t => {
  const { __type, data, ...cat } = MESSAGE_CATEGORY_THREE;
  const conformed = conform_to_schema(cat, MESSAGE_CATEGORY_SCHEMA);
  t.deepEqual(conformed, { ...cat, data: [] });
});

test("reject message category with missing required property", t => {
  const { __type, name, ...cat } = MESSAGE_CATEGORY_THREE;
  const conformed = conform_to_schema(cat, MESSAGE_CATEGORY_SCHEMA);
  t.deepEqual(conformed, null);
});
