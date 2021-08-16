import { HelpDataKey } from "~/view/components/help/help-data";

export enum OptimizeTrigger {
  manual = 0,
  submit = 1,
  blur = 2,
  stop = 3,
  edit = 4,
}

export enum OptimizeLevel {
  safe = 0,
  normal = 1,
  max = 2,
}

declare global {
  namespace TTS {
    interface Message {
      id: string;
      text: string;
      name: string;
      options: MessageOptions;
    }

    interface MessageOptions {
      max_length: number;
      speed: boolean;
      bits: string;
      speed_char?: string;
      voice: string;
    }

    type LoadMessageEvent = CustomEvent<{
      callback: () => void;
      id: string | null;
      prev_id: string | null;
      passive?: boolean;
    }>;

    interface Snippet {
      text: string;
      options: SnippetOptions;
    }

    interface SnippetOptions {
      prefix?: string;
      suffix?: string;
      space_before: boolean;
      space_after: boolean;
      default_count: number;
    }

    interface SnippetsSection {
      name: string;
      open: boolean;
      data: Snippet[];
    }

    interface EditorState {
      text: string;
      max_length: number;
      speed: boolean;
      voice: string;
      bits: string;
      pause_duration: number;
      speed_char: string;
    }

    interface EditorHistory {
      keep?: boolean;
      state: TTS.EditorState;
      cursor: {
        start: number;
        end: number;
      };
      cursor_before?: {
        start: number;
        end: number;
      };
    }

    interface EditorHistoryStorage {
      data: EditorHistory[];
      index: number;
    }

    interface EditorSettings {
      trim_whitespace: boolean;
      optimize_words: OptimizeTrigger;
      optimize_level: OptimizeLevel;
      bits_string: string;
      history_steps: number;
      skip_tutorials: boolean;
    }

    type OptimizeTriggerName = Exclude<keyof typeof OptimizeTrigger, "blur">;
    type OptimizeLevelName = keyof typeof OptimizeLevel;

    type OptimizeCallback = (
      new_text: string,
      cursor_start: number,
      cursor_end: number,
      trigger: OptimizeTrigger
    ) => void;

    type OptimizeEvent = CustomEvent<{
      trigger: OptimizeTrigger;
      input: preact.RefObject<HTMLTextAreaElement>;
      callback?: OptimizeCallback;
      refocus_target?: HTMLElement;
    }>;

    interface AppState {
      volume: number;
      message: string | null;
      editor: EditorState;
      settings: EditorSettings;
    }

    interface RequestStatus {
      pending: boolean;
      success: boolean;
      error?: any;
    }

    interface TTSRequest {
      text: string;
      promise: Promise<string>;
      data: string;
    }

    type ExportedSettings = EditorSettings & { __type: "settings" };
    type ExportedMessage = Message & { __type: "message" };
    type ExportedSnippet = Snippet & { __type: "snippet" };
    type ExportedSnippetsSection = Omit<SnippetsSection, "data"> & {
      __type: "snippets-section";
      data: ExportedSnippet[];
    };

    interface ExportData {
      __type: "export-data";
      settings?: ExportedSettings;
      messages?: ExportedMessage[];
      snippets?: ExportedSnippetsSection[];
    }

    type AnyExportData =
      | TTS.ExportData
      | TTS.ExportData["settings"]
      | TTS.ExportData["messages"]
      | TTS.ExportData["snippets"]
      | TTS.ExportedMessage
      | TTS.ExportedSnippetsSection
      | TTS.ExportedSnippet
      | (
          | TTS.ExportedMessage
          | TTS.ExportedSnippetsSection
          | TTS.ExportedSnippet
          | TTS.ExportedSettings
        )[];

    interface ExportFile {
      name: string;
      data: string;
    }

    interface HelpItem {
      key: string;
      name: string;
      content:
        | string
        | preact.ComponentType<{ goToHelp: (key: HelpDataKey) => void }>;
      tutorial?: boolean;
    }

    type HelpKey = HelpDataKey;

    type HelpCompletedMap = {
      [K in HelpDataKey]?: boolean;
    };
  }
}

export default TTS;
