import { fs, tauri } from "@tauri-apps/api";
import { Picture } from "../entities/Picutre";
import { extensions } from "../utils/extensions";

export function getPicturesFromDir(dir: fs.FileEntry[]) {
  let images = [] as Picture[];
  for (let item of dir) {
    if (!item.children && extensions.some((i) => item.path.endsWith(i))) {
      images.push({
        name: item.name || "",
        path: item.path,
        src: tauri.convertFileSrc(item.path),
      });
    }
  }
  return images;
}
