import * as Preact from "preact";
import { useCallback, useEffect, useRef } from "preact/hooks";
import { VOLUME_CTX } from "~/model";
import { maybeClassName, useContextState, useDebounce } from "~/view/utils";

export const AudioPlayer: Preact.FunctionComponent<{
  id?: string;
  data: string;
  className?: string;
}> = ({ id, data, className }) => {
  const [volume, onChangeVolume] = useContextState(VOLUME_CTX);
  const audio_ref = useRef<HTMLAudioElement>();
  const set_volume_cb = useCallback(
    e => {
      if (e.target.volume !== volume) {
        onChangeVolume?.(e.target.volume);
      }
    },
    [onChangeVolume]
  );
  const [set_volume] = useDebounce(set_volume_cb);
  useEffect(() => {
    window.addEventListener("set-volume", (e: CustomEvent) => {
      if (audio_ref.current && e.detail != null) {
        console.log("setting volume in event", e.detail, e.target);
        setTimeout(() => {
          audio_ref.current.volume = e.detail;
        }, 150);
      }
    });
  }, []);

  useEffect(() => {
    if (
      audio_ref.current &&
      volume != null &&
      volume !== audio_ref.current?.volume
    ) {
      console.log("setting volume", volume, audio_ref);
      const ev = new CustomEvent("set-volume", {
        detail: volume,
        bubbles: true,
      });
      window.dispatchEvent(ev);
    }
  }, [volume]);

  return (
    <div className={`tts-player${maybeClassName(className)}`}>
      <audio
        ref={audio_ref}
        id={id ? `${id}-audio` : "audio"}
        controls={true}
        onVolumeChange={set_volume}
      >
        {data && (
          <source
            id={id ? `${id}-source` : "source"}
            type="audio/wav"
            src={data}
          />
        )}
      </audio>
    </div>
  );
};
