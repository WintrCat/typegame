const key = document.querySelector("#key");
const keySpan = document.querySelector("#key b span");
const pressesSpan = document.querySelector("#presses");
const timeSpan = document.querySelector("#time");
const resetButton = document.querySelector("#restart");
const scoreArea = document.querySelector("#scoreArea");
const scoreSpan = document.querySelector("#score");
const usernameInputBox = document.querySelector("#username");
const submitButton = document.querySelector("#submit");
const submitMessage = document.querySelector("#submitMessage");
const leaderboardArea = document.querySelector("#leaderboard");

const darkModeCheckbox = document.querySelector("#darkMode");
const pressingKeySelect = document.querySelector("#pressingKey");

let pressingKey = "f";

let presses = 0;
let keyPressEligible = true;
let startingPressEligible = true;

let timeLeft = 5;
let timer = null;

// press listener
window.addEventListener("keydown", (event) => {
	if (event.key == pressingKey && keyPressEligible && startingPressEligible) {
		submitMessage.style.display = "none";
		pressAnimation();
		startTimer();

		presses++;
		pressesSpan.innerHTML = presses.toString() + " Presses";

		keyPressEligible = false;
	}
});
window.addEventListener("keyup", (event) => {
	keyPressEligible = event.key == pressingKey;
});

// animation on press
let colourTimeout;
function pressAnimation() {
	if (colourTimeout) clearInterval(colourTimeout);

	key.style.left = randint(-10, 10).toString() + "px";
	key.style.top = randint(-10, 10).toString() + "px";

	key.style.backgroundColor = "#00ff00";
	colourTimeout = setInterval(() => {
		key.style.backgroundColor = darkModeCheckbox.checked ? "#2b2b2b" : "#e6e6e6";
	}, 75);
}

// timer
function startTimer() {
	if (timer) return;
	
	timeLeft = 5;
	timer = setInterval(() => {
		timeLeft -= 0.01;
		timeSpan.innerHTML = timeLeft.toFixed(2) + " seconds left";

		if (timeLeft <= 0.01) {
			displayResults();
			clearInterval(timer);
			timer = null;
		}
	}, 10);
}

// display results after timer ends
async function displayResults() {
	startingPressEligible = false;
	
	scoreArea.style.display = "inline-block";
	scoreSpan.innerHTML = "Score: " + (presses / 5).toFixed(1) + " pps";
}

// reset game
resetButton.addEventListener("click", () => {
	startingPressEligible = true;
	presses = 0;

	scoreArea.style.display = "none";
	key.style.left = key.style.top = "0px";
	pressesSpan.innerHTML = "0 Presses";
	timeSpan.innerHTML = "5.00 seconds left";
});

// submit req
submitButton.addEventListener("click", () => {
	submitMessage.innerHTML = "Submitting...";
	submitMessage.style.display = "inline-block";
	fetch("/api/score", {
		"method": "POST",
		"headers": {
			"Content-Type": "application/json"
		},
		"body": JSON.stringify({
			"username": usernameInputBox.value,
			"score": presses / 5
		})
	}).then(res => {
		if (res.status == 200) {
			submitMessage.innerHTML = "You submitted your score!";
			fetchLeaderboard();
		} else if (usernameInputBox.value.length < 3) {
			submitMessage.innerHTML = "Username must be at least 3 letters.";
		} else if (usernameInputBox.value.length > 18) {
			submitMessage.innerHTML = "Username must be 18 letters or less.";
		} else if (res.status == 202) {
			submitMessage.innerHTML = "This username already has a better score.";
		} else {
			submitMessage.innerHTML = "Other submit error; check your Internet.";
		}
	});
});

// get leaderboard req
function fetchLeaderboard() {
	if (darkModeCheckbox.checked) {
		leaderboardArea.innerHTML = "<span class='mono' style='color: white;'>Loading...</span>";
	} else {
		leaderboardArea.innerHTML = "<span class='mono'>Loading...</span>";
	}
	
	fetch("/api/leaderboard").then(res => {
		res.json().then(leaderboard => {
			leaderboardArea.innerHTML = "";

			let scores = Object.keys(leaderboard)
				.sort((a, b) => leaderboard[b] - leaderboard[a])
				.slice(0, 10);
			let pos = 1;
			for (let username of scores) {
	
				let entry = document.createElement("span");
				entry.className = "mono";
				entry.style.fontSize = "20px";
				if (darkModeCheckbox.checked) {
					entry.style.color = "white";
				}
	
				let rank;
				if (pos == 1) {
					rank = "🥇";
				} else if (pos == 2) {
					rank = "🥈";
				} else if (pos == 3) {
					rank = "🥉";
				} else {
					rank = pos.toString();
				}
				
				entry.innerHTML = rank + ". " + username + " - " + leaderboard[username].toFixed(1) + " pps";
	
				leaderboardArea.appendChild(entry);
				leaderboardArea.appendChild(document.createElement("br"));
	
				pos++;
				
			}

			if (leaderboardArea.innerHTML.length == 0) {
				if (darkModeCheckbox.checked) {
					leaderboardArea.innerHTML = "<span class='mono' style='color: white;'>No scores :(</span>";
				} else {
					leaderboardArea.innerHTML = "<span class='mono'>No scores :(</span>";
				}
			}
			
		});
	}).catch(console.log);
}
fetchLeaderboard();

// settings
pressingKeySelect.addEventListener("change", () => {
	pressingKey = pressingKeySelect.value;
	keySpan.innerHTML = pressingKeySelect.value.toUpperCase();

	localStorage.setItem("wintrcat_typegame_key", pressingKey);
});

function setDarkMode(darkMode) {
	if (darkMode) {
		for (let span of document.querySelectorAll("span")) {
			if (!span.classList.contains("ignoreDarkMode")) span.style.color = "white";
		}
		key.style.border = "3px dashed white";
		key.style.backgroundColor = "#2b2b2b";
		document.body.style.backgroundColor = "#0a0a0a";
	} else {
		for (let span of document.querySelectorAll("span")) {
			if (!span.classList.contains("ignoreDarkMode")) span.style.color = "black";
		}
		key.style.border = "3px dashed black";
		key.style.backgroundColor = "#e6e6e6";
		document.body.style.backgroundColor = "#ffffff";
	}
	scoreSpan.style.color = "00db00";

	localStorage.setItem("wintrcat_typegame_darkmode", darkMode ? "true" : "false");
}

darkModeCheckbox.addEventListener("change", () => {
	setDarkMode(darkModeCheckbox.checked);
});

// load settings from local storage
let localDarkMode = localStorage.getItem("wintrcat_typegame_darkmode");
if (localDarkMode == null) {
	localDarkMode = false;
} else {
	localDarkMode = localDarkMode == "true";
}
setDarkMode(localDarkMode);
darkModeCheckbox.checked = localDarkMode;

let localPressingKey = localStorage.getItem("wintrcat_typegame_key");
if (localPressingKey == null) localPressingKey = "f";
pressingKey = localPressingKey;
keySpan.innerHTML = pressingKey.toUpperCase();
pressingKeySelect.value = pressingKey;