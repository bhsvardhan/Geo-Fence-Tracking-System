import React from "react";
import RFIDLogs from "./RFIDLogs"; 
// import Visualization from "./Visualization";

const FirebaseApp = () => {
    return (
        <div style={{ textAlign: "center" }}>
            <RFIDLogs />
            {/* <Visualization /> */}
        </div>
    );
};

export default FirebaseApp;