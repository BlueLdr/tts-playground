import {
  get_tts_data,
  PAUSE_CHAR_SPEED_MODIFIED,
  VOICE_NAMES,
} from "../src/common";

const await_timeout = <T extends any>(cb: () => T, delay) =>
  new Promise<T>(resolve => {
    setTimeout(() => resolve(cb()), delay);
  });
const test_pauses = async () => {
  const test_results = {};
  const audio = document.createElement("AUDIO") as HTMLAudioElement;
  audio.classList.add("invisible");
  const source = document.createElement("SOURCE") as HTMLSourceElement;
  audio.appendChild(source);
  document.body.appendChild(audio);

  const test_one = async (voice: string, char: string, count: number) => {
    const str = `t. ${char.repeat(count)} t`;
    source.src = await get_tts_data(str, voice);
    audio.load();
    return await_timeout(() => audio.duration, 1000);
  };

  const test_char = async (voice: string, char: string) => {
    const results = {};
    for (let i = 0; i < 20; i++) {
      results[i] = await test_one(voice, char, i);
    }
    return await_timeout(() => results, 40001);
  };

  const test_voice = async (voice: string) => ({
    slash: await test_char(voice, "/ "),
    speed: await test_char(voice, PAUSE_CHAR_SPEED_MODIFIED),
  });

  for (let voice of VOICE_NAMES) {
    test_results[voice] = await test_voice(voice);
  }

  return test_results;
};

export default test_pauses;
