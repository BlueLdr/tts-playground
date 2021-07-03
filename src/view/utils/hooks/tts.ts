import * as hooks from "preact/hooks";
import { get_tts_data, play_audio } from "~/common";
import { useRequestStatus, useStateRef } from "~/view/utils";

export const usePlayMessage = (
  message: TTS.Message,
  player_id?: string,
  request?: TTS.TTSRequest
) => {
  const {
    text,
    options: { speed, max_length },
  } = message;

  const [data, set_data, data_ref] = useStateRef("");
  const full_text = hooks.useMemo(() => {
    if (speed && max_length !== text.length) {
      return `${text} ${"¡".repeat(max_length - text.length - 1)}`;
    }
    return text;
  }, [speed, text, max_length]);

  const [status, fetch_tts] = useRequestStatus(get_tts_data);
  const on_submit = hooks.useCallback(() => {
    fetch_tts(full_text, request).then((d) => {
      if (d === data_ref.current) {
        if (data_ref.current) play_audio(player_id);
      } else {
        set_data(d);
      }
    });
  }, [full_text]);

  hooks.useEffect(() => {
    if (data) play_audio();
  }, [data]);

  return [data, status, on_submit, full_text] as const;
};

export const useAudioPlayer = (
  player_id?: string,
  request?: TTS.TTSRequest
) => {
  const [data, set_data, data_ref] = useStateRef<string>("");
  hooks.useEffect(() => {
    if (data) play_audio(player_id);
  }, [data]);
  const get_data = hooks.useCallback((text: string) => {
    if (!text) {
      return Promise.resolve();
    }
    return get_tts_data(text, request).then((d) => {
      if (d === data_ref.current) {
        play_audio(player_id);
      } else {
        set_data(d);
      }
    });
  }, []);

  return [data, get_data] as const;
};

export const useMessageFullText = (message: TTS.Message) => {
  const {
    text,
    options: { max_length, speed },
  } = message;
  return hooks.useMemo(() => {
    if (!speed) {
      return text;
    }
    return `${text} ${"¡".repeat(max_length - text.length - 1)}`;
  }, [text, max_length, speed]);
};
