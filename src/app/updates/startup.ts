import {
  DEFAULT_SPEED_CHAR,
  DEFAULT_VOICE,
  get_stored_messages,
  set_stored_messages,
} from "~/common";

const prev_version = localStorage.getItem("tts-loaded-version");
const cur_version = process.env.TTS_VERSION;

const get_version_number = (version: string) =>
  parseInt((version ?? "1.0.0").replace(/[^0-9]/gi, ""));
const prev_ver_num = prev_version ? get_version_number(prev_version) : 0;
const cur_ver_num = get_version_number(cur_version);

const add_props_to_messages = async () => {
  let messages: TTS.Message[] = get_stored_messages() ?? [];
  messages = messages.map(m => ({
    ...m,
    options: {
      ...m.options,
      voice: m.options.voice ?? DEFAULT_VOICE,
      speed_char: m.options.speed_char ?? DEFAULT_SPEED_CHAR,
    },
  }));
  set_stored_messages(messages);
};

const UPDATES: { [key: string]: (() => Promise<void>)[] } = {
  "v1.1.0": [add_props_to_messages],
};

const perform_updates = async (todo: (() => Promise<void>)[]) => {
  for (const action of todo) {
    await action();
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
