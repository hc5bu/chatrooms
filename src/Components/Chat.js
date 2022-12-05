import React, { useRef, useEffect, useState } from "react";
import "../Styles/Chat.css";

function Chat(props) {
    //This component does not deal with states.
    //It simply renders the chat based on the data it's provided

    const bottomRef = useRef(null);
    const { width } = useWindowSize();

    useEffect(() => {
        //scroll to bottom at beginning. Does this before images are all loaded
        if (bottomRef.current !== null)
            bottomRef.current.scrollIntoView();
    }, [])

    useEffect(() => {
        if (props.messages.length > 0) {
            const c = bottomRef.current.getAttribute("class");
            if (c === "myMessage")
                bottomRef.current.scrollIntoView();
        }
    }, [props.messages])

    if (props.messages.length === 0) {
        return (
            <div id="nothing">
                <div style={{ fontSize: (width >= 1200 ? "1.5em" : "1em") }}>
                    There haven't been any messages sent here yet.<br />
                    Be the first to send a message!
                </div>
                {props.error !== undefined &&
                    <div className="chatError" style={{ fontSize: (width >= 1200 ? "1.5em" : "1em") }}>
                        Something went wrong. Please refresh the page. <br />
                        Reason: {props.error}
                    </div>}
            </div>
        )
    }

    const times = props.messages.map((message) => (new Date(message.timestamp)).toLocaleTimeString())
    const dates = props.messages.map((message) => {
        const t = new Date(message.timestamp);
        const today = new Date();
        const yesterday = new Date((new Date()).setDate(today.getDate() - 1));
        if (t.toDateString() === today.toDateString())
            return "Today";
        else if (t.toDateString() === yesterday.toDateString())
            return "Yesterday";
        else
            return t.toLocaleDateString("en-US");
    })

    // props.messages should be passed in as a list, has username, text, timestamp field for each
    // unless it's a file message, which involves more work
    const parseContent = (message) => {
        if (message.text !== undefined) {
            return (
                <div className="messageText messageMiddle" style={{ fontSize: (width >= 1200 ? "1.5em" : "1em") }}>
                    {message.text}
                </div>
            )
        } else {
            // it's a file
            if (message.filetype.startsWith("image"))
                return (<img className="messageImage messageMiddle" src={message.fileUrl} alt={message.filename} />);
            else if (message.filetype.startsWith("audio"))
                return (
                    <audio className="messageAudio messageMiddle" controls>
                        <source src={message.fileUrl} />
                    </audio>
                )
            else
                return (<a className="messageLink messageMiddle" href={message.fileUrl}>{message.filename}</a>);
        }

    }

    return (
        <div id="wrapper">
            <div id="chat">
                {props.messages.map((message, i) => {
                    return (
                        <div className={message.username === props.username ? "myMessage" : "notMyMessage"}
                            ref={i === props.messages.length - 1 ? bottomRef : undefined} key={i} id={`message-${i}`}>
                            <div className="username" style={{ fontSize: (width >= 1200 ? "21px" : "14px") }}>
                                {message.username}
                            </div>
                            {parseContent(message)}
                            <div className="timestamp" style={{ fontSize: (width >= 1200 ? "15px" : "10px") }}>
                                {dates[i]}&nbsp;{times[i]}
                            </div>
                        </div>
                    )
                })
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

// Hook
function useWindowSize() {
    // Initialize state with undefined width/height so server and client renders match
    const [windowSize, setWindowSize] = useState({
        width: undefined,
        height: undefined,
    });
    useEffect(() => {
        // Handler to call on window resize
        function handleResize() {
            // Set window width/height to state
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        }
        // Add event listener
        window.addEventListener("resize", handleResize);
        // Call handler right away so state gets updated with initial window size
        handleResize();
        // Remove event listener on cleanup
        return () => window.removeEventListener("resize", handleResize);
    }, []); // Empty array ensures that effect is only run on mount
    return windowSize;
}

export default Chat;