import * as Preact from "preact";
import { OptimizeSampleDemo, SnippetAddDemo } from "./demos";

/* for easy copy/paste
  {
    key: "",
    name: "",
    content: "",
  },
 */

const help_data_type = <T extends { [key: string]: TTS.HelpItem }>(
  input: T
): T => input;

const HELP_COMMON = {
  optimize:
    "Message optimization will remove unneeded characters, without altering the speech, to maximize the amount of text you can fit within the character limit.",
};

export const HELP_DATA = help_data_type({
  /* ======================================
   * ============== EDITOR ================
     ====================================== */
  "reset-editor": {
    key: "reset-editor",
    name: "Reset Editor Button",
    content:
      "Clicking the Reset button will clear the text in the editor and start a new message. Changes to the current message will not be saved.",
  },

  "pause-speed": {
    key: "pause-speed",
    name: "Pause: Preserve Speed Modifiers",
    content: "",
  },

  "use-bits": {
    key: "use-bits",
    name: "Bits String",
    content: "",
  },

  /* ======================================
   * ============= SNIPPETS ===============
     ====================================== */
  "snippets-overview": {
    key: "snippets-overview",
    name: "Snippets",
    content: "",
  },
  "snippets-group": {
    key: "snippets-group",
    name: "Snippet Group",
    content: () => (
      <p>
        Snippet Groups help keep your snippets organized. Click on the group to
        expand/hide the snippets inside. Click the Edit button (
        <i className="fas fa-edit" />) to rename or delete the group.
      </p>
    ),
  },
  "snippet-text": {
    key: "snippet-text",
    name: "Snippet Text",
    content: "",
  },
  "snippet-insert": {
    key: "snippet-insert",
    name: "Insert Snippet",
    content: () => (
      <Preact.Fragment>
        <p>
          Left-Click this button to insert the entire snippet into the editor.
          When you Left-Click and hold, the main text will be repeatedly
          inserted into the editor until you release the button.
        </p>
        <p>
          Right-Click this button to insert only the main text, without the
          prefix, suffix, or spaces. Right-Click and hold to repeatedly insert
          only the main text.
        </p>
        <SnippetAddDemo />
      </Preact.Fragment>
    ),
  },
  "snippet-actions": {
    key: "snippet-actions",
    name: "Snippet Actions",
    content: () => (
      <Preact.Fragment>
        <p>
          Clicking the Gear icon (<i className="fas fa-cog" />) next to a
          snippet will reveal a list of actions.
        </p>
        <dl>
          <dt>
            <i className="fas fa-volume-up" /> Listen:
          </dt>
          <dd>Play an audio preview of the snippet.</dd>
          <dt>
            <i className="fas fa-clipboard" /> Copy to Clipboard:
          </dt>
          <dd>
            Copy the snippet to the clipboard. (Hint: Right-Click to copy only
            the main text.)
          </dd>
          <dt>
            <i className="fas fa-edit" /> Edit:
          </dt>
          <dd>Edit the snippet text and options.</dd>
          <dt>
            <i className="fas fa-trash" /> Delete:
          </dt>
          <dd>Delete the snippet.</dd>
        </dl>
      </Preact.Fragment>
    ),
  },

  /* ======================================
   * =========== OPTIMIZATION =============
     ====================================== */
  "optimize-full": {
    key: "optimize-full",
    name: "Message Optimization",
    content: ({ goToHelp }) => (
      <Preact.Fragment>
        <p>
          {HELP_COMMON.optimize} This becomes helpful when you have a long
          message, or you want to get the most out of the{" "}
          <button className="link" onClick={() => goToHelp("speed-overview")}>
            Speed Modifier
          </button>
          .
        </p>
        <OptimizeSampleDemo />
        <hr />
        <h3>Message Optimization Settings</h3>
        {HELP_DATA["optimize-settings"].content()}
      </Preact.Fragment>
    ),
  },
  "optimize-settings": {
    key: "optimize-settings",
    name: "Message Optimization: Settings",
    content: () => (
      <Preact.Fragment>
        <p>
          The following options are available for configuring message
          optimization:
        </p>
        <dl>
          <dt>
            <b>Automatically Trim Spaces</b>
          </dt>
          <dd>
            When this is enabled, any unnecessary spaces in the message text
            will be removed. This includes spaces at the beginning and end of
            the message, as well as multiple consecutive spaces.
          </dd>
          <dt>
            <b>Optimize Words (Trigger)</b>
          </dt>
          <dd>
            This setting determines when the message will be optimized.
            <ol>
              <li>
                <b>Manually</b>: Only optimize when you click the "Optimize
                Message" button above the editor.
              </li>
              <li>
                <b>When you click submit</b>: Optimize when you click the
                "Submit" button.
              </li>
              <li>
                <b>When you stop typing</b>: Automatically optimize a few
                seconds after you stop typing.
              </li>
              <li>
                <b>As you're typing</b>: Optimize immediately as you type.
              </li>
            </ol>
          </dd>
          <dt>
            <b>Optimization Level</b>
          </dt>
          <dd>
            This setting determines how aggressive the optimization will be with
            regard to preserving the speech of the original text.
            <ol>
              <li>
                <b>Minimum</b>: Speech should be identical before and after
                optimization.
              </li>
              <li>
                <b>Normal</b>: Optimization will cause some very minor changes
                in speech, but shouldn't be noticeable.
              </li>
              <li>
                <b>Maximum</b>: Some parts of speech may change noticeably, but
                should still have the correct syllables.
              </li>
            </ol>
          </dd>
        </dl>
      </Preact.Fragment>
    ),
  },
  "optimize-manual": {
    key: "optimize-manual",
    name: "Manually Trigger Optimization",
    content: ({ goToHelp }) => (
      <Preact.Fragment>
        <p>
          Clicking this button will optimize the current text in the editor.
        </p>
        <p>{HELP_COMMON.optimize}</p>
        <p>
          See the{" "}
          <button className="link" onClick={() => goToHelp("optimize-full")}>
            Message Optimization help page
          </button>{" "}
          to learn more.
        </p>
      </Preact.Fragment>
    ),
  },

  /* ======================================
   * =============== SPEED ================
     ====================================== */
  "speed-overview": {
    key: "speed-overview",
    name: "Speed Modifier",
    content: "",
  },

  /* ======================================
   * =============== OTHER ================
     ====================================== */
  "not-found": {
    key: "not-found",
    name: "Not Found",
    content: "Sorry! We don't have any information about that.",
    /*content: () => {
      return (<Preact.Fragment>
          <p>Sorry! We don't have any information about that.</p>
        <p>Did we miss something? <a href="">Report this issue</a>.</p>
        </Preact.Fragment>)
      }*/
  },
});

export type HelpData = typeof HELP_DATA;
export type HelpDataKey = keyof HelpData;
