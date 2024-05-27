import React from "react";
import headLogo from '../lib/image/head.png';
import background from '../lib/image/background.png';
import {Link} from 'react-router-dom';
import "./Lobby.css";

function Lobby(){
  
  return (
      <div id="lobby1">
        <img src={background} id='background'/>
        <h1 id="Header">Pixel Art</h1>
        <Link to='/account' id='linkToCanvas' onClick={()=>{
            let nav0 = document.querySelector('#nav0');
            let nav5 = document.querySelector('#nav5');
            nav0.classList.remove('active');
            nav5.classList.add('active');}}>
          <img id="headImage" src={headLogo} alt="Show an headImage" />
        </Link>
      </div>
  );
};

export default Lobby;