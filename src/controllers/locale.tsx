import * as i18n from "@solid-primitives/i18n";
import { os } from "@tauri-apps/api";
import {
  JSX,
  Show,
  Suspense,
  createContext,
  createEffect,
  createResource,
  createSignal,
  useContext,
} from "solid-js";
import { Dictionary, RawDictionary } from "../locales/Dictionary";
import { Locale } from "../locales/Locale";

async function fetchDictionary(locale: Locale): Promise<Dictionary> {
  const dict: RawDictionary = (await import(`../locales/${locale}.ts`)).dict;
  return i18n.flatten(dict);
}

export function useLocale() {
  const [locale, setLocale] = createSignal<Locale>("en");
  const [dict] = createResource(locale, fetchDictionary);

  const t = i18n.translator(dict);

  createEffect(() => {
    os.locale().then((l) => {
      if (l) setLocale(l as Locale);
    });
  });

  return { locale, dict, t };
}

export const LocaleContext = createContext<ReturnType<typeof useLocale>>();

export function LocaleProvider(props: { children: JSX.Element }) {
  const value = useLocale();
  return (
    <Suspense fallback="Loading...">
      <LocaleContext.Provider value={useLocale()}>
        <Show when={value.dict()}>{props.children}</Show>
      </LocaleContext.Provider>
    </Suspense>
  );
}

export function createLocale() {
  return useContext(LocaleContext)!;
}
