from flask import Flask, render_template, jsonify, abort, json
from os import path, listdir


# Creates the app.
app = Flask(__name__)


# Main route. Placeholder.
@app.route('/')
def index():
	deck_data = "test"
	return render_template('deck.html', deck_data=deck_data)
	
# Route used to get the json files of the cards of a deck. 
@app.route("/api/deck/<deck_name>/files")
def list_deck_files(deck_name):
	folder_path = path.join("data/deck/",deck_name)
	if not path.exists(folder_path):
		abort(404, description=f"Folder '{folder_path}' not found")
	files = [f for f in listdir(folder_path) if f.endswith('.json') and f != "_deck.json"]
	return jsonify(files)

# Route used to get a card json file. 
@app.route("/api/deck/<deck_name>/file/<card_name>")
def get_deck_file(deck_name, card_name):
	file_path = path.join("data/deck", deck_name, card_name)
	if not path.exists(file_path):
		abort(404, description=f"File '{card_name}' not found in deck '{deck_name}'")
	with open(file_path, 'r', encoding='utf-8') as f:
		return jsonify(json.load(f))


# Launches the app.
if __name__ == '__main__':
	app.run(debug=True)
