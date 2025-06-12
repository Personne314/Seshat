// Redirection function.
// Redirection to the deck viewer.
function navigateToElement(card_id) {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = '/deck';
    const inputCard = document.createElement('input');
    inputCard.type = 'hidden';
    inputCard.name = 'card';
    inputCard.value = card_id;
    form.appendChild(inputCard);
    document.body.appendChild(form);
    form.submit();
}

// Loads and renders the dailies.
async function loadDailies() {
	try {
		const response = await fetch('/api/dailies/get');
		const data = await response.json();document.getElementById('current-date').textContent =
			new Date().toLocaleDateString('fr-FR', {
				year:    'numeric',
				month:   'long',
				day:     'numeric'
			}
		);
		displayRadicals(data.radical || []);
		displayKanji(data.kanji || []);
		displayVocabulary(data.word || []);
	} catch (error) {
		console.error('Erreur lors du chargement des dailies:', error);
		document.querySelectorAll('.elements-grid').forEach(grid => {
			grid.innerHTML = '<div class="error-message">Erreur lors du chargement des cartes</div>';
		});
	}
}

// Global card rendering function.
function displayCards(grid, cards, grid_name) {
	grid.innerHTML = cards.map(card => {
		const [character, elementId,,validation_count,] = card;
		const progressPercent = Math.min(100.0, (validation_count / 10.0) * 100.0);
		return `
			<div class="element-card clickable"
				data-element-id="${elementId}"
				data-character="${character}">
				<div class="element-text">${character}</div>
				<div class="progress-container">
					<div class="progress-bar" style="width: ${progressPercent}%"></div>
				</div>
			</div>
		`;
	}).join('');
	document.querySelectorAll(`#${grid_name}-grid .element-card.clickable`).forEach(card => {
		card.addEventListener('click', () => {
			const elementId = card.dataset.elementId;
			navigateToElement(elementId);
		});
	});
}

// Radicals rendering function.
function displayRadicals(radicals) {
	const grid = document.getElementById('radicals-grid');
	if (radicals.length === 0) {
		grid.innerHTML = '<div class="placeholder">Aucun radical à réviser aujourd\'hui</div>';
		return;
	}
	displayCards(grid, radicals, 'radicals')
}

// Kanjis rendering function.
function displayKanji(kanjis) {
	const grid = document.getElementById('kanji-grid');
	if (kanjis.length === 0) {
		grid.innerHTML = '<div class="placeholder">Aucun kanji à réviser aujourd\'hui</div>';
		return;
	}
	displayCards(grid, kanjis, 'kanji')
}

// Vocabulary rendering function.
function displayVocabulary(vocabulary) {
	const grid = document.getElementById('vocabulary-grid');
	if (vocabulary.length === 0) {
		grid.innerHTML = '<div class="placeholder">Aucun vocabulaire à réviser aujourd\'hui</div>';
		return;
	}
	displayCards(grid, vocabulary, 'vocabulary')
}

// Adds events.
document.addEventListener('DOMContentLoaded', function() {
	const tabs = document.querySelectorAll('.tab');
	const tabContents = document.querySelectorAll('.tab-content');
	
	tabs.forEach(tab => {
		tab.addEventListener('click', () => {
			tabs.forEach(t => t.classList.remove('active'));
			tabContents.forEach(c => c.classList.remove('active'));
			tab.classList.add('active');
			document.getElementById(tab.getAttribute('data-tab')).classList.add('active');
		});
	});
	loadDailies();
});
