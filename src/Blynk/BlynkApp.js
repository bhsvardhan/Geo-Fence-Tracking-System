import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for marker icon issue in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

const BLYNK_AUTH_TOKEN = "r92nPHMQ8cSnnGM_zbfSPUOYacakfwG3"; // Replace with your Blynk token

const BlynkApp = () => {
  const [latestScan, setLatestScan] = useState(null);
  const [scanHistory, setScanHistory] = useState([]);

  // Parse scan entry
  const parseScanEntry = (entry) => {
    const result = {
      location: "N/A",
      latitude: "N/A",
      longitude: "N/A",
      event: "",
      tagId: "",
    };

    // Extract location
    const locationMatch = entry.match(/Location: (.+?)(?=\s*\w+:|\s*$)/);
    if (locationMatch) result.location = locationMatch[1].trim();

    // Extract coordinates
    const latMatch = entry.match(/Latitude: (.+?)(?=\s*\w+:|\s*$)/);
    if (latMatch) result.latitude = latMatch[1].trim();

    const longMatch = entry.match(/Longitude: (.+?)(?=\s*\w+:|\s*$)/);
    if (longMatch) result.longitude = longMatch[1].trim();

    // Extract event
    const eventMatch = entry.match(/(Entry|Exit)/);
    if (eventMatch) result.event = eventMatch[1];

    // Extract tag ID
    const tagMatch = entry.match(/Tag ID: (\w+)/);
    if (tagMatch) result.tagId = tagMatch[1];

    return result;
  };

  // Check if two scans are identical
  const isSameScan = (scan1, scan2) => {
    return (
      scan1.tagId === scan2.tagId &&
      scan1.location === scan2.location &&
      scan1.latitude === scan2.latitude &&
      scan1.longitude === scan2.longitude &&
      scan1.event === scan2.event
    );
  };

  // Fetch Latest Scan (V0)
  const fetchLatestScan = useCallback(async () => {
    try {
      const response = await axios.get(
        `https://blynk.cloud/external/api/get?token=${BLYNK_AUTH_TOKEN}&V0`
      );
      if (response.data) {
        const newScan = parseScanEntry(response.data);
        setLatestScan((prev) =>
          prev && isSameScan(prev, newScan) ? prev : newScan
        );
      }
    } catch (error) {
      console.error("Error fetching latest scan:", error);
    }
  }, []);

  // Fetch Scan History (V1)
  const fetchScanHistory = useCallback(async () => {
    try {
      const response = await axios.get(
        `https://blynk.cloud/external/api/get?token=${BLYNK_AUTH_TOKEN}&V1`
      );

      if (response.data) {
        const newEntries = response.data
          .split(/;\s*/)
          .filter((entry) => entry.trim().length > 0)
          .map(parseScanEntry);

        setScanHistory((prevHistory) => {
          const uniqueNewEntries = newEntries.filter(
            (newEntry) =>
              !prevHistory.some((prevEntry) => isSameScan(prevEntry, newEntry))
          );

          return [...uniqueNewEntries, ...prevHistory].slice(0, 50);
        });
      }
    } catch (error) {
      console.error("Error fetching scan history:", error);
    }
  }, []);

  // Fetch data every 5 seconds
  useEffect(() => {
    fetchLatestScan();
    fetchScanHistory();
    const interval = setInterval(() => {
      fetchLatestScan();
      fetchScanHistory();
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchLatestScan, fetchScanHistory]);

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        padding: "20px",
        maxWidth: "800px",
        margin: "0 auto",
        backgroundColor: "#f5f5f5",
        minHeight: "100vh",
      }}
    >
      <h1 style={{ color: "#2c3e50", textAlign: "center", marginBottom: "30px" }}>
        RFID Location Tracker
      </h1>

      {/* Latest Scan Display */}
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "8px",
          padding: "20px",
          marginBottom: "30px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        <h2 style={{ marginTop: "0", marginBottom: "20px", color: "#3498db" }}>
          Latest Scan
        </h2>

        {latestScan ? (
          <div>
            <div><strong>Location:</strong> {latestScan.location}</div>
            <div><strong>Coordinates:</strong> {latestScan.latitude}, {latestScan.longitude}</div>
            <div>
              <strong>Event:</strong>
              <span style={{ color: latestScan.event === "Entry" ? "#27ae60" : "#e74c3c", fontWeight: "bold" }}>
                {latestScan.event}
              </span>
            </div>
            <div><strong>Tag ID:</strong> {latestScan.tagId}</div>

            {/* Leaflet Map for Latest Scan */}
            {latestScan.latitude !== "N/A" && latestScan.longitude !== "N/A" && (
              <MapContainer
                center={[parseFloat(latestScan.latitude), parseFloat(latestScan.longitude)]}
                zoom={17}
                style={{ height: "300px", width: "100%", marginTop: "20px" }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <Marker position={[parseFloat(latestScan.latitude), parseFloat(latestScan.longitude)]}>
                  <Popup>
                    Latitude: {latestScan.latitude}, Longitude: {latestScan.longitude}
                  </Popup>
                </Marker>
              </MapContainer>
            )}
          </div>
        ) : (
          <div style={{ color: "#7f8c8d" }}>Loading latest scan...</div>
        )}
      </div>

      {/* Scan History */}
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "8px",
          padding: "20px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        <h2 style={{ marginTop: "0", marginBottom: "20px", color: "#3498db" }}>
          Scan History
        </h2>

        {scanHistory.length > 0 ? (
          <div style={{ maxHeight: "400px", overflowY: "auto" }}>
            {scanHistory.map((scan, index) => (
              <div key={index} style={{ marginBottom: "20px" }}>
                <div><strong>Location:</strong> {scan.location}</div>
                <div><strong>Coordinates:</strong> {scan.latitude}, {scan.longitude}</div>
                <div><strong>Event:</strong> {scan.event}</div>
                <div><strong>Tag ID:</strong> {scan.tagId}</div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ color: "#7f8c8d" }}>No scan history available</div>
        )}
      </div>
    </div>
  );
};

export default BlynkApp;