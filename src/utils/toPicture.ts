import { convertFileSrc } from "@tauri-apps/api/core";
import { Picture } from "../entities/Picutre";

export function toPicture(path: string): Picture {
  const splitPath = path.split("/");
  return {
    path: path,
    name: splitPath[splitPath.length - 1],
    src: convertFileSrc(path),
  };
}
