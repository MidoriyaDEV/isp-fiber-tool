// src/main.jsx (ou index.js)
import "bootstrap/dist/css/bootstrap.min.css"; // <- IMPORTANTE: primeiro o Bootstrap
import "./index.css";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { MapContext } from "./context/MapContext";
import { EditableContextProvider } from "./context/EditablePolylineContext";
import { PolylinesContextProvider } from "./context/PolylinesContext";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <MapContext>
      <PolylinesContextProvider>
        <EditableContextProvider>
          <App />
        </EditableContextProvider>
      </PolylinesContextProvider>
    </MapContext>
  </React.StrictMode>
);
