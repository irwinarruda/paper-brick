import { tauri } from "@tauri-apps/api";
import { For, Show, createMemo, createSignal } from "solid-js";
import { tv } from "tailwind-variants";
import { WallpaperButton } from "./WallpaperButton";

const tvWallpaperFolder = tv({
  slots: {
    header: "flex items-center justify-end",
    title: "text-sm text-black font-medium",
    showButton: "text-xs ml-auto hover:decoration-current hover:underline",
    imageContainer: "flex flex-row justify-start overflow-hidden w-full gap-3",
    divider: "pt-2",
  },
  variants: {
    showAll: {
      true: {
        imageContainer: "flex-wrap",
      },
    },
  },
});

export type WallpaperFolderProps = {
  name: string;
  images: string[];
  onImageClick?: (src: string) => void;
  onShowAllClick?: () => void;
};

export function WallpaperFolder(props: WallpaperFolderProps) {
  const [showAll, setShowAll] = createSignal(false);
  const css = createMemo(() => tvWallpaperFolder({ showAll: showAll() }));

  function onShow() {
    if (props.images.length === 0) return;
    setShowAll((p) => !p);
  }

  function onImage(src: string) {
    if (props.onImageClick) {
      props.onImageClick(src);
    }
  }

  return (
    <section>
      <div class={css().header()}>
        <h3 class={css().title()}>{props.name}</h3>
        <button class={css().showButton()} onClick={onShow}>
          <Show when={!showAll()}>Mostrar Tudo ({props.images.length})</Show>
          <Show when={showAll()}>Mostrar Menos</Show>
        </button>
      </div>
      <div class={css().divider()} />
      <div class={css().imageContainer()}>
        <Show when={props.images.length > 0}>
          <For each={props.images}>
            {(img) => (
              <WallpaperButton
                src={tauri.convertFileSrc(img)}
                alt={`Wallpaper ${img}`}
                onImageClick={() => onImage(img)}
              />
            )}
          </For>
        </Show>
        <Show when={props.images.length === 0}>
          <For each={Array.from({ length: 4 })}>
            {() => <WallpaperButton alt="Sem Wallpaper" />}
          </For>
        </Show>
      </div>
    </section>
  );
}
