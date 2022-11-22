import React from "react";
import "../Styles/Chat.css";

function Chat(props){
    //This component does not deal with states.
    //It simply renders the chat based on the data it's provided
    return(
        <div id="main">
            { // props.messages should be passed in an array, has username, text, timestamp field
                props.messages.map((message,i)=>(
                    <div className={message.username===props.username ? "myMessage" : "notMyMessage"}>
                        <span className="messageHeader">
                            <div className="username">
                                {message.username}
                            </div>
                            <div className="timestamp">
                                {(new Date(message.timestamp)).toString()}
                            </div>
                        </span>
                        <div className="messageText">
                            {message.text}
                        </div>
                    </div>
                ))
            }
        </div>
    );
}

export default Chat;