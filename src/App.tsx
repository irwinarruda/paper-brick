import { CgMathPlus } from "solid-icons/cg";
import { createEffect } from "solid-js";
import { Button } from "./components/Button";
import { WallpaperFolder } from "./components/WallpaperFolder";
import { createWallpapers } from "./controllers/wallpapers";

function App() {
  const {
    pictures,
    customDirName,
    customPictures,
    currentPicture,
    registerCustomDir,
    removeCustomDir,
    selectPicture,
    loadBaseDirPictures,
    loadCurrentPicture,
    loadCustomDirPictures,
  } = createWallpapers();

  createEffect(() => {
    loadBaseDirPictures();
    loadCurrentPicture();
    loadCustomDirPictures();
  });

  return (
    <div class="flex flex-col pt-3 pb-5 px-5 h-screen overflow-auto">
      <div class="flex items-center justify-between">
        <h1 class="text-lg text-black font-light dark:text-neutral-100">
          Paper Brick
        </h1>
        <Button rightIcon={<CgMathPlus />} onClick={registerCustomDir}>
          Adicionar pasta
        </Button>
      </div>
      <div class="pt-3" />
      <WallpaperFolder
        name="Suas Fotos"
        pictures={pictures()}
        selected={currentPicture()}
        onImageClick={selectPicture}
      />
      <div class="pt-3" />
      <WallpaperFolder
        name={customDirName()}
        pictures={customPictures()}
        selected={currentPicture()}
        onImageClick={selectPicture}
        onRemoveClick={removeCustomDir}
      />
    </div>
  );
}

export default App;
