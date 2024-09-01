import * as path from "@tauri-apps/api/path";
import * as dpi from "@tauri-apps/api/dpi";
import * as core from "@tauri-apps/api/core";
import * as webviewWindow from "@tauri-apps/api/webviewWindow";
import * as fs from "@tauri-apps/plugin-fs";
import * as dialog from "@tauri-apps/plugin-dialog";
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
import { normalizePath, unnormalizePath } from "../utils/normalizePath";

export function createWallpapers() {
  const window = webviewWindow.getCurrentWebviewWindow();
  const [loading, setLoading] = createLoading();
  const [customDir, setCustomDir] = createSignal<Picture | undefined>();
  const [pictures, setPictures] = createSignal<Picture[]>([]);
  const [currentPicture, setCurrentPicture] = createSignal<
    Picture | undefined
  >();
  const rowCount = createMemo(() => Math.ceil(pictures().length / 4));
  const { t } = createLocale();

  const customDirName = createMemo(
    () => customDir()?.name || t("mainPicTitle")!
  );

  async function selectPicture(picture: Picture) {
    try {
      setCurrentPicture(picture);
      await core.invoke(TauriHandlers.SetWallpaper, {
        path: unnormalizePath(picture.path),
      });
    } catch (err) {
      error(err);
    }
  }

  async function setDirByPath() {
    try {
      const home = await path.homeDir();
      const defaultPath = await path.join(home, "Pictures");
      const dirPath = storage.get<string>(StorageKeys.CustomDirPath);
      const dir = await fs.readDir(normalizePath(dirPath ?? defaultPath));
      setCustomDir(dirPath ? toPicture(dirPath) : undefined);
      setPictures(
        await getPicturesFromDir(dir, normalizePath(dirPath ?? defaultPath))
      );
    } catch (err) {
      error(err);
    }
  }

  async function registerCustomDir() {
    try {
      setLoading(true);
      await core.invoke(TauriHandlers.SetDialogOpen);
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

  async function loadPictures(prevendLoading = false) {
    try {
      if (!prevendLoading) setLoading(true);
      const [curr] = await Promise.all([
        core
          .invoke<string | undefined>(TauriHandlers.GetWallpaper)
          .then((p) => (p ? toPicture(normalizePath(p)) : undefined)),
        setDirByPath(),
      ]);
      setCurrentPicture(curr);
    } catch (err) {
      error(err);
    } finally {
      if (!prevendLoading) setLoading(false);
    }
  }

  let initialPosition: number;
  let isShowingMore = false;
  async function onShowMore(showingMore: boolean) {
    isShowingMore = showingMore;
    const rowHeight = 64 + 12;
    const addedRowHeights = rowHeight * (rowCount() - 1);
    if (showingMore) {
      window.setSize(new dpi.LogicalSize(580, 165 + addedRowHeights));
      let currentPosition = await window.outerPosition();
      let offsetPosition = new dpi.PhysicalPosition(
        currentPosition.x,
        (initialPosition ?? currentPosition.y) - addedRowHeights
      );
      window.setPosition(offsetPosition);
      return;
    }
    window.setSize(new dpi.LogicalSize(580, 165));
    let currentPosition = await window.outerPosition();
    let offsetPosition = new dpi.PhysicalPosition(
      currentPosition.x,
      initialPosition ?? currentPosition.y
    );
    window.setPosition(offsetPosition);
  }

  window.listen<number>("window_tray_position", ({ payload }) => {
    if (!isShowingMore) initialPosition = payload;
  });

  window.listen("tauri://focus", () => {
    window.isFocused().then((isFocused) => {
      if (isFocused) {
        loadPictures(true);
      }
    });
  });

  loadPictures();

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
