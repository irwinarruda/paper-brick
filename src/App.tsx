import { JSX, createSignal } from "solid-js";
import { invoke } from "@tauri-apps/api";
import logo from "./assets/logo.svg";

type ButtonProps = JSX.ButtonHTMLAttributes<HTMLButtonElement>;

function Button(props: ButtonProps) {
  return (
    <button
      {...props}
      class="text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700"
    >
      {props.children}
    </button>
  );
}

type InputProps = JSX.InputHTMLAttributes<HTMLInputElement>;

function Input(props: InputProps) {
  return (
    <input
      {...props}
      class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
    />
  );
}

function App() {
  const [input, setInput] = createSignal("");
  async function onClick() {
    await invoke("change_wallpaper", { name: input() });
  }

  return (
    <div class="flex flex-col py-8 px-8">
      <h1 class="text-black text-4xl font-semibold text-center">
        Paper Brick!
      </h1>
      <div class="flex items-center justify-center pt-6 gap-5">
        <a href="https://vitejs.dev" target="_blank">
          <img src="/vite.svg" class="size-20" alt="Vite logo" />
        </a>
        <a href="https://tauri.app" target="_blank">
          <img src="/tauri.svg" class="size-20" alt="Tauri logo" />
        </a>
        <a href="https://solidjs.com" target="_blank">
          <img src={logo} class="size-20" alt="Solid logo" />
        </a>
      </div>
      <div class="w-full pt-8"></div>
      <Input value={input()} onInput={(e) => setInput(e.currentTarget.value)} />
      <p>{input()}</p>
      <div class="w-full pt-8"></div>
      <Button onClick={onClick}>Add wallpaper</Button>
    </div>
  );
}

export default App;
