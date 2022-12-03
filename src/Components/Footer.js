import React, { useState } from "react";
import { BrowserView, MobileView } from "react-device-detect";
import "../Styles/Footer.css"

function Footer(props) {
    const [userEntry, setUserEntry] = useState("");
    const [messageEntry, setMessageEntry] = useState("");
    const [sending, setSending] = useState(false);
    const [nameExists, setNameExists] = useState();

    const clickUserEntry = async () => {
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
        e.preventDefault();
        if (messageEntry !== "") {
            setSending(true);
            const result = await props.sendMessage(messageEntry);
            if (result === true) {
                //success!
                setMessageEntry("");
                setSending(false);
            }
        }
    }

    const enterPressUser = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            clickUserEntry();
        }
    }
    const enterPressMessage = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            clickMessageEntry();
        }
    }

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
                    <button id="enterButton" onClick={clickUserEntry} disabled={sending} style={{"fontSize":(sending?"":"20px")}}>
                        {sending ? "Entering..." : "Enter"}
                    </button>
                </div>
            </div>

        )
    }

    else {
        return (
            <div className="footerContent" style={{ "width": "100%" }}>
                <input id="messageInput" value={messageEntry} onChange={e => setMessageEntry(e.target.value)} placeholder={`Type your message, ${props.username}...`}
                    onKeyDown={enterPressMessage} disabled={sending} />
                <button id="sendButton" onClick={clickMessageEntry} disabled={sending} style={{"fontSize":(sending?"":"20px")}}>
                    {sending ? "Sending..." : "Send"}
                </button>
            </div>
        )
    }
}

export default Footer;