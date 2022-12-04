import React from "react";
import { useParams, Link } from "react-router-dom";
import { db, storage } from "./firebase.js";
import { ref, push, get, set, remove, onValue } from "firebase/database";
import { ref as storeRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { isMobile } from "react-device-detect";
import Chat from "./Components/Chat";
import Footer from "./Components/Footer";
import Header from "./Components/Header";
import "./Styles/Chatroom.css";

export default function ChatroomWrapper(props) {
    let { id } = useParams();
    return (<Chatroom id={id} />);
    // Wraps Chatroom in a function to use useParams()
}

class Chatroom extends React.Component {
    constructor(props) {
        super(props);
        let valid = this.checkValid(props.id);
        this.state = {
            error: undefined,
            messagesLoaded: false,
            usersLoaded: false,
            usersUpdated: false,
            invalid: !valid,
            username: "",
            users: [],
            messages: [],
        };
        this.userListener = undefined;
        this.messageListener = undefined;
        this.userRef = undefined;
        this.userKey = undefined;
    }

    componentDidMount() {
        if (!this.state.invalid) {
            this.userRef = ref(db, `${this.props.id}/users`);
            this.userKey = push(this.userRef);
            this.loading();
            //and an event listener to do stuff when you leave the page.
            if (isMobile)
                document.addEventListener("visibilitychange", this.visibilityChange);
            else
                window.addEventListener('beforeunload', this.unloading);
        }

    }

    resetUsername = async () => {
        // like setUsername below, but without parameters
        let userlist = (await get(this.userRef)).val();
        userlist = userlist !== null ? Object.values(userlist) : [];
        this.setState({ users: userlist });
        if (this.state.username === "" || userlist.includes(this.state.username)) {
            await set(this.userKey, ""); // will be "" if name is taken
            this.setState({ username: "" });
        }
        else
            await set(this.userKey, this.state.username);
    }

    loading = () => {
        this.resetUsername().then(() =>
            this.setState({ usersUpdated: true })
        ).catch(error => this.setState({ error: error.message }));

        //Get list of users, get list of messages
        this.userListener = onValue(this.userRef, snapshot => {
            if (snapshot.exists())
                this.setState({ usersLoaded: true, users: Object.values(snapshot.val()) });
            else
                this.setState({ usersLoaded: true, users: [] }); //should never happen since there should be 1
        }, error => this.setState({ error: error.message })) //if something went wrong

        this.messageListener = onValue(ref(db, `${this.props.id}/messages`), snapshot => {
            if (snapshot.exists())
                this.setState({ messagesLoaded: true, messages: Object.values(snapshot.val()) });
            else
                this.setState({ messagesLoaded: true, messages: [] });
        }, error => this.setState({ error: error.message }))
    }

    unloading = (event) => {
        // event.preventDefault();
        // remove user from component
        if (this.userKey !== undefined)
            remove(this.userKey);
        //detach listeners
        if (this.messageListener !== undefined)
            this.messageListener();
        if (this.userListener !== undefined)
            this.userListener();
        // With an undefined return value, it won't prompt you if you try to exit.
    }

    visibilityChange = (event) => {
        if (document.visibilityState === 'visible') {
            this.loading();
        } else {
            this.unloading();
            /*
            this.setState({
                usersUpdated: false,
                messagesLoaded: false,
                usersLoaded: false
            })
            I can't unload the page. That'll reset the state of all components.
            Chances are no one will type that quickly*/
        }
    }

    componentWillUnmount() {
        //remove event listeners
        if (isMobile)
            document.removeEventListener('visibilitychange', this.visibilityChange);
        else
            window.removeEventListener('beforeunload', this.unloading);
        this.unloading();
    }

    checkValid(id) {
        const isInvalid = id.length > 4 || id.match(/[^A-Za-z0-9]/g);
        return !isInvalid;
    }

    //these will be passed to the footer
    setUsername = async (name) => {
        if (this.state.users.includes(name))
            return null;
        try {
            await set(this.userKey, name);
        }
        catch (error) {
            this.setState({ error: error.message });
            return false;
        }
        this.setState({ username: name });
        return true;
    }

    sendMessage = async (text) => {
        const messageKey = push(ref(db, `${this.props.id}/messages`));
        const newMessage = {
            text: text,
            timestamp: Date.now(),
            username: this.state.username,
        }
        try {
            await set(messageKey, newMessage);
            await set(ref(db, `${this.props.id}/lastUpdated`), Date.now())
        }
        catch (error) {
            this.setState({ error: error.message });
            return false;
        }
        return true;
    }

    sendFile = async (file) => {
        const messageKey = push(ref(db, `${this.props.id}/messages`));
        const fileKey = push(ref(db, `${this.props.id}/files`))
        const filepath = `${this.props.id}/${messageKey.key}/${file.name}`;
        const storageRef = storeRef(storage, filepath);        
        const newMessage = {
            filetype: file.type,
            filename: file.name,
            timestamp: Date.now(),
            username: this.state.username,
        }
        try {
            await uploadBytes(storageRef, file);
            const url = await getDownloadURL(storeRef(storage, filepath));
            newMessage['fileUrl'] = url;
            await set(messageKey, newMessage);
            await set(fileKey, filepath);
            await set(ref(db, `${this.props.id}/lastUpdated`), Date.now());
        }
        catch (error) {
            this.setState({ error: error.message });
            return false;
        }
        return true;
    }

    render() {
        if (this.state.invalid) {
            return (
                <div>
                    <h2>That ID is invalid.</h2>
                    <p>Room IDs should be up to 4 characters long and only contain alphanumeric characters.</p>
                    <p><Link to={'/'}>Go back to the home page</Link></p>
                </div>
            )
        }
        else if (!this.state.usersUpdated || !this.state.usersLoaded || !this.state.messagesLoaded) {
            return (
                <div>
                    <p>Hang on, communicating with the server... <br />
                        (If this takes too long, consider refreshing)</p>
                    {this.state.error !== undefined &&
                        <p style={{ "color": 'red' }}>
                            Something went wrong. Reason: {this.state.error}
                        </p>
                    }
                </div>
            )
        }
        else {
            return (
                <div>
                    <div id="header">
                        <Header users={this.state.users} roomId={this.props.id} />
                    </div>
                    <div id="messages" style={{ "bottom": (this.state.username === "" ? 90 : 50) }}>
                        <Chat username={this.state.username} messages={this.state.messages} error={this.state.error} />
                    </div>
                    <div id="footer" style={{ "height": (this.state.username === "" ? 90 : 50) }}>
                        <Footer username={this.state.username} setUsername={this.setUsername} sendMessage={this.sendMessage} sendFile={this.sendFile}/>
                    </div>
                </div>
            )
        }
    }
}
