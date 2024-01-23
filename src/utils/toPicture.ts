import { tauri } from "@tauri-apps/api";
import { Picture } from "../entities/Picutre";

export function toPicture(path: string): Picture {
  const splitPath = path.split("/");
  return {
    path: path,
    name: splitPath[splitPath.length - 1],
    src: tauri.convertFileSrc(path),
  };
}
