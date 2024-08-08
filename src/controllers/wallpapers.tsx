import { dialog, fs, invoke, path, window } from "@tauri-apps/api";
import { PhysicalPosition } from "@tauri-apps/api/window";
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

  async function loadPictures(prevendLoading = false) {
    try {
      if (!prevendLoading) setLoading(true);
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
      window.appWindow.setSize(
        new window.LogicalSize(580, 165 + addedRowHeights),
      );
      let currentPosition = await window.appWindow.outerPosition();
      let offsetPosition = new PhysicalPosition(
        currentPosition.x,
        (initialPosition ?? currentPosition.y) - addedRowHeights,
      );
      window.appWindow.setPosition(offsetPosition);
      return;
    }
    window.appWindow.setSize(new window.LogicalSize(580, 165));
    let currentPosition = await window.appWindow.outerPosition();
    let offsetPosition = new PhysicalPosition(
      currentPosition.x,
      initialPosition ?? currentPosition.y,
    );
    window.appWindow.setPosition(offsetPosition);
  }

  window.appWindow.listen<number>("window_tray_position", ({ payload }) => {
    initialPosition = payload;
  });

  window.appWindow.listen("tauri://focus", () => {
    window.appWindow.isFocused().then((isFocused) => {
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
