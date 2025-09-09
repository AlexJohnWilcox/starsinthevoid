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
        "|                                                                              |",
        "|   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *  |",
        "|                                                                              |",
        "|   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *  |",
        "|                                                                              |",
        "|   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *  |",
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
    bottomConsole: (name, ly) => [
        "   _____________________________",
        "  |  Series 800 Starcraft      |",
        "  |---------------------------|",
        "  |  [o]   [o]   [o]   [o]    |",
        "  |                           |",
        `  |   Pilot: ${name.padEnd(18)}|`,
        `  |   Ly: ${ly.toString().padEnd(20)}|`,
        "  |___________________________|"
    ].join("\n")
};

let starFrame = 0;
let beepOn = true;
function generateRandomStarfield(width = 100, height = 14, starDensity = 0.07) {
    let field = [];
    for (let y = 0; y < height; y++) {
        let line = '';
        for (let x = 0; x < width; x++) {
            if (Math.random() < starDensity) {
                line += '*';
            } else {
                line += ' ';
            }
        }
        field.push(line);
    }
    return field;
}

function getStarFieldArt() {
    // Generate a random starfield each frame
    const width = 100;
    const height = 14;
    let starfield = generateRandomStarfield(width, height);
    // Add a box around the starfield
    let topBorder = '┌' + '─'.repeat(width) + '┐';
    let bottomBorder = '└' + '─'.repeat(width) + '┘';
    let boxedStarfield = [topBorder];
    for (let line of starfield) {
        boxedStarfield.push('│' + line + '│');
    }
    boxedStarfield.push(bottomBorder);
    // Add the console at the bottom, centered
    let consoleArt = asciiArt.bottomConsole(playerName, lyGauge).split('\n');
    let consoleWidth = Math.max(...consoleArt.map(l => l.length));
    let leftPad = Math.floor((width - consoleWidth) / 2);
    let rightPad = width - consoleWidth - leftPad;
    consoleArt = consoleArt.map(line => ' '.repeat(leftPad) + line + ' '.repeat(rightPad));
    return [...boxedStarfield, ...consoleArt].join('\n');
}

let playerName = '';
let fuel = 0;
let currentScene = 'intro';
let lyGauge = 0;
let lyInterval = null;
let fuelLoreShown = false;

function addLoreMessage(msg) {
    const loreText = document.getElementById('lore-text');
    if (!loreText) {
        console.warn('No lore-text element found!');
        return;
    }
    const div = document.createElement('div');
    div.textContent = msg;
    div.style.opacity = '0';
    div.style.transition = 'opacity 0.7s';
    div.style.fontFamily = 'inherit';
    div.style.fontSize = '18px';
    div.style.background = 'none';
    div.style.padding = '0';
    div.style.margin = '0';
    // Insert at the top
    loreText.insertBefore(div, loreText.firstChild);
    setTimeout(() => { div.style.opacity = '1'; }, 50);
}

function renderIntro() {
    lyGauge = 0;
    if (lyInterval) {
        clearInterval(lyInterval);
        lyInterval = null;
    }
    // Hide fuel section on starter screen
    const fuelSection = document.getElementById('fuel-section');
    if (fuelSection) fuelSection.style.display = 'none';
    document.getElementById('ascii').textContent = asciiArt.introConsole;
    document.getElementById('output').textContent = '';
    document.getElementById('name-entry').style.display = 'block';
    document.getElementById('save-btn').style.display = 'none';
    document.getElementById('load-btn').style.display = 'none';
    // Animate yellow beeping light
    beepOn = true;
    if (window.beepInterval) clearInterval(window.beepInterval);
    window.beepInterval = setInterval(() => {
        let art = asciiArt.introConsole.split("\n");
        art[5] = beepOn ? "  |         [*]               |" : "  |         [ ]               |";
        document.getElementById('ascii').textContent = art.join("\n");
        beepOn = !beepOn;
    }, 500);
    // Show first lore message
    setTimeout(() => {
        addLoreMessage('You awake slowly on the cold metallic floor of a dimly lit metal box. A small console blinks in front of you.');
    }, 0);
}

function startGame() {
    document.getElementById('name-entry').style.display = 'none';
    currentScene = 'starfield';
    if (window.beepInterval) clearInterval(window.beepInterval);
    renderStarfield();
    setTimeout(() => {
        const bottomBubble = document.getElementById('bottom-bubble');
        if (bottomBubble) bottomBubble.style.display = 'block';
    }, 5000);
}

function renderStarfield() {
    // Show fuel section on main game screen after 5 seconds
    const fuelSection = document.getElementById('fuel-section');
    if (fuelSection) fuelSection.style.display = 'none'; // Hide initially
    // Hide bottom bubble initially
    const bottomBubble = document.getElementById('bottom-bubble');
    if (bottomBubble) bottomBubble.style.display = 'none';
    // Animate starfield and show console at bottom
    function drawScene() {
        document.getElementById('ascii').textContent = getStarFieldArt();
        document.getElementById('fuel-count').textContent = 'Fuel: ' + fuel;
        document.getElementById('fuel-count').style.display = 'inline-block';
        document.getElementById('fuel-btn').style.display = 'inline-block';
        document.getElementById('save-btn').style.display = 'inline-block';
        document.getElementById('load-btn').style.display = 'inline-block';
    }
    // Start Ly gauge interval
    if (lyInterval) clearInterval(lyInterval);
    lyInterval = setInterval(() => {
        if (fuel > 0) {
            lyGauge++;
            fuel--;
            document.getElementById('fuel-count').textContent = 'Fuel: ' + fuel;
            drawScene();
        }
    }, 1000);
    // Lore messages in order
    setTimeout(() => {
        addLoreMessage('You press down on the metallic keys, spelling out your name. After a moment, the console beeps and the viewport shifts to reveal a starfield outside.');
    }, 0);
    setTimeout(() => {
        addLoreMessage("After gathering yourself and belongings you look around and find an old dark matter centrifuge from the 2100's. Looks like it still works...");
        if (fuelSection) fuelSection.style.display = 'flex';
        if (bottomBubble) bottomBubble.style.display = 'flex';
    }, 5000);
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
        // Only renderIntro, no input box or console
        renderIntro();
        document.getElementById('output').textContent += "\nGame loaded!";
    } else {
        document.getElementById('output').textContent += "\nNo saved game found.";
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('save-btn').addEventListener('click', showSaveScreen);
    document.getElementById('load-btn').addEventListener('click', showLoadScreen);
    document.getElementById('fuel-btn').addEventListener('click', () => {
        fuel++;
        document.getElementById('fuel-count').textContent = 'Fuel: ' + fuel;
        // Show lore message only on first click
        if (!fuelLoreShown) {
            addLoreMessage('Upon activation the centrifuge whirls to life with a cacophony of metallic clangs and dark matter begins pouring into the crucible in liquid form.');
            fuelLoreShown = true;
        }
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

    // Menu button dropdown logic
    const menuBtn = document.getElementById('menu-btn');
    if (menuBtn) {
        menuBtn.addEventListener('click', function() {
            const dropdown = document.getElementById('menu-dropdown');
            if (dropdown) {
                dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
            }
        });
    }
    // New Game button logic
    const newGameBtn = document.getElementById('newgame-btn');
    if (newGameBtn) {
        newGameBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to start a new game? This will erase your current progress.')) {
                // Reset game state
                playerName = '';
                fuel = 0;
                currentScene = 'intro';
                // Hide dropdown
                const dropdown = document.getElementById('menu-dropdown');
                if (dropdown) dropdown.style.display = 'none';
                renderIntro();
            }
        });
    }

    // Always start fresh on page load
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
    if (!found) {
        html = '<em>No saves found.</em>';
        listDiv.innerHTML = html;
        setTimeout(() => {
            document.getElementById('loadfile-screen').style.display = 'none';
        }, 2000);
    } else {
        listDiv.innerHTML = html;
    }
}

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