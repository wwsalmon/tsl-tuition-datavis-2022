import React from "react";

function AsideHeadshot({src, alt}) {
    return (
        <img src={src} alt={alt} style={{display: "block", marginBottom: 16, objectFit: "cover", width: 200, height: 200, borderRadius: "50%"}}/>
    )
}

module.exports = AsideHeadshot;