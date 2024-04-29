import mysql.connector
import random
import json
from flask import Flask, request
from flask_cors import CORS
from Player_stats import *

def yhteys():
    connection = mysql.connector.connect(
        host="127.0.0.1",
        port=3306,
        user="root",
        password="root",
        database="flight_game",
        autocommit=True,
    )
    return connection

def satunnaiset_maat(connection):

    cursor = connection.cursor()
    sql = ("""select ident, latitude_deg, longitude_deg, airport.name, country.name from airport, country
    where airport.iso_country=country.iso_country 
    and country.continent = 'EU' 
    and type = 'large_airport';""")
    cursor.execute(sql)
    result = cursor.fetchall()
    result = result
#
    # random.sample varmistaa, että luvut eivät toistu
    pelilauta = []

    random_airports = random.sample(result, 10)

    # Create a list to store airport data as dictionaries
    pelilauta = []
    for airport_data in random_airports:
        airport_dict = {
            "ident": airport_data[0],
            "latitude_deg": airport_data[1],
            "longitude_deg": airport_data[2],
            "name": airport_data[3],
            "country": airport_data[4]
        }
        pelilauta.append(airport_dict)

    return pelilauta


connection = yhteys()


app = Flask(__name__)

CORS(app)

@app.route('/newgame')
def aloitus():
    random_airports_data = satunnaiset_maat(connection)
    json_data = json.dumps(random_airports_data, indent=4)
    return json_data

@app.route('/player_stats', methods=['POST'])
def save_player_stats():
    data = request.json
    name = data.get('name')
    money = data.get('money')
    co2_emissions = data.get('co2_emissions')
    location = data.get('location')
    turn = data.get('turn')
    score = data.get('score')

    if name is not None:
        session = Session()
        player_stats = PlayerStats(name=name, money=money, co2_emissions=co2_emissions, location=location, turn=turn,
                                   score=score)
        session.add(player_stats)
        session.commit()
        session.close()
        return jsonify({'message': 'Player stats saved successfully'}), 200
    else:
        return jsonify({'error': 'Player name not provided'}), 400


if __name__ == '__main__':
    app.run(use_reloader=True, host='127.0.0.1', port=3000)




# Initialize database tables

# Get 10 random airports and store their data as dictionaries
# random_airports_data = satunnaiset_maat(connection)

# Convert airport data to JSON format
#json_data = json.dumps(random_airports_data, indent=4)
#print(json_data)