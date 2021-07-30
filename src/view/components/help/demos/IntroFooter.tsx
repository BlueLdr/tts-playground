import * as Preact from "preact";

const INTRO_STEPS = {
  "intro-start": "intro-editor",
  "intro-editor": "intro-messages",
  "intro-messages": "intro-snippets",
  "intro-snippets": "intro-help",
  "intro-help": null,
} as const;

export const IntroFooter: Preact.FunctionComponent<{
  item: TTS.HelpKey;
  setItem: (key: TTS.HelpKey | null) => void;
  back: () => void;
}> = ({ item, setItem, back }) => {
  return (
    <div className="modal-footer">
      {item === "intro-start" ? (
        <button
          className="btn btn-large btn-negative"
          onClick={() => setItem("intro-help")}
        >
          Skip
        </button>
      ) : (
        <button className="btn btn-large" onClick={back}>
          Back
        </button>
      )}
      <button
        className="btn btn-large btn-primary"
        onClick={() => setItem(INTRO_STEPS[item])}
      >
        {item === "intro-start"
          ? "Start"
          : item === "intro-help"
          ? "Get Started"
          : "Next"}
      </button>
    </div>
  );
};
