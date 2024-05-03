class Airplane:
    def __init__(self, name, cost, co2_multiplier):
        self.name = name
        self.cost = cost
        self.co2_multiplier = co2_multiplier

air1 = Airplane('Sähkölentokone', 6000, 0.25)
air2 = Airplane('Hybridilentokone', 5000, 0.30)
air3 = Airplane('Sähköliitokone', 4000, 0.35)
air4 = Airplane('Biodiesel Jet', 3000, 0.40)
air5 = Airplane('Sähköhelikopteri', 2000, 0.45)
air6 = Airplane('Aurinkovoimaraketti', 1000, 0.50)

def airplain_data():
    airplanes = [air1, air2, air3, air4, air5, air6]
    airplane_data = []
    for airplane in airplanes:
        airplane_dict = {
            'name': airplane.name,
            'cost': airplane.cost,
            'co2_multiplier': airplane.co2_multiplier
        }
        airplane_data.append(airplane_dict)
    return airplane_data




