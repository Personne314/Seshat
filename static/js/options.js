function resetDailies() {
	if (confirm("Êtes-vous sûr de vouloir réinitialiser les dailies ?")) {
		window.location.href = "/api/dailies/reset";
	}
}
