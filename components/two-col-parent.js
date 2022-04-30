import React from "react";

export default function TwoColParent({children}) {
    return (
        <div className="two-col-parent fullWidth" style={{maxWidth: 800, margin: "96px auto"}}>
            {children}
        </div>
    )
}