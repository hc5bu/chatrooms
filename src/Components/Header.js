import React from "react";
import { Link } from "react-router-dom";
import "../Styles/Header.css"

function Header(props){
    const namedUsers = props.users.filter(name=>name!=="");
    const s = namedUsers.join(", ");
    const num = namedUsers.length;
    return (
        <div id="headerContent">
            <Link to="/"><button id="backButton">Back to<br/>Home</button></Link>
            <div id="activeUsers">
                <strong>{num} Active User{num!==1 && "s"}{num>0 && ": "}</strong>{s}
            </div>
            <div id="roomIdText">Room ID: <div id="roomNum">{props.roomId}</div></div>
        </div>
    )
}

export default Header;