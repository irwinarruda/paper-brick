import { createSignal } from "solid-js";

export function createLoading() {
  const [signal, setSignal] = createSignal(false);
  let finished = false;
  let timer: number | undefined;
  return [
    signal,
    function (loading: boolean) {
      if (loading) {
        setSignal(true);
        if (!!timer) clearTimeout(timer);
        timer = setTimeout(() => {
          timer = undefined;
          if (finished) {
            finished = false;
            setSignal(false);
          }
        }, 500);
      }
      if (!!timer) finished = true;
      else setSignal(false);
    },
  ] as const;
}
