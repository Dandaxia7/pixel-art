import React from 'react';
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import NavigationBar from './components/NavigationBar';
import Canvas from './components/Canvas.js';
import Lobby from './components/Lobby.js';
import AIDraw from './components/AIDraw.js';
import Pixel from './components/Pixel.js';
import Account from './components/Account.js';


/************************************App主函数*******************************/
function App() {

  return (
      <BrowserRouter>
        <NavigationBar />
        <Routes>
          <Route path='/' element={<Lobby />}></Route>
          <Route path='/canvas' element={<Canvas />}></Route>
          <Route path='/AIdraw' element={<AIDraw />}></Route>
          <Route path='/pixel' element={<Pixel /> }></Route>
          <Route path='/account' element={<Account />}></Route>
        </Routes>
      </BrowserRouter>
  );
};
/************************************App主函数*******************************/
export default App;
