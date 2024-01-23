import { Store } from "tauri-plugin-store-api";

export const storage = new Store(".settings.dat");

export const StorageKeys = {
  CustomDirPath: "custom_dir_path",
};
