// Simple game template for ASCII browser adventure

const asciiArt = {
    introConsole: [
        "   _____________________________",
        "  |  Series 800 Starcraft      |",
        "  |---------------------------|",
        "  |  [o]   [o]   [o]   [o]    |",
        "  |                           |",
        "  |         [*]               |",
        "  |      Enter Name           |",
        "  |___________________________|"
    ].join("\n"),
    starfield: [
        "................................................................................",
        "................................................................................",
        "....................*.............*..................*.............*.............",
        "................................................................................",
        "   ____________________________________________________________________________  ",
        "  /                                                                            \\",
        " /   [o]   [o]   [o]   [o]   [o]   [o]   [o]   [o]   [o]   [o]   [o]   [o]      \\",
        "|------------------------------------------------------------------------------|",
        "|  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   |",
        "|                                                                              |",
        "|   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *  |",
        "|                                                                              |",
        "|   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *  |",
        "|                                                                              |",
        "|   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *  |",
        "|                                                                              |",
        "|   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *  |",
        "|______________________________________________________________________________|"
    ].join("\n"),
    bottomConsole: name => [
        "   _____________________________",
        "  |  Series 800 Starcraft      |",
        "  |---------------------------|",
        "  |  [o]   [o]   [o]   [o]    |",
        "  |                           |",
        `  |   Pilot: ${name.padEnd(18)}|`,
        "  |___________________________|"
    ].join("\n")
};

let starFrame = 0;
function getStarFieldArt() {
    // Animate stars by shifting their positions every frame
    const baseArt = asciiArt.console.split('\n');
    // Simple star animation: replace some '*' with ' ' and move them
    let animatedArt = baseArt.map((line, idx) => {
        if (line.includes('*')) {
            let chars = line.split('');
            for (let i = 0; i < chars.length; i++) {
                if (chars[i] === '*') {
                    // Move star horizontally based on frame and line
                    let offset = (starFrame + idx + i) % 3;
                    chars[i] = offset === 0 ? '*' : ' ';
                }
            }
            return chars.join('');
        }
        return line;
    });
    return animatedArt.join('\n');
}

let playerName = '';
let fuel = 0;
let currentScene = 'intro';

function renderIntro() {
    document.getElementById('ascii').textContent = asciiArt.introConsole;
    document.getElementById('output').textContent =
        "You awake slowly on the cold metal floor of a dimly lit metal box. A small console blinks in front of you.";
    document.getElementById('name-entry').style.display = 'block';
    document.getElementById('input').style.display = 'none';
    document.getElementById('fuel-count').style.display = 'none';
    document.getElementById('fuel-btn').style.display = 'none';
    document.getElementById('save-btn').style.display = 'none';
    document.getElementById('load-btn').style.display = 'none';
    // Animate yellow beeping light
    let beepOn = true;
    if (window.beepInterval) clearInterval(window.beepInterval);
    window.beepInterval = setInterval(() => {
        let art = asciiArt.introConsole.split("\n");
        art[5] = beepOn ? "  |         [*]               |" : "  |         [ ]               |";
        document.getElementById('ascii').textContent = art.join("\n");
        beepOn = !beepOn;
    }, 500);
}

function startGame() {
    document.getElementById('name-entry').style.display = 'none';
    document.getElementById('input').style.display = 'block';
    currentScene = 'starfield';
    if (window.beepInterval) clearInterval(window.beepInterval);
    renderStarfield();
}

function renderConsole() {
    // Not used anymore, replaced by renderStarfield
}

function renderStarfield() {
    // Animate starfield and show console at bottom
    function drawScene() {
        let baseArt = asciiArt.starfield.split("\n");
        let animatedArt = baseArt.map((line, idx) => {
            if (line.includes('*')) {
                let chars = line.split('');
                for (let i = 0; i < chars.length; i++) {
                    if (chars[i] === '*') {
                        let offset = (starFrame + idx + i) % 3;
                        chars[i] = offset === 0 ? '*' : ' ';
                    }
                }
                return chars.join('');
            }
            return line;
        });
        // Add console at bottom
        animatedArt.push(asciiArt.bottomConsole(playerName));
        document.getElementById('ascii').textContent = animatedArt.join("\n");
        document.getElementById('fuel-count').textContent = 'Fuel: ' + fuel;
        document.getElementById('fuel-count').style.display = 'inline-block';
        document.getElementById('fuel-btn').style.display = 'inline-block';
        document.getElementById('save-btn').style.display = 'inline-block';
        document.getElementById('load-btn').style.display = 'inline-block';
    }
    document.getElementById('output').textContent =
        'Stars drift by outside the glass.\nType a command to begin.';
    document.getElementById('input').value = '';
    // Prevent multiple intervals
    if (window.starfieldInterval) {
        clearInterval(window.starfieldInterval);
        window.starfieldInterval = null;
    }
    window.starfieldInterval = setInterval(() => {
        starFrame++;
        if (currentScene === 'starfield') drawScene();
    }, 300);
    drawScene();
}

function handleInput(e) {
    if (e.key === 'Enter') {
        const value = e.target.value.trim().toLowerCase();
        if (currentScene === 'console') {
            // Example: respond to basic commands
            if (value === 'look') {
                document.getElementById('output').textContent += "\nYou see blinking lights and drifting stars.";
            } else if (value === 'help') {
                document.getElementById('output').textContent += "\nTry commands like 'look', 'scan', 'status'.";
            } else {
                document.getElementById('output').textContent += "\nUnknown command. Try 'help'.";
            }
        }
    }
}

function handleNameSubmit() {
    const nameInput = document.getElementById('name-input');
    const name = nameInput.value.trim();
    if (name) {
        playerName = name;
        startGame();
    } else {
        document.getElementById('output').textContent += "\nPlease enter a name.";
    }
}

function saveGame() {
    const state = { currentScene, playerName };
    localStorage.setItem('asciiGameSave', JSON.stringify(state));
    document.getElementById('output').textContent += "\nGame saved!";
}

function loadGame() {
    const state = JSON.parse(localStorage.getItem('asciiGameSave'));
    if (state && state.currentScene) {
        currentScene = state.currentScene;
        playerName = state.playerName || '';
        if (currentScene === 'console') {
            document.getElementById('name-entry').style.display = 'none';
            document.getElementById('input').style.display = 'block';
            renderConsole();
            document.getElementById('output').textContent += "\nGame loaded!";
        } else {
            renderIntro();
            document.getElementById('output').textContent += "\nGame loaded!";
        }
    } else {
        document.getElementById('output').textContent += "\nNo saved game found.";
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('input').addEventListener('keydown', handleInput);
    document.getElementById('save-btn').addEventListener('click', showSaveScreen);
    document.getElementById('load-btn').addEventListener('click', showLoadScreen);
    document.getElementById('fuel-btn').addEventListener('click', () => {
        fuel++;
        document.getElementById('fuel-count').textContent = 'Fuel: ' + fuel;
    });
    document.getElementById('name-submit').addEventListener('click', handleNameSubmit);
    document.getElementById('name-input').addEventListener('keydown', function(e) {
        if (e.key === 'Enter') handleNameSubmit();
    });
    document.getElementById('savefile-submit').addEventListener('click', saveGame);
    document.getElementById('loadfile-select').addEventListener('change', loadGame);
    document.getElementById('deletefile-btn').addEventListener('click', deleteSaveFile);
    renderIntro();
});

function deleteSaveFile() {
    const select = document.getElementById('loadfile-select');
    const key = select.value;
    if (!key) return;
    if (confirm('Delete save "' + key.replace('asciiGameSave_','') + '" permanently?')) {
        localStorage.removeItem(key);
        // Refresh the select list
        let options = '<option value="">Select a save...</option>';
        for (let i = 0; i < localStorage.length; i++) {
            let k = localStorage.key(i);
            if (k.startsWith('asciiGameSave_')) {
                options += `<option value="${k}">${k.replace('asciiGameSave_','')}</option>`;
            }
        }
        select.innerHTML = options;
    }
}

function showSaveScreen() {
    document.getElementById('savefile-screen').style.display = 'block';
    document.getElementById('savefile-input').value = '';
}

function saveGame() {
    const saveName = document.getElementById('savefile-input').value.trim();
    if (!saveName) return;
    const state = { currentScene, playerName, fuel };
    localStorage.setItem('asciiGameSave_' + saveName, JSON.stringify(state));
    document.getElementById('savefile-screen').style.display = 'none';
    alert('Game saved as "' + saveName + '"!');
}

function showLoadScreen() {
    document.getElementById('loadfile-screen').style.display = 'block';
    const listDiv = document.getElementById('loadfile-list');
    let html = '';
    let found = false;
    for (let i = 0; i < localStorage.length; i++) {
        let key = localStorage.key(i);
        if (key.startsWith('asciiGameSave_')) {
            found = true;
            let saveName = key.replace('asciiGameSave_','');
            html += `<div style="display:flex;align-items:center;margin-bottom:6px;">
                <button style="margin-right:8px;" data-key="${key}" class="load-save-btn">Load</button>
                <span style="flex:1;">${saveName}</span>
                <button style="color:#ff4444;font-weight:bold;" data-key="${key}" class="delete-save-btn">&#10006;</button>
            </div>`;
        }
    }
    if (!found) html = '<em>No saves found.</em>';
    listDiv.innerHTML = html;
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('input').addEventListener('keydown', handleInput);
    document.getElementById('save-btn').addEventListener('click', showSaveScreen);
    document.getElementById('load-btn').addEventListener('click', showLoadScreen);
    document.getElementById('fuel-btn').addEventListener('click', () => {
        fuel++;
        document.getElementById('fuel-count').textContent = 'Fuel: ' + fuel;
    });
    document.getElementById('name-submit').addEventListener('click', handleNameSubmit);
    document.getElementById('name-input').addEventListener('keydown', function(e) {
        if (e.key === 'Enter') handleNameSubmit();
    });
    document.getElementById('savefile-submit').addEventListener('click', saveGame);
    document.getElementById('loadfile-list').addEventListener('click', function(e) {
        if (e.target.classList.contains('load-save-btn')) {
            loadNamedGame(e.target.getAttribute('data-key'));
        } else if (e.target.classList.contains('delete-save-btn')) {
            deleteNamedGame(e.target.getAttribute('data-key'));
        }
    });
    // Only render intro if not restoring a loaded game
    if (!window.__loadedFromSave) {
        renderIntro();
    }
});

function loadNamedGame(key) {
    const state = JSON.parse(localStorage.getItem(key));
    if (state && state.currentScene) {
        currentScene = state.currentScene;
        playerName = state.playerName || '';
        fuel = state.fuel || 0;
        document.getElementById('loadfile-screen').style.display = 'none';
        window.__loadedFromSave = true;
        if (currentScene === 'starfield') {
            renderStarfield();
        } else {
            renderIntro();
        }
    } else {
        alert('No saved game found.');
    }
}

function deleteNamedGame(key) {
    if (confirm('Delete save "' + key.replace('asciiGameSave_','') + '" permanently?')) {
        localStorage.removeItem(key);
        showLoadScreen();
    }
}