import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { OnBeatProvider } from "./context/OnBeatContext";

import './styles/main.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
        <OnBeatProvider>
            <App />
        </OnBeatProvider>
    </BrowserRouter>
  </React.StrictMode>
);
