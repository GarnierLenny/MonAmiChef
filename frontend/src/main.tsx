import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import "./styles/index.css";
import { PostHogProvider } from "posthog-js/react";
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "https://19449437968adfbddb722155a1c04b53@o4510011509047296.ingest.de.sentry.io/4510011510161488",
  // Setting this option to true will send default PII data to Sentry.
  // For example, automatic IP address collection on events
  sendDefaultPii: true,
});

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
