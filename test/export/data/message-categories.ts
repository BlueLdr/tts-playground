import TTS from "~/model/types";
import {
  MESSAGE_FOUR,
  MESSAGE_ONE,
  MESSAGE_THREE,
  MESSAGE_TWO,
  // @ts-expect-error:
} from "./messages.ts";

export const MESSAGE_CATEGORY_ONE: TTS.ExportedMessageCategory = {
  name: "Test message category 1",
  open: false,
  data: [MESSAGE_ONE, MESSAGE_TWO, MESSAGE_THREE],
  __type: "message-category",
};

export const MESSAGE_CATEGORY_TWO: TTS.ExportedMessageCategory = {
  name: "Test message category 2",
  open: false,
  data: [MESSAGE_FOUR],
  __type: "message-category",
};

export const MESSAGE_CATEGORY_THREE: TTS.ExportedMessageCategory = {
  name: "Test message category 3",
  open: false,
  data: [MESSAGE_ONE.id, MESSAGE_TWO.id, MESSAGE_THREE.id],
  __type: "message-category",
};

export const MESSAGE_CATEGORY_FOUR: TTS.ExportedMessageCategory = {
  name: "Test message category 4",
  open: false,
  data: [MESSAGE_FOUR.id],
  __type: "message-category",
};

export const MESSAGE_CATEGORY_FIVE: TTS.ExportedMessageCategory = {
  name: "Test message category 5",
  open: false,
  data: [],
  __type: "message-category",
};
