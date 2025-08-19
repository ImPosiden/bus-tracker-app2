const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const PORT = 3001;

// --- IMPORTANT: Add your Geoapify API Key here ---
const GEOAPIFY_API_KEY = '2f8063a5e786465ba74968b8d5e24ace';

app.use(cors());
app.use(express.json());

// --- Hardcoded Route Data ---
const routesData = [
  {
    id: 1,
    name: "Kottayam Town Circle",
    stops: [
      { id: 101, name: "KSRTC Stand", position: [9.5916, 76.5222] },
      { id: 102, name: "CMS College", position: [9.5898, 76.5311] },
      { id: 103, name: "Collectorate", position: [9.5945, 76.5400] },
      { id: 104, name: "Baker Junction", position: [9.6010, 76.5350] },
      { id: 105, name: "KSRTC Stand", position: [9.5916, 76.5222] }
    ]
  },
  {
    id: 2,
    name: "Medical College Route",
    stops: [
        { id: 201, name: "KSRTC Stand", position: [9.5916, 76.5222] },
        { id: 202, name: "Children's Park", position: [9.6112, 76.5234] },
        { id: 203, name: "Gandhi Nagar", position: [9.6285, 76.5321] },
        { id: 204, name: "Medical College", position: [9.6350, 76.5450] }
    ]
  },
  {
    id: 3,
    name: "Kottayam to Pala",
    stops: [
        { id: 301, name: "Kottayam KSRTC Stand", position: [9.5916, 76.5222] },
        { id: 302, name: "Pala Bus Stand", position: [9.7095, 76.6858] }
    ]
  }
];

// --- Helper Functions ---

// Calculates distance between two lat/lng points in meters (Haversine formula)
function getDistance(pos1, pos2) {
    const R = 6371e3; // Earth's radius in metres
    const lat1 = pos1[0] * Math.PI / 180;
    const lat2 = pos2[0] * Math.PI / 180;
    const deltaLat = (pos2[0] - pos1[0]) * Math.PI / 180;
    const deltaLng = (pos2[1] - pos1[1]) * Math.PI / 180;

    const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

async function getDetailedRoute(routeInfo) {
  if (!routeInfo) return null;
  const waypoints = routeInfo.stops.map(stop => `${stop.position[0]},${stop.position[1]}`).join('|');
  const apiUrl = `https://api.geoapify.com/v1/routing?waypoints=${waypoints}&mode=drive&apiKey=${GEOAPIFY_API_KEY}`;
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    const detailedPath = data.features[0].geometry.coordinates[0].map(coord => [coord[1], coord[0]]);
    return { ...routeInfo, path: detailedPath };
  } catch (error) {
    console.error("Failed to fetch route from Geoapify:", error);
    return null;
  }
}

// --- API Endpoints ---

app.get('/api/routes', (req, res) => {
  const routeList = routesData.map(r => ({ id: r.id, name: r.name }));
  res.json(routeList);
});

app.get('/api/route/:id', async (req, res) => {
  const routeId = parseInt(req.params.id, 10);
  const routeInfo = routesData.find(r => r.id === routeId);
  const detailedRoute = await getDetailedRoute(routeInfo);
  if (detailedRoute) {
    res.json(detailedRoute);
  } else {
    res.status(500).send('Error fetching route data');
  }
});

// --- NEW: Search Endpoint for Nearby Routes ---
app.post('/api/search/nearby', (req, res) => {
    const { lat, lng, radius = 1000 } = req.body; // Default search radius of 1km
    const userPosition = [lat, lng];
    
    const nearbyRoutes = routesData.filter(route => {
        // Check if any stop on the route is within the radius
        return route.stops.some(stop => getDistance(userPosition, stop.position) <= radius);
    });

    res.json(nearbyRoutes.map(r => ({ id: r.id, name: r.name })));
});

// --- NEW: Search Endpoint for Route Planning ---
app.post('/api/search/plan', (req, res) => {
    const { start, end, radius = 1000 } = req.body;
    const startPosition = [start.lat, start.lng];
    const endPosition = [end.lat, end.lng];

    const suitableRoutes = routesData.filter(route => {
        const isStartNearby = route.stops.some(stop => getDistance(startPosition, stop.position) <= radius);
        const isEndNearby = route.stops.some(stop => getDistance(endPosition, stop.position) <= radius);
        return isStartNearby && isEndNearby;
    });

    res.json(suitableRoutes.map(r => ({ id: r.id, name: r.name })));
});


app.post('/api/location', (req, res) => {
  const { lat, lng } = req.body;
  io.emit('locationUpdate', { lat, lng });
  res.status(200).send('Data received');
});

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

/*
// --- Bus Simulator for Demo (DISABLED) ---
async function startBusSimulator() {
    console.log("Starting bus simulator for Kottayam to Pala route...");
    const routeInfo = routesData.find(r => r.id === 3);
    const detailedRoute = await getDetailedRoute(routeInfo);

    if (!detailedRoute || !detailedRoute.path || detailedRoute.path.length === 0) {
        console.error("Could not fetch detailed route for simulator. Aborting.");
        return;
    }

    let currentIndex = 0;
    setInterval(() => {
        const currentPosition = detailedRoute.path[currentIndex];
        const newPosition = { lat: currentPosition[0], lng: currentPosition[1] };
        io.emit('locationUpdate', newPosition);
        currentIndex = (currentIndex + 1) % detailedRoute.path.length;
    }, 200);
}
*/

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running and accessible on your local network at port ${PORT}`);
  // The simulator is no longer started automatically
  // startBusSimulator(); Hello i can hear you talk 
});
