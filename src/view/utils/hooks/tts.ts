import * as hooks from "preact/hooks";
import { get_tts_data, play_audio } from "~/common";
import { useRequestStatus, useStateIfMounted } from "~/view/utils";

export const usePlayMessage = (message: TTS.Message, player_id?: string) => {
  const {
    text,
    options: { speed, max_length },
  } = message;

  const [data, set_data] = useStateIfMounted("");
  const full_text = hooks.useMemo(() => {
    if (speed && max_length !== text.length) {
      return `${text} ${"¡".repeat(max_length - text.length - 1)}`;
    }
    return text;
  }, [speed, text, max_length]);

  const [status, fetch_tts] = useRequestStatus(get_tts_data);
  const on_submit = hooks.useCallback(() => {
    let msg = text;
    if (speed && max_length !== msg.length) {
      msg = `${text} ${"¡".repeat(max_length - msg.length - 1)}`;
    }
    fetch_tts(msg).then((d) => {
      if (d === data) {
        play_audio(player_id);
      } else {
        set_data(d);
      }
    });
  }, [text, speed, max_length, data, player_id]);

  hooks.useEffect(() => {
    play_audio();
  }, [data]);

  return [data, status, on_submit, full_text] as const;
};
