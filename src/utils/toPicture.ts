import * as core from "@tauri-apps/api/core";
import * as os from "@tauri-apps/plugin-os";
import { Picture } from "../entities/Picutre";

export function toPicture(path: string): Picture {
  const platform = os.platform();
  let splitPath;
  if (platform === "windows") {
    splitPath = path.split("\\");
  } else {
    splitPath = path.split("/");
  }
  return {
    path: path,
    name: splitPath[splitPath.length - 1],
    src: core.convertFileSrc(path),
  };
}
