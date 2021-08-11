import { DEFAULT_SPEED_CHAR } from "~/common";

export const get_speed_modifier = (message: TTS.Message) => {
  const {
    text,
    options: { max_length, speed, bits, speed_char = DEFAULT_SPEED_CHAR },
  } = message;
  let text_ = bits ? `${bits} ${text}` : text;
  if (!speed || text_.length >= max_length - 1) {
    return "";
  }
  return speed_char
    .repeat(max_length - text_.length)
    .slice(0, max_length - text_.length);
};
