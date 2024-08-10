import fs from "@tauri-apps/plugin-fs";
import imageCompression from "browser-image-compression";
import { Picture } from "../entities/Picutre";
import { extensions } from "../utils/extensions";
import { getFileFromPath } from "./getFileFromPath";

const memoFiles = new Map<string, string>();

export async function getPicturesFromDir(dir: fs.DirEntry[]) {
  let images = [] as Promise<Picture>[];
  for (let item of dir) {
    if (!item.isDirectory && extensions.some((i) => item.name.endsWith(i))) {
      images.push(
        (async function () {
          const picture: Picture = {
            name: item.name || "",
            path: item.name,
            src: "",
          };
          if (memoFiles.has(item.name)) {
            picture.src = memoFiles.get(item.name)!;
            return picture;
          }
          const file = await getFileFromPath(item.name, {
            fileName: "toCompress",
          });
          const src = URL.createObjectURL(
            await imageCompression(file, {
              maxSizeMB: 0.1,
              maxWidthOrHeight: 1920,
              useWebWorker: true,
            }),
          );
          memoFiles.set(item.name, src);
          picture.src = src;
          return picture;
        })(),
      );
    }
  }
  return Promise.all(images);
}
