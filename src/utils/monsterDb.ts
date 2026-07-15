export interface MonsterData {
  id: string;
  name: string;
  biome: 'grass' | 'cave' | 'snow' | 'volcano' | 'ruins';
  type: 'math' | 'chinese' | 'english' | 'logic';
  shape: 'slime' | 'goblin' | 'beast' | 'ghost' | 'golem';
  bodyColor: string;
  accentColor: string;
}

export const MONSTER_DATABASE: MonsterData[] = [
  // ==================== GRASS (翡翠草原) ====================
  {
    id: 'grass_1',
    name: '翡翠史萊姆 (Green Slime)',
    biome: 'grass',
    type: 'math',
    shape: 'slime',
    bodyColor: '#22c55e',
    accentColor: '#15803d'
  },
  {
    id: 'grass_2',
    name: '森林獨角兔 (Horned Rabbit)',
    biome: 'grass',
    type: 'chinese',
    shape: 'beast',
    bodyColor: '#f1f5f9',
    accentColor: '#facc15'
  },
  {
    id: 'grass_3',
    name: '尖刺棘花怪 (Thorn Flower)',
    biome: 'grass',
    type: 'english',
    shape: 'goblin',
    bodyColor: '#84cc16',
    accentColor: '#ef4444'
  },
  {
    id: 'grass_4',
    name: '草原幼狼 (Grassland Wolf)',
    biome: 'grass',
    type: 'logic',
    shape: 'beast',
    bodyColor: '#64748b',
    accentColor: '#334155'
  },
  {
    id: 'grass_5',
    name: '惡作劇哥布林 (Forest Goblin)',
    biome: 'grass',
    type: 'math',
    shape: 'goblin',
    bodyColor: '#4ade80',
    accentColor: '#b45309'
  },
  {
    id: 'grass_6',
    name: '暴躁小野豬 (Wild Boar)',
    biome: 'grass',
    type: 'chinese',
    shape: 'beast',
    bodyColor: '#78350f',
    accentColor: '#451a03'
  },
  {
    id: 'grass_7',
    name: '劇毒斑點菇 (Poisonous Mushroom)',
    biome: 'grass',
    type: 'english',
    shape: 'slime',
    bodyColor: '#ec4899',
    accentColor: '#f43f5e'
  },
  {
    id: 'grass_8',
    name: '大食怪毛毛蟲 (Giant Caterpillar)',
    biome: 'grass',
    type: 'logic',
    shape: 'ghost',
    bodyColor: '#a855f7',
    accentColor: '#22c55e'
  },
  {
    id: 'grass_9',
    name: '微風小皮克希 (Wind Pixie)',
    biome: 'grass',
    type: 'math',
    shape: 'ghost',
    bodyColor: '#38bdf8',
    accentColor: '#0ea5e9'
  },
  {
    id: 'grass_10',
    name: '草原流竄盜賊 (Grassland Thief)',
    biome: 'grass',
    type: 'english',
    shape: 'goblin',
    bodyColor: '#f59e0b',
    accentColor: '#1e293b'
  },

  // ==================== CAVE (幽暗岩洞) ====================
  {
    id: 'cave_1',
    name: '紫影吸血蝙蝠 (Cave Bat)',
    biome: 'cave',
    type: 'chinese',
    shape: 'ghost',
    bodyColor: '#701a75',
    accentColor: '#d946ef'
  },
  {
    id: 'cave_2',
    name: '尖刺岩石蜘蛛 (Rock Spider)',
    biome: 'cave',
    type: 'math',
    shape: 'beast',
    bodyColor: '#475569',
    accentColor: '#94a3b8'
  },
  {
    id: 'cave_3',
    name: '洞穴暗影爬行者 (Shadow Crawler)',
    biome: 'cave',
    type: 'logic',
    shape: 'ghost',
    bodyColor: '#1e1b4b',
    accentColor: '#312e81'
  },
  {
    id: 'cave_4',
    name: '守衛石魔像 (Stone Golem)',
    biome: 'cave',
    type: 'english',
    shape: 'golem',
    bodyColor: '#334155',
    accentColor: '#06b6d4'
  },
  {
    id: 'cave_5',
    name: '閃耀晶背甲蟲 (Crystal Beetle)',
    biome: 'cave',
    type: 'math',
    shape: 'slime',
    bodyColor: '#0d9488',
    accentColor: '#2dd4bf'
  },
  {
    id: 'cave_6',
    name: '地底豺狼礦工 (Underground Kobold)',
    biome: 'cave',
    type: 'chinese',
    shape: 'goblin',
    bodyColor: '#b45309',
    accentColor: '#f59e0b'
  },
  {
    id: 'cave_7',
    name: '遠古食鐵小獸 (Iron-eating Beast)',
    biome: 'cave',
    type: 'english',
    shape: 'beast',
    bodyColor: '#52525b',
    accentColor: '#a1a1aa'
  },
  {
    id: 'cave_8',
    name: '擬態鐘乳石怪 (Stalactite Mimic)',
    biome: 'cave',
    type: 'logic',
    shape: 'golem',
    bodyColor: '#3f3f46',
    accentColor: '#ef4444'
  },
  {
    id: 'cave_9',
    name: '巨鉗洞穴毒蠍 (Cave Scorpion)',
    biome: 'cave',
    type: 'math',
    shape: 'beast',
    bodyColor: '#7c2d12',
    accentColor: '#f97316'
  },
  {
    id: 'cave_10',
    name: '邪惡黑暗薩滿 (Dark Shaman)',
    biome: 'cave',
    type: 'chinese',
    shape: 'goblin',
    bodyColor: '#3b0764',
    accentColor: '#c084fc'
  },

  // ==================== SNOW (寒冰雪域) ====================
  {
    id: 'snow_1',
    name: '極地霜凍史萊姆 (Snow Slime)',
    biome: 'snow',
    type: 'english',
    shape: 'slime',
    bodyColor: '#e0f2fe',
    accentColor: '#0284c7'
  },
  {
    id: 'snow_2',
    name: '疾風白極地狼 (Ice Wolf)',
    biome: 'snow',
    type: 'logic',
    shape: 'beast',
    bodyColor: '#f8fafc',
    accentColor: '#38bdf8'
  },
  {
    id: 'snow_3',
    name: '暴雪巨型雪人 (Frost Yeti)',
    biome: 'snow',
    type: 'math',
    shape: 'golem',
    bodyColor: '#f1f5f9',
    accentColor: '#94a3b8'
  },
  {
    id: 'snow_4',
    name: '寒夜冰霜雪鴞 (Snow Owl)',
    biome: 'snow',
    type: 'chinese',
    shape: 'ghost',
    bodyColor: '#e2e8f0',
    accentColor: '#cbd5e1'
  },
  {
    id: 'snow_5',
    name: '冰晶高階元素 (Ice Elemental)',
    biome: 'snow',
    type: 'english',
    shape: 'ghost',
    bodyColor: '#bae6fd',
    accentColor: '#60a5fa'
  },
  {
    id: 'snow_6',
    name: '凍土尖角猛獁 (Tundra Mammoth)',
    biome: 'snow',
    type: 'logic',
    shape: 'beast',
    bodyColor: '#475569',
    accentColor: '#f1f5f9'
  },
  {
    id: 'snow_7',
    name: '深淵霜凍幼龍 (Frost Wyrm)',
    biome: 'snow',
    type: 'math',
    shape: 'beast',
    bodyColor: '#0284c7',
    accentColor: '#e0f2fe'
  },
  {
    id: 'snow_8',
    name: '雪原偽裝強盜 (Snow Thief)',
    biome: 'snow',
    type: 'chinese',
    shape: 'goblin',
    bodyColor: '#94a3b8',
    accentColor: '#475569'
  },
  {
    id: 'snow_9',
    name: '皇家企鵝戰士 (Penguin Warrior)',
    biome: 'snow',
    type: 'english',
    shape: 'slime',
    bodyColor: '#1e293b',
    accentColor: '#f59e0b'
  },
  {
    id: 'snow_10',
    name: '遠古冰霜巨魔 (Ice Troll)',
    biome: 'snow',
    type: 'logic',
    shape: 'golem',
    bodyColor: '#0369a1',
    accentColor: '#bae6fd'
  },

  // ==================== VOLCANO (烈焰火山) ====================
  {
    id: 'volcano_1',
    name: '熔岩爆裂史萊姆 (Fire Slime)',
    biome: 'volcano',
    type: 'math',
    shape: 'slime',
    bodyColor: '#f97316',
    accentColor: '#7f1d1d'
  },
  {
    id: 'volcano_2',
    name: '黑甲熔岩居蟹 (Lava Crab)',
    biome: 'volcano',
    type: 'chinese',
    shape: 'beast',
    bodyColor: '#991b1b',
    accentColor: '#ea580c'
  },
  {
    id: 'volcano_3',
    name: '烈羽猛焰精靈 (Flame Sprite)',
    biome: 'volcano',
    type: 'english',
    shape: 'ghost',
    bodyColor: '#f59e0b',
    accentColor: '#ef4444'
  },
  {
    id: 'volcano_4',
    name: '雙頭地獄惡犬 (Hellhound)',
    biome: 'volcano',
    type: 'logic',
    shape: 'beast',
    bodyColor: '#450a0a',
    accentColor: '#dc2626'
  },
  {
    id: 'volcano_5',
    name: '活火山熔岩巨人 (Magma Golem)',
    biome: 'volcano',
    type: 'math',
    shape: 'golem',
    bodyColor: '#1c1917',
    accentColor: '#ea580c'
  },
  {
    id: 'volcano_6',
    name: '紅蓮烈焰小鬼 (Fire Imp)',
    biome: 'volcano',
    type: 'chinese',
    shape: 'goblin',
    bodyColor: '#dc2626',
    accentColor: '#facc15'
  },
  {
    id: 'volcano_7',
    name: '不死鳥烈焰雛鳥 (Phoenix Chick)',
    biome: 'volcano',
    type: 'english',
    shape: 'ghost',
    bodyColor: '#f97316',
    accentColor: '#facc15'
  },
  {
    id: 'volcano_8',
    name: '灼熱火山灰殭屍 (Ash Zombie)',
    biome: 'volcano',
    type: 'logic',
    shape: 'goblin',
    bodyColor: '#292524',
    accentColor: '#78716c'
  },
  {
    id: 'volcano_9',
    name: '黑曜石尖角石像鬼 (Obsidian Gargoyle)',
    biome: 'volcano',
    type: 'math',
    shape: 'golem',
    bodyColor: '#0c0a09',
    accentColor: '#a855f7'
  },
  {
    id: 'volcano_10',
    name: '紅焰巨龍幼崽 (Red Dragon Hatchling)',
    biome: 'volcano',
    type: 'chinese',
    shape: 'beast',
    bodyColor: '#b91c1c',
    accentColor: '#facc15'
  },

  // ==================== RUINS (古老遺跡) ====================
  {
    id: 'ruins_1',
    name: '遺跡雕像石像鬼 (Ancient Gargoyle)',
    biome: 'ruins',
    type: 'logic',
    shape: 'golem',
    bodyColor: '#1e293b',
    accentColor: '#10b981'
  },
  {
    id: 'ruins_2',
    name: '遠古機械遺跡守衛 (Relic Sentinel)',
    biome: 'ruins',
    type: 'math',
    shape: 'golem',
    bodyColor: '#0f172a',
    accentColor: '#eab308'
  },
  {
    id: 'ruins_3',
    name: '白骨復甦骷髏兵 (Skeleton Soldier)',
    biome: 'ruins',
    type: 'chinese',
    shape: 'goblin',
    bodyColor: '#f1f5f9',
    accentColor: '#64748b'
  },
  {
    id: 'ruins_4',
    name: '法老王詛咒木乃伊 (Cursed Mummy)',
    biome: 'ruins',
    type: 'english',
    shape: 'goblin',
    bodyColor: '#d97706',
    accentColor: '#451a03'
  },
  {
    id: 'ruins_5',
    name: '幽綠迴盪遺跡幽靈 (Wraith)',
    biome: 'ruins',
    type: 'logic',
    shape: 'ghost',
    bodyColor: '#14532d',
    accentColor: '#4ade80'
  },
  {
    id: 'ruins_6',
    name: '禁忌懸浮魔導書 (Magic Book)',
    biome: 'ruins',
    type: 'math',
    shape: 'ghost',
    bodyColor: '#4c1d95',
    accentColor: '#a855f7'
  },
  {
    id: 'ruins_7',
    name: '古代符文守護石人 (Runestone Golem)',
    biome: 'ruins',
    type: 'chinese',
    shape: 'golem',
    bodyColor: '#0f172a',
    accentColor: '#38bdf8'
  },
  {
    id: 'ruins_8',
    name: '貪婪偽裝寶箱怪 (Mimic Chest)',
    biome: 'ruins',
    type: 'english',
    shape: 'slime',
    bodyColor: '#7c2d12',
    accentColor: '#dc2626'
  },
  {
    id: 'ruins_9',
    name: '終焉暗影刺客 (Shadow Assassin)',
    biome: 'ruins',
    type: 'logic',
    shape: 'ghost',
    bodyColor: '#090d16',
    accentColor: '#9333ea'
  },
  {
    id: 'ruins_10',
    name: '深淵死靈大法師 (Necromancer)',
    biome: 'ruins',
    type: 'math',
    shape: 'goblin',
    bodyColor: '#180828',
    accentColor: '#c084fc'
  }
];

export function getMonstersByBiome(biome: 'grass' | 'cave' | 'snow' | 'volcano' | 'ruins'): MonsterData[] {
  return MONSTER_DATABASE.filter(m => m.biome === biome);
}

export function getRandomMonster(biome: 'grass' | 'cave' | 'snow' | 'volcano' | 'ruins'): MonsterData {
  const list = getMonstersByBiome(biome);
  return list[Math.floor(Math.random() * list.length)];
}
