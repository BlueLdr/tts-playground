import * as Preact from "preact";
import { useMemo } from "preact/hooks";
import { DEFAULT_SPEED_CHAR } from "~/common";
import { AudioPlayer, generate_pause } from "~/view/components";
import { useAudioPlayer } from "~/view/utils";

const PAUSE_DEMO_MODAL_REQUEST: TTS.TTSRequest = {
  text: "",
  promise: new Promise(() => {}),
  data: "",
};

const create_text = str =>
  `this is before the pause ${str} this is after the pause ${DEFAULT_SPEED_CHAR.repeat(
    20
  )}`;

export const PauseSpeedDemo: Preact.FunctionComponent = () => {
  const [tts_data, preview_tts] = useAudioPlayer(
    "pause-demo-modal-player",
    PAUSE_DEMO_MODAL_REQUEST
  );

  const [text_normal, text_preserved] = useMemo(
    () => [
      create_text(generate_pause(1.3, "Brian", false)),
      create_text(generate_pause(1.3, "Brian", true)),
    ],
    []
  );

  return (
    <div className="help-demo help-demo-pause">
      <h4 className="help-demo-prompt">Try it out:</h4>
      <div className="help-demo-pause-top">
        <div className="help-demo-pause-item">
          <div className="help-demo-pause-item-text tts-text">
            {text_normal}
          </div>
          <button
            className="help-demo-pause-item-button icon-button"
            onClick={() => preview_tts(text_normal)}
          >
            <i className="fas fa-volume-up" />
          </button>
        </div>
        <div className="help-demo-pause-item">
          <div className="help-demo-pause-item-text tts-text">
            {text_preserved}
          </div>
          <button
            className="help-demo-pause-item-button icon-button"
            onClick={() => preview_tts(text_preserved)}
          >
            <i className="fas fa-volume-up" />
          </button>
        </div>
      </div>
      <div className="help-demo-pause-player">
        <AudioPlayer data={tts_data} id="pause-demo-modal-player" />
      </div>
    </div>
  );
};
