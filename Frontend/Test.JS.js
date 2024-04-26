'use strict'

const map = L.map('map', {tap: false});
L.tileLayer('https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
    maxZoom: 20,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
}).addTo(map);
map.setView([60, 24], 7);


document.querySelector('#player-form').addEventListener('submit', function (evt) {
    evt.preventDefault();
    const playerName = document.querySelector('#player-input').value;
    document.querySelector('#player-name').textContent = playerName;
});

const stats = [name, 0, 0, 0, 1]


document.querySelector('#player-form').addEventListener('submit', function (evt) {
    evt.preventDefault();
    const playerName = document.querySelector('#player-input').value;
    document.querySelector('#player-modal').classList.add('hide');
    initializeMap()
})

async function fetchData() {
    try {
        const response = await fetch(`http://127.0.0.1:3000/newgame`);
        if (!response.ok) {
            Error('Could not fetch resource');
        }
        const data = await response.json();
        console.log('Fetched data:', data);
        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
        return null;
    }
}

async function initializeMap() {
    const data = await fetchData();
    if (!data || !Array.isArray(data)) {
        console.log('No data available or data is not an array');
        return;
    }

    // Create a layer group for airport markers
    const airportMarkers = L.layerGroup().addTo(map);

    // Limit iteration to the first 10 airports or the length of data, whichever is smaller
    const maxAirports = Math.min(data.length, 10);

    // Iterate through the first 10 airports in the data array
    for (let i = 0; i < maxAirports; i++) {
        const airport = data[i];

        // Create a marker for each airport using latitude and longitude
        const marker = L.marker([airport.latitude_deg, airport.longitude_deg]).addTo(map);

        // Add popup information to the marker with airport's name
        marker.bindPopup(`${i + 1}. Airport ${airport.name}`)

        // Add the marker to the airport markers layer group
        airportMarkers.addLayer(marker);

        if (i === 0) {
            map.flyTo([airport.latitude_deg, airport.longitude_deg], 5)
            marker.openPopup()
            marker.setIcon(blueIcon)
        }
    }
    airportdata(data)
    return data
}
