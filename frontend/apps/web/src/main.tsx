import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';
import './i18n';
import './styles/globals.css';
import { initSentry } from './observability/sentry';
import { initWebVitals } from './observability/webVitals';

initSentry();
initWebVitals();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
