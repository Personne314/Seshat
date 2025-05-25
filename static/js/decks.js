// Defines the deck type to use.
deck_type = "";
current_page = 0;
function setDeckType(type) {
	deck_type = type;
	current_page = 0;
	triggerTagSearch([deck_type], 0,10);
}

// This trigger the search and update the page
function triggerTagSearch(tags, min, amount) {
	fetch('/api/decks', {
		method: 'POST',
		headers: {'Content-Type': 'application/json'},
		body: JSON.stringify({tags:tags, min:min, amount:amount})
	}).then(response => response.json()).then(data => {
		
		
		
		console.log("Server answer:", data);
		


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
