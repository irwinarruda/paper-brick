import { homeDir } from "@tauri-apps/api/path";
import { LogicalSize, PhysicalPosition } from "@tauri-apps/api/dpi";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { readDir, BaseDirectory } from "@tauri-apps/plugin-fs";
import { open } from "@tauri-apps/plugin-dialog";
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
  const window = getCurrentWebviewWindow();
  const [loading, setLoading] = createLoading();
  const [customDir, setCustomDir] = createSignal<Picture | undefined>();
  const [pictures, setPictures] = createSignal<Picture[]>([]);
  const [currentPicture, setCurrentPicture] = createSignal<
    Picture | undefined
  >();
  const rowCount = createMemo(() => Math.ceil(pictures().length / 4));
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
      const dir = await readDir(dirPath ?? "Pictures", {
        baseDir: dirPath ? undefined : BaseDirectory.Home,
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
      const dirPath = await open({
        directory: true,
        multiple: false,
        title: t("dialogTitle"),
        defaultPath: await homeDir(),
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
      console.log("invoke", invoke);
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
      if (!prevendLoading) setLoading(false);
    }
  }

  let initialPosition: number;
  async function onShowMore(isShowingMore: boolean) {
    const rowHeight = 64 + 12;
    const addedRowHeights = rowHeight * (rowCount() - 1);
    if (isShowingMore) {
      window.setSize(new LogicalSize(580, 165 + addedRowHeights));
      let currentPosition = await window.outerPosition();
      let offsetPosition = new PhysicalPosition(
        currentPosition.x,
        (initialPosition ?? currentPosition.y) - addedRowHeights,
      );
      window.setPosition(offsetPosition);
      return;
    }
    window.setSize(new LogicalSize(580, 165));
    let currentPosition = await window.outerPosition();
    let offsetPosition = new PhysicalPosition(
      currentPosition.x,
      initialPosition ?? currentPosition.y,
    );
    window.setPosition(offsetPosition);
  }

  window.listen<number>("window_tray_position", ({ payload }) => {
    initialPosition = payload;
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
