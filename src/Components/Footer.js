import React, {useState} from "react";
import "../Styles/Footer.css"

function Footer(props){
    const [userEntry, setUserEntry] = useState("");
    const [messageEntry, setMessageEntry] = useState("");
    const [sending, setSending] = useState(false);
    const [nameExists, setNameExists] = useState(false);

    const clickUserEntry = async () => {
        if(userEntry!==""){
            setSending(true);
            const result = await props.setUsername(userEntry);
            if(result===null){
                // means name already exists
                setNameExists(true);
                setSending(false);
            }
            else if(result===true)
                setSending(false);
        }
    }

    const clickMessageEntry = async () => {
        if(messageEntry!==""){
            setSending(true);
            const result = await props.sendMessage(messageEntry);
            if(result===true){
                //success!
                setMessageEntry("");
                setSending(false);
            }
        }
    }

    const enterPressUser = (e) => {
        if(e.key==="Enter"){
            e.preventDefault();
            clickUserEntry();
        }
    }
    const enterPressMessage = (e) => {
        if(e.key==="Enter"){
            e.preventDefault();
            clickMessageEntry();
        }
    }

    if(props.username===""){
        return(
            <div id="footerContent">
                {!nameExists ? <div className="startingText">Enter a username<br/>to start chatting:</div> : 
                <div className="startingText">That username is currently in use.<br/> Enter something else:</div>}
                <input id="usernameInput" value={userEntry} onChange={e=>setUserEntry(e.target.value)} placeholder="Enter a username..." 
                onKeyDown={enterPressUser} disabled={sending}/>
                <button id="enterButton" onClick={clickUserEntry} disabled={sending}>
                    {sending?"Entering...":"Enter"}
                </button>
            </div>
        )
    }

    else {
        return(
            <div id="footerContent">
                <input id="messageInput" value={messageEntry} onChange={e=>setMessageEntry(e.target.value)} placeholder={`Type your message, ${props.username}...`}
                onKeyDown={enterPressMessage} disabled={sending}/>
                <button id="sendButton" onClick={clickMessageEntry} disabled={sending}>
                    {sending?"Sending...":"Send"}
                </button>
            </div>
        )
    }
}

export default Footer;