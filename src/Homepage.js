import React, { useState } from 'react';
import { db } from './firebase.js';
import { ref, get } from "firebase/database";
import { Link } from "react-router-dom";
import "./Styles/Homepage.css"

function Homepage() {
  const [search, setSearch] = useState(""); // controls search field
  const [data, setData] = useState(); // store data for id
  const [invalid, setInvalid] = useState(false); // show text if id format is invalid
  const [error, setError] = useState(null); // store error code when refresh
  const [show, setShow] = useState(false) // show text & button for room
  const [id, setId] = useState(); //store id to go to room
  const [checking, setChecking] = useState(false); // disable check button when checking database

  const refresh = async function (id) {
    setError(null);
    let snapshot;
    try {
      snapshot = await get(ref(db, id + "/"));
    }
    catch (error) {
      setError(error.message);
      return undefined;
    }
    return snapshot.val();
  }

  const checkValid = () => {
    // will never be blank at this point
    const isInvalid = search.match(/[^A-Za-z0-9]/g);
    setInvalid(isInvalid);
    return !isInvalid;
  }

  const checkId = () => {
    const isValid = checkValid();
    if (search === "") {
      setId(undefined);
      setShow(false);
      setInvalid(false);
    }
    else if(!isValid){
      setShow(false);
      setId(undefined);
    }
    else if (isValid) {
      // only proceeds if valid checks out
      const s = search;
      setChecking(true);
      setShow(false);
      refresh(s).then(data => {
        setData(data);
        if (data !== undefined) {
          setChecking(false);
          setId(s);
          setShow(true);
        } // otherwise, error should pop up
      });
    }
  }

  const renderCheck = () => {
    if (error !== null)
      return; // show should be false anyway, but just in case
    else if (data === null) {
      // no active users, messages, or updates in that room
      return (
        <div className='roomInfo'>
          <p><strong>ID: </strong>{id}</p>
          <p>That room ID is currently not in use. Feel free to start chatting!</p>
          <Link to={"/" + id}><button className='goButton'>Go to Chatroom</button></Link>
        </div>
      )
    }
    else {
      const numUsers = data['users'] !== undefined ? Object.keys(data['users']).length : 0;
      const numMessages = data['messages'] !== undefined ? Object.keys(data['messages']).length : 0;
      const lastUpdated = data['lastUpdated'] !== undefined ? new Date(data['lastUpdated']) : undefined;
      return (
        <div className='roomInfo'>
          <p><strong>ID: </strong>{id}</p>
          <p>
            <strong>Users Online: </strong>{numUsers} &nbsp;&nbsp;&nbsp;<strong>Messages: </strong>{numMessages}<br />
            {(lastUpdated !== undefined) && 
              <div>
                <strong>Last Updated: </strong> {lastUpdated.toString()}
              </div>}
          </p>
          <Link to={"/" + id}><button className='goButton'>Go to Chatroom</button></Link>
        </div>
      )
    }

  }

  const enterPressCheck = (e) => {
    if(e.key==="Enter"){
        e.preventDefault();
        checkId();
    }
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <h1 id="pageTitle">Basic Chatroom</h1>
      <h2>Enter a Room ID (up to 4 characters) to begin.</h2>
      <span id='roomSearch'>
        <input id='searchbar' onKeyDown={enterPressCheck} value={search} placeholder='i.e. 1234' maxLength='4' onChange={e => setSearch(e.target.value)} />
        <button id='checkButton' onClick={checkId} disabled={checking}>{checking ? "Checking..." : "Check"}</button>
      </span>
      {invalid && <p>Please only use alphanumeric characters for the ID.</p>}
      {show && renderCheck()}
      {error !== null ?
        <div id="errortext" style={{ color: 'red' }}>
          <p>Something went wrong when communicating with the servers. Please try again later</p>
          <p>Reason: {error}</p>
        </div>
        : null}

    </div>

  );
}

export default Homepage;
