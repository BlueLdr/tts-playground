import * as Preact from "preact";
import { useCallback, useContext, useRef } from "preact/hooks";
import { createNamedContext } from "~/model";
import { useDebounce, useStateIfMounted } from "~/view/utils";

export const SEARCH_BAR = createNamedContext<string>("", "SearchBarState");

export const SearchBar: Preact.FunctionComponent = () => {
  const { value, setValue } = useContext(SEARCH_BAR);
  const input_ref = useRef<HTMLInputElement>();
  const [text, set_text] = useStateIfMounted(value);
  const [active, set_active] = useStateIfMounted(!!value);
  const [update_value, cancel_update] = useDebounce(setValue, 150);
  const on_change = useCallback(
    e => {
      const new_text = e.currentTarget.value;
      set_text(new_text);
      update_value(new_text);
    },
    [update_value]
  );

  const on_clear = useCallback(() => {
    cancel_update();
    set_text("");
    setValue("");
    set_active(false);
  }, [cancel_update]);

  return (
    <div className="search-bar" data-active={`${active}`}>
      <button
        className="icon-button search-bar-toggle"
        onClick={() => {
          set_active(true);
          input_ref.current?.focus();
        }}
      >
        <i class="fas fa-search" />
      </button>
      <input
        ref={input_ref}
        className="search-bar-input"
        value={text}
        onInput={on_change}
        onBlur={() => {
          if (!text) {
            on_clear();
          }
        }}
      />
      <button className="icon-button search-bar-close" onClick={on_clear}>
        <i class="fas fa-times" />
      </button>
    </div>
  );
};
