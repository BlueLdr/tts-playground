import * as Preact from "preact";
import { PAUSE_CHAR_SPEED_MODIFIED, SPEED_CHAR } from "~/common";
import {
  ReportMissingHelpLink,
  PauseSpeedDemo,
  OptimizeSampleDemo,
  SnippetAddDemo,
} from "./demos";

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
  speed:
    "The Speed Modifier causes the speech to become higher-pitched and faster, as if the speaker is excited or panicking.",
  speed_enable: `Enabling "Speed Modifier" will fill the rest of the message up to the character limit with the speed modifier character.`,
  speed_brian:
    "Brian is the only voice that works well with the speed modifier. Most other voices will have little to no change in pitch or speed.",
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

  "pause-add": {
    key: "pause-add",
    name: "Add Pause",
    content: () => (
      <Preact.Fragment>
        Add text to the message that will make the speaker pause for the
        specified amount of time.
        <br />
        Right-Click the Add Pause button to quickly add a pause using the
        duration that was previously set.
      </Preact.Fragment>
    ),
  },

  "pause-speed": {
    key: "pause-speed",
    name: "Pause: Preserve Speed Modifier",
    content: ({ goToHelp }) => (
      <Preact.Fragment>
        <p>
          The normal way to add a pause is using <code>/</code>, separated by
          spaces. However, this behaves like punctuation, which removes the
          effect of the speed modifier on any text before it. The{" "}
          <code>{PAUSE_CHAR_SPEED_MODIFIED}</code> character has a similar
          effect, but preserves the effect of the speed modifier.
        </p>
        <h4>
          Why not use <code>{PAUSE_CHAR_SPEED_MODIFIED}</code> all the time?
        </h4>
        <p>
          The <code>{PAUSE_CHAR_SPEED_MODIFIED}</code> character, while quiet,
          is not completely silent like slashes are. It can also affect the
          pronunciation of words before and after it. For example,{" "}
          <code>{PAUSE_CHAR_SPEED_MODIFIED.repeat(4)} ow</code> will sound more
          like "pow" than "ow", even with the space in between.
          <br />
        </p>
        <p>
          <button className="link" onClick={() => goToHelp("speed-overview")}>
            Learn more about the Speed Modifier and Punctuation.
          </button>
        </p>
        <PauseSpeedDemo />
      </Preact.Fragment>
    ),
  },

  "editor-voice": {
    key: "tts-voice",
    name: "Text-to-Speech Voice",
    tutorial: true,
    content: () => (
      <Preact.Fragment>
        <p>Choose the TTS voice to use for the current message.</p>
        <h3>Important Tips</h3>
        <ul>
          <li>{HELP_COMMON.speed_brian}</li>
        </ul>
      </Preact.Fragment>
    ),
  },

  "use-bits": {
    key: "use-bits",
    name: "Bits String",
    content: () => (
      <Preact.Fragment>
        <p>
          Enable this if you plan to send your message using Bits in Twitch
          chat. This will count the Bits text towards the character limit, but
          won't be part of the message speech. This will ensure that the message
          sounds exactly the same when you send it as it does in testing.
        </p>
      </Preact.Fragment>
    ),
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
    tutorial: true,
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
        <p>
          Select text in the editor and then insert the snippet to overwrite the
          selected text.
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
    tutorial: true,
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

  "speed-tutorial": {
    key: "speed-tutorial",
    name: "Speed Modifier",
    tutorial: true,
    content: () => (
      <Preact.Fragment>
        <p>{HELP_COMMON.speed}</p>
        <p>
          {HELP_COMMON.speed_enable.slice(0, -1)} (<code>{SPEED_CHAR}</code>).
        </p>
        <h3>Important Tips</h3>
        <ul>
          <li>
            The speed modifier will not affect any text that follows
            punctuation. For example, in the message{" "}
            <code>Hey you, get off my lawn{SPEED_CHAR.repeat(10)}</code>,{" "}
            <code>Hey you</code> will be spoken normally, and{" "}
            <code>get off my lawn</code> will be sped up.
          </li>
          <li>{HELP_COMMON.speed_brian}</li>
        </ul>
      </Preact.Fragment>
    ),
  },

  /* ======================================
   * ============== SETTINGS ==============
     ====================================== */
  "tutorials-help": {
    key: "tutorials-help",
    name: "Feature Tutorials",
    content: () => (
      <p>
        These tutorials will appear the first time you use certain features.
        They're meant to give you a brief explanation along with any important
        tips about how the feature works. After you see them once, they won't
        appear again unless you use the help button in the top right corner of
        the page.
      </p>
    ),
  },
  "bits-default": {
    key: "bits-default",
    name: "Default Bits String",
    content: () => (
      <Preact.Fragment>
        <p>
          Choose the string that you plan to use most often when creating
          messages with Bits.
        </p>
        <p>
          This defaults to <code>uni300</code> because this is (currently) the
          shortest Bit text available, which leaves more room for speed modifier
          characters.
        </p>
      </Preact.Fragment>
    ),
  },
  "history-steps": {
    key: "history-steps",
    name: "Maximum Undo/Redo Steps",
    content: () => (
      <Preact.Fragment>
        <p>
          Adjust the maximum number of undo/redo steps that will be stored. When
          you exceed this number, the oldest step will be discarded.
        </p>
        <p>
          Note: You should only need to adjust this if you're on a slow computer
          and the app is having performance issues.
        </p>
      </Preact.Fragment>
    ),
  },

  /* ======================================
   * =============== OTHER ================
     ====================================== */

  "skip-tutorials": {
    key: "skip-tutorials",
    name: "Skip All Tutorials",
    content: () => (
      <Preact.Fragment>
        {HELP_DATA["tutorials-help"].content()}
        <p>Are you sure you want to turn off these tutorials?</p>
      </Preact.Fragment>
    ),
  },

  "not-found": {
    key: "not-found",
    name: "Not Found",
    content: () => {
      return (
        <Preact.Fragment>
          <p>Sorry! We don't have any information about that.</p>
          <p>
            Did we miss something? <ReportMissingHelpLink />.
          </p>
        </Preact.Fragment>
      );
    },
  },

  /* ======================================
   * =============== INTRO ================
     ====================================== */
  "intro-start": {
    key: "intro-start",
    name: "",
    content: () => (
      <Preact.Fragment>
        <h1>Welcome to the TTS Playground!</h1>
        <p>Let's take a quick tour of the app and its features!</p>
      </Preact.Fragment>
    ),
  },
  "intro-editor": {
    key: "intro-editor",
    name: "Editor",
    content: () => (
      <Preact.Fragment>
        <h4>Craft and assemble your messages in the editor.</h4>
        <p>Key features:</p>
        <ul>
          <li>Full undo/redo support (Ctrl+Z, Ctrl+Shift+Z)</li>
          <li>Easily add pauses and snippets</li>
          <li>Toggle speed modifier</li>
          <li>Save Messages to access them later</li>
        </ul>
      </Preact.Fragment>
    ),
  },
  "intro-messages": {
    key: "intro-messages",
    name: "Messages",
    content: () => (
      <Preact.Fragment>
        <h4>View and load your saved Messages.</h4>
        <p>Key Features:</p>
        <ul>
          <li>Copy Message text straight to the clipboard</li>
          <li>Load saved Messages into the editor.</li>
        </ul>
      </Preact.Fragment>
    ),
  },
  "intro-snippets": {
    key: "intro-snippets",
    name: "Snippets",
    content: () => (
      <Preact.Fragment>
        <h4>
          Insert repeated text snippets into your message with single click.
        </h4>
        <p>Key Features:</p>
        <ul>
          <li>Create, test, and store repeated text snippets</li>
          <li>
            Insert snippets into the editor by clicking the Add button (
            <i className="fas fa-plus" />)
          </li>
          <li>
            Click and hold the Add button (
            <i className="fas fa-plus" />) to repeat the snippet.
          </li>
          <li>Group snippets to keep them organized</li>
        </ul>
      </Preact.Fragment>
    ),
  },
  "intro-help": {
    key: "intro-help",
    name: "Help Button",
    content: () => (
      <Preact.Fragment>
        <p>If you're not sure how something works:</p>
        <ol>
          <li>Click the Help button in the top right corner.</li>
          <li>Click on the thing you want to learn more about.</li>
          <li>Read the information provided in the help popup.</li>
        </ol>
      </Preact.Fragment>
    ),
  },
});

export type HelpData = typeof HELP_DATA;
export type HelpDataKey = keyof HelpData;
