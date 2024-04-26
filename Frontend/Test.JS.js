'use strict'

async function fetchData() {

    try {

        const response = await fetch(`http://127.0.0.1:3000/newgame`)
        if (!response.ok) {
            throw new Error('Could not fetch resource');
        }
        const data = await response.json();
        console.log(data);
    } catch (error) {
        console.log(error);
    }
}

fetchData()

