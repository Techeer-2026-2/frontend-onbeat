import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { OnBeatProvider } from "./context/OnBeatContext";

import "./styles/main.css";

const queryClient = new QueryClient(); // 데이터를 저장해 둘 창고

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <OnBeatProvider>
          <App />
        </OnBeatProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
);
