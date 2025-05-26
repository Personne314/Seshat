// Global variables used in the script.
const deck_per_page = 5;
deck_type = "";
current_page = 0;
deckStates = {};
modified = false;


// Defines the deck type to use.
function setDeckType(type) {
	deck_type = type;
	current_page = 0;
	deckStates = {};
	triggerTagSearch([deck_type], 0,deck_per_page);
}







function createDeckSections(decks) {
    const form = document.querySelector('.deck-form');
    form.innerHTML = '';

	// Inits the dict with de initial state of the decks.
    decks.forEach(deck => {
        deckStates[deck.name] = deck.is_active;
    });

	// Creates the deck sections
    decks.forEach(deck => {
        const details = document.createElement('details');
        details.className = 'section';
        if (deck.is_active) details.open = true;
        const summary = document.createElement('summary');
        summary.innerHTML = `
            <div class="deck-summary-header">
                <span>${deck.name}</span>
                <label class="toggle-switch">
                    <input type="checkbox" 
                           name="deck_${deck.id}" 
                           ${deck.is_active ? 'checked' : ''}
                           data-deck-name="${deck.name}">
                    <span class="slider"></span>
                </label>
            </div>
        `;
        const content = document.createElement('div');
        content.className = 'options-group';
        content.innerHTML = `
            <div class="kanji-grid">
                ${deck.content.map(k => `<span>${k}</span>`).join('')}
            </div>
        `;
        details.appendChild(summary);
        details.appendChild(content);
        form.appendChild(details);
    });

    // Adds the save button.
    const submitDiv = document.createElement('div');
    submitDiv.className = 'form-actions';
    submitDiv.innerHTML = `
        <button type="submit" class="primary">Enregistrer</button>
    `;
    form.appendChild(submitDiv);

	// Adds the listeners.
    document.querySelectorAll('.toggle-switch input').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const deckName = this.dataset.deckName;
            deckStates[deckName] = this.checked;
            modified = true;
        });
    });
}








// This trigger the search and update the page
function triggerTagSearch(tags, min, amount) {
	fetch('/api/decks', {
		method: 'POST',
		headers: {'Content-Type': 'application/json'},
		body: JSON.stringify({tags:tags, min:min, amount:amount})
	}).then(response => response.json()).then(data => {
		
		


		createDeckSections(data);
		console.log("Server answer:", data);
		

		document.getElementById("page-indicator").innerHTML = `Page ${current_page+1}`
	})
	.catch(error => console.error('Error:', error));
}











// Met à jour l'affichage des decks
async function updateDecksDisplay(diff) {
	const tagSearch = document.getElementById('tag-search');
    const tags = [...new Set(
        [deck_type, ...tagSearch.value.trim().toLowerCase().split(/\s+/).filter(Boolean)]
    )];

    current_page += diff;
    const min = current_page * deck_per_page;
    const amount = deck_per_page;

	fetch('/api/decks-count', {
		method: 'POST',
		headers: {'Content-Type': 'application/json'},
		body: JSON.stringify({tags:tags, min:min, amount:amount})
	}).then(response => response.json()).then(data => {
		if (data.count === 0) {
            current_page -= diff;
            return;
        }
        triggerTagSearch(tags, min,deck_per_page);
	})
	.catch(error => console.error('Error:', error));
}









// This adds the events for the search bar. 
document.addEventListener('DOMContentLoaded', function() {
	const tagSearch = document.getElementById('tag-search');
	const tagFilters = document.querySelectorAll('.tag-filter');
	
	// Tag click event.
	tagFilters.forEach(tag => {
		tag.addEventListener('click', function() {
			const currentTags = tagSearch.value.trim();
			const tagValue = this.getAttribute('data-tag');
			if (!currentTags.includes(tagValue)) {
				tagSearch.value = currentTags ? `${currentTags} ${tagValue}` : tagValue;
			}
		});
	});
	
	// Enter key pressure detection.
	tagSearch.addEventListener('keydown', function(e) {
		if (e.key === 'Enter') {
			e.preventDefault();
			const tags = [...new Set(
				[deck_type, ...tagSearch.value.trim().toLowerCase().split(/\s+/).filter(Boolean)]
			)];
			current_page = 0;
			triggerTagSearch(tags, 0,deck_per_page);
		}
	});


    const prevBtn = document.querySelector('.pagination-btn.prev');
    const nextBtn = document.querySelector('.pagination-btn.next');
    const pageIndicator = document.getElementById('page-indicator');

    // Bouton Précédent
    prevBtn.addEventListener('click', async () => {
        if (current_page > 0) {
            await updateDecksDisplay(-1);
        }
    });

    // Bouton Suivant
    nextBtn.addEventListener('click', async () => {
        await updateDecksDisplay(1);
    });

});














// // Exemple de fonction pour sauvegarder les changements
// function saveAllDeckStates() {
//     console.log("États actuels des decks:", deckStates);
//     // Envoyer deckStates au serveur via fetch()
//     fetch('/api/update-decks', {
//         method: 'POST',
//         headers: {'Content-Type': 'application/json'},
//         body: JSON.stringify(deckStates)
//     }).then(response => response.json())
//       .then(data => console.log("Réponse du serveur:", data));
// }

// // À appeler quand on clique sur "Enregistrer"
// document.querySelector('.deck-form').addEventListener('submit', function(e) {
//     e.preventDefault();
//     saveAllDeckStates();
// });



