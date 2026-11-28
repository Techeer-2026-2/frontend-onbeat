import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { OnBeatProvider } from "./context/OnBeatContext";
import { startClickQueueRetry } from "./api/bannerClickQueue";

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

// 실패해서 보관해 둔 배너 클릭을 앱 시작 때와 30초마다 다시 보낸다
startClickQueueRetry();
