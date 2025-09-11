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
let lyConversionOn = true; // DM->Ly conversion active when true
// DOM cache refs (assigned on demand)
let lyToggleWrapper = null;
let coPilotPurchased = false;
let coPilotActive = false;
let coPilotButtonAdded = false;
let coPilotSwitch = null;
let autoDMInterval = null;
let milestone50LoreShown = false; // only controls lore line (button is idempotent)
let coPilotOnlineLoreShown = false; // ensure online lore shows only once
let milestone50Fired = false; // fires exactly once when Ly crosses 50
let lookAroundLoreShown = false; // prevents duplicate environment lore

function getSaveData() {
    const raw = localStorage.getItem('asciiSaveSlot');
    if (!raw) return null;
    try {
        return JSON.parse(raw);
    } catch (e) {
        console.warn('Corrupted save detected. Removing.', e);
        localStorage.removeItem('asciiSaveSlot');
        return null;
    }
}
function setSaveData(data) {
    localStorage.setItem('asciiSaveSlot', JSON.stringify(data));
}
function saveGame() {
    const lySwitchEl = document.getElementById('ly-switch');
    if (lySwitchEl) lyConversionOn = lySwitchEl.checked;
    setSaveData({ playerName, fuel, currentScene, lyGauge, fuelLoreShown, lyConversionOn, milestone50LoreShown, coPilotPurchased, coPilotActive, coPilotButtonAdded, coPilotOnlineLoreShown, milestone50Fired, lookAroundLoreShown });
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
        lyConversionOn = (typeof data.lyConversionOn === 'boolean') ? data.lyConversionOn : lyConversionOn;
        milestone50LoreShown = !!data.milestone50LoreShown;
        coPilotPurchased = !!data.coPilotPurchased;
        coPilotActive = !!data.coPilotActive;
        coPilotButtonAdded = !!data.coPilotButtonAdded;
    coPilotOnlineLoreShown = !!data.coPilotOnlineLoreShown;
    milestone50Fired = !!data.milestone50Fired || lyGauge >= 50; // infer if already past
    lookAroundLoreShown = !!data.lookAroundLoreShown;
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
    if (!lyToggleWrapper) lyToggleWrapper = document.getElementById('ly-toggle-wrapper');
    if (lyToggleWrapper) lyToggleWrapper.style.display = 'none';
}

function handleNameSubmit() {
    const nameInput = document.getElementById('name-input');
    const name = nameInput.value.trim();
    if (name) {
        playerName = name;
        currentScene = 'starfield';
        if (window.beepInterval) clearInterval(window.beepInterval);
    // Hide name entry UI after successful submission
    const nameEntry = document.getElementById('name-entry');
    if (nameEntry) nameEntry.style.display = 'none';
    nameInput.value = '';
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
            // environment lore handled in renderStarfield delayed reveal; removed duplicate here
        }, 5000);
    }
}

function ensureLyToggle() {
    if (!lyToggleWrapper) lyToggleWrapper = document.getElementById('ly-toggle-wrapper');
    if (!lyToggleWrapper) return;
    lyToggleWrapper.style.display = 'block';
    const lySwitch = document.getElementById('ly-switch');
    if (lySwitch && !lySwitch.__wired) {
        lySwitch.addEventListener('change', e => {
            lyConversionOn = e.target.checked;
        });
        lySwitch.__wired = true;
    }
    if (lySwitch) lySwitch.checked = lyConversionOn; // reflect saved state
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

function fireMilestone50() {
    if (lyGauge < 50) return; // milestone not reached yet
    const upgrades = document.getElementById('upgrades');
    // Show lore only once
    if (!milestone50Fired || !milestone50LoreShown) {
        addLoreMessage('The console begins humming and a gauge reads [50 Ly from Origin] - you notice a new lever that reads "Ship Co-Pilot"');
        milestone50LoreShown = true;
        milestone50Fired = true; // mark after lore
    }
    if (!upgrades) {
        // If upgrades container not yet in DOM, retry soon until mounted
        const retry = setInterval(() => {
            const up = document.getElementById('upgrades');
            if (up) {
                clearInterval(retry);
                if (!coPilotPurchased) {
                    let existing = document.getElementById('copilot-buy-btn');
                    if (!existing) createCoPilotPurchaseButton(up);
                }
                else if (coPilotPurchased && !coPilotSwitch) createCoPilotSwitch();
            }
        }, 200);
        return;
    }
    if (!coPilotPurchased) {
        let existing = document.getElementById('copilot-buy-btn');
        if (!existing) createCoPilotPurchaseButton(upgrades);
    }
    else if (coPilotPurchased && !coPilotSwitch) createCoPilotSwitch();
}

function createCoPilotPurchaseButton(upgrades) {
    const btn = document.createElement('button');
    btn.id = 'copilot-buy-btn';
    btn.textContent = 'Ship Co-Pilot: 100 DM';
    btn.style.fontSize = '14px';
    btn.style.padding = '6px 14px';
    btn.style.background = '#444';
    btn.style.color = '#fff';
    btn.style.border = 'none';
    btn.style.borderRadius = '6px';
    btn.style.boxShadow = '0 2px 8px #000a';
    btn.addEventListener('click', () => {
        if (fuel >= 100 && !coPilotPurchased) {
            fuel -= 100;
            document.getElementById('fuel-count').textContent = 'Fuel: ' + fuel;
            coPilotPurchased = true;
            btn.remove();
            createCoPilotSwitch();
        }
    });
    upgrades.appendChild(btn);
    coPilotButtonAdded = true;
}

function createCoPilotSwitch() {
    const upgrades = document.getElementById('upgrades');
    if (!upgrades) return;
    coPilotSwitch = document.createElement('button');
    coPilotSwitch.id = 'copilot-switch-btn';
    coPilotSwitch.textContent = 'Ship Co-Pilot: OFF';
    coPilotSwitch.style.fontSize = '14px';
    coPilotSwitch.style.padding = '6px 14px';
    coPilotSwitch.style.background = '#555';
    coPilotSwitch.style.color = '#fff';
    coPilotSwitch.style.border = 'none';
    coPilotSwitch.style.borderRadius = '6px';
    coPilotSwitch.style.boxShadow = '0 2px 8px #000a';
    coPilotSwitch.addEventListener('click', toggleCoPilotActive);
    upgrades.appendChild(coPilotSwitch);
}

function toggleCoPilotActive() {
    coPilotActive = !coPilotActive;
    if (coPilotSwitch) {
        coPilotSwitch.textContent = 'Ship Co-Pilot: ' + (coPilotActive ? 'ON' : 'OFF');
        coPilotSwitch.style.background = coPilotActive ? '#2c6' : '#555';
    }
    if (coPilotActive) {
        if (!coPilotOnlineLoreShown) {
            addLoreMessage('[COPILOT ONLINE - BEGINNING AUTOMATIC CENTRIFUGE DUMP]');
            coPilotOnlineLoreShown = true;
        }
        if (autoDMInterval) clearInterval(autoDMInterval);
        autoDMInterval = setInterval(() => {
            // Auto-generate DM (fuel) at +2 per second
            fuel += 2;
            const fc = document.getElementById('fuel-count');
            if (fc) fc.textContent = 'Fuel: ' + fuel;
        }, 1000);
    } else {
        if (autoDMInterval) { clearInterval(autoDMInterval); autoDMInterval = null; }
    }
}

function renderStarfield(skipIntroLore = false) {
    const fuelSection = document.getElementById('fuel-section');
    const bottomBubble = document.getElementById('bottom-bubble');
    // Hide DM->Ly toggle initially; it will appear after 5s with fuel UI
    if (!lyToggleWrapper) lyToggleWrapper = document.getElementById('ly-toggle-wrapper');
    if (lyToggleWrapper) lyToggleWrapper.style.display = 'none';

    // Show the materials bubble (bottomBubble) immediately
    if (bottomBubble) {
        bottomBubble.style.display = 'block';
        bottomBubble.style.position = 'relative';
        bottomBubble.style.left = '';
        bottomBubble.style.right = '';
        bottomBubble.style.top = '';
        bottomBubble.style.transform = '';
        bottomBubble.style.margin = '32px auto 0 auto';
    }

    // Hide fuel section initially
    if (fuelSection) fuelSection.style.display = 'none';

    if (skipIntroLore) {
        // Loaded from save: show immediately (no delay, keep existing fuel amount)
        if (fuelSection) {
            fuelSection.style.display = 'flex';
            const fuelCount = document.getElementById('fuel-count');
            if (fuelCount) fuelCount.textContent = 'Fuel: ' + fuel;
        }
        if (lyToggleWrapper) ensureLyToggle();
    } else {
        // Fresh start: delay reveal for atmospheric pacing
        setTimeout(() => {
            if (fuelSection) {
                fuelSection.style.display = 'flex';
                const fuelCount = document.getElementById('fuel-count');
                if (fuelCount) fuelCount.textContent = 'Fuel: ' + fuel;
            }
            if (lyToggleWrapper) ensureLyToggle();
            if (!lookAroundLoreShown) {
                addLoreMessage('You take a second to look around, it\'s an old model starship from the 2100\'s, a dusty dark matter centrifuge lies in the back of the ship...');
                lookAroundLoreShown = true;
            }
        }, 5000);
    }

    function drawScene() {
        const asciiEl = document.getElementById('ascii');
        if (asciiEl) asciiEl.textContent = getStarFieldArt();
        const fuelCountEl = document.getElementById('fuel-count');
        if (fuelCountEl) {
            fuelCountEl.textContent = 'Fuel: ' + fuel;
            fuelCountEl.style.display = 'inline-block';
        }
        const fuelBtnEl = document.getElementById('fuel-btn');
        if (fuelBtnEl) fuelBtnEl.style.display = 'inline-block';
        // Removed references to old save/load buttons that no longer exist (save-btn, load-btn)
    // Toggle already positioned below ASCII art via HTML structure
    fireMilestone50();
    }
    if (lyInterval) clearInterval(lyInterval);
    lyInterval = setInterval(() => {
        const lySwitchEl = document.getElementById('ly-switch');
        if (lySwitchEl) lyConversionOn = lySwitchEl.checked;
        if (fuel > 0 && lyConversionOn) {
            lyGauge++;
            fuel--;
            document.getElementById('fuel-count').textContent = 'Fuel: ' + fuel;
            drawScene();
        }
        // Boundary detection: if we just crossed 50 this tick fire immediately
        if (!milestone50Fired && lyGauge >= 50) fireMilestone50();
    }, 1000);
    if (!skipIntroLore && typeof LORE_MESSAGES !== 'undefined') {
        setTimeout(() => {
            addLoreMessage(LORE_MESSAGES[1]);
        }, 0);
    }
    if (window.starfieldInterval) {
        clearInterval(window.starfieldInterval);
        window.starfieldInterval = null;
    }
    window.starfieldInterval = setInterval(() => {
        starFrame++;
        if (currentScene === 'starfield') drawScene();
        if (!milestone50Fired && lyGauge >= 50) fireMilestone50();
    }, 300);
    drawScene();
    // Immediate milestone evaluation for loaded saves
    if (!milestone50Fired && lyGauge >= 50) fireMilestone50();
}

function clearSaveData() {
    localStorage.removeItem('asciiSaveSlot');
}

document.addEventListener('DOMContentLoaded', () => {
    installGlobalErrorHandlers();
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
    // Apply saved state immediately if starfield already active when loading
    const lySwitchSaved = document.getElementById('ly-switch');
    if (lySwitchSaved) lySwitchSaved.checked = lyConversionOn;
});

// --------- Global Error Handling & Recovery ---------
function installGlobalErrorHandlers() {
    if (window.__asciiErrorHandlersInstalled) return;
    window.__asciiErrorHandlersInstalled = true;
    window.addEventListener('error', ev => {
        showErrorOverlay(ev.error ? (ev.error.stack || ev.error.message) : ev.message);
    });
    window.addEventListener('unhandledrejection', ev => {
        showErrorOverlay(ev.reason ? (ev.reason.stack || ev.reason.message) : 'Unhandled rejection');
    });
}

function showErrorOverlay(message) {
    if (document.getElementById('ascii-error-overlay')) return;
    const wrap = document.createElement('div');
    wrap.id = 'ascii-error-overlay';
    wrap.style.position = 'fixed';
    wrap.style.top = '0';
    wrap.style.left = '0';
    wrap.style.width = '100vw';
    wrap.style.height = '100vh';
    wrap.style.background = 'rgba(0,0,0,0.85)';
    wrap.style.zIndex = '99999';
    wrap.style.display = 'flex';
    wrap.style.flexDirection = 'column';
    wrap.style.alignItems = 'center';
    wrap.style.justifyContent = 'center';
    wrap.style.fontFamily = 'monospace';
    wrap.innerHTML = `
        <div style="max-width:720px;padding:24px 32px;background:#222;border-radius:12px;box-shadow:0 0 18px #000a;color:#eee;display:flex;flex-direction:column;gap:18px;">
            <div style="font-size:22px;font-weight:bold;color:#f66;">Runtime Error</div>
            <pre style="white-space:pre-wrap;font-size:14px;line-height:1.4;max-height:40vh;overflow:auto;margin:0;">${escapeHtml(message||'Unknown error')}</pre>
            <div style="display:flex;gap:12px;flex-wrap:wrap;">
                <button id="force-wipe-btn" style="padding:8px 18px;font-size:14px;border:none;border-radius:6px;background:#c33;color:#fff;cursor:pointer;">Force Wipe Save & Reload</button>
                <button id="close-error-overlay" style="padding:8px 18px;font-size:14px;border:none;border-radius:6px;background:#555;color:#fff;cursor:pointer;">Dismiss</button>
            </div>
        </div>`;
    document.body.appendChild(wrap);
    document.getElementById('close-error-overlay').onclick = () => wrap.remove();
    document.getElementById('force-wipe-btn').onclick = () => {
        try { localStorage.removeItem('asciiSaveSlot'); localStorage.removeItem('asciiLoreText'); } catch(e){}
        location.reload();
    };
}

function escapeHtml(str) {
    return String(str).replace(/[&<>"]/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[s]));
}