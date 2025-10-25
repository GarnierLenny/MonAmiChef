import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import DesktopComingSoon from "./components/DesktopComingSoon.tsx";
import "./styles/index.css";
import "./styles/driver-custom.css";
import "./lib/i18n";
import { PostHogProvider } from "posthog-js/react";
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "https://19449437968adfbddb722155a1c04b53@o4510011509047296.ingest.de.sentry.io/4510011510161488",
  // Setting this option to true will send default PII data to Sentry.
  // For example, automatic IP address collection on events
  sendDefaultPii: true,
  beforeSend(event) {
    // Filter out browser extension errors
    const errorMessage = event.exception?.values?.[0]?.value || '';
    const extensionPatterns = [
      'The message port closed before a response was received',
      'MessageNotSentError',
      'RegisterClientLocalizationsError',
      'cookieManager.injectClientScript',
      'chrome-extension://',
      'moz-extension://',
      'safari-extension://',
      'Receiving end does not exist',
      'Extension context invalidated',
      'Could not establish connection'
    ];

    // Check if error is from browser extension
    if (extensionPatterns.some(pattern => errorMessage.includes(pattern))) {
      return null; // Don't send to Sentry
    }

    // Filter errors from extension-injected scripts
    const fileName = event.exception?.values?.[0]?.stacktrace?.frames?.[0]?.filename || '';
    if (fileName.includes('extension://') || fileName.includes('chrome://') || fileName.includes('moz://')) {
      return null;
    }

    return event;
  },
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
      <DesktopComingSoon>
        <App />
      </DesktopComingSoon>
    </BrowserRouter>
  </PostHogProvider>,
  //</StrictMode>,
);
