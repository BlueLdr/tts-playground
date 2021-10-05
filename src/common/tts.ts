import { tts_cache } from "~/common/cache";
import { DEFAULT_VOICE, SPEED_CHARS } from "~/common/constants";
import { do_alert, regex_last_match } from "./utils";

export const TTS_URL = (voice: string = DEFAULT_VOICE) =>
  `https://api.streamelements.com/kappa/v2/speech?voice=${voice}&text=`;

/**
 * @param text {string}
 * @param voice {string}
 * @returns {Promise<string>}
 */
export const get_tts_data = async (
  text: string,
  voice: string = DEFAULT_VOICE
): Promise<string> => {
  if (!text) {
    return Promise.reject();
  }
  const request: TTS.TTSRequest = tts_cache.get(`${voice}:${text}`) ?? {
    text: `${voice}:${text}`,
    promise: undefined,
    data: "",
  };
  if (request.data) {
    return request.data;
  }
  if (!request.promise) {
    request.text = `${voice}:${text}`;
    request.data = "";
    request.promise = fetch(TTS_URL(voice) + encodeURIComponent(text.trim()))
      .then(async res => {
        if (res.status != 200) {
          const msg = await res.text();
          do_alert(msg);
          tts_cache.remove(request);
          return Promise.reject(msg);
        }

        const mp3 = await res.blob();
        request.data = URL.createObjectURL(mp3);
        tts_cache.set(request);

        return request.data;
      })
      .catch(err => {
        console.error(`Failed to get TTS data:`, err);
        return Promise.reject(err);
      });
    tts_cache.set(request);
  }

  return request.promise;
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

// predicts duration of text before speed modifier
// x: duration of text without speed modifier
// y: number of speed modifier characters
const speed_duration_equations: ObjectOf<
  ObjectOf<(x: number, y: number) => number>
> = {
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

const get_duration = async (
  text: string,
  voice: string
): Promise<number | undefined> => {
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

  const data = await get_tts_data(text, voice).catch(err => {
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

const DUR_CHECK_EXTRA_CHAR = "ᴾᴾ";
const DUR_CHECK_EXTRA_CHAR_DURATION = 0.287333;
const SPEED_BREAK_REGEX =
  /(?:\s+[{(\[]\s*)|(?:\s*[}:\])]\s+)|(?:[;!?,])|(?:\s+[\\|]\s+)|(?:\s+\/(?:\s+\/)+\s+)|(?:(?:\s+\.\s*)|(?:\s*\.\s+))/g;
const START_AT_CURSOR_OFFSET = 0.5;

export const predict_duration = async (
  message: TTS.Message,
  start_index?: number
): Promise<[duration: number, start_time: number] | undefined> => {
  const { speed, voice, speed_char, max_length } = message.options;
  const is_sped = speed && max_length > message.text.length;

  const result = await (async (): Promise<
    [duration: number, start_time: number] | undefined
  > => {
    /** duration of the whole message text, without speed modifiers */
    const base_duration = await get_duration(message.text, voice);
    if (!start_index && !is_sped) {
      return [base_duration, 0];
    }

    const adj_start = start_index
      ? regex_last_match(
          message.text,
          /[\s;/\\{}\[\]:.<>\-_+=()*^%$#~|!?,ᴾ0-9]/gi,
          start_index
        )
      : null;
    if (
      adj_start &&
      adj_start.index > 0 &&
      adj_start.index < message.text.length
    ) {
      start_index = adj_start.index + adj_start[0].length;
    }
    if (start_index && (!speed || max_length <= message.text.length)) {
      const start_time = await get_duration(
        message.text.slice(0, start_index),
        voice
      );
      return [base_duration, start_time];
    }

    /** regex match for the speed-breaking text */
    let break_match = is_sped
      ? regex_last_match(message.text, SPEED_BREAK_REGEX)
      : null;

    if (!break_match) {
      if (!start_index) {
        return [
          speed_duration_equations[voice]?.[speed_char]?.(
            base_duration,
            get_speed_modifier(message).length
          ),
          0,
        ];
      } else {
        // @ts-expect-error:
        break_match = {
          [0]: "",
          index: 0,
        };
      }
    }

    /** start index of the speed-modified text */
    const sped_start_index = break_match.index + break_match[0].length;
    const text_sped = message.text.slice(sped_start_index);

    /** Duration of the to-be-modified text, unmodified */
    const sped_duration_normal = await get_duration(
      text_sped.trimStart(),
      voice
    );
    /** Duration of the speed-modified text */
    const sped_duration_modified: number | undefined = speed_duration_equations[
      voice
    ]?.[speed_char]?.(sped_duration_normal, get_speed_modifier(message).length);

    /** duration of the message before the speed-breaking text */
    const unsped_duration = base_duration - sped_duration_normal;

    /** Full duration of the real message */
    const duration = unsped_duration + sped_duration_modified;

    if (!start_index || start_index <= 0 || start_index > message.text.length) {
      return [duration, 0];
    }

    if (start_index >= break_match.index && start_index <= sped_start_index) {
      return [duration, unsped_duration];
    }

    if (start_index >= sped_start_index) {
      const sped_ratio = sped_duration_modified / sped_duration_normal;
      const start_sped = start_index - sped_start_index;
      let sped_before_dur, sped_after_dur;
      if (start_sped > text_sped.length / 2) {
        sped_before_dur = await get_duration(
          text_sped.slice(0, start_sped),
          voice
        );
        sped_after_dur = (sped_duration_normal - sped_before_dur) * sped_ratio;
      } else {
        sped_after_dur = await get_duration(text_sped.slice(start_sped), voice);
        sped_after_dur *= sped_ratio;
      }
      return [duration, duration - sped_after_dur];
    }

    const unsped_text = message.text.slice(0, sped_start_index);
    let before_dur, after_dur;
    if (start_index > unsped_text.length / 2) {
      before_dur = await get_duration(unsped_text.slice(0, start_index), voice);
    } else {
      after_dur = await get_duration(
        `${unsped_text.slice(start_index)} ${DUR_CHECK_EXTRA_CHAR}`,
        voice
      );
      before_dur = unsped_duration - after_dur + DUR_CHECK_EXTRA_CHAR_DURATION;
    }
    return [duration, before_dur];
  })().catch(() => {});

  if (!result) {
    return;
  }
  return [result[0], Math.max(0, result[1] - START_AT_CURSOR_OFFSET)];
};
