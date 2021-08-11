import * as hooks from "preact/hooks";
import { get_tts_data, play_audio } from "~/common";
import { EDITOR_SETTINGS } from "~/model";
import {
  get_speed_modifier,
  useMemoRef,
  useRequestStatus,
  useStateRef,
  useValueRef,
} from "~/view/utils";

export const usePlayMessage = (
  message: TTS.Message,
  player_id?: string,
  request?: TTS.TTSRequest
) => {
  const { voice, bits_string } = hooks.useContext(EDITOR_SETTINGS).value ?? {};
  const voice_ref = useValueRef(voice);
  const {
    text,
    options: { speed, max_length, bits },
  } = message;

  const [data, set_data, data_ref] = useStateRef("");
  const full_text = useMemoRef(() => {
    if (speed && max_length !== text.length) {
      return `${text}${get_speed_modifier(message)}`;
    }
    return text;
  }, [speed, text, max_length, bits, bits_string]);

  const [status, fetch_tts] = useRequestStatus(get_tts_data);
  const on_submit = hooks.useCallback(() => {
    fetch_tts(full_text.current, request, voice_ref.current).then(d => {
      if (d === data_ref.current) {
        if (data_ref.current) play_audio(player_id, false);
      } else {
        set_data(d);
      }
    });
  }, [request, player_id]);

  hooks.useEffect(() => {
    if (data) play_audio(player_id);
  }, [data]);

  return [
    data,
    status,
    on_submit,
    bits ? `${bits} ${full_text.current}` : full_text.current,
  ] as const;
};

export const usePlaySnippet = (
  player_id?: string,
  request?: TTS.TTSRequest
) => {
  const voice = hooks.useContext(EDITOR_SETTINGS).value?.voice;
  const voice_ref = useValueRef(voice);
  const [data, set_data, data_ref] = useStateRef("");

  const [status, fetch_tts] = useRequestStatus(get_tts_data);
  const on_submit = hooks.useCallback(
    (snippet: TTS.Snippet, count?: number) => {
      const {
        text,
        options: { prefix = "", default_count, suffix = "" },
      } = snippet;
      const full_text = `${prefix}${text.repeat(
        count || default_count || 1
      )}${suffix}`;
      return fetch_tts(full_text, request, voice_ref.current).then(d => {
        if (d === data_ref.current) {
          if (data_ref.current) play_audio(player_id, false);
        } else {
          set_data(d);
        }
      });
    },
    []
  );

  hooks.useEffect(() => {
    if (data) play_audio(player_id);
  }, [data]);

  return [data, status, on_submit] as const;
};

export const useAudioPlayer = (
  player_id?: string,
  request?: TTS.TTSRequest
) => {
  const voice = hooks.useContext(EDITOR_SETTINGS).value?.voice;
  const voice_ref = useValueRef(voice);
  const [data, set_data, data_ref] = useStateRef<string>("");
  hooks.useEffect(() => {
    if (data) play_audio(player_id);
  }, [data]);
  const get_data = hooks.useCallback((text: string) => {
    if (!text) {
      return Promise.resolve();
    }
    return get_tts_data(text, request, voice_ref.current).then(d => {
      if (d === data_ref.current) {
        play_audio(player_id, false);
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
    options: { max_length, speed, bits },
  } = message;
  return hooks.useMemo(() => {
    let text_ = bits ? `${bits} ${text}` : text;
    if (!speed || text_.length >= max_length - 1) {
      return text_;
    }
    return `${text_}${get_speed_modifier(message)}`;
  }, [text, max_length, speed]);
};
