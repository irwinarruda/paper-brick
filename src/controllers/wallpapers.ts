import { dialog, fs, invoke, path } from "@tauri-apps/api";
import { createMemo, createSignal } from "solid-js";
import { Picture } from "../entities/Picutre";
import { TauriHandlers } from "../entities/TauriHandlers";
import { error } from "../utils/error";
import { extensions } from "../utils/extensions";
import { getPicturesFromDir } from "../utils/getPicturesFromDir";
import { StorageKeys, storage } from "../utils/storage";
import { toPicture } from "../utils/toPicture";

export function createWallpapers() {
  const [pictures, setPictures] = createSignal<Picture[]>([]);
  const [currentPicture, setCurrentPicture] = createSignal<
    Picture | undefined
  >();
  const [customDir, setCustomDir] = createSignal<Picture | undefined>();
  const [customPictures, setCustomImages] = createSignal<Picture[]>([]);

  const customDirName = createMemo(() => customDir()?.name || "Customizado");

  async function selectPicture(picture: Picture) {
    setCurrentPicture(picture);
    try {
      await invoke(TauriHandlers.SetWallpaper, { path: picture.path });
    } catch (err) {
      error(err);
    }
  }

  async function setCustomDirByPath(dirPath: string) {
    setCustomDir(toPicture(dirPath));
    const dir = await fs.readDir(dirPath as string, {
      recursive: true,
    });
    setCustomImages(getPicturesFromDir(dir));
    await storage.set(StorageKeys.CustomDirPath, dirPath);
    await storage.save();
  }

  async function registerCustomDir() {
    const dirPath = await dialog.open({
      directory: true,
      multiple: false,
      title: "Selecione uma pasta",
      defaultPath: await path.homeDir(),
      filters: [
        {
          name: "Imagens",
          extensions: extensions.map((i) => i.replace(".", "")),
        },
      ],
    });
    await setCustomDirByPath(dirPath as string);
  }

  async function loadCurrentPicture() {
    const currentPicture = await invoke<string>(
      TauriHandlers.GetWallpaper,
    ).then((p) => toPicture(p));
    setCurrentPicture(currentPicture);
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
    const path = await storage.get<string>(StorageKeys.CustomDirPath);
    if (!!path) {
      await setCustomDirByPath(path);
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
    loadBaseDirPictures,
    loadCurrentPicture,
    loadCustomDirPictures,
  };
}
