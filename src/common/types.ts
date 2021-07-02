declare namespace TTS {
  interface Message {
    text: string;
    name: string;
    options: MessageOptions;
  }

  interface MessageOptions {
    max_length: number;
    use_speed: boolean;
  }

  interface Snippet {
    text: string;
    options: SnippetOptions;
  }

  interface SnippetOptions {
    prefix?: string;
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

  interface AppState {
    volume: number;
    message: number;
    editor: EditorState;
  }
}
