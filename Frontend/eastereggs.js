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
