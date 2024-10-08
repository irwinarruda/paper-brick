import { CgMathPlus } from "solid-icons/cg";
import Logo from "./assets/logo.png";
import { Button } from "./components/Button";
import { WallpaperFolder } from "./components/WallpaperFolder";
import { createLocale } from "./controllers/locale";
import { createWallpapers } from "./controllers/wallpapers";

function App() {
  const {
    pictures,
    loading,
    customDir,
    customDirName,
    currentPicture,
    registerCustomDir,
    removeCustomDir,
    selectPicture,
    onShowMore,
  } = createWallpapers();
  const { t } = createLocale();

  return (
    <div class="flex flex-col pt-3 pb-5 px-5 h-screen overflow-hidden">
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
        loading={loading()}
        pictures={pictures()}
        selected={currentPicture()}
        onImageClick={selectPicture}
        onRemoveClick={removeCustomDir}
        onShowMore={onShowMore}
        hasRemove={!!customDir()}
        isPlaceholder={pictures().length === 0}
      />
    </div>
  );
}

export default App;
