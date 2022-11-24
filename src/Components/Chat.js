import React, { useRef, useEffect } from "react";
import "../Styles/Chat.css";

function Chat(props) {
    //This component does not deal with states.
    //It simply renders the chat based on the data it's provided

    const bottomRef = useRef(null);

    useEffect(() => {
        //scroll to bottom at beginning
        if(bottomRef.current!==null)
            bottomRef.current.scrollIntoView();
    }, [])

    useEffect(() => {
        if (props.messages.length > 0) {
            const c = bottomRef.current.getAttribute("class");
            if(c==="myMessage")
                bottomRef.current.scrollIntoView();
        }
    }, [props.messages])

    if (props.messages.length === 0) {
        return (
            <div id="nothing">
                <div>
                    There haven't been any messages sent here yet.<br />
                    Be the first to send a message!
                </div>
                {props.error !== undefined &&
                    <div className="chatError">
                        Something went wrong. Please refresh the page. <br />
                        Reason: {props.error}
                    </div>}
            </div>
        )
    }

    const times = props.messages.map((message)=>(new Date(message.timestamp)).toLocaleTimeString())
    const dates = props.messages.map((message)=>{
        const t = new Date(message.timestamp);
        const today = new Date();
        const yesterday = new Date((new Date()).setDate(today.getDate()-1));
        if(t.toDateString()===today.toDateString())
            return "Today";
        else if (t.toDateString()===yesterday.toDateString())
            return "Yesterday";
        else
            return t.toLocaleDateString("en-US");
    })
    // props.messages should be passed in as a list, has username, text, timestamp field for each
    return (
        <div id="wrapper">
            <div id="chat">
                {props.messages.map((message, i) => (
                    <div className={message.username === props.username ? "myMessage" : "notMyMessage"}
                        ref={i === props.messages.length - 1 ? bottomRef : undefined} key={i}>
                        <div className="username">
                            {message.username}
                        </div>
                        <div className="messageText">
                            {message.text}
                        </div>
                        <div className="timestamp">
                            {dates[i]}&nbsp;{times[i]}
                        </div>
                    </div>
                ))
                }

                {props.error !== undefined &&
                    <div className="chatError">
                        Something went wrong. Please refresh the page. <br />
                        Reason: {props.error}
                    </div>}
            </div>
            <div id="spacer"></div>
        </div>
    );
}

export default Chat;