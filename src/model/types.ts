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
    }

    interface EditorSettings {
      open: boolean;
      insert_at_cursor: boolean;
      trim_whitespace: boolean;
      voice: string;
    }

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
