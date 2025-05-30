allowFlip = false;
function cardsAllowFlip() {allowFlip = true;}
function cardsPreventFlip() {allowFlip = false;}


// Flashcard base class.
class Flashcard {
	constructor(type, front, meaning, mnemonic, example) {
		this.type = type;
		this.front = front;
		this.meaning = meaning;
		this.mnemonic = mnemonic;
		this.example = example;
	}

	// Must be overriden by the children.
	render(index) {
        throw new Error("render() wasn't implemented");
    }

	// This renders the shared first part of the card HTML script.
	renderPre(index) {
		return `
			<div class="flashcard ${this.type} ${index === 0 ? 'active' : ''}" 
			${allowFlip ? 'onclick="this.classList.toggle(\'flipped\')"' : ''}>
				<div class="flashcard-inner">
					<div class="flashcard-face flashcard-front">
						${this.front}
					</div>
					<div class="flashcard-face flashcard-back">
						<div class="card-content">
							<h3 class="card-title">${this.meaning.join(', ')}</h3>`;
	}

	// This renders the shared last part of the card HTML script.
	renderPost() {
		return `
							<p class="card-info"><strong>Mnémonique:</strong></p>
							<p>${this.mnemonic}</p>
											
							${this.example.length > 0 ? `
								<div class="examples">
									<p class="card-info"><strong>Exemples:</strong></p>
										${this.example.map(ex => `<p class="example">${ex}</p>`).join('')}
								</div>
							` : ''}
						</div>
					</div>
				</div>
			</div>`;
	}
}

// Flashcard class for words.
class WordCard extends Flashcard {
	constructor(type, front, meaning, mnemonic, example, data) {
		super(type, front, meaning, mnemonic, example);
		this.reading = data.reading;
		this.word_class = data.class;
	}

	// This function returns the HTML to render the card.
	render(index) {
		return `
			${this.renderPre(index)}
				<p class="card-info"><strong>Lecture:</strong> ${this.reading}</p>
				<p class="card-info"><strong>Type:</strong> ${this.word_class}</p>
			${this.renderPost()}
			`;
	}
}

// Flashcard class for radicals.
class RadicalCard extends Flashcard {
	constructor(type, front, meaning, mnemonic, example, data) {
		super(type, front, meaning, mnemonic, example);
		this.name = data.radical_reading;
	}

	// This function returns the HTML to render the card.
	render(index) {
		return `
			${this.renderPre(index)}
				<p class="card-info"><strong>Nom:</strong> ${this.name}</p>
			${this.renderPost()}
		`;
	}
}

// Flashcard class for kanji.
class KanjiCard extends Flashcard {
	constructor(type, front, meaning, mnemonic, example, data) {
		super(type, front, meaning, mnemonic, example);
		this.on = data.on;
		this.kun = data.kun;
		this.radical = data.radical;
	}

	// This function returns the HTML to render the card.
	render(index) {
		return `
			${this.renderPre(index)}
				<p class="card-info"><strong>On:</strong> ${this.on.join(', ')}</p>
				<p class="card-info"><strong>Kun:</strong> ${this.kun.join(', ')}</p>
				<p class="card-info"><strong>Radical:</strong> ${this.radical.join(', ')}</p>
			${this.renderPost()}
		`;
	}
}

// Loads a card from its json file.
async function loadCard(deck_name, card_data, type) {
	try {

		// Gets all the shared data between card types.
		const front = card_data.japanese_name ?? null;
		const meaning = card_data.meaning ?? null;
		const mnemonic = card_data.mnemonic ?? null;
		const example = card_data.example ?? null;

		// Creates the right card.
		switch (type) {
			case "word":
				return new WordCard(type, front, meaning, mnemonic, example, card_data);
			case "radical":
				return new RadicalCard(type, front, meaning, mnemonic, example, card_data);
			case "kanji":
				return new KanjiCard(type, front, meaning, mnemonic, example, card_data);
			default:
				throw new Error(`[SESHAT]: unknown card type '${type}'`);
		}

	// Error managment.
	} catch (error) {
		console.error(`Error when loading deck '${deck_name}' card :`, error);
		return null;
	}
}
