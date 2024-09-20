import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import authReducer from "./state";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import { PersistGate } from "redux-persist/integration/react";
import { Amplify } from "aws-amplify";

// https://docs.amplify.aws/gen1/react/tools/libraries/configure-categories/

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolClientId: "6e718pu7haefgts8vp0hveoaa4",
      userPoolId: "us-east-2_CpLLfRhtv",
    },
  },
  API: {
    REST: {
      "climbing-app-api": {
        endpoint: "https://mkhhqgexii.execute-api.us-east-2.amazonaws.com/dev",
        region: "us-east-2",
      },
    },
  },
  Storage: {
    S3: {
      bucket: "toash-climbing-userdata",
      region: "us-east-2",
    },
  },
});

// set up redux store
const persistConfig = { key: "root", storage, version: 1 };
const persistedReducer = persistReducer(persistConfig, authReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistStore(store)}>
        <App />
      </PersistGate>
    </Provider>
  </React.StrictMode>
);
