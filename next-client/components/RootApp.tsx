"use client";

import { StrictMode } from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { ToastContainer } from "react-toastify";

import { store, persistor } from "../client/src/app/store";
import { SocketProvider } from "../client/src/context/SocketContext";
import { NotificationProvider } from "../client/src/context/NotificationContext";
import "react-toastify/dist/ReactToastify.css";

import App from "../client/src/App.jsx";

export default function RootApp() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <StrictMode>
          <SocketProvider>
            <NotificationProvider>
              <App />
              <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
              />
            </NotificationProvider>
          </SocketProvider>
        </StrictMode>
      </PersistGate>
    </Provider>
  );
}

