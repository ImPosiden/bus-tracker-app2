// This file contains all the hardcoded route information for the application.
// The stop names have been standardized to improve matching with the OpenStreetMap database.

const routesData = [
  // --- Kottayam Area Routes (Names updated for precision) ---
  { 
    id: 1, 
    name: "Kottayam Town Circle", 
    stops: ["KSRTC Bus Station, Kottayam", "CMS College, Kottayam", "Kottayam Collectorate", "Baker Junction, Kottayam", "KSRTC Bus Station, Kottayam"] 
  },
  { 
    id: 2, 
    name: "Medical College Route", 
    stops: ["KSRTC Bus Station, Kottayam", "Childrens Park, Kottayam", "Gandhi Nagar", "Medical College, Kottayam"] 
  },
  { 
    id: 3, 
    name: "Kottayam to Pala", 
    stops: ["KSRTC Bus Station, Kottayam", "Ettumanoor", "Pala KSRTC Bus Stand"] 
  },
  {
    id: 4,
    name: "Kottayam to Changanassery",
    stops: ["KSRTC Bus Station, Kottayam", "Chingavanam", "Changanassery KSRTC Bus Stand"]
  },
  {
    id: 5,
    name: "Kottayam to Kumarakom",
    stops: ["KSRTC Bus Station, Kottayam", "Kumarakom"]
  },
  {
    id: 6,
    name: "Pala to Erattupetta",
    stops: ["Pala KSRTC Bus Stand", "Bharananganam", "Erattupetta"]
  },

  // --- Ernakulam (Kochi) Area Routes (Names updated for precision) ---
  {
    id: 7,
    name: "Ernakulam to Fort Kochi",
    stops: ["Ernakulam KSRTC Bus Stand", "Thoppumpady", "Fort Kochi"]
  },
  {
    id: 8,
    name: "Ernakulam to Aluva",
    stops: ["Ernakulam KSRTC Bus Stand", "Edappally", "Kalamassery", "Aluva KSRTC Bus Stand"]
  },
  {
    id: 9,
    name: "Vyttila Hub to Kakkanad",
    stops: ["Vyttila Mobility Hub", "Padamugal", "Kakkanad"]
  },
  {
    id: 10,
    name: "Ernakulam to Muvattupuzha",
    stops: ["Ernakulam KSRTC Bus Stand", "Thrippunithura", "Kolenchery", "Muvattupuzha KSRTC"]
  },

  // --- Thiruvananthapuram Area Routes (Names updated for precision) ---
  {
    id: 11,
    name: "Thampanoor to Technopark",
    stops: ["Thampanoor", "Pattoor", "Pettah, Thiruvananthapuram", "Kazhakoottam", "Technopark"]
  },
  {
    id: 12,
    name: "East Fort to Kovalam",
    stops: ["East Fort, Thiruvananthapuram", "Thiruvallam", "Kovalam"]
  },
  {
    id: 13,
    name: "Thiruvananthapuram to Nedumangad",
    stops: ["Thampanoor", "Peroorkada", "Vattiyoorkavu", "Nedumangad"]
  },

  // --- Inter-District Routes (Names updated for precision) ---
  {
    id: 14,
    name: "Kottayam to Ernakulam",
    stops: ["KSRTC Bus Station, Kottayam", "Ettumanoor", "Thalayolaparambu", "Vyttila Mobility Hub", "Ernakulam KSRTC Bus Stand"]
  },
  {
    id: 15,
    name: "Thrissur to Guruvayur",
    stops: ["Thrissur KSRTC Bus Stand", "Amala Nagar", "Guruvayur"]
  },
  {
    id: 16,
    name: "Kozhikode to Wayanad (Kalpetta)",
    stops: ["Kozhikode KSRTC Bus Stand", "Thamarassery", "Vythiri", "Kalpetta"]
  },
  {
    id: 17,
    name: "Alappuzha to Kollam",
    stops: ["Alappuzha KSRTC Bus Station", "Haripad", "Kayamkulam KSRTC Bus Stand", "Karunagappally", "Kollam KSRTC Bus Stand"]
  }
];

// We export the data so it can be used in other files, like our main server file.
module.exports = {
  routesData
};
