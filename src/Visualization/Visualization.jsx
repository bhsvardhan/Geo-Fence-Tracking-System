import React, { useEffect, useState, useCallback } from "react";
import { getDatabase, ref, onValue } from "firebase/database";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LineChart,
    Line,
} from "recharts";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Initialize Firebase Database
const db = getDatabase();

const Visualization = () => {
    const [dayWiseData, setDayWiseData] = useState([]);
    const [userWiseData, setUserWiseData] = useState([]);
    const [hourlyData, setHourlyData] = useState([]);
    const [geoData, setGeoData] = useState([]);
    const [trendData, setTrendData] = useState([]);

    const classifyEntryExit = (filename) =>
        filename.includes("Entry") ? "Entry" : "Exit";

    const processFirebaseData = useCallback((rawData) => {
        let dayWiseCount = {};
        let userWiseCount = {};
        let hourlyCount = {};
        let locationData = [];
        let trendCount = {};

        Object.keys(rawData).forEach((recordKey) => {
            const [tagID] = recordKey.split("_"); // Extract tagID before first underscore
            const userEntries = rawData[recordKey];

            Object.values(userEntries).forEach((entry) => {
                const entryType = classifyEntryExit(recordKey);
                const timestamp = entry.timestamp;
                const dateObj = new Date(timestamp);
                if (isNaN(dateObj)) return;

                const date = dateObj.toISOString().split("T")[0];
                const hour = dateObj.getHours();
                const hourGroup = `${Math.floor(hour / 4) * 4}-${Math.floor(hour / 4) * 4 + 3
                    }`;
                const location = entry.location || "Unknown";
                const lat = parseFloat(entry.latitude);
                const lon = parseFloat(entry.longitude);

                // Day-wise count
                if (!dayWiseCount[date])
                    dayWiseCount[date] = { date, Entries: 0, Exits: 0 };
                if (entryType === "Entry") dayWiseCount[date].Entries++;
                else dayWiseCount[date].Exits++;

                // User-wise count
                if (!userWiseCount[tagID])
                    userWiseCount[tagID] = { tagID, Entries: 0, Exits: 0 };
                if (entryType === "Entry") userWiseCount[tagID].Entries++;
                else userWiseCount[tagID].Exits++;

                // Grouped Hourly Count (Four-hour intervals)
                if (!hourlyCount[hourGroup])
                    hourlyCount[hourGroup] = { hourGroup, Entries: 0, Exits: 0 };
                if (entryType === "Entry") hourlyCount[hourGroup].Entries++;
                else hourlyCount[hourGroup].Exits++;

                // Geospatial Data
                if (!isNaN(lat) && !isNaN(lon)) {
                    locationData.push({
                        lat,
                        lon,
                        tagID,
                        entryType,
                        timestamp,
                        location,
                    });
                }

                // Trend Data
                if (!trendCount[date])
                    trendCount[date] = { date, Entries: 0, Exits: 0 };
                if (entryType === "Entry") trendCount[date].Entries++;
                else trendCount[date].Exits++;
            });
        });

        setDayWiseData(Object.values(dayWiseCount));
        setUserWiseData(Object.values(userWiseCount));
        setHourlyData(Object.values(hourlyCount));
        setGeoData(locationData);
        setTrendData(Object.values(trendCount));
    }, []);

    useEffect(() => {
        const dataRef = ref(db, "RFID_Logs_updated");
        onValue(dataRef, (snapshot) => {
            if (snapshot.exists()) {
                processFirebaseData(snapshot.val());
            }
        });
    }, [processFirebaseData]);

    return (
        <div style={{ textAlign: "center", padding: "20px" }}>
            <h2>Day-wise Entry/Exit Count</h2>
            <ResponsiveContainer width="100%" height={400}>
                <BarChart data={dayWiseData}>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Entries" fill="green" />
                    <Bar dataKey="Exits" fill="red" />
                </BarChart>
            </ResponsiveContainer>

            <h2>User-wise Entry/Exit Count</h2>
            <ResponsiveContainer width="100%" height={400}>
                <BarChart data={userWiseData}>
                    <XAxis dataKey="tagID" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Entries" fill="blue" />
                    <Bar dataKey="Exits" fill="orange" />
                </BarChart>
            </ResponsiveContainer>

            <h2>Hourly Entries and Exits (Grouped 4-hour Intervals)</h2>
            <ResponsiveContainer width="100%" height={400}>
                <BarChart data={hourlyData}>
                    <XAxis dataKey="hourGroup" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Entries" fill="purple" />
                    <Bar dataKey="Exits" fill="brown" />
                </BarChart>
            </ResponsiveContainer>

            <h2>Geospatial Entry/Exit Map</h2>
            <MapContainer
                center={[11.0, 76.9]}
                zoom={10}
                style={{ height: "400px", width: "100%" }}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap"
                />
                {geoData.map((point, index) => (
                    <Marker key={index} position={[point.lat, point.lon]}>
                        <Popup>
                            <strong>{point.tagID}</strong> - {point.entryType} <br />
                            {point.timestamp} <br />
                            {point.location}
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            <h2>Entry/Exit Trends Over Time</h2>
            <ResponsiveContainer width="100%" height={400}>
                <LineChart data={trendData}>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="Entries" stroke="blue" />
                    <Line type="monotone" dataKey="Exits" stroke="red" />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default Visualization;