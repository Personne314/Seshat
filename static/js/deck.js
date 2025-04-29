
// This class is used to manage the logical part of deck rendering.
class FlashcardDeck {
	
	// Deck constructor.
	constructor() {
		const elt = document.getElementById('deck-data');
		this.name = elt.dataset.name;

		// HTML elements.
		this.deck = document.querySelector('.deck-container');
		this.prevBtn = document.querySelector('.prev');
		this.nextBtn = document.querySelector('.next');

		// Deck parameters.
		this.currentIndex = 0;
	}

	// This initializes the deck.
	async init() {
		await this.loadDeck();
		this.setupEventListeners();
	}

	// This function loads the deck.
	// It loads its metadata, then renders the deck.
	async loadDeck() {
		try {
			const res = await fetch(`api/deck/${this.name}/file/_deck.json`);
			if (!res.ok) throw new Error(`File not found : api/deck/${this.name}/file/_deck.json`);
			const deck_meta = await res.json();
			this.deck_name = deck_meta.name;
			this.deck_tags = deck_meta.tags;
			if (typeof this.deck_name !== 'string') {
				throw new Error("Field 'name' missing or invalid");
			}
			if (!Array.isArray(this.deck_tags) || !this.deck_tags.every(tag => typeof tag === 'string')) {
				throw new Error("Field 'tags' missing or invalid");
			}
			await this.renderDeckInfo();
			await this.renderCards();
		} catch (error) {
			console.error(`Error when loading deck '${this.name}/_deck.json' :`, error);
		}
	}

	// This returns the card names.
	async getCardsNames() {
		const response = await fetch(`/api/deck/${this.name}/files`);
		const files = await response.json();
		return files;
	}

	// This renders the name and the tags of the deck.
	async renderDeckInfo() {
		document.getElementById('deck-name').textContent = this.deck_name;
		const tagsContainer = document.getElementById('deck-tags');
		tagsContainer.innerHTML = this.deck_tags.map(tag => 
			`<span class="tag">${tag}</span>`
		).join('');
	}

	// This is used to render the cards of the deck.
	async renderCards() {
		
		// Loads the cards from jsons.
		const cards = [];
		const card_names = await this.getCardsNames();
		for (const file_name of card_names) {
			let card = await loadCard(this.name, file_name);
			if (card != null) cards.push(card);
		}

		// Renders the code.
		this.deck.innerHTML = cards.map((card, index) => card.render(index)).join('');
		this.cards = document.querySelectorAll('.flashcard');
		this.updateDeck();
	}

	// This setup the controls events.
	setupEventListeners() {
		this.prevBtn.addEventListener('click', () => this.navigate(-1));
		this.nextBtn.addEventListener('click', () => this.navigate(1));
		document.addEventListener('keydown', (e) => {
			if (e.key === 'ArrowLeft') this.navigate(-1);
			if (e.key === 'ArrowRight') this.navigate(1);
		});
		window.addEventListener('resize', () => this.updateDeck());
	}

	// This is used to navigate between the cards.
	navigate(direction) {
		this.currentIndex = Math.max(0, 
			Math.min(this.currentIndex + direction, this.cards.length - 1));
		this.updateDeck();
	}

	// This is used to update the cards.
	updateDeck() {
		this.cards.forEach(card => {
			card.style.transform = 'none';
			card.classList.remove('active');
		});
		if (this.cards[this.currentIndex]) {
			this.cards[this.currentIndex].classList.add('active');
		}
	}
}

// Initialisation quand le DOM est chargé
document.addEventListener('DOMContentLoaded', async () => {
	const flashcard = new FlashcardDeck();
	await flashcard.init();
});