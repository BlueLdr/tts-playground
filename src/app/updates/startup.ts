import {
  DEFAULT_SPEED_CHAR,
  DEFAULT_VOICE,
  generate_id,
  get_stored_messages,
  get_stored_snippets,
  set_stored_message_categories,
  set_stored_messages,
  set_stored_snippets_sections,
  set_stored_snippets,
} from "~/common";
import { sample_messages, sample_snippets } from "~/common/sample-data";
import { snippet_to_string } from "~/view/utils";

const prev_version = localStorage.getItem("tts-loaded-version");
const cur_version = process.env.TTS_VERSION;

const get_version_number = (version: string) =>
  parseInt((version ?? "1.0.0").replace(/[^0-9]/gi, ""));
const prev_ver_num = prev_version ? get_version_number(prev_version) : 0;
const cur_ver_num = get_version_number(cur_version);

export const add_props_to_messages = () => {
  let messages: TTS.Message[] = get_stored_messages() ?? [];
  messages = messages.map((m, i) => {
    if (!m.id) {
      const index = sample_messages.findIndex(
        sm => sm.name === m.name && sm.text === m.text
      );
      m.id = index > -1 ? `sample-message-${index + 1}` : generate_id(m.text);
    }
    return {
      ...m,
      options: {
        ...m.options,
        voice: m.options.voice ?? DEFAULT_VOICE,
        speed_char: m.options.speed_char ?? DEFAULT_SPEED_CHAR,
      },
    };
  });
  set_stored_messages(messages);
};

export const add_messages_to_categories = () => {
  let messages: TTS.Message[] = get_stored_messages() ?? [];
  const samples: TTS.MessageCategory = {
    name: "Sample Messages",
    open: true,
    data: [],
  };

  messages.forEach(m => {
    if (
      sample_messages.some(
        sm => sm.id === m.id || (sm.name === m.name && sm.text === m.text)
      )
    ) {
      samples.data.push(m.id);
    }
  });

  set_stored_message_categories([samples]);
};

export const convert_snippets_to_categories = () => {
  const snippet_sections = get_stored_snippets() as unknown as (Omit<
    TTS.SnippetsSection,
    "data"
  > & { data: TTS.Snippet[] })[];
  // @ts-expect-error:
  if (snippet_sections === sample_snippets) {
    return;
  }
  const snippets: TTS.Snippet[] = [];
  const snippet_categories: TTS.SnippetsSection[] = snippet_sections.map(s => ({
    ...s,
    data: s.data.map(sn => {
      if (!sn.id) {
        sn.id = generate_id(snippet_to_string(sn));
      }
      snippets.push(sn);
      return sn.id;
    }),
  }));
  set_stored_snippets_sections(snippet_categories);
  set_stored_snippets(snippets);
};

const UPDATES: { [key: string]: (() => void)[] } = {
  "v1.1.0": [add_props_to_messages],
  "v1.3.0": [add_messages_to_categories, convert_snippets_to_categories],
};

const perform_updates = async (todo: (() => void)[]) => {
  for (const action of todo) {
    action();
  }
  localStorage.setItem("tts-loaded-version", cur_version);
  window.location.reload();
};

const check_updates = (): boolean => {
  if (cur_version === prev_version) {
    return false;
  }

  const todo = Object.entries(UPDATES)
    .filter(([v]) => {
      const num = get_version_number(v);
      return num <= cur_ver_num && num > prev_ver_num;
    })
    .reduce((list, [, actions]) => list.concat(actions), []);

  if (todo.length <= 0) {
    localStorage.setItem("tts-loaded-version", cur_version);
    return false;
  }

  perform_updates(todo);
  return true;
};

export default check_updates;
