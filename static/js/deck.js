
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
			const res = await fetch(`api/deck/${encodeURIComponent(this.name)}`);
			if (!res.ok) throw new Error("Deck not found");
			const deck = await res.json();
			const deck_meta = deck.meta;
			const deck_cards = deck.cards;
			this.type = ['radical', 'kanji', 'word'].find(tag => deck_meta.tags.includes(tag)) || 'unknown';
			await this.renderDeckInfo(deck_meta);
			await this.renderCards(deck_cards);
		} catch (error) {
			console.error(`Error when loading deck '${this.name}' :`, error);
		}
	}

	// This renders the name and the tags of the deck.
	async renderDeckInfo(deck_meta) {
		console.log(deck_meta);
		const deck_name = deck_meta.name;
		const deck_tags = deck_meta.tags;
		document.getElementById('deck-name').textContent = deck_name;
		const tagsContainer = document.getElementById('deck-tags');
		tagsContainer.innerHTML = deck_tags.map(tag => 
			`<span class="tag">${tag}</span>`
		).join('');
	}

	// This is used to render the cards of the deck.
	async renderCards(deck_cards) {
		console.log("deck_cards: ", deck_cards)
		console.log("deck name: ", this.name)

		// Loads the cards from jsons.
		const cards = [];
		for (const card_data of deck_cards) {
			let card = await loadCard(this.name, card_data, this.type);
			if (card != null) cards.push(card);
		}

		// Renders the code.
		this.deck.innerHTML = cards.map((card, index) => card.render(index)).join('');
		this.cards = document.querySelectorAll('.flashcard');
		this.updateDeck();
	}

	// This setup the controls events.
	setupEventListeners() {
		this.prevBtn.addEventListener('click', () => {
			this.resetCurrentCardFlip();
			this.navigate(-1);
		});
		this.nextBtn.addEventListener('click', () => {
			this.resetCurrentCardFlip();
			this.navigate(1);
		});
		document.addEventListener('keydown', (e) => {
			if (e.key === 'ArrowLeft') {
				this.resetCurrentCardFlip();
				this.navigate(-1);
			}
			if (e.key === 'ArrowRight') {
				this.resetCurrentCardFlip();
				this.navigate(1);
			}
			if (e.key === ' ') {
				e.preventDefault();
				const currentCard = this.cards[this.currentIndex];
				if (currentCard) {
					currentCard.classList.toggle('flipped');
				}
			}
		});
		window.addEventListener('resize', () => this.updateDeck());
		this.deck.addEventListener('click', (e) => {
			const card = e.target.closest('.flashcard');
			if (card && card.classList.contains('active')) {
				card.classList.toggle('flipped');
			}
		});
	}

	// This remove the flipped class from the current card.
	resetCurrentCardFlip() {
		const currentCard = this.cards[this.currentIndex];
		if (currentCard && currentCard.classList.contains('flipped')) {
			currentCard.classList.remove('flipped');
		}
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