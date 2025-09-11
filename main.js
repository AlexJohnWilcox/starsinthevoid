// ASCII Adventure Game - Clean, Single-Slot Version
// Requires lore.js for LORE_MESSAGES array

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
        "|                                                                              |",
        "|   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *  |",
        "|                                                                              |",
        "|   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *  |",
        "|                                                                              |",
        "|   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *  |",
        "|______________________________________________________________________________|"
    ].join("\n"),
    bottomConsole: function(name, ly) {
        return [
            "   _____________________________",
            "  |  Series 800 Starcraft      |",
            "  |---------------------------|",
            "  |  [o]   [o]   [o]   [o]    |",
            "  |                           |",
            `  |   Pilot: ${name.padEnd(18)}|`,
            `  |   Ly: ${ly.toString().padEnd(20)}|`,
            "  |___________________________|"
        ].join("\n");
    }
};

let playerName = '';
let fuel = 0;
let currentScene = 'intro';
let lyGauge = 0;
let lyInterval = null;
let fuelLoreShown = false;
let starFrame = 0;
let beepOn = true;
let lyConversionOn = true;

function getSaveData() {
    const raw = localStorage.getItem('asciiSaveSlot');
    return raw ? JSON.parse(raw) : null;
}
function setSaveData(data) {
    localStorage.setItem('asciiSaveSlot', JSON.stringify(data));
}
function saveGame() {
    setSaveData({ playerName, fuel, currentScene, lyGauge, fuelLoreShown });
    // Save lore messages
    const loreText = document.getElementById('lore-text');
    if (loreText) {
        localStorage.setItem('asciiLoreText', loreText.innerHTML);
    }
    const msg = document.getElementById('save-msg');
    if (msg) {
        msg.style.display = 'block';
        setTimeout(() => { msg.style.display = 'none'; }, 1200);
    }
}

function restoreLoreText() {
    const loreText = document.getElementById('lore-text');
    const savedLore = localStorage.getItem('asciiLoreText');
    if (loreText && savedLore) {
        loreText.innerHTML = savedLore;
    }
}

function loadGame() {
    const data = getSaveData();
    if (data) {
        playerName = data.playerName;
        fuel = data.fuel || 0;
        currentScene = data.currentScene || 'intro';
        lyGauge = data.lyGauge || 0;
        fuelLoreShown = !!data.fuelLoreShown;
        restoreLoreText();
        if (currentScene === 'starfield') {
            renderStarfield(true);
        } else {
            renderIntro();
        }
    } else {
        renderIntro();
    }
}

function addLoreMessage(msg) {
    const loreText = document.getElementById('lore-text');
    if (!loreText) return;
    const div = document.createElement('div');
    div.textContent = msg;
    div.style.opacity = '0';
    div.style.transition = 'opacity 0.7s';
    div.style.fontFamily = 'inherit';
    div.style.fontSize = '18px';
    div.style.background = 'none';
    div.style.padding = '0';
    div.style.margin = '0 0 36px 0';
    loreText.insertBefore(div, loreText.firstChild);
    setTimeout(() => { div.style.opacity = '1'; }, 50);
}

function renderIntro() {
    lyGauge = 0;
    if (lyInterval) { clearInterval(lyInterval); lyInterval = null; }
    const fuelSection = document.getElementById('fuel-section');
    if (fuelSection) fuelSection.style.display = 'none';
    document.getElementById('ascii').textContent = asciiArt.introConsole;
    document.getElementById('output').textContent = '';
    document.getElementById('name-entry').style.display = 'block';
    beepOn = true;
    if (window.beepInterval) clearInterval(window.beepInterval);
    window.beepInterval = setInterval(() => {
        let art = asciiArt.introConsole.split("\n");
        art[5] = beepOn ? "  |         [*]               |" : "  |         [ ]               |";
        document.getElementById('ascii').textContent = art.join("\n");
        beepOn = !beepOn;
    }, 500);
    const loreText = document.getElementById('lore-text');
    if (loreText) loreText.innerHTML = '';
    setTimeout(() => {
        addLoreMessage(LORE_MESSAGES ? LORE_MESSAGES[0] : 'You awake slowly on the cold metallic floor of a dimly lit metal box. A small console blinks in front of you.');
    }, 0);

    // Hide DM->Ly toggle in intro
    const lySwitch = document.getElementById('ly-switch');
    if (lySwitch) lySwitch.parentElement.style.display = 'none';
}

function handleNameSubmit() {
    const nameInput = document.getElementById('name-input');
    const name = nameInput.value.trim();
    if (name) {
        playerName = name;
        currentScene = 'starfield';
        if (window.beepInterval) clearInterval(window.beepInterval);
        renderStarfield(false);
        const bottomBubble = document.getElementById('bottom-bubble');
        if (bottomBubble) bottomBubble.style.display = 'block';
        const fuelSection = document.getElementById('fuel-section');
        if (fuelSection) fuelSection.style.display = 'none';
        setTimeout(() => {
            fuel = 0;
            if (fuelSection) {
                fuelSection.style.display = 'flex';
                const fuelCount = document.getElementById('fuel-count');
                if (fuelCount) fuelCount.textContent = 'Fuel: ' + fuel;
            }
            addLoreMessage(LORE_MESSAGES ? LORE_MESSAGES[2] : "After gathering yourself and belongings you look around and find an old dark matter centrifuge from the 2100's. Looks like it still works... The fuel button is now available.");
        }, 5000);
    }
}

function generateRandomStarfield(width = 100, height = 14, starDensity = 0.07) {
    let field = [];
    for (let y = 0; y < height; y++) {
        let line = '';
        for (let x = 0; x < width; x++) {
            line += Math.random() < starDensity ? '*' : ' ';
        }
        field.push(line);
    }
    return field;
}

function getStarFieldArt() {
    const width = 100;
    const height = 14;
    let starfield = generateRandomStarfield(width, height);
    let topBorder = '┌' + '─'.repeat(width) + '┐';
    let bottomBorder = '└' + '─'.repeat(width) + '┘';
    let boxedStarfield = [topBorder];
    for (let line of starfield) {
        boxedStarfield.push('│' + line + '│');
    }
    boxedStarfield.push(bottomBorder);
    let consoleArt = asciiArt.bottomConsole(playerName, lyGauge).split('\n');
    let consoleWidth = Math.max(...consoleArt.map(l => l.length));
    let leftPad = Math.floor((width - consoleWidth) / 2);
    let rightPad = width - consoleWidth - leftPad;
    consoleArt = consoleArt.map(line => ' '.repeat(leftPad) + line + ' '.repeat(rightPad));
    return [...boxedStarfield, ...consoleArt].join('\n');
}

function renderStarfield(skipIntroLore = false) {
    const fuelSection = document.getElementById('fuel-section');
    const bottomBubble = document.getElementById('bottom-bubble');
    // Show DM->Ly toggle in starfield
    const lySwitch = document.getElementById('ly-switch');
    if (lySwitch) lySwitch.parentElement.style.display = 'flex';

    if (skipIntroLore) {
        if (fuelSection) fuelSection.style.display = 'flex';
        if (bottomBubble) {
            bottomBubble.style.display = 'block';
            bottomBubble.style.position = 'relative';
            bottomBubble.style.left = '';
            bottomBubble.style.right = '';
            bottomBubble.style.top = '';
            bottomBubble.style.transform = '';
            bottomBubble.style.margin = '32px auto 0 auto';
        }
    } else {
        if (fuelSection) fuelSection.style.display = 'none';
        if (bottomBubble) bottomBubble.style.display = 'none';
    }
    function drawScene() {
        document.getElementById('ascii').textContent = getStarFieldArt();
        const fuelBtn = document.getElementById('fuel-btn');
        const fuelCount = document.getElementById('fuel-count');
        if (fuelBtn && fuelCount && bottomBubble) {
            fuelBtn.style.position = 'absolute';
            fuelBtn.style.top = '12px';
            fuelBtn.style.left = '12px';
            fuelBtn.style.margin = '0';
            fuelBtn.style.display = 'inline-block';
            fuelCount.style.position = 'absolute';
            fuelCount.style.top = '12px';
            fuelCount.style.left = (fuelBtn.offsetWidth + 24) + 'px';
            fuelCount.style.margin = '0';
            fuelCount.style.display = 'inline-block';
            bottomBubble.style.position = 'relative';
        } else {
            if (fuelCount) fuelCount.style.display = 'inline-block';
            if (fuelBtn) fuelBtn.style.display = 'inline-block';
        }
        fuelCount.textContent = 'Fuel: ' + fuel;
        if (lyGauge === 50 && !window.__ly50LoreShown) {
            addLoreMessage(LORE_MESSAGES ? LORE_MESSAGES[3] : "The console reads [50 Ly from Origin], you glance up at the viewport as stars fly by wondering how you ended up here, and why you can't see any planets...");
            window.__ly50LoreShown = true;
        }
    }
    if (lyInterval) clearInterval(lyInterval);
    lyInterval = setInterval(() => {
        if (fuel > 0 && lyConversionOn) {
            lyGauge++;
            fuel--;
            document.getElementById('fuel-count').textContent = 'Fuel: ' + fuel;
            drawScene();
        }
    }, 1000);
    if (!skipIntroLore && typeof LORE_MESSAGES !== 'undefined') {
        setTimeout(() => {
            addLoreMessage(LORE_MESSAGES[1]);
        }, 0);
        // Removed duplicate 5s lore message
    }
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

function clearSaveData() {
    localStorage.removeItem('asciiSaveSlot');
}

document.addEventListener('DOMContentLoaded', () => {
    const data = getSaveData();
    if (data) {
        loadGame();
    } else {
        renderIntro();
    }
    document.getElementById('save-slot-btn').onclick = saveGame;
    document.getElementById('wipe-save-btn').onclick = () => {
        clearSaveData();
        location.reload();
    };
    document.getElementById('name-submit').onclick = handleNameSubmit;
    document.getElementById('name-input').addEventListener('keydown', function(e) {
        if (e.key === 'Enter') handleNameSubmit();
    });
    document.getElementById('fuel-btn').onclick = () => {
        fuel++;
        document.getElementById('fuel-count').textContent = 'Fuel: ' + fuel;
        if (!fuelLoreShown) {
            addLoreMessage('Upon activation the centrifuge whirls to life with a cacophony of metallic clangs and dark matter begins pouring into the crucible in liquid form.');
            fuelLoreShown = true;
        }
    };
    document.getElementById('ly-switch').onchange = function() {
        lyConversionOn = this.checked;
    };
});