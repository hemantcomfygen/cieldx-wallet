import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { store } from "./redux/store.jsx";
import { Provider } from "react-redux";
// import { PersistGate } from "redux-persist/integration/react";
import { SocketProvider } from "./context/SocketProvider.jsx";
import { HashRouter } from 'react-router-dom'

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      {/* <HashRouter> */}
      <Provider store={store}>
        {/* <PersistGate persistor={persistor}> */}
        <SocketProvider>
          <App />
        </SocketProvider>
        {/* </PersistGate> */}
      </Provider>
    </BrowserRouter>
    {/* </HashRouter> */}
  </StrictMode>
);
