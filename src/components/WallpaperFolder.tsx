import { IoClose } from "solid-icons/io";
import { For, Show, createMemo, createSignal } from "solid-js";
import { tv } from "tailwind-variants";
import { Picture } from "../entities/Picutre";
import { WallpaperButton } from "./WallpaperButton";

const tvWallpaperFolder = tv({
  slots: {
    header: "flex items-center justify-end",
    title: "text-sm text-black font-medium flex items-center gap-1",
    remove:
      "bg-gray-900 text-white rounded-full w-4 h-4 flex items-center justify-center transition-all duration-300",
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
    showRemove: {
      true: {
        remove: "visible",
      },
      false: {
        remove: "hidden",
      },
    },
  },
});

export type WallpaperFolderProps = {
  name: string;
  pictures: Picture[];
  selected?: Picture;
  hasRemove?: boolean;
  onImageClick?: (src: Picture) => void;
  onRemoveClick?: () => void;
};

export function WallpaperFolder(props: WallpaperFolderProps) {
  const [showAll, setShowAll] = createSignal(false);
  const [showRemove, setShowRemove] = createSignal(false);
  const css = createMemo(() =>
    tvWallpaperFolder({ showAll: showAll(), showRemove: showRemove() }),
  );

  const sortedPictures = createMemo(() => {
    const pic: Picture[] = [];
    let hasSelected = false;
    for (const i in props.pictures) {
      if (props.pictures[i].path === props.selected?.path && Number(i) > 4) {
        pic.push(props.pictures[i]);
        hasSelected = true;
      }
    }
    for (const p of props.pictures) {
      if (p.path !== props.selected?.path || !hasSelected) pic.push(p);
    }
    return pic;
  });

  function onShow() {
    if (props.pictures.length === 0) return;
    setShowAll((p) => !p);
  }

  function onImage(picture: Picture) {
    if (props.onImageClick) {
      props.onImageClick(picture);
    }
  }

  function onSelected(picture: Picture) {
    if (props.selected) {
      return props.selected.path === picture.path;
    }
    return false;
  }

  return (
    <section>
      <div class={css().header()}>
        <h3
          class={css().title()}
          onPointerOver={
            props.hasRemove ? () => setShowRemove(true) : undefined
          }
          onPointerOut={
            props.hasRemove ? () => setShowRemove(false) : undefined
          }
        >
          {props.name}
          <Show when={props.hasRemove}>
            <button
              class={css().remove()}
              aria-label="Remover Pasta"
              onClick={props.onRemoveClick}
            >
              <IoClose />
            </button>
          </Show>
        </h3>
        <button class={css().showButton()} onClick={onShow}>
          <Show when={!showAll()}>Mostrar Tudo ({props.pictures.length})</Show>
          <Show when={showAll()}>Mostrar Menos</Show>
        </button>
      </div>
      <div class={css().divider()} />
      <div class={css().imageContainer()}>
        <Show when={props.pictures.length > 0}>
          <For each={sortedPictures()}>
            {(img) => (
              <WallpaperButton
                src={img.src}
                alt={`Wallpaper ${img.name}`}
                selected={onSelected(img)}
                onImageClick={() => onImage(img)}
              />
            )}
          </For>
        </Show>
        <Show when={props.pictures.length === 0}>
          <For each={Array.from({ length: 4 })}>
            {() => <WallpaperButton alt="Sem Wallpaper" />}
          </For>
        </Show>
      </div>
    </section>
  );
}
