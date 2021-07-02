export const TTS_URL =
  "https://api.streamelements.com/kappa/v2/speech?voice=Brian&text=";

const REQUEST: TTS.TTSRequest = {
  text: "",
  promise: new Promise(() => {}),
  data: "",
};

/**
 * @param text {string}
 * @param request {TTS.TTSRequest} cached request to handle resending the same string
 * @returns {Promise<string>}
 */
export const get_tts_data = async (
  text: string,
  request: TTS.TTSRequest = REQUEST
): Promise<string> => {
  if (!text) {
    return Promise.reject();
  }
  let speak;
  if (text === request.text && request.promise) {
    speak = await request.promise;
  } else {
    request.text = text;
    request.data = "";
    speak = await fetch(TTS_URL + encodeURIComponent(text.trim()));
    request.promise = speak;
  }

  if (speak.status != 200) {
    alert(await speak.text());
    request.text = "";
    return Promise.reject(speak.error());
  }

  if (!request.data) {
    const mp3 = await speak.blob();
    request.data = URL.createObjectURL(mp3);
  }

  return request.data;
};

/**
 * @param audioElemId {string} id of the HTMLAudioElement to use
 */
export const play_audio = (audioElemId?: string) => {
  const audio = document.getElementById(
    audioElemId ? `${audioElemId}-audio` : "audio"
  );
  if (!(audio instanceof HTMLAudioElement)) {
    return;
  }
  audio.pause();
  audio.load();
  audio.play();
};
