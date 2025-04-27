class FlashcardCarousel {
    
	// Carousel constructor.
	constructor() {
        this.deckName = "test";

		// HTML elements.
        this.carousel = document.querySelector('.carousel-container');
        this.prevBtn = document.querySelector('.prev');
        this.nextBtn = document.querySelector('.next');

		// Deck parameters.
        this.currentIndex = 0;
        this.init();
    }

    async init() {
        await this.loadDeck();
        this.setupEventListeners();
    }

    async loadDeck() {
        try {
            const response = await fetch(`/api/deck/${this.deckName}`);
            if (!response.ok) throw new Error('Erreur de chargement');
            
            const data = await response.json();
            this.renderDeckInfo(data);
            this.renderCards(data.cards);
        } catch (error) {
            console.error('Erreur:', error);
        }
    }

    renderDeckInfo(data) {
        document.getElementById('deck-name').textContent = data.name;
        const tagsContainer = document.getElementById('deck-tags');
        tagsContainer.innerHTML = data.tags.map(tag => 
            `<span class="tag">${tag}</span>`
        ).join('');
    }
	renderCards(cards) {
		this.carousel.innerHTML = cards.map((card, index) => `
			<div class="flashcard ${card.type} ${index === 0 ? 'active' : ''}" 
				 onclick="this.classList.toggle('flipped')">
				<div class="flashcard-inner">
					<div class="flashcard-face flashcard-front">
						${card.front}
					</div>
					<div class="flashcard-face flashcard-back">
						<div class="card-content">
							<h3 class="card-title">${card.content.meaning}</h3>
							
							${card.type === 'kanji' ? `
								<p class="card-info"><strong>On:</strong> ${card.meta.on}</p>
								<p class="card-info"><strong>Kun:</strong> ${card.meta.kun}</p>
								<p class="card-info"><strong>Radical:</strong> ${card.meta.radical.join(', ')}</p>
							` : ''}
							
							${card.type === 'word' ? `
								<p class="card-info"><strong>Lecture:</strong> ${card.meta.reading}</p>
								<p class="card-info"><strong>Type:</strong> ${card.meta.class}</p>
							` : ''}
							
							${card.type === 'radical' ? `
								<p class="card-info"><strong>Nom:</strong> ${card.meta.name}</p>
							` : ''}
							
							<p class="card-info"><strong>Mnémonique:</strong></p>
							<p>${card.content.mnemonic}</p>
							
							${card.content.examples.length > 0 ? `
								<div class="examples">
									<p class="card-info"><strong>Exemples:</strong></p>
									${card.content.examples.map(ex => 
										`<p class="example">${ex}</p>`
									).join('')}
								</div>
							` : ''}
						</div>
					</div>
				</div>
			</div>
		`).join('');
	
		this.cards = document.querySelectorAll('.flashcard');
		this.updateCarousel(); // Applique les styles initiaux
	}


    setupEventListeners() {
        this.prevBtn.addEventListener('click', () => this.navigate(-1));
        this.nextBtn.addEventListener('click', () => this.navigate(1));

        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') this.navigate(-1);
            if (e.key === 'ArrowRight') this.navigate(1);
        });

        window.addEventListener('resize', () => this.updateCarousel());
    }

	// This is used to navigate between the cards.
    navigate(direction) {
        this.currentIndex = Math.max(0, 
            Math.min(this.currentIndex + direction, this.cards.length - 1));
        this.updateCarousel();
    }

	// This is used to update the cards.
	updateCarousel() {
		this.cards.forEach(card => {
			card.style.transform = 'none'; /* Réinitialise les transformations */
			card.classList.remove('active');
		});
		
		if (this.cards[this.currentIndex]) {
			this.cards[this.currentIndex].classList.add('active');
		}
	}
}

// Initialisation quand le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
    new FlashcardCarousel();
});