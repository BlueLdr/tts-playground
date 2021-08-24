import TTS from "~/model/types";

export const get_uncategorized = (
  messages: TTS.Message[],
  categories: (TTS.MessageCategory | TTS.MessageCategoryPopulated)[]
) => {
  return messages.filter(
    m =>
      !categories.find(c =>
        // @ts-expect-error:
        c.data.find(d => m.id === (typeof d === "string" ? d : d.id))
      )
  );
};

export const map_category_msg_ids = (
  c: TTS.MessageCategoryPopulated | TTS.MessageCategory
): TTS.MessageCategory => ({
  ...c,
  data: c.data.map(m => (typeof m === "string" ? m : (m as TTS.Message).id)),
});
