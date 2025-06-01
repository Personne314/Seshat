from flask import Flask, redirect, render_template, jsonify, request
from core.database import *
from core.options import *
from core.dailies import *
from json import loads
from os import remove



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




# Radical exercice route.
@app.route("/exercice")
def radicals_exercise():
	return render_template("exercice.html", options=get_options())




# This route generates the dailies if needed then the main page.
@app.route("/")
def index():
	dailies_init()
	return render_template("index.html", options=get_options(), active_page="home")

# This route generates a page used to mosearch for words.
@app.route("/dictionary")
def page_dictionary():
	return render_template("dictionary.html", options=get_options(), active_page="dictionary")

# This route generates a page used to modify tha application options.
@app.route("/options")
def page_options():
	return render_template("options.html", options=get_options(), active_page="options")

# This route generates a page showing the kanji of a deck.
@app.route("/deck", methods=["POST"])
def page_deck():
	deck_name = request.form.get('deck', '')
	card_name = request.form.get('card', '')
	if card_name.isdigit():
		deck_name = db_get_deck_from_element(card_name)
		card_name = db_get_name_from_element(card_name)
	return render_template("decks/deck.html", options=get_options(), deck_name=deck_name, card_name=card_name)

# This route generates a page showing the kanji deck list.
@app.route("/decks/kanji")
def page_decks_kanji():
	return render_template(
		"decks/kanji_decks.html", 
		options=get_options(), 
		active_page="decks-kanji",
		all_tags=db_get_decks_tags("kanji")
	)

# This route generates a page showing the word deck list.
@app.route("/decks/word")
def page_decks_word():
	return render_template(
		"decks/word_decks.html", 
		options=get_options(), 
		active_page="decks-word",
		all_tags=db_get_decks_tags("word")
	)

# This route generates a page showing the radical deck list.
@app.route("/decks/radical")
def page_decks_radical():
	return render_template(
		"decks/radical_decks.html", 
		options=get_options(), 
		active_page="decks-radical",
		all_tags=db_get_decks_tags("radical")
	)



# API Routes

# Route to get the json representing the deck cards.
@app.route("/api/deck/<string:deck_name>")
def api_get_deck(deck_name):
	deck_meta = db_get_deck_meta(deck_name)
	deck_cards = db_get_deck_cards(deck_name, deck_meta["tags"])
	return jsonify({"meta": deck_meta, "cards": deck_cards})

# This route is called to save modified options.
@app.route("/api/options/save", methods=["POST"])
def api_save_options():
	options_update({
		"radicals-dailies-amount": int(request.form["radicals-dailies-amount"]),
		"kanjis-dailies-amount": int(request.form["kanjis-dailies-amount"]),
		"words-dailies-amount": int(request.form["words-dailies-amount"]),
		"app-color-theme": str(request.form["app-color-theme"])
	})
	return redirect("/")

# Route to get the json representing the decks.
@app.route("/api/decks", methods=["POST"])
def api_get_decks():
	data = request.get_json()
	if not data or "tags" not in data or "min" not in data or "amount" not in data:
		return jsonify([])
	return jsonify(db_get_decks_by_tags(data["tags"], data["min"], data["amount"]))

# Route to get the number of decks returned by /api/decks.
@app.route("/api/decks/count", methods=["POST"])
def api_get_decks_count():
	data = request.get_json()
	if not data or "tags" not in data or "min" not in data or "amount" not in data:
		return jsonify([])
	return jsonify(db_get_decks_by_tags_amount(data["tags"], data["min"], data["amount"]))

# This route is called to save modified decks.
@app.route("/api/decks/save", methods=["POST"])
def api_save_decks():
	deck_states = request.form.get("deckStates")
	db_update_decks_status(loads(deck_states))
	return redirect("/")

# This route is used to reset the dailies.
@app.route("/api/dailies/reset")
def api_reset_dailies():
	if path.isfile("dailies.json"):
		remove("dailies.json")
	return redirect("/")

# This route is used to get the dailies card main informations.
@app.route("/api/dailies/get")
def api_get_dailies():
	with open("dailies.json", 'r', encoding='utf-8') as f:
		return jsonify(load(f))
	return jsonify({})



# Launches the app.
if __name__ == "__main__":
	options_init()
	app.run(debug=True)
