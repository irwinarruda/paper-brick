export const storage = {
  set(key: string, value: any) {
    window.localStorage.setItem(key, JSON.stringify(value));
  },
  get<T>(key: string): T | undefined {
    const value = window.localStorage.getItem(key);
    if (value) {
      return JSON.parse(value);
    }
    return undefined;
  },
  delete(key: string) {
    window.localStorage.removeItem(key);
  },
};

export const StorageKeys = {
  CustomDirPath: "custom_dir_path",
};
