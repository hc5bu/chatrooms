import React from 'react';
import { createRoot } from 'react-dom/client';
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import Homepage from './Homepage';
import Chatroom from './Chatroom';
import Blankpage from './Blankpage';

const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route exact path='/' element={<Homepage/>}/>
        <Route exact path='/:id' element={<Chatroom/>}/>
        <Route path='/:id/*' element={<Blankpage/>}/>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);
