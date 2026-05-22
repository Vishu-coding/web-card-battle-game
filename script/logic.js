/**
 * ── StarRail-style Action Value System ───────────────────────────────
 * Each unit has an Action Value: AV = 10000 / SPD
 * The unit with lowest AV acts next; all AVs decrease by the acting unit's AV.
 * On unit action, their AV resets to 10000 / SPD.
 */
let audioContext = null;

function initAudio() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContext;
}

function playTone(pitch, duration, type = 'attack', volume = 0.3) {
    const ctx = initAudio();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    let oscType = 'sine';
    switch(type) {
        case 'sword': oscType = 'sawtooth'; break;
        case 'deep-roar': oscType = 'triangle'; volume *= 0.8; break;
        case 'lightning': oscType = 'square'; break;
        case 'infinity': oscType = 'sine'; break;
        case 'slash': oscType = 'sawtooth'; break;
        case 'three-sword': oscType = 'sawtooth'; break;
        case 'fire': oscType = 'sawtooth'; break;
        case 'alchemy': oscType = 'square'; break;
        case 'arrow': oscType = 'sine'; break;
        case 'ora': oscType = 'square'; break;
        case 'explosive': oscType = 'sawtooth'; break;
        case 'haki': oscType = 'triangle'; break;
        case 'godspeed': oscType = 'square'; break;
        case 'jackpot': oscType = 'sawtooth'; break;
        case 'heal': oscType = 'sine'; volume *= 0.7; break;
        case 'medical': oscType = 'sine'; break;
        case 'demon-heal': oscType = 'triangle'; break;
        case 'wind': oscType = 'sine'; break;
        case 'cold': oscType = 'sine'; volume *= 0.6; break;
        default: oscType = 'sawtooth';
    }

    osc.frequency.setValueAtTime(pitch, ctx.currentTime);
    osc.type = oscType;

    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
}

export function playVoice(charName, actionType) {
    const voiceConfig = VOICE_CONFIG[charName] || { pitch: 440, duration: 0.5, type: 'attack' };
    playTone(voiceConfig.pitch, voiceConfig.duration, voiceConfig.type);
}

export function initActionGauge(units) {
    return units.map(u => ({
        ...u,
        av: Math.floor(10000 / u.spd)
    }));
}

export function getSortedByAV(units) {
    return [...units].filter(u => u.currentHp > 0).sort((a, b) => a.av - b.av);
}

export function advanceGauge(units) {
    const alive = units.filter(u => u.currentHp > 0);
    if (!alive.length) return units;
    const minAV = Math.min(...alive.map(u => u.av));
    return units.map(u => ({
        ...u,
        av: u.currentHp > 0 ? Math.max(0, u.av - minAV) : u.av
    }));
}

export function resetAV(unit) {
    return { ...unit, av: Math.floor(10000 / unit.spd) };
}

export function calculateDamage(actor, isSkill, partyState, targetEnemy) {
    const baseAtk = actor.atk || 0;
    const SP_CAP = 10;
    let finalAtk = baseAtk;
    const passiveLogs = [];

    if (actor._prideStacks !== undefined && actor._prideStacks < actor._prideMax) {
        actor._prideStacks++;
        const bonus = Math.floor(baseAtk * 0.15 * actor._prideStacks);
        finalAtk = baseAtk + bonus;
        passiveLogs.push(`Pride Lv.${actor._prideStacks}: ATK ${baseAtk} → ${finalAtk}`);
    }

    if (actor._equivalentExchange && actor._dmgStore > 0) {
        finalAtk += actor._dmgStore;
        passiveLogs.push(`Equivalent Exchange: +${actor._dmgStore} bonus ATK!`);
        actor._dmgStore = 0;
    }

    // Ichigo Bankai
    if (actor._bankaiThreshold && !actor._bankaiActive) {
        if (actor.currentHp / actor.maxHp <= actor._bankaiThreshold) {
            actor._bankaiActive = true;
            finalAtk = Math.floor(finalAtk * actor._bankaiMult);
            passiveLogs.push(`BANKAI ACTIVATED! ATK x1.6!`);
        }
    } else if (actor._bankaiActive) {
        finalAtk = Math.floor(finalAtk * actor._bankaiMult);
    }

    if (isSkill) {
        if (partyState.sp < 2) return { result: "NOT_ENOUGH_SP" };
        partyState.sp -= 2;
        let multiplier = 2.5;

        if (actor._firstStrike) {
            actor._firstStrike = false;
            multiplier = 7.5;
            passiveLogs.push(`THUNDERCLAP FIRST STRIKE! Triple skill damage!`);
        }

        const variance = 0.9 + Math.random() * 0.2;
        const dmg = Math.floor(finalAtk * multiplier * variance);
        return { result: dmg, passiveLogs, isHeal: false };
    } else {
        // Basic attack
        const spGain = 1 + (actor._extraSP || 0);
        partyState.sp = Math.min(SP_CAP, partyState.sp + spGain);
        if (actor._extraSP) passiveLogs.push(`Flamboyant: +${spGain} SP!`);

        let multiplier = 1.0;
        if (actor._firstStrike) {
            actor._firstStrike = false;
            multiplier = 3.0;
            passiveLogs.push(`THUNDERCLAP FIRST STRIKE! Triple damage!`);
        }

        const variance = 0.9 + Math.random() * 0.2;
        let dmg = Math.floor(finalAtk * multiplier * variance);

        // Killua double hit
        let extraDmg = 0;
        if (actor._doubleHitChance && Math.random() < actor._doubleHitChance) {
            extraDmg = Math.floor(finalAtk * variance);
            passiveLogs.push(`Whirlwind: Second hit! +${extraDmg} dmg!`);
            dmg += extraDmg;
        }

        // Healer on-attack heals
        let healResult = null;
        if (actor._healOnAttack) {
            healResult = { type: "random", amount: actor._healOnAttack };
        }
        if (actor._atkBuffOnAttack) {
            passiveLogs.push(`Sky Dragon Roar: Random ally gains ATK+8% for 2 turns!`);
        }

        // Hakari Jackpot
        if (actor._jackpotChance && Math.random() < actor._jackpotChance) {
            const healed = Math.min(actor._jackpotHeal, actor.maxHp - actor.currentHp);
            actor.currentHp = Math.min(actor.maxHp, actor.currentHp + actor._jackpotHeal);
            passiveLogs.push(`JACKPOT! ${actor.name} healed ${healed} HP!`);
        }

        return { result: dmg, passiveLogs, isHeal: false, healResult };
    }
}

/* ── Healer Skill ────────────────────────────────────────────────── */
export function calculateHealSkill(actor, party, partyState) {
    if (partyState.sp < 2) return { result: "NOT_ENOUGH_SP" };
    partyState.sp -= 2;
    const passiveLogs = [];
    const heals = [];

    if (actor.name === "Orihime Inoue") {
        // Heal lowest HP ally
        const target = party.filter(p => p.currentHp > 0)
            .sort((a, b) => (a.currentHp / a.maxHp) - (b.currentHp / b.maxHp))[0];
        if (target) {
            const amt = Math.floor(target.maxHp * 0.35);
            target.currentHp = Math.min(target.maxHp, target.currentHp + amt);
            heals.push({ name: target.name, amount: amt });
            passiveLogs.push(`Soten Kisshun: ${target.name} +${amt} HP!`);
        }
    } else if (actor.name === "Sakura Haruno") {
        // Heal all allies
        let bonus = 0;
        if (actor._tsunadeBonus && party.some(p => p.currentHp > 0 && p.currentHp / p.maxHp < 0.4)) {
            bonus = 0.10;
            passiveLogs.push(`Tsunade's Teaching: +10% healing!`);
        }
        party.filter(p => p.currentHp > 0).forEach(p => {
            const amt = Math.floor(p.maxHp * (0.20 + bonus));
            p.currentHp = Math.min(p.maxHp, p.currentHp + amt);
            heals.push({ name: p.name, amount: amt });
        });
        passiveLogs.push(`Cherry Blossom Impact: All allies healed!`);
    } else if (actor.name === "Rem") {
        // Heal all + deal damage
        party.filter(p => p.currentHp > 0).forEach(p => {
            const amt = Math.floor(p.maxHp * 0.15);
            p.currentHp = Math.min(p.maxHp, p.currentHp + amt);
            heals.push({ name: p.name, amount: amt });
        });
        const dmg = Math.floor(actor.atk * 1.8 * (0.9 + Math.random() * 0.2));
        passiveLogs.push(`Gospel of the Oni: All healed + ${dmg} damage!`);
        return { result: dmg, passiveLogs, isHeal: true, heals };
    } else if (actor.name === "Wendy Marvell") {
        // Heal all
        party.filter(p => p.currentHp > 0).forEach(p => {
            const amt = Math.floor(p.maxHp * 0.25);
            p.currentHp = Math.min(p.maxHp, p.currentHp + amt);
            heals.push({ name: p.name, amount: amt });
        });
        passiveLogs.push(`Milky Way: Dragon wind heals all allies!`);
    }

    return { result: 0, passiveLogs, isHeal: true, heals };
}

/* ── Enemy AI ────────────────────────────────────────────────────── */
export function enemyTurn(actor, players) {
    playVoice(actor.name, 'turn', VOICE_CONFIG); // Enemy turn voice
    const alivePlayers = players.filter(p => p.currentHp > 0);
    if (!alivePlayers.length) return null;

    // Target: focus lowest HP%
    const target = alivePlayers.reduce((lowest, p) =>
        p.currentHp / p.maxHp < lowest.currentHp / lowest.maxHp ? p : lowest
    );

    const rawDamage = Math.floor(actor.atk * (0.85 + Math.random() * 0.3)); 
    let finalDamage = rawDamage;
    const passiveLogs = [];

    // Gojo Infinity
    if (target._infinityChance && Math.random() < target._infinityChance) {
        finalDamage = 0;
        passiveLogs.push(`∞ INFINITY! ${target.name} nullified the attack!`);
    }

    // Rem Devotion Shield
    if (finalDamage > 0 && target._devotionShield && target.currentHp - finalDamage < target.maxHp * 0.2) {
        if (!target._devotionTriggered?.[target.name]) {
            const shieldAmt = Math.min(finalDamage, target._devotionShield);
            finalDamage = Math.max(0, finalDamage - shieldAmt);
            if (!target._devotionTriggered) target._devotionTriggered = {};
            target._devotionTriggered[target.name] = true;
            passiveLogs.push(`Devotion Shield! ${target.name} absorbs ${shieldAmt} damage!`);
        }
    }

    // Zoro death defy
    if (finalDamage > 0 && !target._deathDefyUsed && target.currentHp - finalDamage <= 0) {
        finalDamage = target.currentHp - 1;
        target._deathDefyUsed = true;
        passiveLogs.push(`NOTHING HAPPENED! ${target.name} survives with 1 HP!`);
    }

    // Equivalent exchange store
    if (target._equivalentExchange && finalDamage > 0) {
        target._dmgStore = (target._dmgStore || 0) + Math.floor(finalDamage * 0.5);
        passiveLogs.push(`Equivalent Exchange: ${target.name} stores ${Math.floor(finalDamage * 0.5)} ATK!`);
    }

    target.currentHp = Math.max(0, target.currentHp - finalDamage);
    playVoice(target.name, 'hit', VOICE_CONFIG); // Hit voice

    // Jotaro counter
    let counterResult = null;
    if (target._counterChance && target.currentHp > 0 && Math.random() < target._counterChance) {
        const counterDmg = Math.floor(target.atk * target._counterMult);
        passiveLogs.push(`ORA! ${target.name} counters for ${counterDmg}!`);
        counterResult = counterDmg;
    }

    return {
        targetName: target.name,
        damage: finalDamage,
        targetIndex: players.indexOf(target),
        passiveLogs,
        counterDmg: counterResult
    };
}

/* ── Passives ────────────────────────────────────────────────────── */
export function applyPassives(char, allParty) {
    if (char && typeof char.passive === 'function' && !char.passiveApplied) {
        char.passive(char, allParty);
        char.passiveApplied = true;
    }
    char.maxHp = char.hp;
    char.currentHp = char.hp;
    return char;
}

export function applyHakiAura(party) {
    const hasLuffy = party.find(p => p._hakirAura);
    if (hasLuffy) {
        party.forEach(p => {
            if (p !== hasLuffy) p.atk = Math.floor(p.atk * 1.1);
        });
        return true;
    }
    return false;
}

/* ── AI Taunt via Claude ─────────────────────────────────────────── */
export async function getEnemyTaunt(bossName, bossPersonality, situation, playerNames) {
    try {
        const response = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "claude-sonnet-4-20250514",
                max_tokens: 100,
                messages: [{
                    role: "user",
                    content: `You are ${bossName} from anime, a boss in a battle game. Personality: ${bossPersonality}

Situation: ${situation}
Players still standing: ${playerNames.join(', ')}

Say ONE short in-character battle taunt (1-2 sentences, no quotes, no *actions*, just dialogue). Stay perfectly in character.`
                }]
            })
        });
        const data = await response.json();
        return data.content?.[0]?.text || null;
    } catch {
        return null;
    }
}
