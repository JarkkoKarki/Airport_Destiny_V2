import mysql.connector
import random
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from airplanes import airplain_data


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

# Tietokannasta otetaan satunnaisesti Euroopasta 10 isoa lentokentää ja muuttaa ne json dataksi
def satunnaiset_maat(connection):
    cursor = connection.cursor()
    sql = ("""select ident, latitude_deg, longitude_deg, airport.name, country.name from airport, country
    where airport.iso_country=country.iso_country 
    and country.continent = 'EU' 
    and type = 'large_airport';""")
    cursor.execute(sql)
    result = cursor.fetchall()
    result = result


    pelilauta = []

    random_airports = random.sample(result, 10)


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

# Ottaa tietokannasta pelaajan nimen ja scoren ja lajittelee ne scoren mukaan isoimmasta pienimpään
def player_stats(connection):
    cursor = connection.cursor()
    sql = "SELECT name, score From player_stats ORDER BY score DESC"
    cursor.execute(sql)
    result = cursor.fetchall()
    players = []
    for player in result:
        player_stats = {
            "Player": player[0],
            "score": player[1]
        }
        players.append(player_stats)
    return players


connection = yhteys()

app = Flask(__name__)

CORS(app)


@app.route('/newgame')
def aloitus():
    random_airports_data = satunnaiset_maat(connection)
    json_data = json.dumps(random_airports_data, indent=4)
    return json_data

# Luo player_stats pöydän jos sitä ei ole vielä olemassa
def create_table(connection):
    create_table_query = """CREATE TABLE IF NOT EXISTS player_stats (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255),
        money FLOAT,
        co2_emissions FLOAT,
        turn INT,
        score INT
    )"""
    cursor = connection.cursor()
    cursor.execute(create_table_query)
    connection.commit()

# tuhoaa tiedot player_stats pöydästä
def delete_data(connection):
    sql = "DELETE from player_stats"
    cursor = connection.cursor()
    cursor.execute(sql)

# päivittää pelaaja tiedot tietokantaan
@app.route('/player_stats', methods=['POST'])
def save_player_stats():
    connection = yhteys()
    data = request.json
    name = data.get('name')
    money = data.get('money')
    co2_emissions = data.get('co2_emissions')
    turn = data.get('turn')
    score = data.get('score')

    if name is not None:
        if connection:
            create_table(connection)

            cursor = connection.cursor()
            insert_query = """
                INSERT INTO player_stats (name, money, co2_emissions, turn, score)
                VALUES (%s, %s, %s, %s, %s)
            """
            values = (name, money, co2_emissions, turn, score)
            cursor.execute(insert_query, values)
            connection.commit()
            cursor.close()

            return jsonify({'message': 'Player stats saved successfully'}), 200
        else:
            return jsonify({'error': 'Failed to connect to the database'}), 500
    else:
        return jsonify({'error': 'Player name not provided'}), 400


@app.route('/leaderboard')
def send_player_leaderboard():
    player_stats_data = player_stats(connection)
    json_data = json.dumps(player_stats_data, indent=4)
    return json_data


@app.route('/airplanes')
def send_airplane_data():
    data = airplain_data()
    json_data = json.dumps(data, indent=4)
    return json_data


@app.route('/deletedata', methods=['DELETE'])
def delete_stats():
    try:
        delete_data(connection)
        return jsonify({'message': 'Data deleted successfully'}), 200
    except Exception:
        return jsonify({'error': 'Failed to delete data', 'message': str(Exception)}), 500


if __name__ == '__main__':
    app.run(use_reloader=True, host='127.0.0.1', port=3001)
