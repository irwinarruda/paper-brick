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
  const [customDir, setCustomDir] = createSignal<Picture | undefined>();
  const [pictures, setPictures] = createSignal<Picture[]>([]);
  const [currentPicture, setCurrentPicture] = createSignal<
    Picture | undefined
  >();
  const { t } = createLocale();

  const customDirName = createMemo(
    () => customDir()?.name || t("mainPicTitle")!,
  );

  async function selectPicture(picture: Picture) {
    try {
      setCurrentPicture(picture);
      await invoke(TauriHandlers.SetWallpaper, { path: picture.path });
    } catch (err) {
      error(err);
    }
  }

  async function setDirByPath() {
    try {
      const dirPath = storage.get<string>(StorageKeys.CustomDirPath);
      const dir = await fs.readDir(dirPath ?? "Pictures", {
        dir: dirPath ? undefined : fs.BaseDirectory.Home,
        recursive: false,
      });
      setCustomDir(dirPath ? toPicture(dirPath) : undefined);
      setPictures(getPicturesFromDir(dir));
    } catch (err) {
      error(err);
    }
  }

  async function registerCustomDir() {
    try {
      await invoke(TauriHandlers.SetDialogOpen);
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
      storage.set(StorageKeys.CustomDirPath, dirPath);
      await setDirByPath();
    } catch (err) {
      error(err);
    }
  }

  async function removeCustomDir() {
    try {
      storage.delete(StorageKeys.CustomDirPath);
      await setDirByPath();
    } catch (err) {
      error(err);
    }
  }

  async function loadCurrentPicture() {
    try {
      const currPicture = await invoke<string | undefined>(
        TauriHandlers.GetWallpaper,
      ).then((p) => (p ? toPicture(p) : undefined));
      setCurrentPicture(currPicture);
    } catch (err) {
      error(err);
    }
  }

  async function loadCustomDirPictures() {
    try {
      await setDirByPath();
    } catch (err) {
      error(err);
    }
  }

  return {
    pictures,
    customDir,
    customDirName,
    currentPicture,
    selectPicture,
    registerCustomDir,
    removeCustomDir,
    loadCurrentPicture,
    loadCustomDirPictures,
  };
}
