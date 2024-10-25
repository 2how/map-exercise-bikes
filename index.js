
let userData;
let stations;
const markerMap = new Map();
const map = new maplibregl.Map({
    container: 'map',
    style: 'https://tiles.openfreemap.org/styles/liberty',
    center: [-73.935242, 40.730610], // Default center (New York)
    zoom: 9,
});


async function getUserData() {
    try {
        const response = await fetch("https://api.techniknews.net/ipgeo/");
        return await response.json();
    } catch (error) {
        console.error("Something went wrong loading the user data.");
    }
}

// se pueden filtrar propiedades pero desafortunadamente no se pueden obtener objetos concretos con una id :(
async function getStations() {
    try {
        const response = await fetch("https://api.citybik.es/v2/networks/bicimad?fields=stations");
        return (await response.json()).network.stations;
    } catch (error) {
        console.error("Something went wrong loading station data.");
    }
}

async function loadData() {
    userData = await getUserData();
    stations = await getStations();
    addStationMarkers();

    setTimeout(() => {
        setInterval(updateStations, 10000);
    }, 10000);
}

function addStationMarkers() {
    stations.forEach((station) => {
        const marker = createMarker(station);
        marker.addTo(map);
        markerMap.set(station.id, marker);
    });
    console.log('🗺️', stations);
}

function createMarker(station) {
    const color = getMarkerColor(station.free_bikes);
    return new maplibregl.Marker({ color, draggable: false })
        .setLngLat([station.longitude, station.latitude])
        .setPopup(getPopup(station));
}

function updateStations() {
    stations.forEach(updateStation);
    console.log('Updated all stations!');
}

function updateStation(station) {
    markerMap.get(station.id).remove();
    const marker = createMarker(station);
    marker.addTo(map);
    markerMap.set(station.id, marker);
}

function getMarkerColor(free_bikes) {
    return free_bikes <= 0 ? "#ff0000" : free_bikes < 10 ? "#f5e700" : "#49cb00";
}


function getPopup(station) {
    return new maplibregl.Popup().setHTML(`
        <h2>${station.name}</h2>
        <p>Location: ${station.latitude}, ${station.longitude}</p>
        <p>Bikes available: ${station.free_bikes}</p>
        <p>Empty slots: ${station.empty_slots}</p>
    `);
}

document.getElementById("center-button").addEventListener("click", () => {
    if (userData) {
        map.setCenter([userData.lon, userData.lat]);
    } else {
        console.log('User data not loaded yet. Cannot center the map.');
    }
});

loadData();
