let cards = [];
let currentIndex = 0;

// Gets the HTML elements.
const cardContainer = document.getElementById('deck-container');
const textInput = document.getElementById('text-input');
const responseBtn = document.getElementById('response-btn');
const nextBtn = document.getElementById('next-btn');
const deckDataElement = document.getElementById('deck-data');
let deckName = deckDataElement ? deckDataElement.dataset.name || 'error' : 'error';

// This function loads the cards from the current deck.
async function fetchCards() {
	try {
		const response = await fetch(`/api/exercice/radical/${deckName}`);
		const filenames = await response.json();
		const promises = filenames.map(name => loadCard(deckName, name));
		cards = (await Promise.all(promises)).filter(c => c !== null);
		renderCurrentCard();
	} catch (error) {
		cardContainer.innerHTML = "<p>Impossible de charger les cartes.</p>";
	}
}

// This function renders the current card.
function renderCurrentCard() {
	if (currentIndex >= cards.length) {
		cardContainer.innerHTML = "<p>Exercice terminé !</p>";
		return;
	}
	cardContainer.innerHTML = cards[currentIndex].render(0);
	const input = document.getElementById('text-input');
	input.value = '';
	responseBtn.disabled = false;
	nextBtn.disabled = true;
	input.focus();
}

// This flip the card to show the anwer.
function showAnswer() {
	const userInput = textInput.value.trim().toLowerCase();
	const currentCard = cards[currentIndex];

	if (!currentCard.meaning) {
		console.warn("⚠️ Aucun champ 'meaning' trouvé sur la carte courante");
		return;
	}

	const validAnswers = currentCard.meaning.map(m => m.toLowerCase());
	const isCorrect = validAnswers.includes(userInput);

	console.log(`Réponse utilisateur : "${userInput}"`);
	console.log("Réponses valides :", validAnswers);
	console.log(isCorrect ? "✅ Bonne réponse !" : "❌ Mauvaise réponse.");

	const flashcard = document.querySelector('.flashcard');
	if (flashcard) {
		flashcard.classList.add('flipped');
	}

	responseBtn.disabled = true;
	nextBtn.disabled = false;
}

// This function pass to the next question.
function nextCard() {
	currentIndex++;
	renderCurrentCard();
}

// Setup the events.
responseBtn.addEventListener('click', showAnswer);
nextBtn.addEventListener('click', nextCard);
textInput.addEventListener('keydown', function (e) {
	if (e.key === 'Enter') {
		if (!responseBtn.disabled) {
			showAnswer();
		} else if (!nextBtn.disabled) {
			nextCard();
		}
	}
});

// Starts the exercise.
fetchCards();
