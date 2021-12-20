import React from "react";
import NaviRouter from './router.js';

import { Header, Layout } from "./components";

function App() {
  return (
    <Layout>
      <Header />
      <NaviRouter />
    </Layout>
  );
}

export default App;
