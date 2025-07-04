from flask import Flask, redirect, render_template, jsonify, request
from core.exercices import *
from core.database import *
from core.options import *
from core.dailies import *
from json import loads
from random import shuffle



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



# This route generates the dailies if needed then the main page.
@app.route("/")
def page_index():
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

# This route generates the exercices pages.
@app.route("/exercices/<string:type>")
def page_exercises(type):
    # Détermine la page active en fonction du type d'exercice
    active_page_map = {
        'free-kanji': 'exercices-free-kanji',
        'free-word': 'exercices-free-word',
        'free-radical': 'exercices-free-radical',
        'free-all': 'exercices-free-all'
    }
    active_page = active_page_map.get(type, 'dailies')
    return render_template("exercices.html", options=get_options(), type=type, active_page=active_page)



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
	dailies_delete()
	return redirect("/")

# This route is used to get the dailies card main informations.
@app.route("/api/dailies/get")
def api_get_dailies():
	return jsonify(dailies_get_todo())

# Route to get the json representing a set of dailies exercices.
@app.route("/api/dailies/exercices/<string:type>")
def api_get_dailies_exercices(type):
	exercices = {"type":"dailies", "exercices":[]}
	dailies = dailies_get_todo()

	# Gets the dailies element to work on.
	elements = []
	if type == "all":
		elements = dailies["kanji"] + dailies["word"] + dailies["radical"]
	elif type == "kanji":
		elements = dailies["kanji"]
	elif type == "word":
		elements = dailies["word"]
	elif type == "radical":
		elements = dailies["radical"]

	# Makes the exrecices from the cards.
	info = {"kanji":[],"word":[],"radical":[]}
	cards = db_get_cards_by_ids([elt[1] for elt in elements])
	for card in cards :
		info[card["type"]].append(card["japanese"])
	for card in cards :
		exercices["exercices"] += exercices_create(card, info)
	shuffle(exercices["exercices"])
	return jsonify(exercices)

# This is used to process the results of an exercice.
@app.route('/api/exercices/end', methods=['POST'])
def api_exercices_end():
	raw_data = request.data.decode('utf-8')
	json_str = raw_data.split('=', 1)[1] if '=' in raw_data else raw_data
	data = loads(json_str) if json_str else {}
	if data.get("type") == "dailies" :
		dailies_process_result(data["results"])
	return redirect("/")




# This route is used to import the progression.
@app.route("/api/progression/import")
def api_import_progression():
	return redirect("/")

# This route is used to export the progression.
@app.route("/api/progression/export")
def api_export_progression():
	return redirect("/")

# This route is used to reset the progression.
@app.route("/api/progression/reset")
def api_reset_progression():
	return redirect("/")

# This route is used to sync the database with the json data.
@app.route("/api/database/sync")
def api_sync_database():
	return redirect("/")






# Launches the app.
if __name__ == "__main__":
	options_init()
	app.run(debug=True)
