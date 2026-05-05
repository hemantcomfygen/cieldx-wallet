import { configureStore } from '@reduxjs/toolkit';
import AuthSlice from "./slices/AuthSlice"
import CoinTransactionSlice from "./slices/CoinTransactionSlice"

export const store = configureStore({
  reducer: {
    auth: AuthSlice,
    coinTransaction: CoinTransactionSlice,
  },
});



// store/store.js
// import { configureStore } from '@reduxjs/toolkit';
// import { persistStore, persistReducer } from 'redux-persist';
// import storage from 'redux-persist/lib/storage'; // localStorage
// // or use sessionStorage
// // import storageSession from 'redux-persist/lib/storage/session';
// import { combineReducers } from 'redux';
// import AuthSlice from "./slices/AuthSlice";
// import CoinTransactionSlice from "./slices/CoinTransactionSlice";


// const authPersistConfig = {
//   key: 'auth',
//   storage: storage,
//   whitelist: [
//     'getCoinListData',
//     'getAddressAndBalanceOfPassphraseData',
//     'getCoinListOfWalletData',
//     'getAllWalletListData',
//     'activeWalletData'
//   ],
// };

// const coinTransactionPersistConfig = {
//   key: 'coinTransaction',
//   storage: storage,
//   whitelist: [
//     'getAllTransactionListData'
//   ],
// };


// const persistedAuthReducer = persistReducer(authPersistConfig, AuthSlice);
// const persistedCoinTransactionReducer = persistReducer(coinTransactionPersistConfig, CoinTransactionSlice);

// // Combine reducers
// const rootReducer = combineReducers({
//   auth: persistedAuthReducer,
//   coinTransaction: persistedCoinTransactionReducer,
// });

// export const store = configureStore({
//   reducer: rootReducer,
//   middleware: (getDefaultMiddleware) =>
//     getDefaultMiddleware({
//       serializableCheck: {
//         ignoredActions: [
//           'persist/PERSIST',
//           'persist/REHYDRATE',
//           'persist/REGISTER',
//           'persist/PURGE',
//           'persist/FLUSH',
//           'persist/PAUSE',
//         ],
//       },
//     }),
// });

// export const persistor = persistStore(store);