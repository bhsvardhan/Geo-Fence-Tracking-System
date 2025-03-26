import React, { useEffect, useState } from "react";
import { database, ref, onValue } from "./firebaseConfig";
import {
    FaMapMarkerAlt, FaClock, FaDoorOpen, FaDoorClosed, FaIdCard,
    FaSearch, FaCalendarAlt, FaUndo, FaExternalLinkAlt
} from "react-icons/fa";
import "./RFIDLogs.css";

const RFIDLogs = () => {
    const [logs, setLogs] = useState([]);
    const [filteredLogs, setFilteredLogs] = useState([]);
    const [filteredEntries, setFilteredEntries] = useState([]);
    const [filteredExits, setFilteredExits] = useState([]);
    const [isFiltered, setIsFiltered] = useState(false);
    const [searchTag, setSearchTag] = useState("");
    const [selectedLog, setSelectedLog] = useState(null);

    // Date and Time Filters
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");

    useEffect(() => {
        const logsRef = ref(database, "RFID_Logs_updated");
        onValue(logsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const sortedLogs = Object.entries(data)
                    .map(([key, value]) => {
                        const tagID = key.slice(0, 7);
                        const logData = value.entry || Object.values(value)[0];
                        return {
                            id: key,
                            tagID,
                            type: key.includes("Entry") ? "Entry" : "Exit",
                            timestamp: logData.timestamp,
                            location: logData.location || "Unknown",
                            image_url: logData.image_url || "",
                            latitude: logData.latitude || null,
                            longitude: logData.longitude || null
                        };
                    })
                    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

                setLogs(sortedLogs);
                setFilteredLogs(sortedLogs);
            }
        });
    }, []);

    // Filtering logs
    useEffect(() => {
        let updatedLogs = logs;
        let isFilterApplied = false;

        if (searchTag.trim()) {
            updatedLogs = updatedLogs.filter(log => log.tagID.includes(searchTag));
            isFilterApplied = true;
        }

        if (startDate || endDate) {
            updatedLogs = updatedLogs.filter(log => {
                const logDate = new Date(log.timestamp).toISOString().split("T")[0];
                return (!startDate || logDate >= startDate) && (!endDate || logDate <= endDate);
            });
            isFilterApplied = true;
        }

        if (startTime || endTime) {
            updatedLogs = updatedLogs.filter(log => {
                const logTime = new Date(log.timestamp).toTimeString().split(" ")[0];
                return (!startTime || logTime >= startTime) && (!endTime || logTime <= endTime);
            });
            isFilterApplied = true;
        }

        setFilteredLogs(updatedLogs);
        setIsFiltered(isFilterApplied);

        if (isFilterApplied) {
            setFilteredEntries(updatedLogs.filter(log => log.type === "Entry"));
            setFilteredExits(updatedLogs.filter(log => log.type === "Exit"));
        }
    }, [searchTag, startDate, endDate, startTime, endTime, logs]);

    const resetFilters = () => {
        setSearchTag("");
        setStartDate("");
        setEndDate("");
        setStartTime("");
        setEndTime("");
        setIsFiltered(false);
        setFilteredLogs(logs);
    };

    return (
        <div className="rfid-container">
            <div className="rfid-content">
                <h1 className="rfid-title1">Firebase</h1>
                <h1 className="rfid-title">📋 Latest RFID Logs</h1>

                {/* Search & Filters */}
                <div className="filters-container">
                    <div className="search-bar">
                        <FaSearch className="search-icon" style={{color: "white", marginRight: "10px"}}/>
                        <input
                            type="text" 
                            placeholder="Search by Tag ID..."
                            value={searchTag}
                            onChange={(e) => setSearchTag(e.target.value)}
                            className="search-input"
                        />
                    </div>

                    <div className="date-time-filters">
                        <div className="filter-item">
                            <label><FaCalendarAlt /> Start Date</label>
                            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                        </div>

                        <div className="filter-item">
                            <label><FaCalendarAlt /> End Date</label>
                            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                        </div>

                        <div className="filter-item">
                            <label><FaClock /> Start Time</label>
                            <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                        </div>

                        <div className="filter-item">
                            <label><FaClock /> End Time</label>
                            <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                        </div>

                        <button className="reset-button" onClick={resetFilters}>
                            <FaUndo /> Reset
                        </button>
                    </div>
                </div>

                {/* Display Logs */}
                {isFiltered ? (
                    <div className="rfid-logs-container">
                        <div className="entries-section" style={{width:"600px"}}>
                            <h2 style={{color:"white", marginBottom:"10px"}}>Entries</h2>
                            {filteredEntries.slice(0, 5).map((log) => (
                                <div key={log.id} className="rfid-card" style={{marginBottom:"20px"}} onClick={() => setSelectedLog(log)}>
                                    <img src={log.image_url} alt="RFID Log" className="rfid-image" />
                                    <div className="rfid-details">
                                        <h2><FaDoorOpen className="entry" style={{color:"#0BDA51"}}  /> Entry</h2>
                                        <p><FaIdCard /> Tag ID: {log.tagID}</p>
                                        <p><FaMapMarkerAlt /> {log.location}</p>
                                        <p><FaClock /> {log.timestamp}</p>
                                        {log.latitude && log.longitude && (
                                    <p className="gmaps1">
                                        <a href={`https://www.google.com/maps?q=${log.latitude},${log.longitude}`}
                                            target="_blank" rel="noopener noreferrer"
                                            style={{ }}>
                                            View on Google Maps <FaExternalLinkAlt style={{ marginLeft: "5px" }} />
                                        </a>
                                    </p>
                                )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="exits-section"style={{width:"600px"}}>
                            <h2 style={{color:"white", marginBottom:"10px"}}>Exits</h2>
                            {filteredExits.slice(0, 5).map((log) => (
                                <div key={log.id} className="rfid-card" style={{marginBottom:"20px"}}  onClick={() => setSelectedLog(log)}>
                                    <img src={log.image_url} alt="RFID Log" className="rfid-image" />
                                    <div className="rfid-details">
                                        <h2><FaDoorClosed className="exit" style={{color:"#D22B2B"}} /> Exit</h2>
                                        <p><FaIdCard /> Tag ID: {log.tagID}</p>
                                        <p><FaMapMarkerAlt /> {log.location}</p>
                                        <p><FaClock /> {log.timestamp}</p>
                                        {log.latitude && log.longitude && (
                                    <p className="gmaps1">
                                        <a href={`https://www.google.com/maps?q=${log.latitude},${log.longitude}`}
                                            target="_blank" rel="noopener noreferrer"
                                            style={{ }}>
                                            View on Google Maps <FaExternalLinkAlt style={{ marginLeft: "5px" }} />
                                        </a>
                                    </p>
                                )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="rfid-list">
                        {filteredLogs.slice(0, 5).map((log) => (
                            <div key={log.id} className="rfid-card" onClick={() => setSelectedLog(log)}>
                                <img src={log.image_url} alt="RFID Log" className="rfid-image" />
                                <div className="rfid-details">
                                    <h2>{log.type === "Entry" ? <FaDoorOpen className="entry" style={{color:"#0BDA51"}} /> : <FaDoorClosed className="exit" style={{color:"#D22B2B"}} />} {log.type}</h2>
                                    <p><FaIdCard /> Tag ID: {log.tagID}</p>
                                    <p><FaMapMarkerAlt /> {log.location}</p>
                                    <p><FaClock /> {log.timestamp}</p>
                                    {log.latitude && log.longitude && (
                                    <p className="gmaps">
                                        <a href={`https://www.google.com/maps?q=${log.latitude},${log.longitude}`}
                                            target="_blank" rel="noopener noreferrer"
                                            style={{ }}>
                                            View on Google Maps <FaExternalLinkAlt style={{ marginLeft: "5px" }} />
                                        </a>
                                    </p>
                                )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RFIDLogs;