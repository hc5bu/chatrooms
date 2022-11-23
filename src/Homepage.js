import React, { useState, useEffect } from 'react';
import { db } from './firebase.js';
import { ref, get } from "firebase/database";
import { Link } from "react-router-dom"

function Homepage() {
  const [search, setSearch] = useState(""); // controls search field
  const [data, setData] = useState(); // store data for id
  const [invalid, setInvalid] = useState(false); // show text if id format is invalid
  const [error, setError] = useState(null); // store error code when refresh
  //const [check, setCheck] = useState(); //undefined
  const [show, setShow] = useState(false) // show text & button for room
  const [id, setId] = useState(); //store id to go to room
  const [checking, setChecking] = useState(false); // disable check button when checking database
  //const [creating, setCreating] = useState(false);

  useEffect(() => {
    //refresh("123").then(a=>console.log(a));
  }, []);

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
    if (search === "") {
      setId(undefined);
      setShow(false);
      setInvalid(false);
    }
    else if (checkValid()) {
      // only proceeds if valid checks out
      const s = search;
      setChecking(true);
      setShow(false);
      refresh(s).then(data => {
        console.log(data);
        setData(data);
        if (data !== undefined) {
          setChecking(false);
          setId(s);
          setShow(true);
        } // otherwise, error should pop up
      });
    }


  }
  /*
  const checkId = () => {
    if (search !== "") {
      if(!checkValid())
        return;
      const s = search;
      setId(search);
      //setSearch("");
      setChecking(true);
      refresh().then(data => {
        if (data===null) {
          setId(undefined);
          setCheck(undefined);
        } else {
          if (data[s] !== undefined)
            setCheck(true);
          else
            setCheck(false);
          setChecking(false);
        }
        setData(data);
      });
    }
    else {
      setId(undefined);
      setCheck(undefined);
      setInvalid(false);
    }
  }
  */
  /*
  const createRoom = async () => {
    //uses the id field
    setCreating(true);
    const data = await refresh();
    if(data!==null){
      if(data[id]===undefined){
        try{
          await set(ref(db, "rooms/"+id), {
            "viewing" : 0,
            "lastLogout" : null,
            "users" : [],
            "messages" : []
          });
          await set(ref(db, "active/"+id), 0);
          navigate("/"+id);
        } catch(error) {
          setError(error.message);
        }
      } else {
        navigate("/"+id);
      }
    }
  }*/

  const renderCheck = () => {
    if (error !== null)
      return; // show should be false anyway, but just in case
    else if (data === null) {
      // no active users, messages, or updates in that room
      return (
        <div>
          <p>ID: {id}</p>
          <p>That room ID is not currently in use. Be the first to send a message!</p>
          <Link to={"/" + id}><button>Go to Chatroom</button></Link>
        </div>
      )
    }
    else {
      const numUsers = data['users'] !== undefined ? Object.keys(data['users']).length : 0;
      const numMessages = data['messages'] !== undefined ? Object.keys(data['messages']).length : 0;
      const lastUpdated = new Date(data['lastUpdated']);
      return (
        <div>
          <p>ID: {id}</p>
          <p>
            Active Users: {numUsers} Messages: {numMessages}<br />
            {(lastUpdated !== undefined) && "Last Updated:" + lastUpdated.toString()}
          </p>
          <Link to={"/" + id}><button>Go to Chatroom</button></Link>
        </div>
      )
    }

  }


  return (
    <div style={{ textAlign: 'center' }}>
      <h1>Basic Chatroom</h1>
      <h2>Enter a Room ID (up to 4 characters) to begin.</h2>
      <span id='Room Search'>
        <input id='Searchbar' value={search} placeholder='i.e. 1234' maxLength='4' onChange={e => setSearch(e.target.value)} />
        <button onClick={checkId} disabled={checking}>{checking ? "Checking..." : "Check"}</button>
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
