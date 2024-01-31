import { fs } from "@tauri-apps/api";
import imageCompression from "browser-image-compression";
import { Picture } from "../entities/Picutre";
import { extensions } from "../utils/extensions";
import { getFileFromPath } from "./getFileFromPath";

const memoFiles = new Map<string, string>();

export async function getPicturesFromDir(dir: fs.FileEntry[]) {
  let images = [] as Promise<Picture>[];
  for (let item of dir) {
    if (!item.children && extensions.some((i) => item.path.endsWith(i))) {
      images.push(
        (async function () {
          const picture: Picture = {
            name: item.name || "",
            path: item.path,
            src: "",
          };
          if (memoFiles.has(item.path)) {
            picture.src = memoFiles.get(item.path)!;
            return picture;
          }
          const file = await getFileFromPath(item.path, {
            fileName: "toCompress",
          });
          const src = URL.createObjectURL(
            await imageCompression(file, {
              maxSizeMB: 0.1,
              maxWidthOrHeight: 1920,
              useWebWorker: true,
            }),
          );
          memoFiles.set(item.path, src);
          picture.src = src;
          return picture;
        })(),
      );
    }
  }
  return Promise.all(images);
}
