import { JSX } from "solid-js";
import { tv } from "tailwind-variants";

const tvButton = tv({
  base: [
    "flex items-center",
    "bg-stone-50 hover:bg-stone-200 focus:outline-none focus:ring-4 focus:ring-gray-300 rounded-lg",
    "h-6 px-2",
    "text-sm text-black font-light",
    "shadow shadow-stone-500",
    "dark:text-stone-100",
    "dark:bg-neutral-600 dark:hover:bg-neutral-500 dark:shadow-stone-800",
  ],
});

export type ButtonProps = JSX.ButtonHTMLAttributes<HTMLButtonElement> & {
  rightIcon?: JSX.Element;
};

export function Button(props: ButtonProps) {
  return (
    <button {...props} class={tvButton({ class: props.class })}>
      {props.children}
      {props.rightIcon && <div class="pl-1" />}
      {props.rightIcon}
    </button>
  );
}
