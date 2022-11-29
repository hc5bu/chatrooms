import React, { useState } from 'react';
import { db } from './firebase.js';
import { ref, get } from "firebase/database";
import { Link } from "react-router-dom";
import "./Styles/Homepage.css"

function Homepage() {
  const [search, setSearch] = useState(""); // controls search field
  const [data, setData] = useState(undefined); // store data for id
  const [invalid, setInvalid] = useState(false); // show text if id format is invalid
  const [error, setError] = useState(null); // store error code when refresh
  const [show, setShow] = useState(false) // show text & button for room
  const [id, setId] = useState(); //store id to go to room
  const [checking, setChecking] = useState(false); // disable check button when checking database
  const [showTable, setShowTable] = useState(false); // show table
  const [tableing, setTableing] = useState(false); // disable table button
  const [allData, setAllData] = useState(undefined);

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
    else if (!isValid) {
      setShow(false);
      setId(undefined);
    }
    else if (isValid) {
      // only proceeds if valid checks out
      const s = search;
      setChecking(true);
      setShow(false);
      refresh(s).then(data => {
        if (data !== undefined) {
          setData(data);
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
                <strong>Last Updated: </strong> {lastUpdated.toLocaleString("en-US")}
              </div>}
          </p>
          <Link to={"/" + id}><button className='goButton'>Go to Chatroom</button></Link>
        </div>
      )
    }

  }

  const enterPressCheck = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      checkId();
    }
  }

  const randomId = () => {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (var i = 0; i < 4; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    setSearch(result);
  }

  const renderTable = () => {
    if (allData === undefined) return null;
    //console.log(allData);
    if (allData === null)
      return "There aren't any currently active chatrooms.";
    const ids = Object.keys(allData); //maybe sort?
    //console.log(ids);
    return (
      <table>
        <thead>
          <tr>
            <th>Room ID</th>
            <th>Users</th>
            <th>Messages</th>
            <th>Last Updated</th>
          </tr>
        </thead>
        <tbody>
          {ids.map((id, i) => {
            console.log(id)
            const numUsers = allData[id]['users'] !== undefined ? Object.keys(allData[id]['users']).length : 0;
            const numMessages = allData[id]['messages'] !== undefined ? Object.keys(allData[id]['messages']).length : 0;
            const lastUpdated = allData[id]['lastUpdated'] !== undefined ? (new Date(allData[id]['lastUpdated'])).toLocaleString("en-US") : "N/A";
            console.log(numUsers);
            return (
              <tr key={i}>
                <td>{id}</td>
                <td>{numUsers}</td>
                <td>{numMessages}</td>
                <td>{lastUpdated}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    )
  }

  const clickTable = () => {
    setTableing(true);
    get(ref(db, "/")).then(snapshot => {
      setAllData(snapshot.val());
      setShowTable(true);
      setTableing(false);
    }).catch(error => setError(error.message));
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <h1 id="pageTitle">Basic Chatroom</h1>
      <h2>Enter a Room ID (up to 4 characters) to begin.</h2>
      <span id='roomSearch'>
        <input id='searchbar' onKeyDown={enterPressCheck} value={search} placeholder='i.e. 1234' maxLength='4' onChange={e => setSearch(e.target.value)} />
        <button id='checkButton' onClick={checkId} disabled={checking}>Check</button>
        <button id='randomButton' onClick={randomId} disabled={checking}>Random</button>
      </span>
      {invalid && <p>Please only use alphanumeric characters for the ID.</p>}
      {show && renderCheck()}
      <div id="tableContent">
        <button id="tableButton" onClick={clickTable} disabled={tableing}>{showTable ? "Refresh Table" : "Display active chatrooms"}</button>
        {showTable && renderTable()}
      </div>
      {error !== null ?
        <div id="errortext" style={{ color: 'red' }}>
          <p>Something went wrong when communicating with the servers. Please try again later</p>
          <p>Reason: {error}</p>
        </div>
        : null}
      <div id="disclaimer">
        Please limit usage to 100 users at a time.<br />
        Chatrooms that have been inactive for more than an hour will be cleared on the hour.
      </div>
    </div>

  );
}

export default Homepage;
