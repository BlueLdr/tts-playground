import * as Preact from "preact";
import { useContext, useEffect, useMemo } from "preact/hooks";
import { MESSAGE_CATEGORIES } from "~/model";
import { useDebounce, useStateIfMounted } from "~/view/utils";

export const CategoryField: Preact.FunctionComponent<{
  category: string;
  setCategory: (value: string) => void;
}> = ({ category, setCategory }) => {
  const categories = useContext(MESSAGE_CATEGORIES).value;
  const [value, set_value] = useStateIfMounted(category);
  const [updateCat] = useDebounce(setCategory);

  useEffect(() => {
    updateCat(value);
  }, [value]);

  return (
    <label className="tts-message-modal-input tts-message-modal-category">
      <p>Category</p>
      <input
        id="message-category-input"
        value={value}
        // @ts-expect-error
        onChange={e => set_value(e.target.value)}
        list="message-categories-list"
        autocomplete="off"
        placeholder="Not Categorized"
      />
      <datalist id="message-categories-list">
        {categories?.map(s => (
          <option key={s.name} value={s.name}>
            {s.name}
          </option>
        ))}
      </datalist>
    </label>
  );
};

export const useCategoryField = (message: TTS.Message) => {
  const categories = useContext(MESSAGE_CATEGORIES).value;

  const initial_category = useMemo(
    () => categories.find(c => c.data.includes(message.id))?.name,
    []
  );

  return [...useStateIfMounted(initial_category), initial_category] as const;
};
