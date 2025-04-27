from flask import Flask, render_template, jsonify
from model.deck import Deck

app = Flask(__name__)



@app.route('/')
def index():
    deckname = "test"

    deck = Deck(deckname)
    if deck.init:
        return render_template('carousel.html')
    return ""



@app.route('/api/deck/<deck_name>')
def api_get_deck(deck_name):
    deck = Deck(deck_name)
    if not deck.init:
        return jsonify({"error": "Deck loading failed"}), 400
    
    cards = []
    for front in deck:
        card = deck[front]
        cards.append({
            "id": f"{card.type.name.lower()}_{hash(front)}",
            "type": card.type.name.lower(),
            "front": card.front,
            "meta": {
                **({"on": card.on, "kun": card.kun, "radical": card.radical} if card.type.name == "KANJI" else {}),
                **({"reading": card.reading, "class": card.word_class.name.lower()} if card.type.name == "WORD" else {}),
                **({"name": card.name} if card.type.name == "RADICAL" else {})
            },
            "content": {
                "meaning": card.meaning,
                "mnemonic": card.mnemonic,
                "examples": card.example
            }
        })
    
    return jsonify({
        "name": deck.name,
        "tags": deck.tags,
        "cards": cards
    })

if __name__ == '__main__':
    app.run(debug=True)