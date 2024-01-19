import { JSX, createSignal } from "solid-js";
import { invoke, fs } from "@tauri-apps/api";
import logo from "./assets/logo.svg";
import { Select } from "./components/Select";
import { createLogSignal } from "./utils/createLogSignal";

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
  const log = createLogSignal();
  const [input, setInput] = createSignal("");
  const [select, setSelect] = createSignal("test");
  async function onClick() {
    await invoke("change_wallpaper", { name: input() });
  }

  async function onFs() {
    const dir = await fs.readDir(".config", {
      dir: fs.BaseDirectory.Home,
      recursive: true,
    });
    log.send(dir.toString());
  }

  return (
    <div class="flex flex-col py-8 px-8">
      <h2>{log.view()}</h2>
      <h1 class="text-black text-4xl font-semibold text-center">
        Paper Brick!
      </h1>
      <div class="w-full pt-8"></div>
      <Select
        value={select()}
        onChange={setSelect}
        options={[
          { label: "test", value: "test" },
          { label: "test1", value: "test1" },
          { label: "test2", value: "test2" },
          { label: "test3", value: "test3" },
          { label: "test4", value: "test4" },
          { label: "test5", value: "test5" },
          { label: "test6", value: "test6" },
          { label: "test7", value: "test7" },
          { label: "test8", value: "test8" },
          { label: "test9", value: "test9" },
        ]}
      />
      <Input value={input()} onInput={(e) => setInput(e.currentTarget.value)} />
      <p>{input()}</p>
      <div class="w-full pt-8"></div>
      <Button onClick={onClick}>Add wallpaper</Button>
      <Button onClick={onFs}>Test File System</Button>
    </div>
  );
}

export default App;
