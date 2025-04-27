from flask import Flask, render_template
from model.deck import *

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

if __name__ == '__main__':
    deck = Deck("test")
    
    print("\nStarting Flask Server...")
    app.run(debug=True)
