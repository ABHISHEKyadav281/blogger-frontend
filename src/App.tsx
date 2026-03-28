import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./redux/store";

import {AppRoutes} from "./layout/AppRoutes"; 
import ScrollToTop from "./components/ScrollToTop";

export const App: React.FC = () => {
  return (
    <Provider store={store}>
      <Router>
        <ScrollToTop />
        <AppRoutes />
      </Router>
    </Provider>
  );
};

export default App;
