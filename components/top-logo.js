import React from "react";

function TopLogo() {
    return (
        <a href="https://tsl.news" style={{
            position: "absolute",
            top: 16,
            left: "50%",
            transform: "translateX(-50%)",
        }}>
            <img src="static/tsl-wordmark-white.svg" alt="TSL logo" style={{height: 16, opacity: 0.5}}/>
        </a>
    );
}

module.exports = TopLogo;