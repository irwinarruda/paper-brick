import { window } from "@tauri-apps/api";
import { CgMathPlus } from "solid-icons/cg";
import Logo from "./assets/logo.png";
import { Button } from "./components/Button";
import { WallpaperFolder } from "./components/WallpaperFolder";
import { createLocale } from "./controllers/locale";
import { createWallpapers } from "./controllers/wallpapers";

function App() {
  const {
    pictures,
    customDir,
    customDirName,
    currentPicture,
    registerCustomDir,
    removeCustomDir,
    selectPicture,
    loadCurrentPicture,
    loadCustomDirPictures,
  } = createWallpapers();
  const { t } = createLocale();

  window.appWindow.listen("tauri://focus", () => {
    window.appWindow.isFocused().then((isFocused) => {
      if (isFocused) {
        loadCustomDirPictures();
        loadCurrentPicture();
      }
    });
  });
  loadCustomDirPictures();
  loadCurrentPicture();

  return (
    <div class="flex flex-col pt-3 pb-5 px-5 h-screen overflow-auto">
      <div class="flex items-center justify-between">
        <h1 class="flex items-center text-lg text-black font-light dark:text-neutral-100">
          <img src={Logo} class="size-6" /> <div class="pl-1" /> {t("title")}
        </h1>
        <Button rightIcon={<CgMathPlus />} onClick={registerCustomDir}>
          {t("addDir")!}
        </Button>
      </div>
      <div class="pt-3" />
      <WallpaperFolder
        name={customDirName()}
        pictures={pictures()}
        selected={currentPicture()}
        onImageClick={selectPicture}
        onRemoveClick={removeCustomDir}
        hasRemove={!!customDir()}
        isPlaceholder={pictures().length === 0}
      />
    </div>
  );
}

export default App;
