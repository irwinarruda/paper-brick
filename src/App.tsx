import { createSignal } from "solid-js";
import { CgMathPlus } from "solid-icons/cg";
import { fs, dialog, path } from "@tauri-apps/api";
import { WallpaperFolder } from "./components/WallpaperFolder";
import { Button } from "./components/Button";
import { extensions } from "./utils/extensions";

function App() {
  const [images, setImages] = createSignal<string[]>([]);

  async function onAddDir() {
    const file = await dialog.open({
      directory: true,
      multiple: false,
      title: "Selecione uma pasta",
      defaultPath: await path.homeDir(),
      filters: [
        {
          name: "Imagens",
          extensions: extensions.map((i) => i.replace(".", "")),
        },
      ],
    });
    // await invoke("change_wallpaper", {});
  }

  async function onFs() {
    try {
      const dir = await fs.readDir("Pictures", {
        dir: fs.BaseDirectory.Home,
        recursive: false,
      });
      let images = [];
      for (let item of dir) {
        if (!item.children && extensions.some((i) => item.path.endsWith(i))) {
          images.push(item.path);
        }
      }
      setImages(images);
    } catch (err) {}
  }
  onFs();

  return (
    <div class="flex flex-col pt-3 pb-5 h-screen overflow-auto">
      <div class="px-5 text-base text-stone-500 font-light">
        <div class="flex items-center justify-between">
          <h1 class="text-lg">Paper Brick</h1>
          <Button rightIcon={<CgMathPlus />} onClick={onAddDir}>
            Adicionar pasta
          </Button>
        </div>
        <div class="pt-3" />
        <WallpaperFolder images={images()} name="Suas Fotos" />
        <div class="pt-3" />
        <WallpaperFolder images={[]} name="Cusotmizado" />
      </div>
    </div>
  );
}

export default App;
