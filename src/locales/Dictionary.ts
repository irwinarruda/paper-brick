import * as i18n from "@solid-primitives/i18n";
import * as en from "./en";

export type RawDictionary = typeof en.dict;
export type Dictionary = i18n.Flatten<RawDictionary>;
