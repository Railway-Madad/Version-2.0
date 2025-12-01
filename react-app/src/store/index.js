import { combineReducers, configureStore } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage";
import {
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  REHYDRATE,
  persistReducer,
  persistStore,
} from "redux-persist";
import authReducer from "./slices/authSlice";
import newsReducer from "./slices/newsSlice";
import menuReducer from "./slices/menuSlice";
import stockReducer from "./slices/stockSlice";
import settingsReducer from "./slices/settingsSlice";
import complaintReducer from "./slices/complaintSlice";
import orderReducer from "./slices/orderSlice";

const rootReducer = combineReducers({
  auth: authReducer,
  news: newsReducer,
  menu: menuReducer,
  stock: stockReducer,
  settings: settingsReducer,
  complaint: complaintReducer,
  orders: orderReducer,
});

const persistConfig = {
  key: "rail-madad-root",
  storage,
  whitelist: ["auth", "stock", "settings", "complaint", "orders"],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export default store;
