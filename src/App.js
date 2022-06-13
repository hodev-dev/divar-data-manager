import './App.css';
import { Home } from './pages/Home';
import Posts from './pages/Posts';
import { useState, createContext, useContext } from "react";

import { Routes, Route, Link } from "react-router-dom";
function App() {

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/posts" element={<Posts />} />
    </Routes>
  );
}

export default App;
