const allowedWordClasses = [
	"ichidan", "godan", "irregular",
	"i_adj", "na_adj",
	"particle", "adverb", "pronoun", "conjunction",
	"noun"
];
const allowedCardTypes = [
	"word", "radical", "kanji"
];


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
			onclick="this.classList.toggle('flipped')">
				<div class="flashcard-inner">
					<div class="flashcard-face flashcard-front">
						${this.front}
					</div>
					<div class="flashcard-face flashcard-back">
						<div class="card-content">
							<h3 class="card-title">${this.meaning}</h3>`;
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
		this.reading = data.reading ?? null;
		this.word_class = data.class ?? null;
		if (typeof this.reading !== 'string') {
			throw new Error(`[SESHAT]: missing or invalid 'reading' field (${this.reading})`);
		}
		if (typeof this.word_class !== 'string') {
			throw new Error(`[SESHAT]: missing or invalid 'class' field (${this.word_class})`);
		}
		if (!allowedWordClasses.includes(this.word_class)) {
			throw new Error(`[SESHAT]: invalid 'class' field: must be one of ${allowedWordClasses.join(", ")} (${this.word_class})`);
		}
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
		this.name = data.name ?? null;
		if (typeof this.name !== 'string') {
			throw new Error(`[SESHAT]: missing or invalid 'name' field (${this.name})`);
		}
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
		this.on = data.on ?? null;
		this.kun = data.kun ?? null;
		this.radical = data.radical ?? null;
		if (typeof this.on !== 'string') {
			throw new Error(`[SESHAT]: missing or invalid 'on' field (${this.on})`);
		}
		if (typeof this.kun !== 'string') {
			throw new Error(`[SESHAT]: missing or invalid 'kun' field (${this.kun})`);
		}
		if (!Array.isArray(this.radical)) {
			throw new Error(`[SESHAT]: missing or invalid 'radical' field (must be list) (${this.radical})`);
		}
		for (const r of this.radical) {
			if (typeof r !== 'string') {
				throw new Error(`[SESHAT]: 'radical' field must contain only strings (${this.radical})`);
			}
		}
	}

	// This function returns the HTML to render the card.
	render(index) {
		return `
			${this.renderPre(index)}
				<p class="card-info"><strong>On:</strong> ${this.on}</p>
				<p class="card-info"><strong>Kun:</strong> ${this.kun}</p>
				<p class="card-info"><strong>Radical:</strong> ${this.radical.join(', ')}</p>
			${this.renderPost()}
		`;
	}
}

// Loads a card from its json file.
async function loadCard(deck_name, file_name) {
	try {
		const res = await fetch(`api/deck/${deck_name}/file/${file_name}`);
		if (!res.ok) throw new Error(`File not found : api/deck/${deck_name}/file/${file_name}`);
		const card_data = await res.json();

		// Gets all the shared data between card types.
		const type = card_data.type ?? null;
		const front = card_data.front ?? null;
		const meaning = card_data.meaning ?? null;
		const mnemonic = card_data.mnemonic ?? null;
		const example = card_data.example ?? null;
		if (typeof type !== 'string') {
			throw new Error(`[SESHAT]: '${file_name}' must define a 'type' string field`);
		}
		if (!allowedCardTypes.includes(type)) {
			throw new Error(`[SESHAT]: '${file_name}' 'type' field must be one of: ${allowedCardTypes.join(", ")}`);
		}
		if (typeof front !== 'string') {
			throw new Error(`[SESHAT]: '${file_name}' must define a 'front' string field`);
		}
		if (typeof meaning !== 'string') {
			throw new Error(`[SESHAT]: '${file_name}' must define a 'meaning' string field`);
		}
		if (typeof mnemonic !== 'string') {
			throw new Error(`[SESHAT]: '${file_name}' must define a 'mnemonic' string field`);
		}
		if (!Array.isArray(example)) {
			throw new Error(`[SESHAT]: '${file_name}' must define an 'example' list field`);
		}
		for (const e of example) {
			if (typeof e !== 'string') {
				throw new Error(`[SESHAT]: '${file_name}' 'example' field must contain only strings`);
			}
		}

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

	// Errors managment.
	} catch (error) {
		console.error(`Error when loading deck '${this.name}/_deck.json' :`, error);
		return null;
	}
}
