import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import "./styles/index.css";
import { PostHogProvider } from "posthog-js/react";

const options = {
  api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
};

createRoot(document.getElementById("root")!).render(
  //<StrictMode>
  <PostHogProvider
    apiKey={import.meta.env.VITE_PUBLIC_POSTHOG_KEY}
    options={options}
  >
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </PostHogProvider>,
  //</StrictMode>,
);
