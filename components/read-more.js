import React from "react";

function ReadMore({title, img, href, date}){
    return (
        <a style={{display: "flex", alignItems: "center", margin: "24px 0", border: "1px solid #ccc", padding: 8, borderRadius: 16}} href={href}>
            <img src={img} alt={title} style={{width: 96, height: 96, objectFit: "cover", marginRight: 32}}/>
            <div>
                <div style={{fontSize: 18, marginBottom: 4}}><span>{title}</span></div>
                <div style={{fontSize: 14, opacity: 0.5}}><span>{date}</span></div>
            </div>
        </a>
    )
}

module.exports = ReadMore;