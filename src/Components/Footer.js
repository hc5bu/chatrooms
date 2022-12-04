import React, { useState } from "react";
import { BrowserView, MobileView, isMobile } from "react-device-detect";
import "../Styles/Footer.css"

function Footer(props) {
    const [userEntry, setUserEntry] = useState("");
    const [messageEntry, setMessageEntry] = useState("");
    const [sending, setSending] = useState(false);
    const [nameExists, setNameExists] = useState();
    const [showUpload, setShowUpload] = useState(false);
    const [file, setFile] = useState();
    const [fileValue, setFileValue] = useState("");

    const clickUserEntry = async (e) => {
        const name = userEntry;
        if (name !== "") {
            setSending(true);
            const result = await props.setUsername(name);
            if (result === null || result === true) {
                setSending(false);
                setUserEntry("");
            }
            setNameExists(name);
        }
    }

    const clickMessageEntry = async (e) => {
        if(showUpload && fileValue!==""){
            setSending(true);
            const result = await props.sendFile(file);
            if(result===true){
                setFile(undefined);
                setFileValue("");
                setSending(false);
            }
        }
        else if (messageEntry !== "") {
            setSending(true);
            const result = await props.sendMessage(messageEntry);
            if (result === true) {
                setMessageEntry("");
                setSending(false);
            }
        }
    }

    const enterPressUser = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            if(!sending)
                clickUserEntry();
        }
    }
    const enterPressMessage = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            if(!sending)
                clickMessageEntry();
        }
    }

    const handleFileChange = (e) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
            setFileValue(e.target.value);
        }
      };

    if (props.username === "") {
        return (
            <div id="footerWrapper">
                <div id="startingText">
                    <div>
                        <strong>{nameExists === undefined ? "Enter a username to start chatting..." :
                            `"${nameExists}" is currently in use. Enter a different name...`}</strong>
                        <BrowserView>
                            <div style={{ 'fontSize': 12.5 }}>(Your username will be cleared when you leave this page.)</div>
                        </BrowserView>
                        <MobileView>
                            <div style={{ 'fontSize': 12.5, "color": "red" }}>(Your username may be cleared if you leave this screen.)</div>
                        </MobileView>
                    </div>
                </div>
                <div className="footerContent">
                    <input id="usernameInput" value={userEntry} onChange={e => setUserEntry(e.target.value)} placeholder="Enter a username..."
                        onKeyDown={enterPressUser} disabled={sending} />
                    <button id="enterButton" onClick={clickUserEntry} disabled={sending||userEntry.length===0} style={{ "fontSize": (sending ? "" : "20px") }}>
                        {sending ? "Entering..." : "Enter"}
                    </button>
                </div>
            </div>

        )
    }
    else {
        let disableSend = sending || (!showUpload && messageEntry.length===0) || (showUpload && file===undefined);
        return (
            <div className="footerContent" style={{ "width": "100%" }}>
                <button id="changeButton" onClick={()=>setShowUpload(!showUpload)} disabled={sending}>{showUpload?"Go Back":"File Upload"}</button>
                {!showUpload ?
                    <input id="messageInput" value={messageEntry} onChange={e => setMessageEntry(e.target.value)} placeholder={`Type your message, ${props.username}...`}
                        onKeyDown={enterPressMessage} /> :
                    <div id="uploadContent">
                        <input id='fileUpload' type='file' accept="text/plain,audio/*,image/*"  onChange={handleFileChange} 
                        style={{fontSize:(isMobile ? "" : "16px")}} value={fileValue} disabled={sending}/>
                        <BrowserView>
                            <span id="fileTypes">Valid: .jpeg/.png/.mp3/.txt</span>
                        </BrowserView>
                    </div>
                    
                }
                {!showUpload ?
                    <button id="sendButton" onClick={clickMessageEntry} disabled={disableSend} 
                    style={{ "fontSize": (sending ? "" : "20px"), "color":(disableSend ? "" : "blue")}}>
                        {sending ? "Sending..." : "Send"}
                    </button> :
                    <button id="uploadButton" onClick={clickMessageEntry} disabled={disableSend} 
                    style={{ "fontSize": (sending ? "" : "20px"), "color":(disableSend ? "" : "orangeRed")}}>
                        {sending ? "Uploading..." : "Upload"}
                    </button>
                }
                
            </div>
        )
    }
}

export default Footer;