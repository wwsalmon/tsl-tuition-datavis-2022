import React from "react";

function Navbar() {
    return (
        <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            zIndex: 2,
            height: 48,
            backgroundColor: "white",
            width: "100%",
            display: "flex",
        }}>
            <a href="https://tsl.news" style={{margin: "auto auto"}}>
                <img src="static/tsl-wordmark.svg" alt="TSL logo" style={{height: 16}}/>
            </a>
        </div>
    );
}

module.exports = Navbar;