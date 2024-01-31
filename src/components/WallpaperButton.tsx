import { Show, createMemo } from "solid-js";
import { tv } from "tailwind-variants";
import Placeholder from "../assets/placeholder.png";

const tvWallpaperButton = tv({
  slots: {
    root: "min-w-28 h-16 relative rounded-md",
    button: "w-28 h-16 bg-no-repeat bg-cover bg-center rounded-md",
  },
  variants: {
    skeleton: {
      true: {
        root: "animate-pulse bg-gray-300 dark:bg-gray-800",
      },
    },
    selected: {
      true: {
        button: [
          "ring-[0.16rem] ring-inset ring-blue-500",
          "outline outline-white outline-1 -outline-offset-[0.185rem]",
          "dark:outline-black",
        ],
      },
    },
  },
});

export type WallPaperButtonProps = {
  src?: string;
  alt?: string;
  loading?: boolean;
  selected?: boolean;
  onImageClick?: () => void;
  onDeleteClick?: () => void;
};

export function WallpaperButton(props: WallPaperButtonProps) {
  const css = createMemo(() =>
    tvWallpaperButton({ selected: props.selected, skeleton: props.loading }),
  );
  return (
    <div class={css().root()}>
      <Show when={!props.loading}>
        <button
          class={css().button()}
          onClick={props.onImageClick}
          aria-label={props.alt}
          style={{
            "background-image": `url(${props.src ?? Placeholder})`,
          }}
        />
      </Show>
    </div>
  );
}
