import './App.css';
import { Home } from './pages/Home';
import Posts from './pages/Posts';
import Sms from './pages/Sms';
import { useState, createContext, useContext } from "react";

import { Routes, Route, Link } from "react-router-dom";
import Test from './pages/Test';

function App() {

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/posts" element={<Posts />} />
      <Route path="/sms" element={<Sms />} />
      <Route path="/test" element={<Test />} />
    </Routes>
  );
}

export default App;
