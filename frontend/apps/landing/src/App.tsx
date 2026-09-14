import { RouterProvider, type RouterProviderProps } from 'react-router-dom';

import { router } from './router';

export default function App() {
  return <RouterProvider router={router as unknown as RouterProviderProps['router']} />;
}
