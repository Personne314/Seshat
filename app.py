from flask import Flask, render_template, jsonify
from core.database import get_db, close_db, db_get_deck_meta, db_get_deck_cards
from core.options import options_init
from core.dailies import dailies_init

# Creates the app.
app = Flask(__name__)



# Opens the connection before a request.
@app.before_request
def before_request():
	get_db()

# Closes the connection after a request.
@app.teardown_appcontext
def teardown_appcontext(exception):
	close_db()



# Main route. Placeholder.
@app.route('/')
def index():
	dailies_init()
	deck_data = "test"
	return "PLACEHOLDER"

# Radical exercice route.
@app.route('/radicals-exercise')
def radicals_exercise():
	deck_data = "radicals-14"
	return render_template('exercices/radical_exercise.html', deck_data=deck_data)



# This route generates a page showing the kanji of a deck.
@app.route('/deck')
def page_deck():
	deck_data = "Vocabulaire JLPT5 - 18"
	return render_template('deck.html', deck_data=deck_data)



# API Routes

# Route to get the json representing the deck cards.
@app.route('/api/deck/<string:deck_name>')
def get_deck(deck_name):
	deck_meta = db_get_deck_meta(deck_name)
	deck_cards = db_get_deck_cards(deck_name, deck_meta["tags"])
	return jsonify({"meta": deck_meta, "cards": deck_cards})



# Launches the app.
if __name__ == '__main__':
	options_init()
	app.run(debug=True)
