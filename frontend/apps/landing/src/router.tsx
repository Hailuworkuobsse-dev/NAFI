import { createBrowserRouter, Navigate } from 'react-router-dom';

import { PublicLayout } from './layouts/PublicLayout';
import { LandingPage } from './pages/LandingPage';
import { NotFoundPage } from './pages/NotFoundPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'how-it-works', element: <LandingPage /> },
      { path: 'for-investors', element: <LandingPage /> },
      { path: 'for-farmers', element: <LandingPage /> },
      { path: 'for-banks', element: <LandingPage /> },
      { path: 'for-government', element: <LandingPage /> },
      { path: 'impact', element: <LandingPage /> },
      { path: 'security', element: <LandingPage /> },
      { path: 'about', element: <LandingPage /> },
      { path: 'contact', element: <LandingPage /> },
      { path: '404', element: <NotFoundPage /> },
      { path: '*', element: <Navigate to="/404" replace /> },
    ],
  },
]);
