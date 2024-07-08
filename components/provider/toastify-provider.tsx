'use client';

import { ToastContainer } from 'react-toastify';

export const ToastifyProvider = () => (
  <ToastContainer
    // toastClassName={(context) =>
    //   contextClass[context?.type || "default"] +
    //   " relative flex p-1 min-h-10 rounded-md justify-between overflow-hidden cursor-pointer"
    // }
    // bodyClassName={() => "text-sm font-white font-med block p-3"}
    position="top-right"
    autoClose={3000}
  />
);
