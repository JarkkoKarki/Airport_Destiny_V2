import mysql.connector
import random
import json
from geopy.distance import geodesic
import time


def yhteys():
    connection = mysql.connector.connect(
        host="127.0.0.1",
        port=3306,
        user="root",
        password="root",
        database="flight_game",
        autocommit=True,
    )
    time.sleep(1)
    tietokanta_alustus(connection)
    return connection


def tietokanta_alustus(sql_yhteys):
    cursor = sql_yhteys.cursor()
    cursor.execute("drop table if exists goal_reached;")
    cursor.execute("drop table if exists game;")
    cursor.execute("drop table if exists goal;")
def satunnaiset_maat(sql_yhteys):

    cursor = sql_yhteys.cursor()
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
    for index, airport_data in enumerate(random_airports, start=1):
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

# Initialize database tables
tietokanta_alustus(connection)

# Get 10 random airports and store their data as dictionaries
random_airports_data = satunnaiset_maat(connection)

# Convert airport data to JSON format
json_data = json.dumps(random_airports_data, indent=4)
print(json_data)

