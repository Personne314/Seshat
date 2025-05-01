let cards = [];
let currentIndex = 0;

const cardContainer = document.getElementById('deck-container');
const textInput = document.getElementById('text-input');
const responseBtn = document.getElementById('response-btn');
const nextBtn = document.getElementById('next-btn');
const deckDataElement = document.getElementById('deck-data');
let deckName = deckDataElement ? deckDataElement.dataset.name || 'error' : 'error';

async function fetchCards() {
	try {
		const response = await fetch(`/api/exercice/radical/${deckName}`);
		const filenames = await response.json();

		console.log(filenames);

		// Charge chaque carte via flashcard.js
		const promises = filenames.map(name => loadCard(deckName, name));
		cards = (await Promise.all(promises)).filter(c => c !== null);
		renderCurrentCard();
	} catch (error) {
		console.error('Erreur lors de la récupération des cartes :', error);
		cardContainer.innerHTML = "<p>Impossible de charger les cartes.</p>";
	}
}

function renderCurrentCard() {
	if (currentIndex >= cards.length) {
		cardContainer.innerHTML = "<p>Exercice terminé !</p>";
		return;
	}

	// Efface l'ancien contenu et affiche la nouvelle carte
	cardContainer.innerHTML = cards[currentIndex].render(0);

	// Réinitialise l'état de l'exercice
	const input = document.getElementById('text-input');
	input.value = '';
	responseBtn.disabled = false;
	nextBtn.disabled = true;

	// Focus sur l'entrée texte
	input.focus();
}

function showAnswer() {
	document.querySelector('.flashcard').classList.add('flipped');
	responseBtn.disabled = true;
	nextBtn.disabled = false;
}

function nextCard() {
	currentIndex++;
	renderCurrentCard();
}

// Événement bouton réponse
responseBtn.addEventListener('click', showAnswer);

// Événement bouton suivant
nextBtn.addEventListener('click', nextCard);

// Événement touche Entrée
textInput.addEventListener('keydown', function (e) {
	if (e.key === 'Enter') {
		if (!responseBtn.disabled) {
			showAnswer();
		} else if (!nextBtn.disabled) {
			nextCard();
		}
	}
});

// Démarrage
fetchCards();
