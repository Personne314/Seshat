// Defines the deck type to use.
deck_type = "";
current_page = 0;
function setDeckType(type) {
	deck_type = type;
	current_page = 0;
	triggerTagSearch([deck_type], 0,10);
}





function updateDecks() {
	document.getElementById("page-indicator").innerHTML = `Page ${current_page+1}`
}




function createDeckSections(decks) {
    const form = document.querySelector('.deck-form');
    form.innerHTML = '';

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
                           ${deck.is_active ? 'checked' : ''}>
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

    form.innerHTML += `
        <div class="form-actions">
            <button type="submit" class="primary">Enregistrer</button>
        </div>
    `;
}







// This trigger the search and update the page
function triggerTagSearch(tags, min, amount) {
	fetch('/api/decks', {
		method: 'POST',
		headers: {'Content-Type': 'application/json'},
		body: JSON.stringify({tags:tags, min:min, amount:amount})
	}).then(response => response.json()).then(data => {
		
		


		createDeckSections(data)
		console.log("Server answer:", data);
		

		updateDecks();
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
			triggerTagSearch(tags, 0,10);
		}
	});
});
