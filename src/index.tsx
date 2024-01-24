/* @refresh reload */
import { render } from "solid-js/web";

import "./styles/index.css";
import App from "./App";
import { LocaleProvider } from "./controllers/locale";

render(
  () => (
    <LocaleProvider>
      <App />
    </LocaleProvider>
  ),
  document.getElementById("root") as HTMLElement,
);
