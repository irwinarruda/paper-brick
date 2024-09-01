import * as os from "@tauri-apps/plugin-os";

export function normalizePath<T extends string | undefined>(path: T): T {
  if (!path) return path;
  const platform = os.platform();
  if (platform === "windows") {
    return path.replace("C:", "") as T;
  }
  return path;
}

export function unnormalizePath<T extends string | undefined>(path: T): T {
  if (!path) return path;
  const platform = os.platform();
  if (platform === "windows") {
    return ("C:" + path) as T;
  }
  return path;
}
