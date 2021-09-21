import * as Preact from "preact";
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "preact/hooks";
import { comparator, replace_item_in } from "~/common";
import { createNamedContext } from "~/model";
import {
  useDebounce,
  useStateIfMounted,
  useValueRef,
  filter_options_with_score,
} from "~/view/utils";

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

export const useOrganizerSearch = <T extends { id: string }>(
  items: T[],
  sections: OrganizerSectionSpec<string>[],
  uncategorized: OrganizerSectionSpec<string> | undefined,
  inputs: string[] | null,
  test_item: (item: T, regex: RegExp) => boolean
) => {
  const uncat_open = useValueRef(uncategorized?.open ?? true);
  const open_all = useRef<boolean>(true);
  useMemo(() => {
    open_all.current = true;
  }, [inputs]);

  const items_results_raw = useMemo<ScoredMatch<T>[] | null>(() => {
    if (!inputs || inputs.length === 0) {
      return null;
    }
    const [first, ...results] = inputs.map(text =>
      filter_options_with_score(text, items, test_item)
    );

    return results
      .reduce(
        (output, list) =>
          !list
            ? output
            : list.reduce((cur_output, msg) => {
                return !msg
                  ? cur_output
                  : replace_item_in(
                      cur_output,
                      m => m.opt.id === msg.opt.id,
                      prev_value =>
                        prev_value
                          ? {
                              ...prev_value,
                              score: msg.score + (prev_value?.score ?? 0),
                            }
                          : msg,
                      "end"
                    );
              }, output),
        first
      )
      .sort(comparator("score", "desc"));
  }, [inputs, items]);

  const sections_results = useMemo<
    OrganizerSectionSpec<string>[] | null
  >(() => {
    if (!inputs || inputs.length === 0) {
      return null;
    }
    const matches_in_cats = sections
      .map(c => {
        const items = c.data
          .map(id => items_results_raw.find(o => o.opt.id === id))
          .filter(_ => !!_);
        const score = items.reduce(
          (score, item) => score + (item?.score ?? 0),
          0
        );
        return items.length === 0
          ? null
          : {
              score,
              opt: {
                ...c,
                open: open_all.current ? true : c.open,
                data: items.map(m => m.opt.id),
              },
            };
      })
      .filter(_ => !!_);
    const matched_cats = filter_options_with_score(
      inputs[0],
      sections,
      (opt, regex) => regex.test(opt.name)
    );

    let results = matches_in_cats.reduce(
      (results, item) =>
        !item
          ? results
          : replace_item_in(
              results,
              c => c.opt.name === item.opt.name,
              prev_value =>
                prev_value
                  ? {
                      ...prev_value,
                      score: prev_value.score + item.score,
                    }
                  : item,
              "end"
            ),
      matched_cats
    );

    if (uncategorized) {
      const uncat_items = items_results_raw.filter(
        i => !results.some(c => c.opt.data.includes(i.opt.id))
      );
      if (uncat_items.length > 0) {
      }
      results = results.concat([
        {
          score: uncat_items.reduce(
            (score, msg) => score + (msg?.score ?? 0),
            0
          ),
          opt: {
            name: uncategorized.name,
            open: open_all.current ? true : uncat_open.current,
            data: uncat_items.map(m => m.opt.id),
          },
        },
      ]);
    }

    return results.sort(comparator("score", "desc")).map(({ opt }) => opt);
  }, [items_results_raw, inputs, sections, uncategorized]);

  const items_results = useMemo<T[] | null>(
    () => (items_results_raw ? items_results_raw.map(({ opt }) => opt) : null),
    [items_results_raw]
  );

  useEffect(() => {
    open_all.current = false;
  }, [inputs]);

  return [items_results, sections_results] as const;
};
