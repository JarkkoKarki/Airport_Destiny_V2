import mysql.connector

from Database import *
from flask import Flask, request
from flask_cors import CORS

app = Flask(__name__)
cors = CORS(app)
connection = mysql.connector.connect(
    host="127.0.0.1",
    port=3306,
    user="BLEJAJO",
    password="BLEJAJO",
    database="flight_game",
    autocommit=True,
)

class Airport:
    # lisätty data, jottei tartte jokaista lentokenttää hakea erikseen
    def __init__(self, ident, active=False, data=None):
        self.ident = ident
        self.active = active

        # vältetään kauhiaa määrää hakuja
        if data is None:
            # find airport from DB
            sql = "SELECT ident, name, latitude_deg, longitude_deg, municipality FROM Airport WHERE ident='" + ident + "'"
            print(sql)
            cur = connection.cursor()
            cur.execute(sql)
            res = cur.fetchall()
            if len(res) == 1:
                # game found
                self.ident = res[0][0]
                self.name = res[0][1]
                self.latitude = float(res[0][2])
                self.longitude = float(res[0][3])
                self.municipality = res[0][4]
        else:
            self.name = data['name']
            self.latitude = float(data['latitude'])
            self.longitude = float(data['longitude'])
            self.municipality = data['municipality']



def find_nearby_airports(self):
    # print("Testing geopy...")
    # self.distanceTo(1, 2)
    lista = []
    # haetaan kaikki tiedot kerralla
    sql = "SELECT airport.name, airport.latitude, airport.longitude, airport.municipality, country.name FROM Airport, country WHERE airport.iso_country=country.iso_country and country.continent = 'EU' and type = 'large_airport'"
    print(sql)
    cur = connection.cursor()
    cur.execute(sql)
    res = cur.fetchall()
    for r in res:
        if r[0] != self.ident:
            data = {'name': r[1], 'latitude': r[2], 'longitude': r[3], 'municipality': r[4], 'country.name': r[5]}
            print(data)
            airport = Airport(r[0], False, data)
            lista.append(airport)



# http://127.0.0.1:5000/flyto?game=fEC7n0loeL95awIxgY7M&dest=EFHK&consumption=123
@app.route('/flyto')
def flyto():
    args = request.args
    id = args.get("game")
    dest = args.get("dest")
    consumption = args.get("consumption")
    print("*** Called flyto endpoint ***")
    vastaus = {
        'id': id,
        'consumption': consumption,
        'destination': dest
    }
    return vastaus



# http://127.0.0.1:5000/newgame?player=Vesa&loc=EFHK
@app.route('/newgame')
def newgame():
    args = request.args
    player = args.get("player")
    dest = args.get("loc")
    vastaus = {
        'player': player,
        'dest': dest
    }
    return vastaus

if __name__ == '__main__':
    app.run(use_reloader=True, host='127.0.0.1', port=3000)
