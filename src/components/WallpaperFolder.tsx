import { IoClose } from "solid-icons/io";
import { For, Show, createMemo, createSignal } from "solid-js";
import { tv } from "tailwind-variants";
import { createLocale } from "../controllers/locale";
import { Picture } from "../entities/Picutre";
import { WallpaperButton } from "./WallpaperButton";

const tvWallpaperFolder = tv({
  slots: {
    header: "flex items-center justify-end",
    title: [
      "text-sm text-black font-normal flex items-center gap-1",
      "dark:text-neutral-200",
    ],
    remove:
      "bg-gray-900 text-white rounded-full w-4 h-4 flex items-center justify-center transition-all duration-300",
    showButton: [
      "text-xs text-neutral-600 ml-auto hover:decoration-current hover:underline",
      "dark:text-neutral-400",
    ],
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
  onImageClick?: (src: Picture) => void;
  onRemoveClick?: () => void;
  isPlaceholder?: boolean;
};

export function WallpaperFolder(props: WallpaperFolderProps) {
  const [showAll, setShowAll] = createSignal(false);
  const [showRemove, setShowRemove] = createSignal(false);
  const { t } = createLocale();
  const css = createMemo(() =>
    tvWallpaperFolder({ showAll: showAll(), showRemove: showRemove() }),
  );
  const hasRemove = !!props.onRemoveClick;

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
          onPointerOver={hasRemove ? () => setShowRemove(true) : undefined}
          onPointerOut={hasRemove ? () => setShowRemove(false) : undefined}
        >
          {props.name}
          <Show when={hasRemove}>
            <button
              class={css().remove()}
              aria-label={t("removeDir")}
              onClick={props.onRemoveClick}
            >
              <IoClose />
            </button>
          </Show>
        </h3>
        <button class={css().showButton()} onClick={onShow}>
          <Show when={!showAll()}>
            {t("showMorePic", props.pictures.length)}
          </Show>
          <Show when={showAll()}>
            {t("showLessPic", props.pictures.length)}
          </Show>
        </button>
      </div>
      <div class={css().divider()} />
      <div class={css().imageContainer()}>
        <Show when={!props.isPlaceholder}>
          <For each={sortedPictures()}>
            {(img) => (
              <WallpaperButton
                src={img.src}
                alt={t("picLabel", img.name)}
                selected={onSelected(img)}
                onImageClick={() => onImage(img)}
              />
            )}
          </For>
        </Show>
        <Show when={props.isPlaceholder}>
          <For each={Array.from({ length: 4 })}>
            {() => <WallpaperButton alt={t("noPicLabel")} />}
          </For>
        </Show>
      </div>
    </section>
  );
}
