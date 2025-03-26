import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import BlynkApp from "./Blynk/BlynkApp";
import FirebaseApp from "./Firebase/App";
import VisualizationApp from "./Visualization/App";
import "./App.css";

const Home = () => {
    return (
        <div style={containerStyle}>
            <h1 style={headingStyle}>Select Your View</h1>
            <div style={cardContainerStyle}>
                {/* Card for Blynk */}
                <Link to="/blynk" style={{ textDecoration: "none" }}>
                    <div className="card blynk">
                        <h2>Blynk</h2>
                    </div>
                </Link>

                {/* Card for Firebase */}
                <Link to="/firebase" style={{ textDecoration: "none" }}>
                    <div className="card firebase">
                        <h2>Firebase</h2>
                    </div>
                </Link>
            </div>
            {/* New Card for Visualization */}
            <Link to="/visualization" style={{ textDecoration: "none" }}>
                <div className="card1 visualization">
                    <h2>Visualization</h2>
                </div>
            </Link>
        </div>
    );
};

// 🎨 Styles
const containerStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    background: "linear-gradient(to right, #0F2027, #203A43, #2C5364)",
    color: "white",
};

const headingStyle = {
    fontSize: "2.5rem",
    marginBottom: "30px",
    textShadow: "3px 3px 15px rgba(0,0,0,0.5)",
};

const cardContainerStyle = {
    display: "flex",
    gap: "30px",
};

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/blynk" element={<BlynkApp />} />
                <Route path="/firebase" element={<FirebaseApp />} />
                <Route path="/visualization" element={<VisualizationApp />} />
            </Routes>
        </Router>
    );
};

export default App;