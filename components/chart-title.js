import React from "react";

module.exports = function ChartTitle({children}) {
    return (
        <p style={{fontSize: 16, textAlign: "center"}}>{children}</p>
    );
}