from flask import Flask, request, jsonify
from flask_cors import CORS
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy import Float

app = Flask(__name__)
CORS(app)

# Database configuration
DATABASE_URL = "mysql+pymysql://root:root@127.0.0.1:3306/flight_game"
engine = create_engine(DATABASE_URL, echo=True)

Base = declarative_base()


# Define the database model
class PlayerStats(Base):
    __tablename__ = 'player_stats'

    id = Column(Integer, primary_key=True)
    name = Column(String(255))
    money = Column(Integer)
    co2_emissions = Column(Float)
    location = Column(String(255))
    turn = Column(Integer)
    score = Column(Float)


# Create all tables defined in the Base class
Base.metadata.create_all(engine)

# Create a session
Session = sessionmaker(bind=engine)


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
    app.run(debug=True)
