import { convertFileSrc } from "@tauri-apps/api/core";

export async function getFileFromPath(
  path: string,
  options: { fileName: string },
) {
  const file = await fetch(convertFileSrc(path)).then((res) => res.blob());
  return new File([file], options.fileName, { type: file.type });
}
