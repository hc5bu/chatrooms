import React from "react";
import "../Styles/Chat.css";

function Chat(props) {
    //This component does not deal with states.
    //It simply renders the chat based on the data it's provided

    if (props.messages === undefined) {
        return (
            <div id="nothing">
                <div>
                    There haven't been any messages sent here yet.<br />
                    Be the first to send a message!
                </div>
                {props.error!==undefined &&
                <div className="chatError">
                    Something went wrong. Please refresh the page. <br/>
                    Reason: {props.error}
                </div>}
            </div>
        )
    }
    // props.messages should be passed in as a list, has username, text, timestamp field for each
    return (
        <div id="chat">
            {props.messages.map((message, i) => (
                <div className={message.username === props.username ? "myMessage" : "notMyMessage"} key={i}>
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

            {props.error!==undefined &&
            <div className="chatError">
                Something went wrong. Please refresh the page. <br/>
                Reason: {props.error}
            </div>}
        </div>
    );
}

export default Chat;