import test from "ava";
import {
  add_props_to_messages,
  add_messages_to_categories,
  convert_snippets_to_categories,
} from "~/app/updates/startup";
import {
  get_stored_message_categories,
  get_stored_messages,
  get_stored_snippets_sections,
  get_stored_snippets,
  set_stored_messages,
  set_stored_snippets,
} from "~/common";

import {
  OLD_MESSAGES as OLD_MESSAGES_110,
  NEW_MESSAGES as NEW_MESSAGES_110,
  // @ts-expect-error:
} from "./data/v1-1-0-data.ts";

import {
  OLD_MESSAGES as OLD_MESSAGES_130,
  NEW_MESSAGE_CATEGORIES as NEW_MESSAGE_CATEGORIES_130,
  NEW_SNIPPETS as NEW_SNIPPETS_130,
  NEW_SNIPPETS_SECTIONS as NEW_SNIPPETS_SECTIONS_130,
  OLD_SNIPPETS as OLD_SNIPPETS_130,
  // @ts-expect-error:
} from "./data/v1-3-0-data.ts";

test(`apply migration for "add_props_to_messages"`, async t => {
  localStorage.clear();
  set_stored_messages(OLD_MESSAGES_110);

  add_props_to_messages();
  const new_msgs = get_stored_messages();

  t.deepEqual(new_msgs.slice(0, 2), NEW_MESSAGES_110.slice(0, 2));
  t.deepEqual({ ...new_msgs[2], id: "" }, NEW_MESSAGES_110[2]);
  t.regex(new_msgs[2].id, /[0-9a-f]{32}/i);

  t.teardown(localStorage.clear);
});

test(`apply migration for "add_messages_to_categories"`, async t => {
  localStorage.clear();
  set_stored_messages(OLD_MESSAGES_130);

  add_messages_to_categories();
  const new_msgs = get_stored_messages();
  const new_cats = get_stored_message_categories();

  t.deepEqual(new_msgs, OLD_MESSAGES_130);
  t.deepEqual(new_cats, NEW_MESSAGE_CATEGORIES_130);

  t.teardown(localStorage.clear);
});

test(`apply migration for "convert_snippets_to_categories"`, async t => {
  localStorage.clear();
  set_stored_snippets(OLD_SNIPPETS_130);

  convert_snippets_to_categories();
  const new_snippets = get_stored_snippets();
  const new_sections = get_stored_snippets_sections();

  t.is(new_sections.length, 3);
  t.deepEqual(new_sections[0], {
    ...NEW_SNIPPETS_SECTIONS_130[0],
    data: [new_snippets[0].id, new_snippets[1].id],
  });

  t.deepEqual(new_sections[1], {
    ...NEW_SNIPPETS_SECTIONS_130[1],
    data: [new_snippets[2].id, new_snippets[3].id, new_snippets[4].id],
  });

  t.deepEqual(new_sections[2], {
    ...NEW_SNIPPETS_SECTIONS_130[2],
    data: [new_snippets[5].id, new_snippets[6].id],
  });

  t.deepEqual(
    new_snippets.map(s => ({ ...s, id: "" })),
    NEW_SNIPPETS_130
  );

  t.plan(new_snippets.length + 5);
  new_snippets.forEach(s => {
    t.regex(s.id, /[0-9a-f]{32}/i);
  });

  t.teardown(localStorage.clear);
});
