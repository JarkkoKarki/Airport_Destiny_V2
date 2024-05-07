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
    turn: 0,
    score: 0,
};

// Alustetaan muuttujia
let lento, diceRolled, compensatedEmission, flyTurn, planes, vuoro, maxVuoro, dist

// Alustetaan elementtejä
const audio = document.getElementById('music');
const footerIcon = document.getElementById('footer-icon');
const deleteButton = document.getElementById('delete-sql');
const newGame = document.getElementById('new-game');
const turnElement = document.getElementById('vuorot');


///Player Name
document.querySelector('#player-form').addEventListener('submit', async function (evt) {
    evt.preventDefault();
    // Hakee aloitus sivulta pelaajan nimen
    const playerName = document.querySelector('#player-input').value;
    document.querySelector('#player-name').textContent = playerName;
    player.name = playerName;
    document.querySelector('#player-modal').classList.add('hide');
    // Hakee pelitiedot
    data = await initializeMap();
    // Aloittaa musiikin
    audio.volume = 0.2;
    audio.play();
    // Käynnistetää peli
    gameLoop(data);
});

// GAME LOOP KUTSUTAAN PELIN ALUSTUKSEN YHTEYDESSÄ
async function gameLoop(data) {
    // Pidetään lukua lentokerrasta
    flyTurn = 0;
    // Haetaan lentokoneiden tiedot
    planes = await fetchAirplanes()
    // haetaan lentokentät Lentokerran perusteella
    airportdata(data, flyTurn);
    vuoro = 1;
    maxVuoro = 10;
    diceRolled = false;
    compensatedEmission = false;
    lento = false;

    // Kysytään pelaajalta lento valinta
    if (!lento) {
        document.querySelector('#lento1').addEventListener('click', function (event) {
            event.preventDefault();
            // Tarkistetaan riittääkö pelaajan rahat kyseisen lennon hintaan
            if (player.money >= planes[0].cost) {
                // Kutsutaan lento funktio (parametrina lentokoneen numero)
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
}

// Toiminto funktiot


//Päästöjen kompensoiminen
document.querySelector('.valinta1').addEventListener('click', function () {
    // Tarkistetaan onko päästöjä kompensoitu ja onko noppaa heitetty
    if (!compensatedEmission && !diceRolled) {
        // tarkistetaan riittääkö raha halvimpaan lentoon toiminnon jälkeen
        if (player.money >= 2000) {
            // Kutsutaan easterEgg funktio
            easterEggMain(player);
            // Poistetaan pelaajalta rahaa ja päästöjä
            player.money -= 1000;
            player.co2_emissions *= 0.6;
            // pyöristetään päästöjen arvo ja päivitetään rahat sekä päästöt html:ään
            document.querySelector('#consumed').textContent = player.co2_emissions.toFixed(2);
            document.querySelector('#budget').textContent = player.money;
            // Päästöt kompensoitu vuorolla
            compensatedEmission = true;
            alert(`Päästöt kompensoitu`);
        } else {
            alert('Ei tarpeeksi rahaa');
        }
    } else {
        alert('Olet jo tehnyt toiminnon');
    }
});


// Nopan heitto valinta
document.querySelector('.valinta').addEventListener('click', function () {
    // Tarkistetaan onko noppaa heitetty
    if (!diceRolled) {
        // Kutsutaan easterEgg funktio
        easterEggMain(player);
        // heitetään noppaa
        let roll = rollDice();
        // lisätään summa pelaajan rahoihin ja viedään rahat html:ään
        player.money += roll;
        document.querySelector('#budget').textContent = player.money;
        alert(`Sait tämän verran rahulia ${roll}e`);
        diceRolled = true;
    } else {
        alert('Et voi enää heittää noppaa tällä vuorolla.');
    }
})

// Lento funktio
function fly(flight) {
    // lisätään footterissa oleva ikoniin pikseleitä
    addPadding(footerIcon, 10)
    // poistetaan pelaajan rahoista lentokoneen hinta
    player.money -= planes[flight].cost
    alert(`Lento ${flight + 1} ostettu`)
    // Lisätään vuoro ja lentokertaan arvot
    player.turn += 1
    flyTurn += 1
    // Päivitetään uusien lentokenttien tiedot
    airportdata(data, flyTurn)
    // Lasketaan päästöt lentokoneen =  lentokoneen päästölukema * etäisyys maahan
    const emissions = planes[flight]['emissions'] * dist
    // Lisätään päästöt pelaajan tietoihin ja html:ään
    player.co2_emissions += emissions
    document.querySelector('#consumed').textContent = player.co2_emissions;
    // Lento suoritettu
    lento = true
    // Päivitetään loputkin tiedot html:ään
    document.querySelector('#consumed').textContent = player.co2_emissions.toFixed(2);
    document.querySelector('#budget').textContent = player.money;
    document.querySelector('#player-modal1').classList.add('hide')
    vuoro++;
    diceRolled = false;
    // Lentokäsky leafletille, joka menee flyTurnin mukaisesti seuraavaan maahan
    handleFlightAction(flyTurn);
    turnElement.innerText = 'vuoro ' + vuoro;
    // Tarkistetaan onko viimeinen vuoro
    if (vuoro === 10) {
        // Lasketaan pelaajan pisteet
        player.score = 1000000 / player.co2_emissions
        // Tallennetaan tiedot tietokantaan
        savePlayerStats()
        alert('voitit Pelin');
        // Viedään tiedot leaderboardiin
        leaderboardData()
        // Piilotetaan lentonäkymä ja avataan leaderboard
        document.querySelector('#player-modal1').classList.add('hide')
        document.querySelector('#player-modal2').classList.remove('hide')
        // Tuodaan uusi peli nappula näkyviin
        newGame.classList.remove('hide')
    }

}

// Leaflet funktio Lentäessä
function handleFlightAction(flyTurn) {
    // Lasketaan Markerin paikka
    const latitude = data[flyTurn]['latitude_deg'];
    const longitude = data[flyTurn]['longitude_deg'];
    // Piilotetaan aikaisempi tekstikenttä markerista
    map.closePopup();
    // Lisätään marker ja sen teksti
    marker = L.marker([latitude, longitude]).addTo(map);
    marker.bindPopup(`${flyTurn + 1}. Airport: ${data[flyTurn]['name']}`).openPopup();
    // Lentää seuraavaan markkeriin pienellä animaatiolla
    map.flyTo([latitude, longitude], 5, {
        duration: 2,
        easeLinearity: 0.25,
    });
}

// Lisää paddingiä Footerissa olevaan iconiin
function addPadding(footerIcon, number) {
    // Max arvo on ruudun koosta 80%
    const targetPosition = window.innerWidth * 0.8;
    const currentLeft = parseFloat(window.getComputedStyle(footerIcon).left) || 0;
    let newLeft = currentLeft + (number * parseFloat(getComputedStyle(document.documentElement).fontSize));
    if (newLeft > targetPosition) {
        newLeft = targetPosition;
    }
    // Lisätään Pikseleitä vasemmalle
    footerIcon.style.left = `${newLeft + 200}px`;
    if (newLeft >= targetPosition) {
        console.log('Kuva mennyt 80%');
    }
}

// Kuva maasta
async function pictures(data, flyTurn) {
    // Avain
    const headers = {
        'Authorization': 'kw6AUunTF71L7kKeuf7Sf5VhTD63RveTOo9Ow5fKBOSgSrNajFBi7lox',
    };

    // Haut
    const searchParams = {
        query: `${data[flyTurn]['country']}`,
        orientation: 'landscape',
        size: 'medium',
        locale: 'en-US',
        page: 1,
        per_page: 15,
    };
    // Query ja Url
    const queryString = new URLSearchParams(searchParams).toString();
    const apiUrl = 'https://api.pexels.com/v1/search';
    await fetch(`${apiUrl}?${queryString}`, {
        method: 'GET',
        headers: headers,
    }).then(response => {
        // Tarkistetaan onnistuko haku
        if (response.ok) {
            return response.json();
        } else {
            throw new Error(
                `Kuvia ei löytynyt. Status code: ${response.status}`);
        }
    }).then(searchResults => {
        if (searchResults.photos && searchResults.photos.length > 0) {
            // Valitaan Jsonista oikea linkki kuvaan
            const firstPhoto = searchResults.photos[0];
            const photoUrl = firstPhoto.src.original;
            // Viedään kuva html elementtiin
            document.getElementById('kuva').src = photoUrl;
        } else {
            console.log('Kuvia ei löytynyt');
        }
    }).catch(error => {
        console.error('Virhe kuvien etsimisessä:', error);
    });
}

// Lentokenttien tietojen haku, jota päivitetään flyTurnilla lentojen välissä.
// Parametreina tietokannoista tulevat tiedot ja flyturn
async function airportdata(data, flyTurn) {
    // Haetaan html elementit lentokenttää koskeviin tietoihin
    const airportNameElement = document.getElementById('airport-name');
    const airportCountryElement = document.getElementById('airport-country');
    const airportIdentElement = document.getElementById('airport-ident');
    const airportCordElement = document.getElementById('airport-cord');
    // Lisätään html elementteihin lentokertaa vastaavat tiedot Jsonista.
    airportNameElement.textContent = data[flyTurn]['name'];
    airportCountryElement.textContent = data[flyTurn]['country'];
    airportIdentElement.textContent = data[flyTurn]['ident'];
    airportCordElement.innerHTML = `${data[flyTurn]['longitude_deg'].toFixed(2)}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${data[flyTurn]['latitude_deg'].toFixed(2)}`;
    // Tarkistetaan onko vuoroja vielä jäljellä
    if (flyTurn < 9) {
        // Jos vuoroja on vielä jäljellä haetaan elementit seuraavaan lentokenttään
        const airportNextNameElement = document.getElementById('nairport-name');
        const airportNextCountryElement = document.getElementById('nairport-country');
        const airportNextIdentElement = document.getElementById('nairport-ident');
        const airportNextCordElement = document.getElementById('nairport-cord');
        // Lisätään tulevaa lentokenttää vastaavat tiedot
        airportNextNameElement.textContent = data[flyTurn + 1]['name'];
        airportNextCountryElement.textContent = data[flyTurn + 1]['country'];
        airportNextIdentElement.textContent = data[flyTurn + 1]['ident'];
        airportNextCordElement.innerHTML = `${data[flyTurn + 1]['longitude_deg'].toFixed(2)}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${data[flyTurn + 1]['latitude_deg'].toFixed(2)}`;
        // Lasketaan etäisyys seuraavaan lentokenttään
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
        // Viedään etäisyys html:ään
        const airportNextDistElement = document.getElementById('nairport-distance');
        airportNextDistElement.textContent = dist.toFixed(2) + ' km';
        // Tarkistetaan onko lentokentät käyty läpi
    } else if (flyTurn === 9) {
        // Poistetaan seuraavan lentokentän elementti
        const lastElement = document.getElementById('last')
        lastElement.classList.add('hide')
    }
    // Tekee sivun alareutaan pelilaudan, jossa näkyy kaikki maat
    const pelilautaElement = document.getElementById('pelilauta');
    let htmlElement = '';
    // Käydään datan lentokentät läpi
    for (let i = 0; i < data.length; i++) {
        // Haetaan apista maan nimeä vastaava tunnus maiden lippuja varten
        const countryData = await fetchCountries(data[i]['country']);
        const countryCode = countryData;
        // Haetaan maan liput tunnuksen avulla
        const flagURL = await fetchFlagImg(countryCode);
        // Viedään tiedot html:ään
        htmlElement += `<li id="child${i + 1}">${i + 1}. ${data[i]['name']}<img class="flags" src="${flagURL}" alt="flag"></li>`;
    }
    // Haetaan maiden kuvat lennoilla
    pictures(data, flyTurn);
    pelilautaElement.innerHTML = `<ul>${htmlElement}</ul>`;
    // Väritetään Lentovuorolla oleva maan nimi sinisellä
    if (flyTurn < 9) {
        const pelilauta = document.querySelector(`#child${flyTurn + 1}`);
        pelilauta.style.color = 'blue';
    } else if (flyTurn === 9) {
        // Viimeinen keltaisella
        const pelilauta = document.querySelector(`#child${flyTurn + 1}`);
        pelilauta.style.color = 'yellow';
    }
}

// Hakee maan nimeä vastaavan tunnuksen
async function fetchCountries(country) {
    try {
        const response = await fetch(
            `https://restcountries.com/v3.1/name/${country}`);
        if (!response.ok) {
            Error('Ei voitu hakea');
        }
        const data = await response.json();
        // Otetaan jsonista tarvittava tieto
        return data[0]['cca2'];
    } catch (error) {
        return null;
    }
}

// Hakee maan tunnusta vastaavan lipun
async function fetchFlagImg(countryCode) {
    let flagURL = `https://flagsapi.com/${countryCode}/flat/64.png`;
    return flagURL;
}

// EVENTLISTENERIT

// Lentovalinta näkyviin ja pois (hide luokan avulla)
document.querySelector('#flight').addEventListener('click', function (evt) {
    evt.preventDefault();
    document.querySelector('#player-modal1').classList.remove('hide');
});
document.querySelector('#close').addEventListener('click', function (evt) {
    evt.preventDefault();
    document.querySelector('#player-modal1').classList.add('hide');
});

// Leaderboard taulukone avaaminen ja sulkeminen
document.querySelector('#leaderboardInput').addEventListener('click', async function (evt) {
    evt.preventDefault();
    // Hakee avatessa samalla myös pelaajien tiedot
    await leaderboardData();
    document.querySelector('#player-modal2').classList.remove('hide')
});

document.querySelector('#leaderboardInput1').addEventListener('click', async function (evt) {
    evt.preventDefault();
    await leaderboardData();
    document.querySelector('#player-modal2').classList.remove('hide')
});

document.querySelector('#leaderBoardClose').addEventListener('click', function (evt) {
    evt.preventDefault();
    document.querySelector('#player-modal2').classList.add('hide');
})

// Leaderboardin päivittäminen
document.querySelector('#refresh').addEventListener('click', function (evt) {
    evt.preventDefault()
    document.querySelector('#player-modal2').classList.add('hide');
    // Hakee tiedot uudestaan
    leaderboardData()
    alert("Tiedot päivitetty")
    document.querySelector('#player-modal2').classList.remove('hide');
})

// Leaderboardin tietojen poisto painike
deleteButton.addEventListener('click', function () {
    // Varmistus
    const userConfirmed = confirm("Hyväksyminen poistaa pelaajatiedot lopullisesti. Haluatko jatkaa?");

    if (userConfirmed) {
        // Viedään tieto backendiin
        fetch('http://127.0.0.1:3001/deletedata', {
            method: 'DELETE'
        })
            .then(response => response.json())
            .then(data => {
                if (data.message) {
                    console.log(data.message);
                    alert('Tiedot poistettu');
                } else if (data.error) {
                    console.log(data.error);
                    alert('Virhe tietojen poistossa: ' + data.error);
                }
            })
            .catch(error => {
                console.log('Error:', error);
                alert('Virhe poistaessa tietoja');
            });
    } else {
        alert("Tietoja ei poistettu");
    }
});

// Hakee Tiedot lentokentistä
async function fetchData() {
    try {
        const response = await fetch(`http://127.0.0.1:3001/newgame`);
        if (!response.ok) {
            Error('Ei voitu hakea tietoa');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Virhe tietojen haussa:', error);
        return null;
    }
}

// Lentokoneiden hakeminen
async function fetchAirplanes() {
    try {
        const response = await fetch(`http://127.0.0.1:3001/airplanes`);
        if (!response.ok) {
            Error('Ei voitu hakea lentokoneita');
        }
        const airplanes = await response.json();
        return airplanes;
    } catch (error) {
        console.error('Virhe tiedon haussa:', error);
        return null;
    }
}

// Varmistetaan, että lentokoneet ehditään hakemaan
async function Airplanes() {
    try {
        const airplanes = await fetchAirplanes();
        // Return the airplanes array
        return airplanes;
    } catch (error) {
        console.error('Virhe lentokoneiden haussa:', error);
        return null;
    }
}


// Alustetaan kartta ja lentokentät pelin alussa
async function initializeMap() {
    // Haetaan tieto lentokentistä
    const data = await fetchData();
    if (!data || !Array.isArray(data)) {
        console.log('Ei löytynyt tietoja');
        return;
    }
    // Lisätään markerit lentokentille
    const airportMarkers = L.layerGroup().addTo(map);
    const maxAirports = Math.min(data.length, 10);
    for (let i = 0; i < maxAirports; i++) {
        const airport = data[i];
        // Lisätään lentokenttien nimet markereihin
        fetchCountries(data[i]['country']);
        marker = L.marker([airport.latitude_deg, airport.longitude_deg]).addTo(map);
        marker.bindPopup(`${i + 1}. Airport ${airport.name}`);
        airportMarkers.addLayer(marker);
        if (i === 0) {
            // Lisää animaation ensimmäiseen maahan ja Avaan markkerin
            map.flyTo([airport.latitude_deg, airport.longitude_deg], 5);
            marker.openPopup();
        }
    }
    return data;
}

// Nopan heitto funktio
function rollDice() {
    // Heittää noppaa
    let roll = Math.floor(Math.random() * 6) + 1;
    // Laskee rahasumman ja palauttaa sen
    let rolledMoney = roll * 1000;
    return rolledMoney;
}

// Kivipaperisakset
function kps(pelaajanValinta) {
    const valinnat = ['rock', 'paper', 'scissors'];
    // Suoritetaan tietokoneen valinta
    const tietokoneenValinta = valinnat[Math.floor(Math.random() * valinnat.length)];
    let result;
    // Tarkistetaan mahdolliset tilanteet
    if (pelaajanValinta === tietokoneenValinta) {
        result = 'It\'s a tie!';
    } else if (
        (pelaajanValinta === 'rock' && tietokoneenValinta === 'scissors') ||
        (pelaajanValinta === 'paper' && tietokoneenValinta === 'rock') ||
        (pelaajanValinta === 'scissors' && tietokoneenValinta === 'paper')
    ) {
        result = 'You win!';
        // Lisätään pelaajalle rahaa voitosta
        player.money = player.money * 2;
        document.querySelector('#budget').textContent = player.money;
    } else {
        result = 'Computer wins! - If you have over 1000 you lose half of your currency :,( -';
        // Mikäli pelaajalla on tarpeeksi rahaa poistetaan rahaa häviössä
        if (player.money >= 1000) {
            player.money = player.money * 0.5;
            document.querySelector('#budget').textContent = player.money;
        }
    }
    // Indormoidaan pelaajaa
    const tulos = alert(`You chose ${pelaajanValinta}, computer chose ${tietokoneenValinta}. ${result}`);
    console.log("lopputulos" + tulos)
}


// Easteregg funktiot
function easterEggMain(player) {
    // Satunnaista numeroa
    const randomNumber = Math.floor(Math.random() * 3) + 1;
    if (randomNumber === 1) {
        // Kivi paperi sakset valinta
        const choice = prompt('Enter your choice: rock, paper, or scissors');
        easterEgg1(player, choice);
    } else if (randomNumber === 2) {
        // Rahan löytö
        easterEgg2(player);
    } else if (randomNumber === 3) {
        // Rahojen menetys
        easterEgg3(player);
    }
}

// EasterEgg1
function easterEgg1(player, choice) {
    kps(choice);
}

// EasterEgg2
function easterEgg2(player) {
    // Pelaaja saa rahaa
    player.money += 10000;
    // vie rahatilanteen html:ään
    document.querySelector('#budget').textContent = player.money;
    alert('Löysit jotain');
}

// EasterEgg3
function easterEgg3(player) {
    const loseMoney = 1000;
    // Tarkistetaan onko pelaajalla tarpeeksi rahaa
    if (player.money <= loseMoney) {
        alert('Olisit juuri menettänyt 1000 rahaa pahan epäonnen vuoksi, mutta onneksesi säästyit!!!');
        console.log('Rahan menetys peruttu -> ei tarpeeksi rahaa');
    } else {
        alert('Osa rahoistasi katosi lennon aikana kuin tuhkatuuleen :(');
        player.money -= loseMoney;
        document.querySelector('#budget').textContent = player.money;
        console.log(player.money);
    }
}


// Viedään pelaajatiedot backendiin
function savePlayerStats() {
    fetch('http://127.0.0.1:3001/player_stats', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(player),
    }).then(response => {
        // Tarkistetaan onnistuiko
        if (!response.ok) {
            throw new Error('Virhe pelaajan tietojen tallentamisessa');
        }
        return response.json();
    }).then(data => {
        console.log('Pelaajatiedot tallennettu:', data);
    }).catch(error => {
        console.error('Virhe:', error);
    });
}

// Pelaajatietojen hakeminen backendistä
async function leaderboardData() {
    try {
        const response = await fetch(`http://127.0.0.1:3001/leaderboard`);
        if (!response.ok) {
            Error('Ei voitu hakea');
        }
        const playerData = await response.json();
        // Lisätään tiedot Leaderboard sivulle
        document.querySelector('.scoreList').innerHTML = '';
        playerData.forEach((player, index) => {
            const tr = document.createElement('tr');
            const playerNameTd = document.createElement('td');
            // Lisätään pelaajan tietoja html:ään ja samalla myös tyyliä
            playerNameTd.textContent = `${index + 1} Player name -- ${player.Player}`;
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
        console.error('Virhe tiedon haussa:', error);
        return null;

    }
}
