// Global variables used in the script.
const deck_per_page = 5;
deck_type = "";
current_page = 0;
deckStates = {};
modified = false;



const MAX_SCORE = 10;



// Defines the deck type to use.
function setDeckType(type) {
	deck_type = type;
	current_page = 0;
	deckStates = {};
	triggerTagSearch([deck_type], 0,deck_per_page);
}

// This creates the content of the page to display the decks.
function createDeckSections(decks) {
    const form = document.querySelector('.deck-form');
    form.innerHTML = '';
    const hiddenInput = document.createElement('input');
    hiddenInput.type = 'hidden';
    hiddenInput.name = 'deckStates';
    form.appendChild(hiddenInput);

    // Inits the dict with the initial state of the decks.
    decks.forEach(deck => {
        if (deckStates[deck.name] !== undefined) {
            deck.is_active = deckStates[deck.name];
        }
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
                        ${deck.is_active ? 'checked' : ''}
                        data-deck-name="${deck.name}">
                    <span class="slider"></span>
                </label>
            </div>
        `;
        const content = document.createElement('div');
        content.className = 'elements-grid';
        content.innerHTML = deck.content.map(item => {
            const [text, score = 0] = Array.isArray(item) ? item : [item, 0];
            const progressPercent = Math.min(100, (score / MAX_SCORE) * 100);
            return `
                <div class="element-card">
                    <div class="element-text">${text}</div>
                    <div class="progress-container">
                        <div class="progress-bar" style="width: ${progressPercent}%"></div>
                    </div>
                </div>
            `;
        }).join('');
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
    form.addEventListener('submit', function(e) {
        hiddenInput.value = JSON.stringify(deckStates);
    });

    // Adds the toggle buttons listeners.
    document.querySelectorAll('.toggle-switch input').forEach(checkbox => {
        checkbox.addEventListener('change', function () {
            const deckName = this.dataset.deckName;
            deckStates[deckName] = this.checked;
            modified = true;
            const detailsElement = this.closest('details');
            if (detailsElement) {
                detailsElement.open = this.checked;
            }
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
		document.getElementById("page-indicator").innerHTML = `Page ${current_page+1}`
	})
	.catch(error => console.error('Error:', error));
}

// Updates the deck display upon page change.
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

// This adds the events. 
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
            triggerTagSearch(tags, 0, deck_per_page);
        }
    });

    // Events for the page buttons.
    const prevBtn = document.querySelector('.pagination-btn.prev');
    const nextBtn = document.querySelector('.pagination-btn.next');
    prevBtn.addEventListener('click', async () => {
        if (current_page > 0) {
            await updateDecksDisplay(-1);
        }
    });
    nextBtn.addEventListener('click', async () => {
        await updateDecksDisplay(1);
    });

    // Inject deckStates in the form on submit.
    const form = document.querySelector('.deck-form');
    if (form) {
        const hiddenInput = document.createElement('input');
        hiddenInput.type = 'hidden';
        hiddenInput.name = 'deckStates';
        form.appendChild(hiddenInput);

        form.addEventListener('submit', function () {
            hiddenInput.value = JSON.stringify(deckStates);
        });
    }
});
