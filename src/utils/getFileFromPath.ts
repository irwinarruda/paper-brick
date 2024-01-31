import { tauri } from "@tauri-apps/api";

export async function getFileFromPath(
  path: string,
  options: { fileName: string },
) {
  const file = await fetch(tauri.convertFileSrc(path)).then((res) =>
    res.blob(),
  );
  return new File([file], options.fileName, { type: file.type });
}
