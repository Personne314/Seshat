// Active an answer method. qcm, japanese or french.
function switchAnswerMethod(method) {
	const methods = document.querySelectorAll('.answer-method');
	methods.forEach(div => {
		div.classList.remove('active');
		[...div.querySelectorAll('input, textarea, button, select')].forEach(el => {
			el.disabled = true;
		});
	});
	const activeDiv = document.getElementById(method);
	activeDiv.classList.add('active');
	[...activeDiv.querySelectorAll('input, textarea, button, select')].forEach(el => {
		el.disabled = false;
	});
}

// Adds the listeners.
document.addEventListener('DOMContentLoaded', () => {
	switchAnswerMethod('qcm');
	const jpInput = document.getElementById('jp-input');
	if (jpInput && window.wanakana) {
		wanakana.bind(jpInput);
	}
});