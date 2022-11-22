import React from "react"
import { useParams } from "react-router-dom";
import { db } from "./firebase.js";
import { ref, onValue } from "firebase/database";
import { Link } from "react-router-dom";
import Chat from "./Components/Chat";
import Footer from "./Components/Footer";
import Header from "./Components/Header";
import "./Styles/Chatroom.css";

export default function ChatroomWrapper(props){
    let { id } = useParams();
    return (<Chatroom id={id}/>);
    // I don't know how to get params from the url any other way
}

class Chatroom extends React.Component{
    constructor(props) {
        super(props);
        this.state={
            error:undefined,
            loaded:false,
            invalid:false,
            username:"Someone else?"
        };
    }
    
    componentDidMount(){
        if(!this.checkValid()){
            this.setState({invalid:true})
        }
        else {
            onValue(ref(db,this.props.id+"/"), (snapshot)=>{
                let newState = {loaded:true, ...snapshot.val()}
                this.setState(newState);
            }, (error)=>{
                //something went wrong
                this.setState({error:error.message});
            })
        } 
    }
    // no need to call componentWillUpdate
    componentWillUnmount(){

    }
    
    checkValid() {
        const isInvalid = this.props.id.length>4 || this.props.id.match(/[^A-Za-z0-9]/g);
        return !isInvalid;
    }
    render() {
        if(this.state.invalid){
            return(
                <div>
                    <h2>That ID is invalid.</h2>
                    <p>Room IDs should be up to 4 characters long and only contain alphanumeric characters.</p>
                    <p><Link to={'/'}> Go back to the home page</Link></p>
                </div>
            )
        }
        else if(!this.state.loaded){
            return(
                <div>
                    <p>Hang on, communicating with the server... <br/>
                        (If this takes too long, consider refreshing)</p>
                    {this.state.error!==undefined && 
                        <p style={{"color":'red'}}>
                            Something went wrong. Reason: {this.state.error}
                        </p>
                    }
                </div>
            )
        }
        else {
            return (
                <div id="body">
                    <div id="header">Hi!</div>
                    <div id="messages">
                        <Chat username={this.state.username} messages={this.state.messages}/>
                    </div>
                    <div id="footer">Hello</div>
                </div>
            )
        }
    }
}
