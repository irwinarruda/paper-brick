import { dialog, fs, invoke, path, window } from "@tauri-apps/api";
import { createMemo, createSignal } from "solid-js";
import { Picture } from "../entities/Picutre";
import { TauriHandlers } from "../entities/TauriHandlers";
import { error } from "../utils/error";
import { extensions } from "../utils/extensions";
import { getPicturesFromDir } from "../utils/getPicturesFromDir";
import { StorageKeys, storage } from "../utils/storage";
import { toPicture } from "../utils/toPicture";
import { createLoading } from "./loading";
import { createLocale } from "./locale";

export function createWallpapers() {
  const [loading, setLoading] = createLoading();
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
      setPictures(await getPicturesFromDir(dir));
    } catch (err) {
      error(err);
    }
  }

  async function registerCustomDir() {
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  }

  async function removeCustomDir() {
    try {
      setLoading(true);
      storage.delete(StorageKeys.CustomDirPath);
      await setDirByPath();
    } catch (err) {
      error(err);
    } finally {
      setLoading(false);
    }
  }

  async function loadPictures() {
    try {
      setLoading(true);
      const [curr] = await Promise.all([
        invoke<string | undefined>(TauriHandlers.GetWallpaper).then((p) =>
          p ? toPicture(p) : undefined,
        ),
        setDirByPath(),
      ]);
      setCurrentPicture(curr);
    } catch (err) {
      error(err);
    } finally {
      setLoading(false);
    }
  }

  async function onShowMore(isShowingMore: boolean) {
    if (isShowingMore) {
      window.appWindow.setSize(
        new window.LogicalSize(
          580,
          165 + (64 + 12) * (Math.ceil(pictures().length / 4) - 1),
        ),
      );
      return;
    }
    window.appWindow.setSize(new window.LogicalSize(580, 165));
  }

  return {
    loading,
    pictures,
    customDir,
    customDirName,
    currentPicture,
    selectPicture,
    registerCustomDir,
    removeCustomDir,
    loadPictures,
    onShowMore,
  };
}
