import { createMemo } from "solid-js";
import { tv } from "tailwind-variants";
import Placeholder from "../assets/placeholder.png";

const tvWallpaperButton = tv({
  slots: {
    root: "w-28 relative h-16",
    button: "w-28 h-16 bg-no-repeat bg-cover bg-center rounded-md",
  },
  variants: {
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
  selected?: boolean;
  onImageClick?: () => void;
  onDeleteClick?: () => void;
};

export function WallpaperButton(props: WallPaperButtonProps) {
  const css = createMemo(() => tvWallpaperButton({ selected: props.selected }));
  return (
    <div class={css().root()}>
      <button
        class={css().button()}
        onClick={props.onImageClick}
        aria-label={props.alt}
        style={{
          "background-image": `url(${props.src ?? Placeholder})`,
        }}
      />
    </div>
  );
}
