declare namespace TTS {
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

  interface ScratchSection {
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
}
