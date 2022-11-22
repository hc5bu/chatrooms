import React from 'react';
import { createRoot } from 'react-dom/client';
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import Homepage from './Homepage';
import Chatroom from './Chatroom';

const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route exact path='/' element={<Homepage/>}/>
        <Route path='/:id' element={<Chatroom/>}/>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);
