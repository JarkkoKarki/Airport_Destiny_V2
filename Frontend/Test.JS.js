'use strict';
let data = null;
let marker;
// Kartta
const map = L.map('map', {tap: false});
L.tileLayer('https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
    maxZoom: 20,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
}).addTo(map);
map.setView([60, 24], 2);

/// Player Stats
const player = {
    name: '',
    money: 1000,
    co2_emissions: 0,
    location: '',
    turn: 0,
    score: 0,
};

let dist

const musicElement = document.getElementById('music').value;
const audio = document.getElementById('music');
const blueIcon = L.divIcon({className: 'blue-icon'});
const greenIcon = L.divIcon({className: 'green-icon'});
const footerIcon = document.getElementById('footer-icon');
const deleteButton = document.getElementById('delete-sql');

// GAME LOOP KUTSUTAAN PELIN ALUSTUKSEN YHTEYDESSÄ

function addPadding(footerIcon, number) {
    const targetPosition = window.innerWidth * 0.8;
    const currentLeft = parseFloat(window.getComputedStyle(footerIcon).left) || 0;
    let newLeft = currentLeft + (number * parseFloat(getComputedStyle(document.documentElement).fontSize));
    if (newLeft > targetPosition) {
        newLeft = targetPosition;
    }
    footerIcon.style.left = `${newLeft + 200}px`;
    if (newLeft >= targetPosition) {
        console.log('Footer icon has reached 80% of the screen width.');
    }
}

// GAME LOOP KUTSUTAAN PELIN ALUSTUKSEN YHTEYDESSÄ
let flyTurn = 0;

// GAME LOOP KUTSUTAAN PELIN ALUSTUKSEN YHTEYDESSÄ
async function gameLoop(data) {
    let flyTurn = 0;
    const planes = await fetchAirplanes()
    console.log(planes)

    function handleFlightAction(flyTurn) {
        const latitude = data[flyTurn]['latitude_deg'];
        const longitude = data[flyTurn]['longitude_deg'];
        map.closePopup();
        console.log(latitude, longitude);
        marker = L.marker([latitude, longitude]).addTo(map);
        marker.bindPopup(`${flyTurn + 1}. Airport: ${data[flyTurn]['name']}`).openPopup();
        map.flyTo([latitude, longitude], 5, {
            duration: 2,
            easeLinearity: 0.25,
        });
    }

    deleteButton.addEventListener('click', function () {
        const userConfirmed = confirm("Hyväksyminen poistaa pelaajatiedot lopullisesti. Haluatko jatkaa?");

        if (userConfirmed) {
            fetch('http://127.0.0.1:3001/deletedata', {
                method: 'DELETE'
            })
                .then(response => response.json())
                .then(data => {
                    if (data.message) {
                        console.log(data.message);
                        alert('Data Deleted successfully');
                    } else if (data.error) {
                        console.log(data.error);
                        alert('Failed to delete data: ' + data.error);
                    }
                })
                .catch(error => {
                    console.log('Error:', error);
                    alert('Error while deleting data');
                });
        } else {
            alert("Tietoja ei poistettu");
        }
    });

    airportdata(data, flyTurn);
    let vuoro = 1;
    let maxVuoro = 10;
    let diceRolled = false;
    let compensatedEmission = false;
    let lento = false;
    const turnElement = document.getElementById('vuorot');

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
            alert('Et voi enää heittää noppaa tällä vuorolla.');
        }

    }

    function EmissionAction(flyTurn) {
        if (!compensatedEmission && !diceRolled) {
            if (player.money >= 2000) {
                easterEggMain(player);
                player.money -= 1000;
                player.co2_emissions *= 0.6;
                document.querySelector('#consumed').textContent = player.co2_emissions.toFixed(2);
                document.querySelector('#budget').textContent = player.money;
                compensatedEmission = true;
                alert(`Päästöt kompensoitu`);
            } else {
                alert('Ei tarpeeksi rahaa');
            }
        } else {
            alert('Olet jo tehnyt toiminnon');
        }
    }

    function fly(flight) {
        addPadding(footerIcon, 10)
        player.money -= planes[flight].cost
        alert(`Lento ${flight + 1} ostettu`)
        player.turn += 1
        flyTurn += 1
        airportdata(data, flyTurn)
        const emissions = planes[flight]['emissions'] * dist
        player.co2_emissions += emissions
        document.querySelector('#consumed').textContent = player.co2_emissions;
        lento = true
        document.querySelector('#consumed').textContent = player.co2_emissions.toFixed(2);
        document.querySelector('#budget').textContent = player.money;
        document.querySelector('#player-modal1').classList.add('hide')
        vuoro++;
        diceRolled = false;
        handleFlightAction(flyTurn);
        turnElement.innerText = 'vuoro ' + vuoro;
        if (vuoro === 10) {
            player.score = 1000000 / player.co2_emissions
            console.log(`Player Money : ${player.money} emissions: ${player.co2_emissions} SCORE: ${player.score}, name ${player.name}, turn ${player.turn}, location ${player.location}`)
            savePlayerStats()
            alert('voitit Pelin');
            leaderboardData()
            document.querySelector('#player-modal1').classList.add('hide')
            document.querySelector('#player-modal2').classList.remove('hide')
            const pelilauta = document.querySelector(
                `#child${flyTurn + 1}`);
            const pelilautabefore = document.querySelector(
                `#child${flyTurn}`);
            pelilautabefore.style.color = '';
            pelilauta.style.color = 'yellow';
        }

    }

    if (!lento) {
        document.querySelector('#lento1').addEventListener('click', function (event) {
            console.log(flyTurn);
            event.preventDefault();
            console.log(planes[0].cost);
            if (player.money >= planes[0].cost) {
                fly(0)
            } else {
                alert('Ei rahaa');
            }
        });
        document.querySelector('#lento2').addEventListener('click', function (event) {
            event.preventDefault();
            if (player.money >= planes[1].cost) {
                fly(1)
            } else {
                alert('Ei rahaa');
            }
        });
        document.querySelector('#lento3').addEventListener('click', function (event) {
            event.preventDefault();
            if (player.money >= planes[2].cost) {
                fly(2)
            } else {
                alert('Ei rahaa');
            }
        });
        document.querySelector('#lento4').addEventListener('click', function (event) {
            event.preventDefault();
            if (player.money >= planes[3].cost) {
                fly(3)
            } else {
                alert('Ei rahaa');
            }
        });
        document.querySelector('#lento5').addEventListener('click', function (event) {
            event.preventDefault();
            console.log(planes[4])
            if (player.money >= planes[4].cost) {
                fly(4)
            } else {
                alert('Ei rahaa');
            }
        });
        document.querySelector('#lento6').addEventListener('click', function (event) {
            event.preventDefault();
            if (player.money >= planes[5].cost) {
                fly(5)
            } else {
                alert('Ei rahaa');
            }
        });
    }

    document.querySelector('.valinta1').addEventListener('click', EmissionAction);
    document.querySelector('.valinta').addEventListener('click', handlePlayerAction);

    // Main game loop
    function playGame() {
        while (vuoro < maxVuoro) {
            console.log(vuoro + 'VUOROROO');
            lento = true;
            vuoro++;
        }
    }
}

// PICTURE FROM COUNTRY
async function pictures(data, flyTurn) {
    const headers = {
        'Authorization': 'kw6AUunTF71L7kKeuf7Sf5VhTD63RveTOo9Ow5fKBOSgSrNajFBi7lox',
    };

    const searchParams = {
        query: `${data[flyTurn]['country']}`,
        orientation: 'landscape',
        size: 'medium',
        locale: 'en-US',
        page: 1,
        per_page: 15,
    };
    const queryString = new URLSearchParams(searchParams).toString();
    const apiUrl = 'https://api.pexels.com/v1/search';
    await fetch(`${apiUrl}?${queryString}`, {
        method: 'GET',
        headers: headers,
    }).then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error(
                `Failed to search photos. Status code: ${response.status}`);
        }
    }).then(searchResults => {
        console.log('Search results:', searchResults);
        if (searchResults.photos && searchResults.photos.length > 0) {
            const firstPhoto = searchResults.photos[0];
            const photoUrl = firstPhoto.src.original;
            document.getElementById('kuva').src = photoUrl;
        } else {
            console.log('No photos found.');
        }
    }).catch(error => {
        console.error('Error searching photos:', error);
    });
}

///
async function airportdata(data, flyTurn) {
    const airportNameElement = document.getElementById('airport-name');
    const airportCountryElement = document.getElementById('airport-country');
    const airportIdentElement = document.getElementById('airport-ident');
    const airportCordElement = document.getElementById('airport-cord');
    console.log(data[flyTurn]['name']);
    airportNameElement.textContent = data[flyTurn]['name'];
    airportCountryElement.textContent = data[flyTurn]['country'];
    airportIdentElement.textContent = data[flyTurn]['ident'];
    airportCordElement.innerHTML = `${data[flyTurn]['longitude_deg'].toFixed(
        2)}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${data[flyTurn]['latitude_deg'].toFixed(2)}`;
    console.log(flyTurn);
    if (flyTurn < 9) {
        const airportNextNameElement = document.getElementById('nairport-name');
        const airportNextCountryElement = document.getElementById(
            'nairport-country');
        const airportNextIdentElement = document.getElementById(
            'nairport-ident');
        const airportNextCordElement = document.getElementById('nairport-cord');
        airportNextNameElement.textContent = data[flyTurn + 1]['name'];
        airportNextCountryElement.textContent = data[flyTurn + 1]['country'];
        airportNextIdentElement.textContent = data[flyTurn + 1]['ident'];
        airportNextCordElement.innerHTML = `${data[flyTurn + 1]['longitude_deg'].toFixed(
            2)}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${data[flyTurn + 1]['latitude_deg'].toFixed(2)}`;
        let lat2 = data[flyTurn + 1]['latitude_deg'];
        let lat1 = data[flyTurn]['latitude_deg'];
        let lon1 = data[flyTurn]['longitude_deg'];
        let lon2 = data[flyTurn + 1]['longitude_deg'];
        let R = 6371; // km
        let dLat = (lat2 - lat1) * (Math.PI / 180);
        let dLon = (lon2 - lon1) * (Math.PI / 180);
        lat1 = (lat1) * (Math.PI / 180);
        lat2 = (lat2) * (Math.PI / 180);
        let a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
        let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        dist = R * c;
        const airportNextDistElement = document.getElementById('nairport-distance');
        airportNextDistElement.textContent = dist.toFixed(2) + ' km';
    } else if (flyTurn === 9) {
        const lastElement = document.getElementById('last')
        lastElement.classList.add('hide')
        const airportNextNameElement = document.getElementById('nairport-name');
        const airportNextCountryElement = document.getElementById(
            'nairport-country');
        const airportNextIdentElement = document.getElementById(
            'nairport-ident');
        const airportNextCordElement = document.getElementById('nairport-cord');
        const airportNextDistElement = document.getElementById('nairport-distance');
        airportNextDistElement.textContent = 'Goal';
        airportNextNameElement.textContent = 'Goal';
        airportNextCountryElement.textContent = 'Goal';
        airportNextIdentElement.textContent = 'Goal';
        airportNextCordElement.innerHTML = `Goal`;
    }
    const pelilautaElement = document.getElementById('pelilauta');
    let htmlElement = '';
    for (let i = 0; i < data.length; i++) {
        const countryData = await fechCountries(data[i]['country']);
        const countryCode = countryData;
        const flagURL = await fechFlagImg(countryCode);
        htmlElement += `<li id="child${i + 1}">${i +
        1}. ${data[i]['name']}<img class="flags" src="${flagURL}" alt="flag"></li>`;
    }

    pelilautaElement.innerHTML = `<ul>${htmlElement}</ul>`;
    pictures(data, flyTurn);
    const pelilauta = document.querySelector(`#child${flyTurn + 1}`);

    if (pelilauta) {
        pelilauta.style.color = 'blue';
    } else {
        console.log(`Element with ID #child${flyTurn + 1} not found.`);
    }
}

async function fechCountries(country) {
    try {
        const response = await fetch(
            `https://restcountries.com/v3.1/name/${country}`);
        if (!response.ok) {
            Error('Could not fetch resource');
        }
        const data = await response.json();
        console.log('Fetched data:', data[0]['cca2']);
        return data[0]['cca2'];
    } catch (error) {
        console.error('Error fetching data:', error);
        return null;
    }
}

async function fechFlagImg(countryCode) {
    let flagURL = `https://flagsapi.com/${countryCode}/flat/64.png`;
    return flagURL;
}

document.querySelector('#flight').addEventListener('click', function (evt) {
    evt.preventDefault();
    document.querySelector('#player-modal1').classList.remove('hide');
});
document.querySelector('#close').addEventListener('click', function (evt) {
    evt.preventDefault();
    document.querySelector('#player-modal1').classList.add('hide');
});

///Player Name
document.querySelector('#player-form').addEventListener('submit', async function (evt) {
    evt.preventDefault();
    const playerName = document.querySelector('#player-input').value;
    document.querySelector('#player-name').textContent = playerName;
    player.name = playerName;
    document.querySelector('#player-modal').classList.add('hide');
    data = await initializeMap();
    audio.volume = 0.5;
    audio.play();
    gameLoop(data);
});

async function fetchData() {
    try {
        const response = await fetch(`http://127.0.0.1:3001/newgame`);
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

async function fetchAirplanes() {
    try {
        const response = await fetch(`http://127.0.0.1:3001/airplanes`);
        if (!response.ok) {
            Error('Could not fetch resource');
        }
        const airplanes = await response.json();
        console.log('Fetched data:', data);
        return airplanes;
    } catch (error) {
        console.error('Error fetching data:', error);
        return null;
    }
}

async function Airplanes() {
    try {
        const airplanes = await fetchAirplanes();
        // Return the airplanes array
        return airplanes;
    } catch (error) {
        console.error('Error fetching airplanes:', error);
        return null;
    }
}

async function initializeMap() {
    const data = await fetchData();
    if (!data || !Array.isArray(data)) {
        console.log('No data available or data is not an array');
        return;
    }
    const airportMarkers = L.layerGroup().addTo(map);
    const maxAirports = Math.min(data.length, 10);
    for (let i = 0; i < maxAirports; i++) {
        const airport = data[i];
        fechCountries(data[i]['country']);
        marker = L.marker([airport.latitude_deg, airport.longitude_deg]).addTo(map);
        marker.bindPopup(`${i + 1}. Airport ${airport.name}`);
        airportMarkers.addLayer(marker);
        if (i === 0) {
            map.flyTo([airport.latitude_deg, airport.longitude_deg], 5);
            marker.openPopup();
            marker.setIcon(blueIcon);
        }
    }
    return data;
}

function rollDice() {
    let roll = Math.floor(Math.random() * 6) + 1;
    let rolledMoney = roll * 1000;
    return rolledMoney;
}

function kps(pelaajanValinta) {
    const valinnat = ['rock', 'paper', 'scissors'];
    const tietokoneenValinta = valinnat[Math.floor(
        Math.random() * valinnat.length)];
    let result;
    if (pelaajanValinta === tietokoneenValinta) {
        result = 'It\'s a tie!';
    } else if (
        (pelaajanValinta === 'rock' && tietokoneenValinta === 'scissors') ||
        (pelaajanValinta === 'paper' && tietokoneenValinta === 'rock') ||
        (pelaajanValinta === 'scissors' && tietokoneenValinta === 'paper')
    ) {
        result = 'You win!';
        player.money = player.money * 2;
    } else {
        result = 'Computer wins! - If you have over 1000 you lose half of your currency :,( -';
        if (player.money >= 1000) {
            player.money = player.money * 0.5;
        }
    }
    const tulos = alert(`You chose ${pelaajanValinta}, computer chose ${tietokoneenValinta}. ${result}`);
    console.log("lopputulos" + tulos)
}

function easterEgg1(player, choice) {
    kps(choice);
}

function easterEgg2(player) {
    player.money += 10000;
    alert('Löysit jotain');
}

function easterEgg3(player) {
    const loseMoney = 1000;
    if (player.money <= loseMoney) {
        alert(
            'Olisit juuri menettänyt 1000 rahaa pahan epäonnen vuoksi, mutta onneksesi säästyit!!!');
        console.log('Rahan menetys peruttu -> ei tarpeeksi rahaa');
    } else {
        alert('Osa rahoistasi katosi lennon aikana kuin tuhkatuuleen :(');
        player.money -= loseMoney;
        console.log(player.money);
    }
}

function easterEggMain(player) {
    const randomNumber = Math.floor(Math.random() * 1000) + 1;
    if (randomNumber === 1) {
        const choice = prompt('Enter your choice: rock, paper, or scissors');
        easterEgg1(player, choice);
    } else if (randomNumber === 2) {
        easterEgg2(player);
    } else if (randomNumber === 3) {
        easterEgg3(player);
    }
}

function savePlayerStats() {
    fetch('http://127.0.0.1:3001/player_stats', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(player),
    }).then(response => {
        if (!response.ok) {
            throw new Error('Failed to save player stats');
        }
        return response.json();
    }).then(data => {
        console.log('Player stats saved:', data);
    }).catch(error => {
        console.error('Error:', error);
    });
}


async function leaderboardData() {
    try {
        const response = await fetch(`http://127.0.0.1:3001/leaderboard`);
        if (!response.ok) {
            Error('Could not fetch resource');
        }
        const playerData = await response.json();
        console.log('Pelaajien score:', playerData);

        document.querySelector('.scoreList').innerHTML = '';

        playerData.forEach((player, index) => {
                const tr = document.createElement('tr');
                const playerNameTd = document.createElement('td');

                playerNameTd.textContent = `${index +1} Player name -- ${player.Player}`;
                playerNameTd.style.background = 'linear-gradient(to right, red, orange, yellow, green, blue, indigo, violet)';
                playerNameTd.style.backgroundClip = 'text';
                playerNameTd.style.color = 'transparent';

                const playerScoreTd = document.createElement('td');
                playerScoreTd.textContent = `Player score -- ${player.score}`;
                playerScoreTd.style.background = 'linear-gradient(to right, red, orange, yellow, green, blue, indigo, violet)';
                playerScoreTd.style.backgroundClip = 'text';
                playerScoreTd.style.color = 'transparent';
                document.querySelector('.scoreList').appendChild(playerNameTd);
                document.querySelector('.scoreList').appendChild(playerScoreTd);
                document.querySelector('.scoreList').appendChild(tr);

         });
    } catch (error) {
        console.error('Error fetching data:', error);
        return null;

    }
}

document.querySelector('#leaderboardInput').addEventListener('click', async function (evt) {
    evt.preventDefault();
    await leaderboardData();
    document.querySelector('#player-modal2').classList.remove('hide')
});

document.querySelector('#leaderBoardClose').addEventListener('click', function (evt) {
    evt.preventDefault();
    document.querySelector('#player-modal2').classList.add('hide');
})

document.querySelector('#refresh').addEventListener('click', function (evt) {
    evt.preventDefault()
    document.querySelector('#player-modal2').classList.add('hide');
    leaderboardData()
    alert("Stats refreshed")
    document.querySelector('#player-modal2').classList.remove('hide');
})