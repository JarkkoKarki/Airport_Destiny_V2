/// Player information and functions

const player = {
    name:"playerName",
    money:1000,
    co2_emissions:0,
    location:0,
    turn:0
}



///Player info updates
function updateMoney(amount){
    player.money += amount;
    console.log(`Player's current money: ${player.money}`)
}

function updateEmissions(emissionAmount){
    player.co2_emissions += emissionAmount;
    console.log(`Player's current Co2 emission: ${player.co2_emissions}`)
}
function updateLocation(locationNumber){ ///location number === current airport from 0-10.///
    player.location += locationNumber;
    console.log(`Player's location in numbers: ${player.location}`)
}


function turn(turnNumber){
    player.turn += turnNumber;
    console.log(`Player's current Co2 emission: ${player.turn}`)
}



// export player object
module.exports = player;

// Example usage:
//displayMoney(); // Display initial money amount

// Assuming the player wins a game and earns 5000 money
//updateMoney(5000);
// Display updated money amount
//displayMoney();


/// yksittäinen vuoro pelin kulussa esimerkki

///heitä noppa funktio ajatuksia:
///kerran vuorossa voi heittää noppaa saat rahaa 1000-6000 1-6 Math.random avulla
///kerran vuorossa tarkistus:  turn ennen nopan heittoa = 1 :  nopan heiton jälkeen jälkeen turn += 1 eli 2
/// heitä noppaa toimii vain jos turn on 1 eikä päivitetty 2? Et pääse lentämään ennen nopanheittoa ?!
///kompensoi päästöjä kanssa 1 per turn / vuoro








