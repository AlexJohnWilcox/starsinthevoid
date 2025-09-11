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
let developerMode = false; // cheat mode: name 'ajmemes'
let milestone100Fired = false; // lights on + state
let milestone100LoreShown = false; // show 100 Ly lore once
// ---- Shop & Upgrades State ----
let currentView = 'main'; // 'main' or 'shop'
let coPilotLevel = 1; // each level adds +2 DM/sec (base provided by constants)
// (Deprecated) engineLevel replaced by capacity/efficiency split
let engineLevel = 1; // legacy (kept for migration)
// New engine upgrade model:
let capacityLevel = 1; // DM consumed per second (>=1)
let efficiencyLevel = 1; // 1 = 1 Ly per DM, 2 = 5 Ly per DM (single upgrade)
let stardust = 0;
let collapseCooldownUntil = 0; // timestamp ms
let starCollapserOnline = false;
const CO_PILOT_BASE_GAIN = 2; // DM/sec per co-pilot level
// Dynamic escalating costs (persisted)
let coPilotUpgradeCost = 150;
let capacityUpgradeCost = 200;
let efficiencyUpgradeCost = 500; // one-time
// Manual dump upgrade: each level adds +1 to click gain
let dumpUpgradeLevel = 0;
let dumpUpgradeCost = 100;
function getCoPilotUpgradeCost() { return coPilotUpgradeCost; }
function getCapacityUpgradeCost() { return capacityUpgradeCost; }
function getEfficiencyUpgradeCost() { return efficiencyUpgradeCost; }
function totalLyPerSecond() { return capacityLevel + (efficiencyLevel - 1); }
function getDumpUpgradeCost() { return dumpUpgradeCost; }
function currentClickGain() {
    const base = developerMode ? 100 : 1;
    return base + dumpUpgradeLevel;
}
function updateFuelButtonLabel() {
    const fb = document.getElementById('fuel-btn');
    if (fb) fb.textContent = `Dump Fuel (+${currentClickGain()})`;
}

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
    setSaveData({ playerName, fuel, currentScene, lyGauge, fuelLoreShown, lyConversionOn, milestone50LoreShown, coPilotPurchased, coPilotActive, coPilotButtonAdded, coPilotOnlineLoreShown, milestone50Fired, lookAroundLoreShown, developerMode, milestone100Fired, milestone100LoreShown, currentView, coPilotLevel, engineLevel, capacityLevel, efficiencyLevel, coPilotUpgradeCost, capacityUpgradeCost, efficiencyUpgradeCost, stardust, collapseCooldownUntil, starCollapserOnline, dumpUpgradeLevel, dumpUpgradeCost });
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
        // Trim to 6 newest entries if needed
        while (loreText.children.length > 6) {
            const oldest = loreText.lastElementChild;
            if (!oldest) break;
            oldest.remove();
        }
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
    milestone100Fired = !!data.milestone100Fired || lyGauge >= 100;
    milestone100LoreShown = !!data.milestone100LoreShown;
        currentView = data.currentView || 'main';
        coPilotLevel = data.coPilotLevel || 1;
    engineLevel = data.engineLevel || 1; // legacy
    capacityLevel = data.capacityLevel || engineLevel || 1;
    efficiencyLevel = data.efficiencyLevel || 1;
    coPilotUpgradeCost = data.coPilotUpgradeCost || Math.ceil(150 * Math.pow(1.2, (coPilotLevel - 1)));
    capacityUpgradeCost = data.capacityUpgradeCost || Math.ceil(200 * Math.pow(1.2, (capacityLevel - 1)));
    efficiencyUpgradeCost = data.efficiencyUpgradeCost || 500;
    stardust = data.stardust || 0;
    collapseCooldownUntil = data.collapseCooldownUntil || 0;
    starCollapserOnline = !!data.starCollapserOnline;
    dumpUpgradeLevel = data.dumpUpgradeLevel || 0;
    dumpUpgradeCost = data.dumpUpgradeCost || Math.ceil(100 * Math.pow(1.2, dumpUpgradeLevel));
    restoreLoreText();
    developerMode = !!data.developerMode;
    if (developerMode && lyGauge < 45) lyGauge = 45;
        if (currentScene === 'starfield') {
            renderStarfield(true);
        } else {
            renderIntro();
        }
        // If shop was open when saved, render its controls again
        if (currentView === 'shop') {
                ensureSystemsButton();
            // slight delay to ensure DOM nodes exist
            setTimeout(() => { renderShopControls(); }, 50);
        }
        // Ensure stardust UI reflects saved state
        setTimeout(() => { ensureStardustUI(); }, 60);
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
    // Track in ship log
    appendToShipLog(msg);
    // Strictly cap to 6 visible entries (immediate removal to avoid buildup during spam)
    while (loreText.children.length > 6) {
        const oldest = loreText.lastElementChild;
        if (!oldest) break;
        oldest.remove();
    }
    setTimeout(() => { div.style.opacity = '1'; }, 50);
}

// --- Ship log (persist all lore) ---
function appendToShipLog(msg) {
    try {
        const raw = localStorage.getItem('asciiLogBook');
        const log = raw ? JSON.parse(raw) : [];
        // Avoid consecutive identical duplicates
        if (log.length === 0 || log[log.length - 1].m !== msg) {
            log.push({ t: Date.now(), m: msg });
        }
        localStorage.setItem('asciiLogBook', JSON.stringify(log));
    } catch(e) { /* ignore */ }
}

function showLogBook() {
    // Simple overlay viewer to scroll to oldest message
    const existing = document.getElementById('ascii-logbook-overlay');
    if (existing) { existing.remove(); }
    const wrap = document.createElement('div');
    wrap.id = 'ascii-logbook-overlay';
    wrap.style.position = 'fixed';
    wrap.style.top = '0';
    wrap.style.left = '0';
    wrap.style.width = '100vw';
    wrap.style.height = '100vh';
    wrap.style.background = 'rgba(0,0,0,0.85)';
    wrap.style.zIndex = '99998';
    wrap.style.display = 'flex';
    wrap.style.flexDirection = 'column';
    wrap.style.alignItems = 'center';
    wrap.style.justifyContent = 'center';
    const inner = document.createElement('div');
    inner.style.maxWidth = '900px';
    inner.style.width = '90%';
    inner.style.maxHeight = '70vh';
    inner.style.overflow = 'auto';
    inner.style.background = '#222';
    inner.style.color = '#eee';
    inner.style.borderRadius = '12px';
    inner.style.boxShadow = '0 0 18px #000a';
    inner.style.padding = '24px';
    const title = document.createElement('div');
    title.textContent = 'Ship Logbook';
    title.style.fontSize = '20px';
    title.style.marginBottom = '12px';
    inner.appendChild(title);
    const list = document.createElement('div');
    list.style.display = 'flex';
    list.style.flexDirection = 'column';
    list.style.gap = '12px';
    try {
        const raw = localStorage.getItem('asciiLogBook');
        let log = raw ? JSON.parse(raw) : [];
        // Newest-first in the overlay
        log = log.slice().reverse();
        // Remove adjacent duplicates in this view as well
        let last = null;
        for (const entry of log) {
            if (last && last.m === entry.m) { continue; }
            const row = document.createElement('div');
            row.textContent = new Date(entry.t).toLocaleString() + ' — ' + entry.m;
            row.style.fontSize = '15px';
            list.appendChild(row);
            last = entry;
        }
    } catch(e) {}
    inner.appendChild(list);
    const btns = document.createElement('div');
    btns.style.display = 'flex';
    btns.style.gap = '12px';
    btns.style.marginTop = '16px';
    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Close';
    closeBtn.style.padding = '6px 12px';
    closeBtn.style.border = 'none';
    closeBtn.style.borderRadius = '6px';
    closeBtn.style.background = '#555';
    closeBtn.style.color = '#fff';
    closeBtn.onclick = () => wrap.remove();
    btns.appendChild(closeBtn);
    inner.appendChild(btns);
    wrap.appendChild(inner);
    document.body.appendChild(wrap);
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
        if (name.toLowerCase() === 'ajmemes') {
            developerMode = true;
            addLoreMessage('[DEV MODE ENABLED: +100 FUEL PER CLICK]');
            updateFuelButtonLabel();
        }
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
                if (fuelCount) fuelCount.textContent = 'Dark Matter: ' + fuel;
                updateFuelButtonLabel();
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
            // Update label text to reflect state
            const labelSpan = lyToggleWrapper ? lyToggleWrapper.querySelector('span') : null;
            if (labelSpan) labelSpan.textContent = lyConversionOn ? 'Engine On' : 'Engine Off';
        });
        lySwitch.__wired = true;
    }
    if (lySwitch) {
        lySwitch.checked = lyConversionOn; // reflect saved state
        const labelSpan = lyToggleWrapper ? lyToggleWrapper.querySelector('span') : null;
        if (labelSpan) labelSpan.textContent = lyConversionOn ? 'Engine On' : 'Engine Off';
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
    if (currentView === 'shop') {
        return getShopAscii(width);
    }
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

function getShopAscii(width) {
    const title = ' SHIP SYSTEMS BAY ';
    const w = width;
    const top = '┌' + '─'.repeat(w) + '┐';
    const bottom = '└' + '─'.repeat(w) + '┘';
    function center(text) {
        const inner = w;
        if (text.length > inner) text = text.slice(0, inner);
        const pad = inner - text.length;
        const left = Math.floor(pad / 2);
        const right = pad - left;
        return '│' + ' '.repeat(left) + text + ' '.repeat(right) + '│';
    }
    const lines = [];
    lines.push(top);
    lines.push(center(title));
    lines.push(center('============ SYSTEMS ============'));
    lines.push(center(`Co-Pilot: Lvl ${coPilotLevel} (+${CO_PILOT_BASE_GAIN * coPilotLevel} DM/s)`));
    lines.push(center(`Engine: ${capacityLevel} DM -> ${efficiencyLevel === 1 ? capacityLevel : 5} Ly`));
    lines.push(center(`Manual Dump: +${currentClickGain()} DM/click`));
    lines.push(center(`Star Collapser: ${starCollapserOnline ? 'Online' : 'Offline'}`));
    lines.push(center(''));
    lines.push(center(`Upgrade Co-Pilot (Lvl ${coPilotLevel}): Cost ${getCoPilotUpgradeCost()} DM`));
    lines.push(center(`Upgrade Capacity (Lvl ${capacityLevel}): Cost ${getCapacityUpgradeCost()} DM`));
    if (efficiencyLevel === 1) {
        lines.push(center(`Upgrade Efficiency: Cost ${getEfficiencyUpgradeCost()} DM`));
    }
    lines.push(center(''));
    while (lines.length < 6) lines.push(center(''));
    lines.push(bottom);
    return lines.join('\n');
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
            document.getElementById('fuel-count').textContent = 'Dark Matter: ' + fuel;
            coPilotPurchased = true;
            addLoreMessage('[SHIP COPILOT ONLINE]');
            btn.remove();
            createCoPilotSwitch();
        }
    });
    // Move to ly-toggle-wrapper area next to engine switch
    const toggleWrap = document.getElementById('ly-toggle-wrapper');
    if (toggleWrap) {
        const spacer = document.createElement('span');
        spacer.style.display = 'inline-block';
        spacer.style.width = '16px';
        toggleWrap.appendChild(spacer);
        toggleWrap.appendChild(btn);
    } else {
        upgrades.appendChild(btn);
    }
    coPilotButtonAdded = true;
}

function createCoPilotSwitch() {
    const toggleWrap = document.getElementById('ly-toggle-wrapper');
    const upgrades = document.getElementById('upgrades');
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
    if (toggleWrap) {
        const spacer = document.createElement('span');
        spacer.style.display = 'inline-block';
        spacer.style.width = '10px';
        toggleWrap.appendChild(spacer);
        toggleWrap.appendChild(coPilotSwitch);
    } else if (upgrades) {
        upgrades.appendChild(coPilotSwitch);
    }
        ensureSystemsButton();
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
            // Auto-generate DM based on current Co-Pilot level
            fuel += CO_PILOT_BASE_GAIN * coPilotLevel;
            const fc = document.getElementById('fuel-count');
            if (fc) fc.textContent = 'Dark Matter: ' + fuel;
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
            if (fuelCount) fuelCount.textContent = 'Dark Matter: ' + fuel;
            updateFuelButtonLabel();
        }
        if (lyToggleWrapper) ensureLyToggle();
    } else {
        // Fresh start: delay reveal for atmospheric pacing
        setTimeout(() => {
            if (fuelSection) {
                fuelSection.style.display = 'flex';
                const fuelCount = document.getElementById('fuel-count');
                if (fuelCount) fuelCount.textContent = 'Dark Matter: ' + fuel;
                updateFuelButtonLabel();
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
            fuelCountEl.textContent = 'Dark Matter: ' + fuel;
            fuelCountEl.style.display = 'inline-block';
        }
        const fuelBtnEl = document.getElementById('fuel-btn');
        if (fuelBtnEl) fuelBtnEl.style.display = 'inline-block';
        // Removed references to old save/load buttons that no longer exist (save-btn, load-btn)
    // Toggle already positioned below ASCII art via HTML structure
    fireMilestone50();
    fireMilestone100();
    }
    if (lyInterval) clearInterval(lyInterval);
    lyInterval = setInterval(() => {
        const lySwitchEl = document.getElementById('ly-switch');
        if (lySwitchEl) lyConversionOn = lySwitchEl.checked;
        if (fuel > 0 && lyConversionOn) {
            const dmToConsume = Math.min(capacityLevel, fuel); // can't exceed available fuel
            const effBonus = efficiencyLevel === 1 ? 0 : 4; // efficiency 2 makes 1 DM -> 5 Ly
            const lyProduced = dmToConsume + effBonus; // produce DM consumed + bonus
            fuel -= dmToConsume;
            lyGauge += lyProduced;
            const fc = document.getElementById('fuel-count');
            if (fc) fc.textContent = 'Dark Matter: ' + fuel;
            drawScene();
        }
        // Boundary detection: if we just crossed 50 this tick fire immediately
        if (!milestone50Fired && lyGauge >= 50) fireMilestone50();
        if (lyGauge >= 100) fireMilestone100();
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
        if (lyGauge >= 100) fireMilestone100();
    }, 300);
    drawScene();
    // Immediate milestone evaluation for loaded saves
    if (!milestone50Fired && lyGauge >= 50) fireMilestone50();
    if (lyGauge >= 100) fireMilestone100();
}

function fireMilestone100() {
    if (lyGauge < 100) return;
    if (!milestone100Fired) {
        milestone100Fired = true;
    }
    if (!milestone100LoreShown) {
        addLoreMessage('[100Ly from Origin] A hum begins buzzing in your ear as the ships main lights begin turning on... you finally can see what lies at the edges of the ship, a new model star-collapser');
        milestone100LoreShown = true;
    }
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
    if (coPilotPurchased) ensureSystemsButton();
    ensureStardustUI();
    document.getElementById('save-slot-btn').onclick = saveGame;
    document.getElementById('wipe-save-btn').onclick = () => {
        clearSaveData();
        try { localStorage.removeItem('asciiLogBook'); } catch(e){}
        location.reload();
    };
    const logBtn = document.getElementById('logbook-btn');
    if (logBtn) logBtn.onclick = showLogBook;
    document.getElementById('name-submit').onclick = handleNameSubmit;
    document.getElementById('name-input').addEventListener('keydown', function(e) {
        if (e.key === 'Enter') handleNameSubmit();
    });
    const fuelBtnInit = document.getElementById('fuel-btn');
    updateFuelButtonLabel();
    document.getElementById('fuel-btn').onclick = () => {
        const gain = currentClickGain();
        fuel += gain;
    document.getElementById('fuel-count').textContent = 'Dark Matter: ' + fuel;
        if (!fuelLoreShown) {
            addLoreMessage('Upon activation the centrifuge whirls to life with a cacophony of metallic clangs and dark matter begins pouring into the crucible in liquid form.');
            fuelLoreShown = true;
        }
    };
    // Adjust button label if reloading into dev mode
    if (developerMode) {
        updateFuelButtonLabel();
    }
    document.getElementById('ly-switch').onchange = function() {
        lyConversionOn = this.checked;
    };
    // Apply saved state immediately if starfield already active when loading
    const lySwitchSaved = document.getElementById('ly-switch');
    if (lySwitchSaved) lySwitchSaved.checked = lyConversionOn;
});

// -------- Systems Button & Controls --------
function ensureSystemsButton() {
    if (!coPilotPurchased) return; // only after buying co-pilot
    if (!lyToggleWrapper) lyToggleWrapper = document.getElementById('ly-toggle-wrapper');
    if (!lyToggleWrapper) return;
    const systemsBtn = document.getElementById('systems-btn');
    if (systemsBtn) {
        systemsBtn.style.display = 'inline-block';
        if (!systemsBtn.__wired) {
            systemsBtn.__wired = true;
            systemsBtn.addEventListener('click', () => {
                if (currentView === 'shop') {
                    // Return to main console
                    currentView = 'main';
                    const sc = document.getElementById('shop-controls');
                    if (sc) sc.remove();
                    systemsBtn.textContent = 'Systems';
                    showConversionSwitch();
                    const asciiEl = document.getElementById('ascii');
                    if (asciiEl) asciiEl.textContent = getStarFieldArt();
                } else {
                    currentView = 'shop';
                    renderShopControls();
                }
            });
        }
        // Initial label & switch visibility
        systemsBtn.textContent = currentView === 'shop' ? 'Main Console' : 'Systems';
        if (currentView === 'shop') hideConversionSwitch(); else showConversionSwitch();
    }
}

function renderShopControls() {
    const asciiEl = document.getElementById('ascii');
    if (asciiEl) asciiEl.textContent = getStarFieldArt(); // refresh ascii to shop view
    const systemsBtn = document.getElementById('systems-btn');
    if (systemsBtn) systemsBtn.textContent = 'Main Console';
    hideConversionSwitch();
    try { window.scrollTo(0,0); } catch(e){}
    ensureStardustUI();
    let shopControls = document.getElementById('shop-controls');
    if (!shopControls) {
        shopControls = document.createElement('div');
        shopControls.id = 'shop-controls';
        shopControls.style.display = 'flex';
        shopControls.style.flexDirection = 'row';
        shopControls.style.flexWrap = 'wrap';
    shopControls.style.gap = '12px';
    shopControls.style.marginTop = '-28px';
        const container = document.getElementById('game-container');
        if (container) container.appendChild(shopControls);
    }
    shopControls.innerHTML = '';
    shopControls.style.marginTop = '-28px';
    // Create left column stack for main upgrades
    const upgradesCol = document.createElement('div');
    upgradesCol.style.display = 'flex';
    upgradesCol.style.flexDirection = 'column';
    upgradesCol.style.alignItems = 'flex-start';
    upgradesCol.style.gap = '8px';
    upgradesCol.style.marginTop = '-10px';
    shopControls.appendChild(upgradesCol);
    const otherCol = document.createElement('div');
    otherCol.style.display = 'flex';
    otherCol.style.flexDirection = 'column';
    otherCol.style.alignItems = 'flex-start';
    otherCol.style.gap = '8px';
    otherCol.style.marginTop = '-10px';
    shopControls.appendChild(otherCol);
    // Capacity Upgrade Button (multi-level) — now shown first
    const capBtn = document.createElement('button');
    capBtn.textContent = `Upgrade Capacity (Lvl ${capacityLevel}): Cost ${getCapacityUpgradeCost()} DM`;
    styleShopBtn(capBtn);
    capBtn.onclick = () => {
        const cost = getCapacityUpgradeCost();
        if (fuel >= cost) {
            fuel -= cost;
            capacityLevel++;
            capacityUpgradeCost = Math.ceil(capacityUpgradeCost * 1.2);
            addLoreMessage(`[ENGINE CAPACITY EXPANDED: ${capacityLevel} DM/s]`);
            renderShopControls();
        } else {
            addLoreMessage('[INSUFFICIENT DM FOR CAPACITY UPGRADE]');
        }
    };
    upgradesCol.appendChild(capBtn);
    // Info under Capacity about current dump yield
    const capInfo = document.createElement('div');
    capInfo.textContent = `Manual Dump: +${currentClickGain()} DM/click`;
    capInfo.style.fontSize = '12px';
    capInfo.style.color = '#ccc';
    capInfo.style.margin = '-2px 0 6px 0';
    upgradesCol.appendChild(capInfo);
    // Dump Yield Upgrade (click bonus)
    const dumpBtn = document.createElement('button');
    dumpBtn.textContent = `Upgrade Dump Yield (Lvl ${dumpUpgradeLevel}): Cost ${getDumpUpgradeCost()} DM`;
    styleShopBtn(dumpBtn);
    dumpBtn.onclick = () => {
        const cost = getDumpUpgradeCost();
        if (fuel >= cost) {
            fuel -= cost;
            dumpUpgradeLevel++;
            dumpUpgradeCost = Math.ceil(dumpUpgradeCost * 1.2);
            addLoreMessage('[MANUAL DUMP YIELD INCREASED: +1 PER CLICK]');
            updateFuelButtonLabel();
            renderShopControls();
        } else {
            addLoreMessage('[INSUFFICIENT DM FOR DUMP YIELD UPGRADE]');
        }
    };
    upgradesCol.appendChild(dumpBtn);
    // Co-Pilot Upgrade Button — now shown after Capacity
    const cpBtn = document.createElement('button');
    cpBtn.textContent = `Upgrade Co-Pilot (Lvl ${coPilotLevel}): Cost ${getCoPilotUpgradeCost()} DM`;
    styleShopBtn(cpBtn);
    cpBtn.onclick = () => {
        const cost = getCoPilotUpgradeCost();
        if (fuel >= cost) {
            fuel -= cost;
            coPilotLevel++;
            coPilotUpgradeCost = Math.ceil(coPilotUpgradeCost * 1.2);
            if (coPilotActive) { // restart interval to apply new rate
                toggleCoPilotActive();
                toggleCoPilotActive();
            }
            addLoreMessage(`[CO-PILOT UPGRADED TO LEVEL ${coPilotLevel}]`);
            renderShopControls();
        } else {
            addLoreMessage('[INSUFFICIENT DM FOR CO-PILOT UPGRADE]');
        }
    };
    upgradesCol.appendChild(cpBtn);
    // Efficiency Upgrade Button (single)
    if (efficiencyLevel === 1) {
        const effBtn = document.createElement('button');
        effBtn.textContent = `Upgrade Efficiency: Cost ${getEfficiencyUpgradeCost()} DM`;
        styleShopBtn(effBtn);
        effBtn.onclick = () => {
            const cost = getEfficiencyUpgradeCost();
            if (fuel >= cost) {
                fuel -= cost;
                efficiencyLevel = 2;
                addLoreMessage('[ENGINE EFFICIENCY MATRIX CALIBRATED: 1 DM -> 5 Ly]');
                renderShopControls();
            } else {
                addLoreMessage('[INSUFFICIENT DM FOR EFFICIENCY UPGRADE]');
            }
        };
        upgradesCol.appendChild(effBtn);
    }

    // Star Collapser purchase (appears at 100 Ly if not yet owned)
    if (lyGauge >= 100 && !starCollapserOnline) {
        const scBtn = document.createElement('button');
        scBtn.textContent = `Star-Collapser: Cost 300 DM`;
        styleShopBtn(scBtn);
        scBtn.onclick = () => {
            if (fuel >= 300) {
                fuel -= 300;
                starCollapserOnline = true;
                addLoreMessage('[STAR COLLAPSER ONLINE]');
                const sd = document.getElementById('stardust-section');
                if (sd) sd.style.display = 'flex';
                ensureStardustUI();
                renderShopControls();
            } else {
                addLoreMessage('[INSUFFICIENT DM FOR STAR-COLLAPSER]');
            }
        };
    otherCol.appendChild(scBtn);
    }
}

function styleShopBtn(btn) {
    btn.style.padding = '6px 14px';
    btn.style.background = '#555';
    btn.style.color = '#fff';
    btn.style.border = 'none';
    btn.style.borderRadius = '6px';
    btn.style.boxShadow = '0 2px 8px #000a';
    btn.style.fontSize = '14px';
    btn.style.cursor = 'pointer';
}

// --- Stardust / Collapser UI wiring ---
function ensureStardustUI() {
    const sd = document.getElementById('stardust-section');
    if (!sd) return;
    sd.style.display = starCollapserOnline ? 'flex' : 'none';
    const sdCount = document.getElementById('stardust-count');
    if (sdCount) sdCount.textContent = `Stardust: ${stardust}`;
    const collapseBtn = document.getElementById('collapse-btn');
    if (collapseBtn && !collapseBtn.__wired) {
        collapseBtn.__wired = true;
        collapseBtn.addEventListener('click', () => {
            const now = Date.now();
            if (!starCollapserOnline) return;
            if (now < collapseCooldownUntil) return; // still cooling down
            // award stardust and start cooldown
            stardust += 1;
            collapseCooldownUntil = now + 10000; // 10s
            if (sdCount) sdCount.textContent = `Stardust: ${stardust}`;
            updateCollapseCooldownUI();
        });
    }
    updateCollapseCooldownUI();
}

function updateCollapseCooldownUI() {
    const collapseBtn = document.getElementById('collapse-btn');
    if (!collapseBtn) return;
    const now = Date.now();
    if (now >= collapseCooldownUntil) {
        collapseBtn.disabled = false;
        collapseBtn.textContent = 'Collapse (+1)';
        return;
    }
    collapseBtn.disabled = true;
    const secs = Math.ceil((collapseCooldownUntil - now) / 1000);
    collapseBtn.textContent = `Collapse (${secs}s)`;
    setTimeout(updateCollapseCooldownUI, 250);
}

// --- Conversion switch visibility helpers ---
function hideConversionSwitch() {
    const label = document.querySelector('#ly-toggle-wrapper label');
    if (label) label.style.display = 'none';
}
function showConversionSwitch() {
    const label = document.querySelector('#ly-toggle-wrapper label');
    if (label) label.style.display = 'inline-flex';
}

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