import { DEFAULT_VOICE, SPEED_CHARS } from "~/common/constants";
import { do_alert } from "./utils";

export const TTS_URL = (voice: string = DEFAULT_VOICE) =>
  `https://api.streamelements.com/kappa/v2/speech?voice=${voice}&text=`;

const REQUEST: TTS.TTSRequest = {
  text: "",
  promise: new Promise(() => {}),
  data: "",
};

/**
 * @param text {string}
 * @param request {TTS.TTSRequest} cached request to handle resending the same string
 * @param voice {string}
 * @returns {Promise<string>}
 */
export const get_tts_data = async (
  text: string,
  request: TTS.TTSRequest = REQUEST,
  voice: string = DEFAULT_VOICE
): Promise<string> => {
  if (!text) {
    return Promise.reject();
  }
  let speak;
  if (`${voice}:${text}` === request.text && request.promise) {
    speak = await request.promise;
  } else {
    request.text = `${voice}:${text}`;
    request.data = "";
    speak = await fetch(TTS_URL(voice) + encodeURIComponent(text.trim()));
    request.promise = speak;
  }

  if (speak.status != 200) {
    do_alert(await speak.text());
    request.text = "";
    return Promise.reject(speak.error());
  }

  if (!request.data) {
    const mp3 = await speak.blob();
    request.data = URL.createObjectURL(mp3);
  }

  return request.data;
};

export const play_audio = (
  audioElemId?: string,
  should_load: boolean = true,
  start_time: number = 0,
  speed_duration?: number
) => {
  const audio = document.getElementById(
    audioElemId ? `${audioElemId}-audio` : "audio"
  );
  if (!(audio instanceof HTMLAudioElement)) {
    return;
  }
  audio.pause();
  if (should_load) {
    if (start_time > 0) {
      audio.addEventListener(
        "canplaythrough",
        () => {
          audio.currentTime = start_time;
        },
        { once: true }
      );
    }
    audio.load();
  } else {
    audio.currentTime = start_time;
  }
  if (speed_duration && speed_duration > 1) {
    const listener = () => {
      if (audio.currentTime >= audio.duration - (speed_duration - 1)) {
        audio.pause();
        audio.removeEventListener("timeupdate", listener);
      }
    };
    audio.addEventListener("timeupdate", listener);
  }
  audio.play();
};

export const get_speed_modifier = (message: TTS.Message) => {
  const {
    text,
    options: { max_length, speed, bits, speed_char },
  } = message;
  let text_ = bits ? `${bits} ${text}` : text;
  if (!speed || !speed_char || text_.length >= max_length - 1) {
    return "";
  }
  return speed_char
    .repeat(max_length - text_.length)
    .slice(0, max_length - text_.length);
};

const speed_duration_equations = {
  Brian: {
    [SPEED_CHARS[0]]: x =>
      0.001249077065 * Math.pow(x, 2) + 1.891549826 * x + -0.9050918154,
    [SPEED_CHARS[1]]: x =>
      0.007447843372 * Math.pow(x, 2) + 0.9027950477 * x + 3.866205369,
    [SPEED_CHARS[2]]: x =>
      0.00002427313534 * Math.pow(x, 2) + 1.480221574 * x + -0.7835359939,
  },
  Amy: {
    [SPEED_CHARS[0]]: x =>
      0.002780203469 * Math.pow(x, 2) + 1.878014901 * x + -4.378397652,
    [SPEED_CHARS[1]]: x =>
      -0.001120588997 * Math.pow(x, 2) + 1.93570933 * x + -9.492824928,
    [SPEED_CHARS[2]]: x =>
      0.0001373480406 * Math.pow(x, 2) + 1.293335907 * x + -0.7659803924,
  },
};

export const get_speed_duration = (
  message: TTS.Message
): number | undefined => {
  const { speed, voice, speed_char, max_length } = message.options;
  if (!speed || max_length <= message.text.length) {
    return;
  }
  return speed_duration_equations[voice]?.[speed_char]?.(
    get_speed_modifier(message).length
  );
};
