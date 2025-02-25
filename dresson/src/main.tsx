import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App"; // ARCamera is inside App, so no need to import it here

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
