import React from "react"
import { useParams } from "react-router-dom";
import { db } from "./firebase.js";
import { ref, push, set, remove, onValue } from "firebase/database";
import { Link } from "react-router-dom";
import Chat from "./Components/Chat";
import Footer from "./Components/Footer";
import Header from "./Components/Header";
import "./Styles/Chatroom.css";

export default function ChatroomWrapper(props) {
    let { id } = useParams();
    return (<Chatroom id={id} />);
    // I don't know how to get params from the url any other way
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
            sending: false
        };
        this.userListener = undefined;
        this.messageListener = undefined;
        this.userKey = undefined;
    }

    componentDidMount() {
        if (!this.state.invalid) {
            const userRef = ref(db, `${this.props.id}/users`);
            this.userKey = push(userRef);
            set(this.userKey, "").then(()=>
                this.setState({usersUpdated:true})
            ).catch(error => this.setState({ error: error.message }));

            //Get list of users, get list of messages
            this.userListener = onValue(userRef, snapshot => {
                if (snapshot.exists())
                    this.setState({ usersLoaded: true, users: Object.values(snapshot.val()) });
                else
                    this.setState({ usersLoaded: true, users: [] }); //should never happen since there should be 1
            }, error => this.setState({ error: error.message })) //if something went wrong

            //inefficient, but works:
            this.messageListener = onValue(ref(db, `${this.props.id}/messages`), snapshot => {
                if (snapshot.exists())
                    this.setState({ messagesLoaded: true, messages: Object.values(snapshot.val()) });
                else
                    this.setState({ messagesLoaded: true, messages: [] });
            }, error => this.setState({ error: error.message }))

            //and an event listener to do stuff when you leave the page.
            window.addEventListener('beforeunload', this.unloading);
        }
        
    }

    unloading = (event) => {
        // Cancel the event as stated by the standard.
        event.preventDefault();
        if(this.userKey!==undefined)
            remove(this.userKey);
        if (this.messageListener !== undefined)
            this.messageListener();
        if (this.userListener !== undefined)
            this.userListener();
        // Chrome requires returnValue to be set.
        return event.returnValue = 'Are you sure you want to quit?'; //not sure what this does
    }

    // no need to call componentDidUpdate
    componentDidUpdate(){
        /*
        console.log(this.userKey);
        console.log(this.userListener);
        console.log(this.messageListener);*/
    }

    componentWillUnmount() {
        //remove event listener
        window.removeEventListener('beforeunload', this.unloading);
        //remove user from component
        if(this.userKey!==undefined)
            remove(this.userKey);
        //detach listeners
        if (this.messageListener !== undefined)
            this.messageListener();
        if (this.userListener !== undefined)
            this.userListener();
    }

    checkValid(id) {
        const isInvalid = id.length > 4 || id.match(/[^A-Za-z0-9]/g);
        return !isInvalid;
    }

    //these will be passed to the footer
    setUsername = async (name) => {
        if(this.state.users.includes(name))
            return null;
        try{
            await set(this.userKey, name);
        }
        catch(error){
            this.setState({error:error.message});
            return false;
        }
        this.setState({username:name});
        return true;
    }

    sendMessage = async (text) => {
        const messageKey = push(ref(db,`${this.props.id}/messages`));
        const newMessage = {
            text: text,
            timestamp: Date.now(),
            username: this.state.username,
        }
        try{
            await set(messageKey, newMessage);
            await set(ref(db, `${this.props.id}/lastUpdated`), Date.now())
        }
        catch(error){
            this.setState({error:error.message});
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
                    <p><Link to={'/'}> Go back to the home page</Link></p>
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
                    <div id="header">To be added</div>
                    <div id="messages">
                        <Chat username={this.state.username} messages={this.state.messages} error={this.state.error} />
                    </div>
                    <div id="footer">
                        <Footer username={this.state.username} setUsername={this.setUsername} sendMessage={this.sendMessage} />
                    </div>
                </div>
            )
        }
    }
}
