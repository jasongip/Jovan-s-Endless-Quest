export interface BossData {
  id: string;
  name: string;
  element: 'Fire' | 'Ice' | 'Lightning' | 'Poison' | 'Dark' | 'Earth';
  size: 9 | 13;
  emoji: string;
  title: string;
  lore: string;
}

export const BOSS_DATABASE: BossData[] = [
  {
    id: 'boss_1',
    name: '地獄火妖 (Hellfire Fiend)',
    element: 'Fire',
    size: 9,
    emoji: '👹🔥',
    title: '烈焰之主',
    lore: '自岩漿最深處凝聚而成的火妖，雙眼噴射著燃燒至萬度的火舌。'
  },
  {
    id: 'boss_2',
    name: '幽藍冰凍怪 (Glacial Frost-Fiend)',
    element: 'Ice',
    size: 9,
    emoji: '❄️👾',
    title: '永凍領主',
    lore: '在極寒冰淵凍結千年的魔怪，其氣息能瞬間將靠近的勇者化為冰雕。'
  },
  {
    id: 'boss_3',
    name: '熔岩爆裂烈火龍 (Volcanic Fire Dragon)',
    element: 'Fire',
    size: 13,
    emoji: '🔥🐉',
    title: '滅世之翼',
    lore: '古老預言中的紅蓮巨龍，每一次展翅都會在大地掀起毀滅性的火炸浪潮！'
  },
  {
    id: 'boss_4',
    name: '極寒深淵冰龍 (Abyssal Frost Dragon)',
    element: 'Ice',
    size: 13,
    emoji: '❄️🐉',
    title: '霜天支配者',
    lore: '盤踞於極地最底層的萬年冰龍，揮動雙翼便能引發覆蓋整座巨塔的暴風雪。'
  },
  {
    id: 'boss_5',
    name: '泰坦鋼鐵巨人 (Titanium Steel Giant)',
    element: 'Earth',
    size: 13,
    emoji: '🪨🤖',
    title: '不摧之盾',
    lore: '由古代超科技鋼鐵與咒文巨石結合而成的超巨型巨人，一腳即可踏碎大地。'
  },
  {
    id: 'boss_6',
    name: '地獄雙頭魔狼 (Orthrus Hellhound)',
    element: 'Dark',
    size: 9,
    emoji: '🐺☠️',
    title: '冥界看守犬',
    lore: '擁有兩個能吞噬靈魂的首級，咆哮時周圍會湧現冥界的黑暗迷霧。'
  },
  {
    id: 'boss_7',
    name: '幻紫妖姬九尾狐 (Phantasmal Nine-Tail Fox)',
    element: 'Dark',
    size: 9,
    emoji: '🦊🔮',
    title: '魅惑妖狐',
    lore: '幻術與鬼火的支配者，九條尾巴搖曳間能召喚出誘惑心智的紫色幽冥火。'
  },
  {
    id: 'boss_8',
    name: '風暴天狗 (Storm Feather Tengu)',
    element: 'Lightning',
    size: 9,
    emoji: '👺⚡',
    title: '雷霆行者',
    lore: '背負雙翼、面戴赤紅面具的古老天狗，手持團扇可隨意操縱雷雲與狂風。'
  },
  {
    id: 'boss_9',
    name: '詭秘面具怪客 (Masquerade Phantom)',
    element: 'Dark',
    size: 9,
    emoji: '🎭👥',
    title: '無面密使',
    lore: '遊走於光影交界處的神秘人，臉上的悲喜面具背後隱藏著吞噬一切的虛空。'
  },
  {
    id: 'boss_10',
    name: '白骨骷髏魔王 (Lich Skeleton Overlord)',
    element: 'Earth',
    size: 13,
    emoji: '💀👑',
    title: '不死主宰',
    lore: '統領無數亡靈的不死骷髏至尊，手持冥魂長劍，周身環繞著死亡的骸骨護盾。'
  },
  {
    id: 'boss_11',
    name: '不滅黏液史萊姆皇 (Slime Emperor)',
    element: 'Poison',
    size: 13,
    emoji: '🟢🤢',
    title: '暴食之主',
    lore: '無限分裂與重組的黏液怪首領，其體液帶有強烈腐蝕酸性，能融化鋼鐵。'
  },
  {
    id: 'boss_12',
    name: '狂雷暴烈雷龍 (Thunder Blitz Dragon)',
    element: 'Lightning',
    size: 13,
    emoji: '⚡🐉',
    title: '萬雷主宰',
    lore: '周身纏繞著藍紫色高壓電弧的雷光巨龍，它的降臨伴隨著天降狂雷。'
  },
  {
    id: 'boss_13',
    name: '虛空暗影魔眼 (Void Shadow Gazer)',
    element: 'Dark',
    size: 9,
    emoji: '🌀🌑',
    title: '深淵凝視者',
    lore: '誕生於虛無空間的巨大魔眼，凝視它的人靈魂會被吸入永恆的黑暗。'
  },
  {
    id: 'boss_14',
    name: '劇毒酸雨巨蛛 (Acid Toxic Arachnid)',
    element: 'Poison',
    size: 9,
    emoji: '🕷️🧪',
    title: '劇毒織網者',
    lore: '噴射綠色毒酸與腐蝕蛛網的恐怖魔蛛，吐息能讓萬物枯萎。'
  },
  {
    id: 'boss_15',
    name: '狂暴黃金比蒙巨人 (Golden Behemoth)',
    element: 'Earth',
    size: 13,
    emoji: '🧱🦁',
    title: '裂地巨獸',
    lore: '披著金色堅甲的遠古巨獸，體型如山，每前進一步都會地動山搖。'
  },
  {
    id: 'boss_16',
    name: '赤紅熔岩石魔 (Magma Rock Core)',
    element: 'Fire',
    size: 9,
    emoji: '🔥🧱',
    title: '熔岩核心',
    lore: '火山岩結晶化後形成的戰鬥魔石，體內流動著滾燙的地底核心。'
  },
  {
    id: 'boss_17',
    name: '寒夜冰霜女王 (Ice-bound Frost Queen)',
    element: 'Ice',
    size: 9,
    emoji: '❄️👸',
    title: '冰霜女皇',
    lore: '統領寒冰領域的高傲女皇，輕輕揮手便能在地面凝結出冰花尖刺。'
  },
  {
    id: 'boss_18',
    name: '霹靂狂電獅王 (Shockwave Blitz Lion)',
    element: 'Lightning',
    size: 9,
    emoji: '⚡🦁',
    title: '奔雷狂獸',
    lore: '渾身毛髮皆由金黃雷電構成的獅子王，一聲咆哮能震落九天驚雷。'
  },
  {
    id: 'boss_19',
    name: '沼澤毒疫腐爛怪 (Swamp Decay Fiend)',
    element: 'Poison',
    size: 9,
    emoji: '🦠🤢',
    title: '毒疫惡源',
    lore: '誕生於腐爛死水中的劇毒軟體怪，散發出綠色的致命毒煙。'
  },
  {
    id: 'boss_20',
    name: '千面邪惡面具神 (God of Thousand Masks)',
    element: 'Dark',
    size: 13,
    emoji: '👁️🎭',
    title: '千面邪神',
    lore: '由無數面具堆疊而成的邪神實體，其面相瞬息萬變，讓人捉摸不透。'
  },
  {
    id: 'boss_21',
    name: '千骨亡靈骨龍 (Skeleton Bone Dragon)',
    element: 'Earth',
    size: 13,
    emoji: '☠️🐉',
    title: '骸骨夢魘',
    lore: '由無數戰死巨龍骸骨組裝而成的亡靈邪龍，呼出帶有冥魂氣息的死氣。'
  },
  {
    id: 'boss_22',
    name: '太陽烈焰不死鳥 (Solar Flare Phoenix)',
    element: 'Fire',
    size: 13,
    emoji: '🔥🦅',
    title: '涅槃之翼',
    lore: '燃燒著太陽耀斑的不死聖鳥，在烈焰中重獲新生，熱量能焚盡一切邪惡。'
  },
  {
    id: 'boss_23',
    name: '極地凍土冰霜猛獁 (Tundra Frost Mammoth)',
    element: 'Ice',
    size: 13,
    emoji: '❄️🐘',
    title: '寒冬踐踏者',
    lore: '背負萬年寒冰的史前冰雪巨獸，兩根長牙是堅不可摧的玄冰神兵。'
  },
  {
    id: 'boss_24',
    name: '雷電魔狼芬里爾 (Purple Lightning Wolf)',
    element: 'Lightning',
    size: 9,
    emoji: '⚡🐺',
    title: '逐雷魔狼',
    lore: '在狂雷風暴中奔馳的藍紫魔狼，速度快如閃電，能召喚高壓雷擊。'
  },
  {
    id: 'boss_25',
    name: '劇毒腐蝕荊棘樹皇 (Corrosive Thorn Treant)',
    element: 'Poison',
    size: 13,
    emoji: '🥀🌳',
    title: '古木之怨',
    lore: '被毒雨污染、枯萎暴走的萬年古樹，帶刺的藤蔓流動著強烈酸液。'
  },
  {
    id: 'boss_26',
    name: '幽冥鬼火幽靈王 (Nether Flame Wraith King)',
    element: 'Dark',
    size: 9,
    emoji: '👻🔥',
    title: '幽冥之主',
    lore: '在幽暗廢墟中低吟的怨念集合體，召喚幽綠色的鬼火燃燒勇者的心智。'
  },
  {
    id: 'boss_27',
    name: '遺跡黃金守护神 (Golden Ruins Colossus)',
    element: 'Earth',
    size: 13,
    emoji: '🪙🧱',
    title: '黃金守護神',
    lore: '矗立在古代遺跡中的黃金戰神像，體表刻滿璀璨符文，神聖不可侵犯。'
  },
  {
    id: 'boss_28',
    name: '暗黑混沌天狗 (Dark Chaos Tengu)',
    element: 'Dark',
    size: 9,
    emoji: '👺🔮',
    title: '黑羽妖皇',
    lore: '墮入黑暗領域的至高天狗，展開漆黑的羽翼召喚大範圍暗黑法球。'
  },
  {
    id: 'boss_29',
    name: '黑水極惡史萊姆 (Dark-Matter Slime Prime)',
    element: 'Poison',
    size: 9,
    emoji: '🌑🤢',
    title: '漆黑汙泥',
    lore: '由宇宙暗物質與致命毒液結合而成的史萊姆，能吸收並同化周遭的能量。'
  },
  {
    id: 'boss_30',
    name: '時空交界支配面具 (Chronos Mask Arbiter)',
    element: 'Dark',
    size: 13,
    emoji: '⏳🎭',
    title: '時空裁決者',
    lore: '掌控時間與空間縫隙的終極面具，能夠自由撥動命運之輪，裁決凡世。'
  }
];

export function getRandomBoss(): BossData {
  const r = Math.floor(Math.random() * BOSS_DATABASE.length);
  return BOSS_DATABASE[r];
}

export function getBossById(id: string): BossData | undefined {
  return BOSS_DATABASE.find(b => b.id === id);
}

export function getBossByName(name: string): BossData | undefined {
  return BOSS_DATABASE.find(b => b.name === name);
}
