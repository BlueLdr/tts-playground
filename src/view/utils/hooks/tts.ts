import * as hooks from "preact/hooks";
import {
  get_tts_data,
  play_audio,
  get_speed_modifier,
  predict_duration,
} from "~/common";
import { EDITOR_SETTINGS, EDITOR_STATE } from "~/model";
import {
  useMemoRef,
  useRequestStatus,
  useStateRef,
  useValueRef,
} from "~/view/utils";

export const usePlayMessage = (message: TTS.Message, player_id?: string) => {
  const { bits_string, stop_playback_at_modifier } =
    hooks.useContext(EDITOR_SETTINGS).value ?? {};
  const {
    text,
    options: { speed, max_length, bits, voice, speed_char },
  } = message;
  const voice_ref = useValueRef(voice);
  const message_ref = useValueRef(message);
  const timestamp_ref = hooks.useRef<number>(0);
  const end_time_ref = hooks.useRef<number>(undefined);

  const [data, set_data, data_ref] = useStateRef("");
  const full_text = useMemoRef(() => {
    if (speed && max_length !== text.length) {
      return `${text}${get_speed_modifier(message)}`;
    }
    return text;
  }, [speed, text, max_length, bits, bits_string, speed_char]);

  const get_tts_audio = hooks.useCallback(
    async (
      msg_text: string,
      voice?: string,
      start_time?: number
    ): Promise<[string, number?, number?]> => {
      let duration = [];
      const data = await get_tts_data(msg_text, voice);
      if ((stop_playback_at_modifier && speed) || start_time) {
        duration = await predict_duration(message_ref.current, start_time);
      }
      return [
        data,
        stop_playback_at_modifier ? duration[0] : undefined,
        duration[1],
      ];
    },
    [stop_playback_at_modifier, speed]
  );

  const [status, fetch_tts] = useRequestStatus(get_tts_audio);
  const on_submit = hooks.useCallback(
    (start_index?: number) => {
      fetch_tts(full_text.current, voice_ref.current, start_index).then(
        ([d, end_time, start_time]) => {
          end_time_ref.current = end_time;
          if (d === data_ref.current) {
            if (data_ref.current)
              play_audio(player_id, false, start_time, end_time);
          } else {
            timestamp_ref.current = start_time;
            set_data(d);
          }
        }
      );
    },
    [player_id, fetch_tts, speed, stop_playback_at_modifier]
  );

  hooks.useEffect(() => {
    if (data) {
      play_audio(player_id, true, timestamp_ref.current, end_time_ref.current);
      timestamp_ref.current = 0;
    }
  }, [data]);

  return [
    data,
    status,
    on_submit,
    bits ? `${bits} ${full_text.current}` : full_text.current,
  ] as const;
};

export const usePlaySnippet = (player_id?: string) => {
  const voice = hooks.useContext(EDITOR_STATE).value?.voice;
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
      return fetch_tts(full_text, voice_ref.current).then(d => {
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

export const useAudioPlayer = (player_id?: string) => {
  const voice = hooks.useContext(EDITOR_STATE).value?.voice;
  const voice_ref = useValueRef(voice);
  const [data, set_data, data_ref] = useStateRef<string>("");
  hooks.useEffect(() => {
    if (data) play_audio(player_id);
  }, [data]);
  const get_data = hooks.useCallback((text: string) => {
    if (!text) {
      return Promise.resolve();
    }
    return get_tts_data(text, voice_ref.current).then(d => {
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
    options: { max_length, speed, bits, speed_char },
  } = message ?? { options: {} };
  return hooks.useMemo(() => {
    if (!text) {
      return "";
    }
    let text_ = bits ? `${bits} ${text}` : text;
    if (!speed || text_.length >= max_length - 1) {
      return text_;
    }
    return `${text_}${get_speed_modifier(message)}`;
  }, [text, max_length, speed, speed_char]);
};
