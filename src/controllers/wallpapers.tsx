import { dialog, fs, invoke, path } from "@tauri-apps/api";
import { createMemo, createSignal } from "solid-js";
import { Picture } from "../entities/Picutre";
import { TauriHandlers } from "../entities/TauriHandlers";
import { error } from "../utils/error";
import { extensions } from "../utils/extensions";
import { getPicturesFromDir } from "../utils/getPicturesFromDir";
import { StorageKeys, storage } from "../utils/storage";
import { toPicture } from "../utils/toPicture";
import { createLocale } from "./locale";

export function createWallpapers() {
  const [pictures, setPictures] = createSignal<Picture[]>([]);
  const [currentPicture, setCurrentPicture] = createSignal<
    Picture | undefined
  >();
  const [customDir, setCustomDir] = createSignal<Picture | undefined>();
  const [customPictures, setCustomImages] = createSignal<Picture[]>([]);
  const { t } = createLocale();

  const customDirName = createMemo(
    () => customDir()?.name || t("defaultCustomDir")!,
  );

  async function selectPicture(picture: Picture) {
    try {
      setCurrentPicture(picture);
      await invoke(TauriHandlers.SetWallpaper, { path: picture.path });
    } catch (err) {
      error(err);
    }
  }

  async function setCustomDirByPath(dirPath: string) {
    try {
      setCustomDir(toPicture(dirPath));
      const dir = await fs.readDir(dirPath as string, {
        recursive: true,
      });
      setCustomImages(getPicturesFromDir(dir));
      await storage.set(StorageKeys.CustomDirPath, dirPath);
      await storage.save();
    } catch (err) {
      error(err);
    }
  }

  async function registerCustomDir() {
    try {
      const dirPath = await dialog.open({
        directory: true,
        multiple: false,
        title: t("dialogTitle"),
        defaultPath: await path.homeDir(),
        filters: [
          {
            name: "Images",
            extensions: extensions.map((i) => i.replace(".", "")),
          },
        ],
      });
      if (!dirPath) return;
      await setCustomDirByPath(dirPath as string);
    } catch (err) {
      error(err);
    }
  }

  async function removeCustomDir() {
    try {
      setCustomDir(undefined);
      setCustomImages([]);
      await storage.delete(StorageKeys.CustomDirPath);
      await storage.save();
    } catch (err) {
      error(err);
    }
  }

  async function loadCurrentPicture() {
    try {
      const currentPicture = await invoke<string | undefined>(
        TauriHandlers.GetWallpaper,
      ).then((p) => (p ? toPicture(p) : undefined));
      setCurrentPicture(currentPicture);
    } catch (err) {
      error(err);
    }
  }

  async function loadBaseDirPictures() {
    try {
      const dir = await fs.readDir("Pictures", {
        dir: fs.BaseDirectory.Home,
        recursive: false,
      });
      setPictures(getPicturesFromDir(dir));
      setCurrentPicture(currentPicture);
    } catch (err) {
      error(err);
    }
  }

  async function loadCustomDirPictures() {
    try {
      const path = await storage.get<string>(StorageKeys.CustomDirPath);
      if (!!path) {
        await setCustomDirByPath(path);
      }
    } catch (err) {
      error(err);
    }
  }

  return {
    pictures,
    customDir,
    customDirName,
    customPictures,
    currentPicture,
    selectPicture,
    registerCustomDir,
    removeCustomDir,
    loadBaseDirPictures,
    loadCurrentPicture,
    loadCustomDirPictures,
  };
}
