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