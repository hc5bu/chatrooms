import React from "react";
import { Link } from "react-router-dom";

export default function Blankpage() {
    return(
        <div>
            <h2>404 Not Found</h2>
            <p>That page doesn't exist.</p>
            <p><Link to={'/'}>Go back to the home page</Link></p>
        </div>
    )
}
