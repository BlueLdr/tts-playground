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
      text: string;
      name: string;
      options: MessageOptions;
    }

    interface MessageOptions {
      max_length: number;
      speed: boolean;
      bits: string;
    }

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
      bits: string;
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
      open: boolean;
      insert_at_cursor: boolean;
      trim_whitespace: boolean;
      optimize_words: OptimizeTrigger;
      optimize_level: OptimizeLevel;
      voice: string;
      bits_string: string;
      history_steps: number;
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
    }>;

    interface AppState {
      volume: number;
      message: number;
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

    type ExportedMessage = Message & { __type: "message" };
    type ExportedSnippet = Snippet & { __type: "snippet" };
    type ExportedSnippetsSection = Omit<SnippetsSection, "data"> & {
      __type: "snippets-section";
      data: ExportedSnippet[];
    };

    interface ExportData {
      __type: "export-data";
      settings?: EditorSettings & { __type: "settings" };
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
      | TTS.ExportedSnippet;

    interface ExportFile {
      name: string;
      data: string;
    }
  }
}

export default TTS;
