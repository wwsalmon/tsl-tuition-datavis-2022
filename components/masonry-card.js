import React from "react";

export default function MasonryCard({children}) {
    return (
        <div style={{padding: 16}}>
            <div style={{padding: 12, backgroundColor: "#FFEECE", fontSize: 16}}>
                {children}
            </div>
        </div>
    )
}