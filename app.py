from flask import Flask, render_template
from model.flashcard import *

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

if __name__ == '__main__':
    f1 = Flashcard("data/deck/test/kanji_test.json")
    f2 = Flashcard("data/deck/test/radical_test.json")
    f3 = Flashcard("data/deck/test/word_test.json")
    print(f1,f2,f3)
    
    print("\nStarting Flask Server...")
    app.run(debug=True)
