export const ROLES = {
    DPS: { label: "DPS", color: "#ff4d6d", icon: "⚔" },
    SUB_DPS: { label: "Sub-DPS", color: "#ffa931", icon: "✦" },
    HEALER: { label: "Healer", color: "#4dffb4", icon: "✚" }
};

export const VOICE_CONFIG = {
    Saber: { pitch: 440, duration: 0.8, type: 'sword' },
    Escanor: { pitch: 220, duration: 1.2, type: 'deep-roar' },
    "Zenitsu Agatsuma": { pitch: 880, duration: 0.6, type: 'lightning' },
    "Gojo Satoru": { pitch: 523, duration: 0.7, type: 'infinity' },
    "Ichigo Kurosaki": { pitch: 330, duration: 0.9, type: 'slash' },
    "Roronoa Zoro": { pitch: 277, duration: 1.0, type: 'three-sword' },
    "Tanjiro Kamado": { pitch: 392, duration: 0.8, type: 'fire' },
    "Edward Elric": { pitch: 466, duration: 0.7, type: 'alchemy' },
    "Archer (EMIYA)": { pitch: 370, duration: 0.9, type: 'arrow' },
    "Jotaro Kujo": { pitch: 196, duration: 0.5, type: 'ora' },
    Tengen: { pitch: 494, duration: 1.1, type: 'explosive' },
    "Monkey D. Luffy": { pitch: 262, duration: 1.0, type: 'haki' },
    "Killua Zoldyck": { pitch: 784, duration: 0.4, type: 'godspeed' },
    "Kinji Hakari": { pitch: 349, duration: 1.3, type: 'jackpot' },
    "Orihime Inoue": { pitch: 659, duration: 1.4, type: 'heal' },
    "Sakura Haruno": { pitch: 587, duration: 1.0, type: 'medical' },
    Rem: { pitch: 698, duration: 1.2, type: 'demon-heal' },
    "Wendy Marvell": { pitch: 784, duration: 1.1, type: 'wind' },
    Aizen: { pitch: 165, duration: 1.0, type: 'cold' },
    Katakuri: { pitch: 174, duration: 0.9, type: 'mochi' },
    "Cosmic Garou": { pitch: 147, duration: 1.2, type: 'cosmic' },
    "Ryomen Sukuna": { pitch: 131, duration: 1.1, type: 'demon' },
};

export const CHARACTERS = [
    {
        id: 0, name: "Saber", role: "DPS",
        hp: 1400, atk: 380, spd: 108,
        img: "assests/saber.png",
        skill: "Excalibur",
        skillDesc: "Unleash the holy sword — deals 280% ATK to the enemy.",
        passiveDesc: "Holy Sword: ATK +20% on battle start",
        passive: (s) => { s.atk = Math.floor(s.atk * 1.2); }
    },
    {
        id: 1, name: "Escanor", role: "DPS",
        hp: 1100, atk: 460, spd: 95,
        img: "assests/escanor.png",
        skill: "The One",
        skillDesc: "Absolute pride — deals 320% ATK, damage increases with Pride stacks.",
        passiveDesc: "Pride: ATK grows +15% each turn (max 3 stacks)",
        passive: (s) => { s._prideStacks = 0; s._prideMax = 3; }
    },
    {
        id: 2, name: "Zenitsu Agatsuma", role: "DPS",
        hp: 950, atk: 520, spd: 130,
        img: "assests/zenitsu.png",
        skill: "Godspeed Shimmer",
        skillDesc: "Lightning strike — deals 260% ATK. First use deals 3× damage.",
        passiveDesc: "Thunderclap: First attack deals triple damage",
        passive: (s) => { s.atk = Math.floor(s.atk * 1.5); s._firstStrike = true; }
    },
    {
        id: 3, name: "Gojo Satoru", role: "DPS",
        hp: 2000, atk: 500, spd: 110,
        img: "assests/gojo.png",
        skill: "Hollow Purple",
        skillDesc: "Merge Infinity — deals 300% ATK to enemy.",
        passiveDesc: "Infinity: 30% chance to nullify incoming damage",
        passive: (s) => { s._infinityChance = 0.3; }
    },
    {
        id: 4, name: "Ichigo Kurosaki", role: "DPS",
        hp: 2800, atk: 430, spd: 105,
        img: "assests/ichigo.png",
        skill: "Getsuga Tenshou",
        skillDesc: "Moon-fang slash — deals 270% ATK to enemy.",
        passiveDesc: "Bankai Surge: Below 30% HP, ATK +60%",
        passive: (s) => { s._bankaiThreshold = 0.3; s._bankaiMult = 1.6; s._bankaiActive = false; }
    },
    {
        id: 5, name: "Roronoa Zoro", role: "DPS",
        hp: 2000, atk: 440, spd: 88,
        img: "assests/zoro.png",
        skill: "Santoryu Ougi",
        skillDesc: "Three-sword ultimate — deals 290% ATK to enemy.",
        passiveDesc: "Nothing Happened: Survives one fatal hit with 1 HP",
        passive: (s) => { s.atk = Math.floor(s.atk * 1.2); s._deathDefyUsed = false; }
    },
    {
        id: 6, name: "Tanjiro Kamado", role: "DPS",
        hp: 1600, atk: 360, spd: 100,
        img: "assests/tanjiro.png",
        skill: "Hinokami Kagura",
        skillDesc: "Sun Breathing dance — deals 260% ATK to enemy.",
        passiveDesc: "Crimson Blade: Each kill grants ATK +10% (max 3×)",
        passive: (s) => { s._killBonus = 0; s._killMax = 3; }
    },
    {
        id: 7, name: "Edward Elric", role: "DPS",
        hp: 1500, atk: 350, spd: 102,
        img: "assests/edward.png",
        skill: "Alchemy Fist",
        skillDesc: "Transmute and strike — deals 250% ATK to enemy.",
        passiveDesc: "Law of Equivalent Exchange: Taking damage stores 50% as bonus ATK next hit",
        passive: (s) => { s._dmgStore = 0; s._equivalentExchange = true; }
    },

    {
        id: 8, name: "Archer (EMIYA)", role: "SUB_DPS",
        hp: 1700, atk: 280, spd: 92,
        img: "assests/archer.png",
        skill: "Unlimited Blade Works",
        skillDesc: "Project blades — hits enemy for 240% ATK and applies armor break.",
        passiveDesc: "Iron Will: HP +30%",
        passive: (s) => { s.hp = Math.floor(s.hp * 1.3); }
    },
    {
        id: 9, name: "Jotaro Kujo", role: "SUB_DPS",
        hp: 2200, atk: 300, spd: 85,
        img: "assests/jotaro.png",
        skill: "Star Platinum: ORA",
        skillDesc: "Rapid-fire barrage — deals 220% ATK to enemy.",
        passiveDesc: "Star Platinum: Counters for 50% ATK when hit",
        passive: (s) => { s._counterChance = 1.0; s._counterMult = 0.5; }
    },
    {
        id: 10, name: "Tengen Uzui", role: "SUB_DPS",
        hp: 1800, atk: 340, spd: 115,
        img: "assests/tengen.png",
        skill: "Musical Score",
        skillDesc: "Explosive rhythmic strike — deals 230% ATK + grants party +1 SP.",
        passiveDesc: "Flamboyant: SPD +20, grants +1 extra SP on attack",
        passive: (s) => { s.atk = Math.floor(s.atk * 1.15); s.spd += 20; s._extraSP = 1; }
    },
    {
        id: 11, name: "Monkey D. Luffy", role: "SUB_DPS",
        hp: 2500, atk: 320, spd: 90,
        img: "assests/luffy.png",
        skill: "Gum-Gum Bajrang Gun",
        skillDesc: "Giant rubber fist — deals 260% ATK to enemy.",
        passiveDesc: "Conqueror's Haki: All allies gain +10% ATK on battle start",
        passive: (s, allParty) => { s.hp = Math.floor(s.hp * 1.3); s._hakirAura = true; }
    },
    {
        id: 12, name: "Killua Zoldyck", role: "SUB_DPS",
        hp: 1400, atk: 310, spd: 125,
        img: "assests/killua.png",
        skill: "Godspeed",
        skillDesc: "Lightning speed strike — attacks twice for 150% ATK each.",
        passiveDesc: "Whirlwind: Attacks have 40% chance to hit twice",
        passive: (s) => { s._doubleHitChance = 0.4; }
    },
    {
        id: 13, name: "Kinji Hakari", role: "SUB_DPS",
        hp: 3500, atk: 280, spd: 78,
        img: "assests/hakari.png",
        skill: "Idle Death Gamble",
        skillDesc: "Roll the jackpot — deals 200% ATK, 50% chance to deal double.",
        passiveDesc: "Jackpot: 25% chance to heal 600 HP after any action",
        passive: (s) => { s._jackpotChance = 0.25; s._jackpotHeal = 600; }
    },

    {
        id: 14, name: "Orihime Inoue", role: "HEALER",
        hp: 1600, atk: 160, spd: 98,
        img: "assests/orihime.png",
        skill: "Soten Kisshun",
        skillDesc: "Reject reality — heals the lowest HP ally for 35% of their max HP.",
        passiveDesc: "Shun Shun Rika: Basic attack heals a random ally for 5% max HP",
        passive: (s) => { s._healOnAttack = 0.05; }
    },
    {
        id: 15, name: "Sakura Haruno", role: "HEALER",
        hp: 1800, atk: 200, spd: 94,
        img: "assests/sakura.png",
        skill: "Cherry Blossom Impact",
        skillDesc: "Medical ninjutsu burst — heals all allies for 20% max HP each.",
        passiveDesc: "Tsunade's Teaching: Skill heals 10% extra if any ally is below 40% HP",
        passive: (s) => { s._tsunadeBonus = true; }
    },
    {
        id: 16, name: "Rem", role: "HEALER",
        hp: 2000, atk: 240, spd: 96,
        img: "assests/rem.png",
        skill: "Gospel of the Oni",
        skillDesc: "Demon form blessing — heals all allies for 15% HP and deals 180% ATK.",
        passiveDesc: "Devotion: When an ally falls below 20% HP, shield them for 300 points",
        passive: (s) => { s._devotionShield = 300; s._devotionTriggered = {}; }
    },
    {
        id: 17, name: "Wendy Marvell", role: "HEALER",
        hp: 1400, atk: 140, spd: 106,
        img: "assests/wendy.png",
        skill: "Milky Way",
        skillDesc: "Dragon healing wind — heals all allies for 25% max HP.",
        passiveDesc: "Sky Dragon Roar: Basic attack applies +8% ATK buff to a random ally for 2 turns",
        passive: (s) => { s._atkBuffOnAttack = 0.08; }
    }
];

export const ENEMIES = [
    {
        id: "aizen", name: "Aizen", hp: 9000, atk: 980, spd: 85,
        img: "assests/aizen.png", tier: "elite",
        personality: "cold, calculating, believes himself to be a god among insects. Never shouts. Always condescending."
    },
    {
        id: "katakuri", name: "Katakuri", hp: 12000, atk: 420, spd: 90,
        img: "assests/katakuri.png", tier: "elite",
        personality: "stoic, honorable warrior. Respects strength. Speaks in short, direct sentences."
    },
    {
        id: "garou", name: "Cosmic Garou", hp: 10000, atk: 650, spd: 160,
        img: "assests/garou.png", tier: "elite",
        personality: "chaotic, cosmic entity. Speaks of fate, heroes, and monsters in dramatic philosophical tone."
    },
    {
        id: "sukuna", name: "Ryomen Sukuna", hp: 7950, atk: 900, spd: 95,
        img: "assests/sukuna.png", tier: "elite",
        personality: "ancient demon king, utterly arrogant, sadistic, finds the battle amusing like a child playing with bugs."
    },
    {
        id: "doflamingo", name: "Doflamingo", hp: 8500, atk: 300, spd: 200,
        img: "assests/doflamingo.png", tier: "elite",
        personality: "theatrical crime lord, speaks with dramatic flair, mocks idealists, believes only power matters."
    },
    {
        id: "frieza", name: "Frieza", hp: 11000, atk: 380, spd: 105,
        img: "assests/frieza.png", tier: "elite",
        personality: "imperious galactic tyrant, polite yet utterly ruthless, speaks with aristocratic disdain."
    },
    {
        id: "madara", name: "Madara Uchiha", hp: 13000, atk: 420, spd: 88,
        img: "assests/madara.png", tier: "elite",
        personality: "legendary war god, utterly contemptuous of the weak, speaks with absolute certainty about destiny."
    },
    {
        id: "meruem", name: "Meruem", hp: 14000, atk: 500, spd: 112,
        img: "assests/meruem.png", tier: "elite",
        personality: "chimera ant king, brutally logical, dismisses all emotion, only acknowledges absolute power."
    },
    {
        id: "muzan", name: "Muzan Kibutsuji", hp: 28000, atk: 580, spd: 110,
        img: "assests/muzan.png", tier: "boss",
        personality: "terrifyingly calm, perfectionistic, speaks with quiet menace, considers all life beneath him."
    },
    {
        id: "yhwach", name: "Yhwach", hp: 32000, atk: 650, spd: 115,
        img: "assests/yhwach.png", tier: "boss",
        personality: "omniscient emperor, speaks in absolute certainties, sees all futures, pities those who oppose him."
    },
    {
        id: "kaguya", name: "Kaguya Otsutsuki", hp: 35000, atk: 700, spd: 98,
        img: "assests/kaguya.png", tier: "boss",
        personality: "primordial goddess, emotionless, ancient, speaks as though mortals are less than insects to her divinity."
    }
];

export const WAVE_CONFIG = [
    { wave: 1, enemyCount: 1, tierPool: ["elite"], hpMult: 0.6, atkMult: 0.7 },
    { wave: 2, enemyCount: 1, tierPool: ["elite"], hpMult: 0.8, atkMult: 0.85 },
    { wave: 3, enemyCount: 1, tierPool: ["elite"], hpMult: 1.0, atkMult: 1.0 },
    { wave: 4, enemyCount: 1, tierPool: ["elite"], hpMult: 1.2, atkMult: 1.1 },
    { wave: 5, enemyCount: 1, tierPool: ["boss"], hpMult: 0.7, atkMult: 0.9, label: "BOSS WAVE" },
    { wave: 6, enemyCount: 1, tierPool: ["elite"], hpMult: 1.5, atkMult: 1.2 },
    { wave: 7, enemyCount: 1, tierPool: ["elite"], hpMult: 1.8, atkMult: 1.3 },
    { wave: 8, enemyCount: 1, tierPool: ["boss"], hpMult: 1.0, atkMult: 1.0, label: "BOSS WAVE" },
];

export function getWaveConfig(waveNum) {
    if (waveNum <= WAVE_CONFIG.length) return WAVE_CONFIG[waveNum - 1];
    const scale = 1 + (waveNum - 8) * 0.25;
    const isBoss = waveNum % 5 === 0;
    return {
        wave: waveNum,
        enemyCount: 1,
        tierPool: isBoss ? ["boss"] : ["elite"],
        hpMult: scale,
        atkMult: scale * 0.85,
        label: isBoss ? "BOSS WAVE" : undefined
    };
}

