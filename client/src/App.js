import React, { useState, useEffect } from 'react';
import MapComponent from './MapComponent';
import InfoPanel from './components/InfoPanel';
import './App.css';

function App() {
  const [routes, setRoutes] = useState([]);
  const [selectedRouteId, setSelectedRouteId] = useState('');
  const [selectedRoute, setSelectedRoute] = useState(null);

  // Fetch the list of available routes when the app loads
  useEffect(() => {
    fetch('http://localhost:3001/api/routes')
      .then(res => res.json())
      .then(data => {
        setRoutes(data);
        // Select the first route by default
        if (data.length > 0) {
          setSelectedRouteId(data[0].id);
        }
      })
      .catch(err => console.error("Failed to fetch routes list:", err));
  }, []);

  // Fetch the detailed data for the selected route whenever the ID changes
  useEffect(() => {
    if (selectedRouteId) {
      fetch(`http://localhost:3001/api/route/${selectedRouteId}`)
        .then(res => res.json())
        .then(data => setSelectedRoute(data))
        .catch(err => console.error("Failed to fetch route details:", err));
    }
  }, [selectedRouteId]);

  return (
    <div className="app-container">
      <div className="sidebar">
        <h1>Kerala Bus Tracker</h1>
        <div className="route-selector">
          <label htmlFor="route-select">Choose a route:</label>
          <select 
            id="route-select" 
            value={selectedRouteId} 
            onChange={e => setSelectedRouteId(e.target.value)}
          >
            {routes.map(route => (
              <option key={route.id} value={route.id}>
                {route.name}
              </option>
            ))}
          </select>
        </div>
        <InfoPanel route={selectedRoute} />
      </div>
      <div className="map-container">
        <MapComponent route={selectedRoute} />
      </div>
    </div>
  );
}

export default App;
