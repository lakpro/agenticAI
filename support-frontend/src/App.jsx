import { useState } from "react";
import "./App.css";
import Request from "./components/Request";
import Memory from "./components/memory";

function App() {
  return (
    <>
      <Request />
      <Memory />
    </>
  );
}

export default App;
