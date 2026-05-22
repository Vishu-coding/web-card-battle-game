import { CHARACTERS, ENEMIES } from 'script/data.js';
import { calculateDamage, applyPassives, applyHakiAura, enemyTurn, getEnemyTaunt } from 'script/logic.js';

let activeParty = [];
let currentBoss = null;
let turnQueue = [];
let currentTurnIndex = 0;
let partyState = { sp: 3 };
let selectedIndices = [];
let battleLog = [];
let isProcessing = false;

/* ── helpers ─────────────────────────────────────────────── */
const sleep = ms => new Promise(r => setTimeout(r, ms));

function shake(el) {
    if (!el) return;
    el.classList.remove('shake');
    void el.offsetWidth;
    el.classList.add('shake');
    setTimeout(() => el.classList.remove('shake'), 460);
}

function showPopups(logs) {
    if (!logs?.length) return;
    logs.forEach((txt, i) => {
        setTimeout(() => {
            const d = document.createElement('div');
            d.className = 'ppop';
            d.textContent = txt;
            document.getElementById('popup-layer').appendChild(d);
            setTimeout(() => d.remove(), 2400);
        }, i * 380);
    });
}

function addLog(txt, cls = '') {
    battleLog.unshift({ txt, cls });
    if (battleLog.length > 20) battleLog.pop();
    const el = document.getElementById('battle-log');
    if (el) el.innerHTML = battleLog.slice(0, 8).map((e, i) =>
        `<div class="le ${e.cls}" style="opacity:${Math.max(0.18, 1 - i * 0.12)}">${e.txt}</div>`
    ).join('');
}

function toast(msg) {
    const d = document.createElement('div');
    d.className = 'toast toast-w';
    d.textContent = msg;
    document.body.appendChild(d);
    setTimeout(() => d.remove(), 2100);
}

function setStatus(html) {
    document.getElementById('battle-status').innerHTML = html;
}

function setBossDlg(txt) {
    const el = document.getElementById('boss-dlg');
    if (!el) return;
    el.textContent = `"${txt}"`;
    el.classList.remove('dlg-on');
    void el.offsetWidth;
    el.classList.add('dlg-on');
}

/* ── Selection ───────────────────────────────────────────── */
function initSelection() {
    const grid = document.getElementById('unit-display');
    if (!grid) return;
    grid.innerHTML = '';

    CHARACTERS.forEach((char, idx) => {
        const card = document.createElement('div');
        card.className = 'char-card';
        card.innerHTML = `
            <img src="${char.img}" class="card-avatar"
                 onerror="this.src='https://via.placeholder.com/58/0a0a14/fff?text=${encodeURIComponent(char.name[0])}'">
            <div class="card-body">
                <b class="card-name">${char.name}</b>
                <div class="card-stats">
                    <span class="cs cs-atk">⚔ ${char.atk}</span>
                    <span class="cs cs-spd">⚡ ${char.spd}</span>
                    <span class="cs cs-hp">♥ ${char.hp}</span>
                </div>
                <div class="card-passive">${char.passiveDesc}</div>
                <div class="card-skill-tag">✦ ${char.skill}</div>
            </div>
            <div class="sel-check">✓</div>
        `;
        card.onclick = () => {
            if (selectedIndices.includes(idx)) {
                selectedIndices = selectedIndices.filter(i => i !== idx);
                card.classList.remove('selected');
            } else if (selectedIndices.length < 4) {
                selectedIndices.push(idx);
                card.classList.add('selected');
            }
            document.getElementById('sel-count').textContent = `${selectedIndices.length} / 4 selected`;
        };
        grid.appendChild(card);
    });
}

/* ── Start Battle ────────────────────────────────────────── */
async function startBattle() {
    if (!selectedIndices.length) { shake(document.getElementById('start-btn')); return; }

    activeParty = selectedIndices.map(idx => {
        const char = { ...CHARACTERS[idx], isPlayer: true };
        applyPassives(char);
        return char;
    });

    if (applyHakiAura(activeParty)) addLog("Conqueror's Haki blankets the battlefield!", 'lb');

    const bossData = ENEMIES[Math.floor(Math.random() * ENEMIES.length)];
    currentBoss = { ...bossData, currentHp: bossData.hp, maxHp: bossData.hp, isPlayer: false };

    // sort by SPD descending
    turnQueue = [...activeParty, currentBoss].sort((a, b) => b.spd - a.spd);

    document.getElementById('selection-screen').classList.add('hidden');
    document.getElementById('battle-screen').classList.remove('hidden');

    // Opening taunt
    getEnemyTaunt(
        currentBoss.name, currentBoss.personality,
        "the battle is just beginning",
        activeParty.map(p => p.name)
    ).then(t => { if (t) setBossDlg(t); });

    processTurn();
}

/* ── Turn Processing ─────────────────────────────────────── */
async function processTurn() {
    if (isProcessing) return;
    isProcessing = true;

    const actor = turnQueue[currentTurnIndex];
    renderAll();

    if (actor.currentHp <= 0) {
        isProcessing = false;
        advanceTurn();
        return;
    }

    if (!actor.isPlayer) {
        setStatus(`<span class="t-e">${actor.name} prepares to strike...</span>`);
        await sleep(900);

        const res = enemyTurn(actor, activeParty);
        if (res) {
            const alive = activeParty.filter(p => p.currentHp > 0).map(p => p.name);
            const hpPct = (actor.currentHp / actor.maxHp) * 100;
            let sit = `you just struck ${res.targetName} for ${res.damage} damage`;
            if (hpPct < 40) sit = `you are critically low at ${Math.floor(hpPct)}% HP`;
            if (res.damage === 0) sit = `your attack was completely nullified`;

            getEnemyTaunt(actor.name, actor.personality, sit, alive).then(t => { if (t) setBossDlg(t); });

            if (res.damage === 0) {
                setStatus(`<span class="t-n">∞ ${res.targetName} nullified ${actor.name}'s attack!</span>`);
                addLog(`∞ Infinity Block — 0 damage`, 'lb');
            } else {
                setStatus(`<span class="t-e">${actor.name} strikes <strong>${res.targetName}</strong> for <strong>${res.damage}</strong>!</span>`);
                addLog(`${actor.name} → ${res.targetName}: ${res.damage} dmg`, 'le2');
            }

            showPopups(res.passiveLogs);
            res.passiveLogs?.forEach(l => addLog(l, 'lpa'));

            const pEl = document.getElementById(`punit-${res.targetIndex}`);
            shake(pEl);

            if (res.counterDmg) {
                await sleep(600);
                currentBoss.currentHp = Math.max(0, currentBoss.currentHp - res.counterDmg);
                setStatus(`<span class="t-c">ORA! Counter hit for ${res.counterDmg}!</span>`);
                addLog(`Counter: ${res.counterDmg} dmg to boss!`, 'lb');
                shake(document.querySelector('.boss-wrap'));
            }

            renderAll();
            await sleep(700);
            isProcessing = false;
            checkEnd();
        } else {
            isProcessing = false;
            advanceTurn();
        }
    } else {
        setStatus(`<span class="t-p">⚔ ${actor.name}'s turn!</span>`);
        isProcessing = false;
    }
}

/* ── Player Action ───────────────────────────────────────── */
window.handleAction = async (isSkill) => {
    if (isProcessing) return;
    const actor = turnQueue[currentTurnIndex];
    const { result: dmg, passiveLogs } = calculateDamage(actor, isSkill, partyState);

    if (dmg === 'NOT_ENOUGH_SP') { toast('Not enough SP!'); return; }

    currentBoss.currentHp = Math.max(0, currentBoss.currentHp - dmg);
    const action = isSkill ? actor.skill : 'Basic Attack';
    setStatus(`<span class="t-p">${actor.name}: <strong>${action}</strong> — ${dmg} damage!</span>`);
    addLog(`${actor.name} [${action}]: ${dmg} dmg`, 'lp');

    showPopups(passiveLogs);
    passiveLogs?.forEach(l => addLog(l, 'lpa'));

    shake(document.querySelector('.boss-wrap'));
    renderAll();
    await sleep(380);
    checkEnd();
};

function checkEnd() {
    if (currentBoss.currentHp <= 0) {
        showEnd(true);
    } else if (activeParty.every(p => p.currentHp <= 0)) {
        showEnd(false);
    } else {
        advanceTurn();
    }
}

async function showEnd(victory) {
    if (victory) {
        // Save replay data
        const replayData = {
            id: Date.now(),
            timestamp: new Date().toLocaleString(),
            team: selectedIndices.map(idx => ({ id: idx, name: CHARACTERS[idx].name, img: CHARACTERS[idx].img })),
            boss: {
                name: currentBoss.name,
                hp: currentBoss.maxHp,
                img: currentBoss.img
            },
            battleLog: battleLog.slice(0, 50) // recent logs
        };
        let replays = JSON.parse(localStorage.getItem('nexusReplays') || '[]');
        replays.unshift(replayData);
        replays = replays.slice(0, 20); // keep top 20
        localStorage.setItem('nexusReplays', JSON.stringify(replays));

        const t = await getEnemyTaunt(
            currentBoss.name, currentBoss.personality,
            "you have just been defeated and are fading away",
            activeParty.filter(p => p.currentHp > 0).map(p => p.name)
        );
        document.getElementById('end-title').className = 'ev';
        document.getElementById('end-title').textContent = '⚔ VICTORY ⚔';
        document.getElementById('end-sub').textContent = t || `${currentBoss.name} has fallen.`;
    } else {
        document.getElementById('end-title').className = 'ed';
        document.getElementById('end-title').textContent = 'DEFEAT';
        document.getElementById('end-sub').textContent = 'The heroes have fallen. The world weeps.';
    }
    document.getElementById('end-overlay').classList.remove('hidden');
}

function advanceTurn() {
    currentTurnIndex = (currentTurnIndex + 1) % turnQueue.length;
    processTurn();
}

/* ── Render ──────────────────────────────────────────────── */
function renderAll() {
    renderActionOrder();
    renderPlayerSide();
    renderBossSide();
    renderControls();
}

function hpClass(pct) {
    return pct > 60 ? 'hh' : pct > 25 ? 'hm' : 'hl';
}

/* HSR-style Action Order bar */
function renderActionOrder() {
    const bar = document.getElementById('action-order');
    const actor = turnQueue[currentTurnIndex];
    const alive = turnQueue.filter(u => u.currentHp > 0);

    bar.innerHTML = alive.map(u => {
        const isActive = u === actor;
        const typeClass = u.isPlayer ? 'aop' : 'aoe';
        const imgSrc = u.img || '';
        const fallback = encodeURIComponent(u.name[0]);
        return `
        <div class="ao-slot ${typeClass} ${isActive ? 'aoa' : ''}">
            <div class="ao-img-wrap">
                <div class="ao-ring"></div>
                <img class="ao-img" src="${imgSrc}"
                     onerror="this.src='https://via.placeholder.com/40/0a0a14/fff?text=${fallback}'">
            </div>
            <span class="ao-lbl">${u.name.split(' ')[0]}</span>
        </div>`;
    }).join('');
}

/* Player party cards with active spotlight */
function renderPlayerSide() {
    const side = document.getElementById('player-side');
    const actor = turnQueue[currentTurnIndex];

    side.innerHTML = activeParty.map((p, idx) => {
        const hpPct = Math.max(0, (p.currentHp / p.maxHp) * 100);
        const dead = p.currentHp <= 0;
        const active = p === actor;

        const tags = [
            p._bankaiActive ? `<span class="stag stag-b">BANKAI</span>` : '',
            p._firstStrike   ? `<span class="stag stag-t">⚡ FIRST</span>` : '',
        ].join('');

        return `
        <div class="uc ${active ? 'uca' : ''} ${dead ? 'ucd' : ''}" id="punit-${idx}">
            <img class="uc-img" src="${p.img}"
                 onerror="this.src='https://via.placeholder.com/50/09090f/fff?text=${encodeURIComponent(p.name[0])}'">
            <div class="uc-body">
                <span class="uc-name">${p.name}</span>
                <div class="hp-track">
                    <div class="hp-bar ${hpClass(hpPct)}" style="width:${hpPct}%"></div>
                </div>
                <span class="hp-num">${Math.floor(p.currentHp)} / ${p.maxHp}</span>
                ${tags}
            </div>
        </div>`;
    }).join('');
}

/* Boss card */
function renderBossSide() {
    const side = document.getElementById('boss-side');
    const actor = turnQueue[currentTurnIndex];
    const bossActive = currentBoss === actor;
    const bpPct = Math.max(0, (currentBoss.currentHp / currentBoss.maxHp) * 100);
    const fallback = encodeURIComponent(currentBoss.name[0]);

    side.innerHTML = `
    <div class="boss-wrap ${bossActive ? 'bt' : ''}">
        <span class="boss-name">${currentBoss.name}</span>
        <img class="boss-img" src="${currentBoss.img}"
             onerror="this.src='https://via.placeholder.com/124/0a0a14/fff?text=${fallback}'">
        <div class="boss-hp-track">
            <div class="boss-hp-bar ${hpClass(bpPct)}" style="width:${bpPct}%"></div>
        </div>
        <span class="boss-hp-num">${Math.floor(currentBoss.currentHp)} / ${currentBoss.maxHp}</span>
        <div id="boss-dlg"></div>
    </div>`;
}

/* Controls + SP pips */
function renderControls() {
    const ctrl = document.getElementById('battle-controls');
    const actor = turnQueue[currentTurnIndex];

    if (!actor || !actor.isPlayer) {
        ctrl.innerHTML = `
        <div class="enemy-wait">
            <div class="wdots"><span></span><span></span><span></span></div>
            Enemy Turn
        </div>`;
        return;
    }

    const pips = Array(10).fill(0).map((_, i) =>
        `<div class="sp-pip ${i < partyState.sp ? 'on' : ''}"></div>`
    ).join('');

    ctrl.innerHTML = `
    <div class="sp-row">
        <span class="sp-lbl">SP</span>
        <div class="sp-pips">${pips}</div>
        <span class="sp-num">${partyState.sp}/10</span>
    </div>
    <div class="act-row">
        <button class="act-btn ab-basic" onclick="handleAction(false)">
            <span class="btn-icon">⚔</span>
            <span class="btn-txt">Basic Attack</span>
            <span class="btn-sub">+1 SP</span>
        </button>
        <button class="act-btn ab-skill ${partyState.sp < 2 ? 'ab-dis' : ''}"
                ${partyState.sp < 2 ? 'disabled' : ''}
                onclick="handleAction(true)">
            <span class="btn-icon">✦</span>
            <span class="btn-txt">${actor.skill}</span>
            <span class="btn-sub">-2 SP</span>
        </button>
    </div>`;
}

/* ── Init ────────────────────────────────────────────────── */
document.getElementById('start-btn').onclick = startBattle;
document.getElementById('restart-btn').onclick = () => location.reload();
initSelection();
