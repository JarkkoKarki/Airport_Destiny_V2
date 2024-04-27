'use strict'

// Kartta
const map = L.map('map', {tap: false});
L.tileLayer('https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
    maxZoom: 20,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
}).addTo(map);
map.setView([60, 24], 2);

/// Player Stats
const player = {
    name: "playerName",
    money: 1000,
    co2_emissions: 0,
    location: 0,
    turn: 0
}


const blueIcon = L.divIcon({className: 'blue-icon'})
const greenIcon = L.divIcon({className: 'green-icon'})


// GAME LOOP KUTSUTAAN PELIN ALUSTUKSEN YHTEYDESSÄ
function gameLoop() {
    let vuoro = 0;
    let maxVuoro = 10;
    let diceRolled = false;
    function handlePlayerAction() {
        if (!diceRolled) {
            easterEggMain(player);
            let roll = rollDice();
            player.money += roll;
            document.querySelector('#budget').textContent = player.money;
            alert(`Sait tämän verran rahulia ${roll}e`);
            console.log(player);
            diceRolled = true;
        } else {
            alert("Et voi enää heittää noppaa tällä vuorolla.");
        }
    }

    // Add event listener for the player's action button
    document.querySelector('.valinta').addEventListener('click', handlePlayerAction);
    // Main game loop
    function playGame() {
        while (vuoro < maxVuoro) {
            diceRolled = false;
            vuoro++;
        }
    }
    // Start the game
    playGame();
}
gameLoop()


function airportdata(data) {
    const airportNameElement = document.getElementById('airport-name');
    const airportCountryElement = document.getElementById('airport-country')
    const airportIdentElement = document.getElementById('airport-ident')
    const airportCordElement = document.getElementById('airport-cord')
    airportNameElement.textContent = data[0]['name'];
    airportCountryElement.textContent = data[0]['country']
    airportIdentElement.textContent = data[0]['ident']
    airportCordElement.innerHTML = `${data[0]['longitude_deg'].toFixed(2)}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${data[0]['latitude_deg'].toFixed(2)}`


    const airportNextNameElement = document.getElementById('nairport-name');
    const airportNextCountryElement = document.getElementById('nairport-country')
    const airportNextIdentElement = document.getElementById('nairport-ident')
    const airportNextCordElement = document.getElementById('nairport-cord')
    airportNextNameElement.textContent = data[1]['name'];
    airportNextCountryElement.textContent = data[1]['country']
    airportNextIdentElement.textContent = data[1]['ident']
    airportNextCordElement.innerHTML = `${data[1]['longitude_deg'].toFixed(2)}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${data[1]['latitude_deg'].toFixed(2)}`

    let lat2 = data[1]['latitude_deg']
    let lat1 = data[0]['latitude_deg']
    let lon1 = data[0]['longitude_deg']
    let lon2 = data[1]['longitude_deg']
    let R = 6371; // km
    let dLat = (lat2 - lat1) * (Math.PI / 180);
    let dLon = (lon2 - lon1) * (Math.PI / 180);
    lat1 = (lat1) * (Math.PI / 180);
    lat2 = (lat2) * (Math.PI / 180);

    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var dist = R * c;

    const airportNextDistElement = document.getElementById('nairport-distance')
    airportNextDistElement.textContent = dist.toFixed(2) + ' km'
    const pelilautaElement = document.getElementById('pelilauta')
    let htmlElement = ""
    for (let i = 0; i < data.length; i++) {
        htmlElement += `<li>${i + 1}. ${data[i]['name']}</li>`
    }
    pelilautaElement.innerHTML = `<ul>${htmlElement}</ul>`
}

document.querySelector('#flight').addEventListener('click', function (evt) {
    evt.preventDefault();
    document.querySelector('#player-modal1').classList.remove('hide');
})

document.querySelector('#close').addEventListener('click', function (evt) {
    evt.preventDefault()
    document.querySelector('#player-modal1').classList.add('hide');
})


///Player Name
document.querySelector('#player-form').addEventListener('submit', function (evt) {
    evt.preventDefault();
    const playerName = document.querySelector('#player-input').value;
    document.querySelector('#player-name').textContent = playerName;
    player.name = playerName;
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

function rollDice() {
    let roll = Math.floor(Math.random() * 6) + 1;
    let rolledMoney = roll * 1000;
    player.money += rolledMoney;
    return rolledMoney;
}

function kps(pelaajanValinta) {
    const valinnat = ["rock", "paper", "scissors"];
    const tietokoneenValinta = valinnat[Math.floor(Math.random() * valinnat.length)];

    let result;

    if (pelaajanValinta === tietokoneenValinta) {
        result = "It's a tie!";
    } else if (
        (pelaajanValinta === 'rock' && tietokoneenValinta === 'scissors') ||
        (pelaajanValinta === 'paper' && tietokoneenValinta === 'rock') ||
        (pelaajanValinta === 'scissors' && tietokoneenValinta === 'paper')
    ) {
        result = "You win!";
    } else {
        result = "Computer wins!";
    }

    document.getElementById('result').innerText = `You chose ${pelaajanValinta}, computer chose ${tietokoneenValinta}. ${result}`;
}

function easterEgg1(player, choice) {
    kps(choice);
}

function easterEgg2(player) {
    player.money += 10000;
}

function easterEgg3(player) {
    const loseMoney = 1000;
    if (player.money <= loseMoney) {
        alert("Olisit juuri menettänyt 1000 rahaa pahan epäonnen vuoksi, mutta onneksesi säästyit!!!");
        console.log("Rahan menetys peruttu -> ei tarpeeksi rahaa");
    } else {
        alert("Osa rahoistasi katosi lennon aikana kuin tuhkatuuleen :(");
        player.money -= loseMoney;
        console.log(player.money);
    }
}

function easterEggMain(player) {
    const randomNumber = Math.floor(Math.random() * 1000) + 1;

    if (randomNumber === 1) {
        const choice = prompt("Enter your choice: rock, paper, or scissors");
        easterEgg1(player, choice);
    } else if (randomNumber === 2) {
        easterEgg2(player);
    } else if (randomNumber === 3) {
        easterEgg3(player);
    }
}






