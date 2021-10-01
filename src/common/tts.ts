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
  end_time?: number
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
  if (end_time && end_time > 0) {
    const listener = () => {
      if (audio.currentTime >= end_time + 1) {
        audio.pause();
        audio.removeEventListener("timeupdate", listener);
      }
    };
    audio.addEventListener("timeupdate", listener);
  }
  audio.play().then(() => {
    console.log(`pausing at: ${end_time + 1}`, audio.duration, end_time);
  });
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

// predicts duration of text before speed modifier
// x: duration of text without speed modifier
// y: number of speed modifier characters
const speed_duration_equations = {
  Brian: {
    [SPEED_CHARS[0]]: (x, y) =>
      -0.004804943951 * Math.pow(x, 2) +
      1.034989221 * x +
      0.0001032108018 * Math.pow(y, 2) +
      -0.01230543739 * y +
      -0.02559110019,
    [SPEED_CHARS[1]]: (x, y) =>
      -0.006894924164 * Math.pow(x, 2) +
      1.10503311 * x +
      0.00008364119949 * Math.pow(y, 2) +
      -0.01117538952 * y +
      -0.05257275558,
    [SPEED_CHARS[2]]: (x, y) =>
      0.04697671721 * Math.pow(x, 2) +
      0.8024347343 * x +
      -0.00008669458965 * Math.pow(y, 2) +
      0.01149287335 * y +
      -0.05711350097,
  },
  Amy: {
    [SPEED_CHARS[0]]: (x, y) =>
      -0.0004864875063 * Math.pow(x, 2) +
      0.06758773105 * x +
      -0.06136184459 * Math.pow(y, 2) +
      1.865900893 * y +
      -3.127775073,
    [SPEED_CHARS[1]]: (x, y) =>
      -0.0002582598232 * Math.pow(x, 2) +
      0.04793784106 * x +
      -0.0746356267 * Math.pow(y, 2) +
      1.990340676 * y +
      -3.120363155,
    [SPEED_CHARS[2]]: (x, y) =>
      -0.000003997373737 * Math.pow(x, 2) +
      -0.0009238623232 * x +
      -0.0307274085 * Math.pow(y, 2) +
      1.353685899 * y +
      -0.6190789821,
  },
};

const MSG_SPED_DURATION_REQ: TTS.TTSRequest = {
  text: "",
  promise: new Promise(() => {}),
  data: "",
};

const MSG_DURATION_REQ: TTS.TTSRequest = {
  text: "",
  promise: new Promise(() => {}),
  data: "",
};

const get_duration = async (
  text: string,
  voice: string,
  request?: TTS.TTSRequest
) => {
  if (!text || !voice) {
    return;
  }

  const audio = document.getElementById(
    "measure-duration-audio"
  ) as HTMLAudioElement;
  const source = document.getElementById(
    "measure-duration-source"
  ) as HTMLSourceElement;
  if (!audio || !source) {
    return;
  }

  const data = await get_tts_data(text, request, voice).catch(err => {
    console.error(
      `Error occurred while trying to measure message duration:`,
      err
    );
    return;
  });
  if (!data) {
    return;
  }

  return new Promise<number>(resolve => {
    audio.addEventListener(
      "canplaythrough",
      () => {
        resolve(audio.duration);
      },
      { once: true }
    );
    source.src = data;
    audio.load();
  });
};

const SPEED_BREAK_REGEX = /[,./?;:[\]{}|!()\\](.*?)$/i;

export const predict_duration = async (
  message: TTS.Message
  // part: "message" | "speed",
): Promise<number | undefined> => {
  const { speed, voice, speed_char, max_length } = message.options;

  const base_duration = await get_duration(
    message.text,
    voice,
    MSG_DURATION_REQ
  );
  if (!speed || max_length <= message.text.length) {
    return base_duration;
  }

  let duration = base_duration;
  const match = message.text.match(SPEED_BREAK_REGEX);
  if (match && match[1]) {
    const sped_duration = await get_duration(
      match[1],
      voice,
      MSG_SPED_DURATION_REQ
    );
    const predicted_sped_duration = speed_duration_equations[voice]?.[
      speed_char
    ]?.(sped_duration, get_speed_modifier(message).length);
    duration = base_duration - sped_duration + predicted_sped_duration;
  } else {
    duration = speed_duration_equations[voice]?.[speed_char]?.(
      duration,
      get_speed_modifier(message).length
    );
  }

  return duration;
};
