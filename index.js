let loadItem = (item) => window.localStorage.getItem(item);
let saveItem = (item, value) => window.localStorage.setItem(item, value);
let lastUpdate = Date.now();

async function getScore(word) {
    try {
        let response = await fetch("/score", {
            method: "POST",
            body: "word=" + word,
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
        });

        let guessData = await response.json();
        guessData.word = word;
        guessData.score = [guessData.score * 100, guessData.percentile];
        return guessData;
    } catch (e) {
        return null;
    }
}

async function guessWord(guess, appGame) {
    guess = guess.replace(/[^-\p{L}\p{N}]/gu, "");
    if (guess.length == 0) return false;

    guess = guess.toLowerCase();
    appGame.input[0] = guess;
    appGame.input.unshift("");
    appGame.input = appGame.input.slice(0, 21);
    appGame.inputIdx = 0;

    let guessData = await getScore(guess);

    if (!guessData) {
        console.log("Une erreur s´est produite.");
    }

    recordGuess(appGame, guess, guessData.word, guessData.score);

    return false;
}

function recordGuess(appGame, guess, word, score) {
    appGame.guessCount++;
    appGame.guesses[guess] = [appGame.guessCount, score];
    if (guess != word) appGame.guesses[word] = [appGame.guessCount, score];

    saveItem("guesses", JSON.stringify(appGame.guesses));
}

let appGame = {
    puzzleNumber: 137,
    utcOffset: 7200,
    active: true,
    appTitle: "cémantix",
    appName: "cemantix",
    prefix: "",
    apiPrefix: "",
    url: "https://cemantix.herokuapp.com/",
    inited: true,
    storePrefix: "",
    guesses: JSON.parse(loadItem("guesses")) || {},
    secret: null,
    guessCount: 3,
    nTries: 2,
    ranking: 0,
    cacheHistory: [],
    input: [""],
    inputIdx: 0,
    solvers: 0,
    teamRef: null,
    teamCode: "",
    teamMembers: "",
    teamTwitter: false,
    syncRef: null,
};

var wordList = [
    "test",
    "ce",
    "n",
    "est",
    "pas",
    "de",
    "la",
    "triche",
    "juste",
    "un",
    "moyen",
    "d",
    "aller",
    "plus",
    "vite",
];

await Promise.all(
    wordList.map(async (word) => {
        await guessWord(word, appGame);
    })
);
