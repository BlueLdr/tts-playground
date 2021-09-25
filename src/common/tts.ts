import { DEFAULT_VOICE } from "~/common/constants";
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
  timestamp: number = 0
) => {
  const audio = document.getElementById(
    audioElemId ? `${audioElemId}-audio` : "audio"
  );
  if (!(audio instanceof HTMLAudioElement)) {
    return;
  }
  audio.pause();
  if (should_load) {
    if (timestamp > 0) {
      audio.addEventListener(
        "canplaythrough",
        () => {
          audio.currentTime = timestamp;
        },
        { once: true }
      );
    }
    audio.load();
  } else {
    audio.currentTime = timestamp;
  }
  audio.play();
};
