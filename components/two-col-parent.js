import React from "react";

module.exports = function TwoColParent({children}) {
    return (
        <div className="two-col-parent fullWidth" style={{maxWidth: 800, margin: "96px auto"}}>
            {children}
        </div>
    )
}