import { useContext } from "preact/hooks";
import * as hooks from "preact/hooks";
import { EDITOR_SETTINGS, HELP_COMPLETED, HELP_ITEM } from "~/model";
import { HELP_DATA, HelpDataKey } from "~/view/components/help/help-data";
import {
  silence_event,
  useContextState,
  useStateIfMounted,
  useValueRef,
} from "~/view/utils";

const get_help_keys = (elem: HTMLElement): [HelpDataKey, HelpDataKey] => {
  let help_key = elem?.dataset?.help;
  let tut_key = elem?.dataset?.tutorial;

  if (!help_key && !tut_key && elem.tagName === "OPTION") {
    elem = elem.parentElement;
    help_key = elem?.dataset?.help;
    tut_key = elem?.dataset?.tutorial;
  }

  return [help_key, tut_key] as [HelpDataKey, HelpDataKey];
};

export const useHelpItem = (enabled: boolean) => {
  const [key, set_key] = useContextState(HELP_ITEM);
  const [comp, set_comp] = useContextState(HELP_COMPLETED);
  const skip_tutorials = useValueRef(
    useContext(EDITOR_SETTINGS).value.skip_tutorials
  );
  const [is_tutorial, set_is_tutorial] = useStateIfMounted(false);
  const comp_map_ref = useValueRef(comp);
  const enabled_ref = useValueRef(enabled);
  const key_ref = useValueRef(key);

  hooks.useEffect(() => {
    if (!comp["intro-help"]) {
      set_key("intro-start");
    }
  }, []);

  hooks.useEffect(() => {
    if (!key || !HELP_DATA[key]) {
      set_is_tutorial(false);
    }
  }, [key]);

  const open_item = hooks.useCallback(
    (new_key: HelpDataKey, other_key?: HelpDataKey) => {
      if (new_key in HELP_DATA) {
        set_key(new_key);
        if (!comp_map_ref.current[new_key]) {
          set_comp({
            ...comp_map_ref.current,
            ...(other_key ? { [other_key]: true } : {}),
            [new_key]: true,
          });
        }
      } else if (enabled_ref.current) {
        set_key("not-found");
      }
    },
    []
  );

  return [
    key,
    hooks.useCallback<EventListener>(e => {
      if (key_ref.current) {
        return;
      }
      const [help_key, tut_key] = get_help_keys(e.target as HTMLElement);

      let target = !enabled_ref.current && tut_key ? tut_key : help_key;
      if (!target) {
        return;
      }

      const is_tut =
        !enabled_ref.current &&
        ((!!tut_key && !comp_map_ref.current[tut_key]) ||
          (!!(HELP_DATA[help_key] as TTS.HelpItem)?.tutorial &&
            !comp_map_ref.current[help_key]));

      if (enabled_ref.current || (is_tut && !skip_tutorials.current)) {
        silence_event(e);
        set_is_tutorial(is_tut);
        open_item(target, tut_key);
      }
    }, []),
    is_tutorial,
  ] as const;
};
