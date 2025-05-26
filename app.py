from flask import Flask, redirect, render_template, jsonify, request
from core.database import get_db, close_db, db_get_deck_meta, db_get_deck_cards, \
	db_get_decks_tags, db_get_decks_by_tags, db_get_decks_by_tags_amount
from core.options import options_init, options_update, get_options
from core.dailies import dailies_init
from json import loads



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
@app.route("/radicals-exercise")
def radicals_exercise():
	deck_data = "radicals-14"
	return render_template("exercices/radical_exercise.html", deck_data=deck_data, active_page="home")




# This route generates the dailies if needed then the main page.
@app.route("/")
def index():
	dailies_init()
	return render_template("index.html", options=get_options(), active_page="home")

# This route generates a page used to modify tha application options.
@app.route("/options")
def show_options():
	return render_template("options.html", options=get_options(), active_page="options")

# This route generates a page showing the kanji of a deck.
@app.route("/deck")
def page_deck():
	deck_data = "Vocabulaire JLPT5 - 18"
	return render_template("decks/deck.html", options=get_options(), deck_data=deck_data)

# This route generates a page showing the kanji deck list.
@app.route("/decks-kanji")
def page_decks_kanji():
	return render_template(
		"decks/kanji_decks.html", 
		options=get_options(), 
		active_page="decks-kanji",
		all_tags=db_get_decks_tags("kanji")
	)

# This route generates a page showing the word deck list.
@app.route("/decks-word")
def page_decks_word():
	return render_template(
		"decks/word_decks.html", 
		options=get_options(), 
		active_page="decks-word",
		all_tags=db_get_decks_tags("word")
	)

# This route generates a page showing the radical deck list.
@app.route("/decks-radical")
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
@app.route("/api/save-options", methods=["POST"])
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
@app.route("/api/decks-count", methods=["POST"])
def api_get_decks_count():
	data = request.get_json()
	if not data or "tags" not in data or "min" not in data or "amount" not in data:
		return jsonify([])
	return jsonify(db_get_decks_by_tags_amount(data["tags"], data["min"], data["amount"]))


# This route is called to save modified decks.
@app.route("/api/save-decks", methods=["POST"])
def api_save_decks():
	deck_states = request.form.get("deckStates")
	parsed_states = loads(deck_states)
	print(parsed_states)
	return redirect("/")



# Launches the app.
if __name__ == "__main__":
	options_init()
	app.run(debug=True)
