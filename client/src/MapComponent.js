import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import io from 'socket.io-client';
import 'leaflet/dist/leaflet.css';

// ... (Keep the busIconSvg, busStopIconSvg, calculateBearing, useSmoothPosition, and useSmoothRotation hooks exactly as they were)

// --- Helper function to calculate bearing ---
function calculateBearing(lat1, lon1, lat2, lon2) {
  const toRadians = (deg) => deg * (Math.PI / 180);
  const toDegrees = (rad) => rad * (180 / Math.PI);
  const φ1 = toRadians(lat1);
  const φ2 = toRadians(lat2);
  const λ1 = toRadians(lon1);
  const λ2 = toRadians(lon2);
  const y = Math.sin(λ2 - λ1) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(λ2 - λ1);
  const θ = Math.atan2(y, x);
  return (toDegrees(θ) + 360) % 360;
}

// --- Custom Hooks for Smooth Animation ---
function useSmoothPosition(initialPosition, duration) {
  const [displayPosition, setDisplayPosition] = useState(initialPosition);
  const positionRef = useRef(initialPosition);
  const animationRef = useRef();
  const moveTo = useCallback((newPosition) => {
    const start = performance.now();
    const startPos = positionRef.current;
    cancelAnimationFrame(animationRef.current);
    const animate = (time) => {
      const elapsed = time - start;
      const progress = Math.min(elapsed / duration, 1);
      const lat = startPos[0] + (newPosition[0] - startPos[0]) * progress;
      const lng = startPos[1] + (newPosition[1] - startPos[1]) * progress;
      const newDisplayPosition = [lat, lng];
      positionRef.current = newDisplayPosition;
      setDisplayPosition(newDisplayPosition);
      if (progress < 1) animationRef.current = requestAnimationFrame(animate);
    };
    animationRef.current = requestAnimationFrame(animate);
  }, [duration]);
  return [displayPosition, moveTo];
}

function useSmoothRotation(initialAngle, duration) {
    const [displayAngle, setDisplayAngle] = useState(initialAngle);
    const angleRef = useRef(initialAngle);
    const animationRef = useRef();
    const rotateTo = useCallback((targetAngle) => {
        const start = performance.now();
        const startAngle = angleRef.current;
        let diff = targetAngle - startAngle;
        if (diff > 180) diff -= 360;
        if (diff < -180) diff += 360;
        cancelAnimationFrame(animationRef.current);
        const animate = (time) => {
            const elapsed = time - start;
            const progress = Math.min(elapsed / duration, 1);
            const currentAngle = startAngle + (diff * progress);
            angleRef.current = currentAngle;
            setDisplayAngle(currentAngle);
            if (progress < 1) animationRef.current = requestAnimationFrame(animate);
        };
        animationRef.current = requestAnimationFrame(animate);
    }, [duration]);
    return [displayAngle, rotateTo];
}

// --- Main Map Component ---
// It now receives the 'route' as a prop
function MapComponent({ route }) {
  const initialCenter = [9.5916, 76.5222]; // Kottayam
  const [busPosition, moveTo] = useSmoothPosition(initialCenter, 950);
  const [rotation, rotateTo] = useSmoothRotation(0, 950);
  const mapRef = useRef(null);
  const lastPositionRef = useRef(initialCenter);

  useEffect(() => {
    const socket = io('http://localhost:3001');
    socket.on('locationUpdate', (data) => {
      const newPos = [data.lat, data.lng];
      const lastPos = lastPositionRef.current;
      if (lastPos[0] !== newPos[0] || lastPos[1] !== newPos[1]) {
        const bearing = calculateBearing(lastPos[0], lastPos[1], newPos[0], newPos[1]);
        rotateTo(bearing);
      }
      moveTo(newPos);
      if (mapRef.current) {
        mapRef.current.panTo(newPos);
      }
      lastPositionRef.current = newPos;
    });
    return () => socket.disconnect();
  }, [moveTo, rotateTo]);

  const busIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#ff5722" width="36px" height="36px"><path d="M0 0h24v24H0z" fill="none"/><path d="M18.5 3H5.5A2.5 2.5 0 0 0 3 5.5v13A2.5 2.5 0 0 0 5.5 21h13a2.5 2.5 0 0 0 2.5-2.5v-13A2.5 2.5 0 0 0 18.5 3zM6 18c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm12 0c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM4 11V6h16v5H4z"/></svg>`;
  
  const busStopIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#1976d2" width="24px" height="24px"><path d="M0 0h24v24H0z" fill="none"/><path d="M12 2c-4.42 0-8 3.58-8 8 0 1.71.55 3.31 1.46 4.63.92 1.32 2.22 2.44 3.54 3.37V22h6v-2c1.32-.93 2.62-2.05 3.54-3.37.91-1.32 1.46-2.92 1.46-4.63 0-4.42-3.58-8-8-8zm0 11.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/></svg>`;
  
  const busStopIcon = new L.DivIcon({ html: busStopIconSvg, className: 'bus-stop-icon', iconSize: [24, 24], iconAnchor: [12, 24], popupAnchor: [0, -24] });
  const busIcon = new L.DivIcon({
    html: `<div style="transform-origin: center; transform: rotate(${rotation}deg);">${busIconSvg}</div>`,
    className: 'bus-icon-wrapper',
    iconSize: [36, 36],
    iconAnchor: [18, 18], // Centered anchor for a front-facing icon
    popupAnchor: [0, -24]
  });

  return (
    <MapContainer center={initialCenter} zoom={14} style={{ height: '100%', width: '100%' }} ref={mapRef}>
      <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {route && (
        <>
          <Polyline pathOptions={{ color: 'blue', weight: 5, opacity: 0.7 }} positions={route.path} />
          {route.stops.map(stop => (
            <Marker key={stop.id} position={stop.position} icon={busStopIcon}><Popup><b>{stop.name}</b></Popup></Marker>
          ))}
        </>
      )}
      <Marker position={busPosition} icon={busIcon}><Popup><b>Live Bus</b></Popup></Marker>
    </MapContainer>
  );
}

export default MapComponent;
