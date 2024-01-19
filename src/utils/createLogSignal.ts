import { createSignal } from "solid-js";

export function createLogSignal() {
  const [log, setLog] = createSignal<string>("");
  return {
    view: log,
    send: (msg: string) => setLog((prev) => prev + "\n" + msg),
  };
}
