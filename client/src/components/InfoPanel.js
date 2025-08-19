import React from 'react';

function InfoPanel({ route }) {
  if (!route) {
    return (
      <div className="info-panel">
        <h2>Select a route to begin</h2>
      </div>
    );
  }

  return (
    <div className="info-panel">
      <div className="info-section">
        <h2>{route.name}</h2>
        <p>Live bus tracking for Route {route.id}.</p>
      </div>
      
      <div className="info-section">
        <h3>Stops</h3>
        <ul className="stop-list">
          {route.stops.map(stop => (
            <li key={stop.id}>{stop.name}</li>
          ))}
        </ul>
      </div>

      <div className="info-section">
        <h3>Live Status</h3>
        <p className="status-live">● Live</p>
        <p>Next Stop: Calculating...</p>
        <p>ETA: Calculating...</p>
      </div>
    </div>
  );
}

export default InfoPanel;
