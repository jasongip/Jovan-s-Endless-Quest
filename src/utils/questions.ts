/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { QuizQuestion } from '../types';

// ============================================================================
// 1. DATA DICTIONARIES (To support massive vocabulary and procedural questions)
// ============================================================================

// A high-quality HK primary level Chinese Character/Word Database (approx. 50 high-frequency items for P1/P2)
export interface ChineseWord {
  word: string;
  en: string;
  strokes: number; // level mapping
  similar: string[]; // visually similar but not homophones (for pronunciation quiz)
}

export const CHINESE_WORDS_DB: ChineseWord[] = [
  { word: "學校", en: "school", strokes: 16, similar: ["學咬", "學絞", "字校", "學較"] },
  { word: "同學", en: "classmate", strokes: 6, similar: ["筒學", "同字", "司學", "向學"] },
  { word: "太陽", en: "sun", strokes: 4, similar: ["大陽", "犬陽", "太湯", "木陽"] },
  { word: "禮貌", en: "polite", strokes: 17, similar: ["體貌", "禮貎", "札貌", "豊貌"] },
  { word: "鉛筆", en: "pencil", strokes: 13, similar: ["沿筆", "鉛竹", "船筆", "鉛車"] },
  { word: "蘋果", en: "apple", strokes: 19, similar: ["蘋菓", "頻果", "平果", "蘋裏"] },
  { word: "唱歌", en: "sing", strokes: 10, similar: ["倡歌", "哈歌", "唱哥", "喝歌"] },
  { word: "畫畫", en: "draw", strokes: 12, similar: ["劃畫", "書畫", "田畫", "晝畫"] },
  { word: "衣服", en: "clothes", strokes: 6, similar: ["依服", "衣報", "表服", "衣月"] },
  { word: "明亮", en: "bright", strokes: 8, similar: ["朋亮", "明高", "萌亮", "盟亮"] },
  { word: "眼睛", en: "eyes", strokes: 11, similar: ["眼晴", "限晶", "眠精", "眼月"] },
  { word: "大樹", en: "tree", strokes: 3, similar: ["太樹", "大對", "大村", "犬樹"] },
  { word: "玩耍", en: "play", strokes: 8, similar: ["元耍", "完耍", "玩要", "玩西"] },
  { word: "早晨", en: "morning", strokes: 6, similar: ["草晨", "早振", "早農", "旱晨"] },
  { word: "操場", en: "playground", strokes: 16, similar: ["燥場", "澡場", "操湯", "燥傷"] },
  { word: "水果", en: "fruit", strokes: 4, similar: ["永果", "水課", "冰果", "木果"] },
  { word: "小貓", en: "cat", strokes: 3, similar: ["小描", "少貓", "小苗", "小錨"] },
  { word: "小狗", en: "dog", strokes: 3, similar: ["小拘", "小旬", "少狗", "小敬"] },
  { word: "書本", en: "book", strokes: 10, similar: ["畫本", "書木", "晝本", "君本"] },
  { word: "老師", en: "teacher", strokes: 10, similar: ["考師", "老帥", "者師", "孝師"] },
  { word: "清水", en: "water", strokes: 11, similar: ["睛水", "晴水", "清冰", "請水"] },
  { word: "小鳥", en: "bird", strokes: 3, similar: ["小烏", "少鳥", "小馬", "小鳴"] },
  { word: "飛機", en: "airplane", strokes: 9, similar: ["非機", "飛幾", "菲機", "蜚機"] },
  { word: "花朵", en: "flower", strokes: 7, similar: ["化朵", "華朵", "荷朵", "葉朵"] },
  { word: "牛奶", en: "milk", strokes: 4, similar: ["午奶", "牛乃", "生奶", "半奶"] },
  { word: "快樂", en: "happy", strokes: 7, similar: ["快落", "抉樂", "怏樂", "決樂"] },
  { word: "溫暖", en: "warm", strokes: 12, similar: ["濕暖", "溫緩", "溫愛", "慍暖"] },
  { word: "綠草", en: "grass", strokes: 14, similar: ["綠早", "緣草", "祿草", "錄草"] },
  { word: "森林", en: "forest", strokes: 12, similar: ["森木", "淋林", "森淋", "林森"] },
  { word: "天空", en: "sky", strokes: 4, similar: ["夫空", "天穿", "吞空", "夭空"] },
  { word: "海洋", en: "ocean", strokes: 10, similar: ["每洋", "海樣", "梅洋", "誨洋"] },
  { word: "月亮", en: "moon", strokes: 4, similar: ["用亮", "月高", "朋亮", "目亮"] },
  { word: "故事", en: "story", strokes: 9, similar: ["姑事", "故是", "胡事", "故時"] },
  { word: "功課", en: "homework", strokes: 5, similar: ["工課", "功科", "攻課", "巧課"] },
  { word: "健康", en: "healthy", strokes: 11, similar: ["健庚", "建康", "律康", "鍵康"] },
  { word: "身體", en: "body", strokes: 7, similar: ["躬體", "身禮", "射體", "身䯚"] },
  { word: "感謝", en: "thank", strokes: 12, similar: ["敢謝", "感射", "寬謝", "慼謝"] },
  { word: "學習", en: "study", strokes: 16, similar: ["學羽", "字習", "覺習", "學刁"] },
  { word: "操心", en: "worry", strokes: 16, similar: ["燥心", "澡心", "操必", "操沁"] },
  { word: "時間", en: "time", strokes: 10, similar: ["時問", "持間", "詩間", "時開"] },
  { word: "鐘錶", en: "clock", strokes: 20, similar: ["鐘表", "鏡錶", "鐘裏", "鐘牌"] },
  { word: "朋友", en: "friend", strokes: 8, similar: ["明友", "朋有", "崩友", "胡友"] },
  { word: "幫助", en: "help", strokes: 12, similar: ["綁助", "幫且", "幚助", "鄉助"] },
  { word: "遊戲", en: "game", strokes: 12, similar: ["遊劇", "遊虐", "游戲", "旅戲"] },
  { word: "圖書", en: "library book", strokes: 14, similar: ["團書", "圖畫", "圓書", "國書"] },
  { word: "玩具", en: "toy", strokes: 8, similar: ["玩貝", "完具", "玩且", "冠具"] },
  { word: "洗手", en: "wash hands", strokes: 9, similar: ["洗毛", "洗首", "冼手", "選手"] },
  { word: "睡覺", en: "sleep", strokes: 13, similar: ["睡學", "唾覺", "睡黨", "睡管"] },
  { word: "跑步", en: "running", strokes: 12, similar: ["包步", "跑涉", "咆步", "抱步"] },
  { word: "跳繩", en: "skipping", strokes: 13, similar: ["兆繩", "挑繩", "佻繩", "桃繩"] }
];

// static HK P1/P2 Cloze & Reorder arrays
const CHINESE_FILL_TEMPLATES = [
  { question: "今天天氣很___，太陽真溫暖。", options: ["晴", "跑", "吃", "跳"], correctAnswer: "晴", explanation: "「晴」代表晴天，與後面的「太陽真溫暖」最配合。" },
  { question: "我和同學一起去___學校。", options: ["上", "看", "飛", "哭"], correctAnswer: "上", explanation: "「上學校」是去學校上課、讀書的意思。" },
  { question: "天上有美麗的___雲。", options: ["白", "黑", "大", "小"], correctAnswer: "白", explanation: "晴朗的天空中通常有「白」雲。" },
  { question: "小鳥在樹上快樂地___歌。", options: ["唱", "畫", "走", "跳"], correctAnswer: "唱", explanation: "小鳥發出的美妙鳴叫聲就像是在「唱」歌。" },
  { question: "明亮的眼睛是用來看東___的。", options: ["西", "南", "北", "前"], correctAnswer: "西", explanation: "「東西」在中文裏泛指各種事物或物品。" },
  { question: "春天的花朵真___麗，五顏六色。", options: ["美", "沒", "每", "妹"], correctAnswer: "美", explanation: "「美麗」常用來形容花朵好看。" },
  { question: "小狗在花園裏興奮地___來跳去。", options: ["跑", "飽", "抱", "炮"], correctAnswer: "跑", explanation: "「跑來跳去」是常見的動作描寫。" },
  { question: "媽媽每天親手做美味的___餐給我吃。", options: ["晚", "萬", "慢", "玩"], correctAnswer: "晚", explanation: "「晚餐」是晚上吃的一頓飯。" },
  { question: "請你幫忙把書桌整理乾___。", options: ["淨", "靜", "睜", "爭"], correctAnswer: "淨", explanation: "「乾淨」代表清潔整齊。" },
  { question: "弟弟一邊唱歌，一邊大___大跳。", options: ["蹦", "蓬", "崩", "本"], correctAnswer: "蹦", explanation: "「蹦蹦跳跳」形容活潑歡樂。" },
  { question: "天黑了，美麗的月亮出來___了。", options: ["照", "招", "召", "朝"], correctAnswer: "照", explanation: "月光「照射」大地。" },
  { question: "上課時，我們要專心聽老師___故事。", options: ["講", "講", "講", "講"], correctAnswer: "講", explanation: "「講故事」即說故事。" },
  { question: "我有一個相親相___的溫馨家庭。", options: ["愛", "哀", "矮", "艾"], correctAnswer: "愛", explanation: "「相親相愛」形容家庭和睦。" },
  { question: "放學後，我們在操場上踢足___。", options: ["球", "求", "秋", "救"], correctAnswer: "球", explanation: "「足球」是體育活動。" },
  { question: "魚兒在清澈的池塘裏自由自由地___水。", options: ["游", "油", "尤", "優"], correctAnswer: "游", explanation: "魚在水中「游泳」。" },
  { question: "大雨過後，天邊出現了一道美麗的___虹。", options: ["彩", "採", "菜", "踩"], correctAnswer: "彩", explanation: "「彩虹」是雨後的自然現象。" },
  { question: "小貓咪蜷縮在沙發上安靜地睡___。", options: ["覺", "角", "腳", "攪"], correctAnswer: "覺", explanation: "「睡覺」代表休息。" },
  { question: "我們應該多吃新鮮的___菜和水果。", options: ["蔬", "疏", "書", "梳"], correctAnswer: "蔬", explanation: "「蔬菜」有益健康。" },
  { question: "上體育課時，同學們要排___整齊的隊伍。", options: ["出", "處", "除", "初"], correctAnswer: "出", explanation: "「排出」隊伍。" },
  { question: "小草從泥土裏探出頭來，綠___的十分可愛。", options: ["油油", "油油", "油油", "油油"], correctAnswer: "油油", explanation: "「綠油油」形容草木茂盛翠綠。" },
  { question: "過馬路時，我們要牽著大人的___才安全。", options: ["手", "毛", "首", "受"], correctAnswer: "手", explanation: "「牽手」走過馬路。" },
  { question: "大熊貓最喜歡吃鮮嫩的竹___。", options: ["葉", "夜", "野", "爺"], correctAnswer: "葉", explanation: "「竹葉」是熊貓的食物。" },
  { question: "秋天到了，樹上的黃葉紛紛___落。", options: ["飄", "漂", "票", "標"], correctAnswer: "飄", explanation: "「飄落」形容落葉在風中落下的樣子。" },
  { question: "我們要養成早起早___的好習慣。", options: ["睡", "瑞", "誰", "說"], correctAnswer: "睡", explanation: "「早起早睡」是健康的生活規律。" },
  { question: "吃飯前，我們必須用肥皂把手洗乾___。", options: ["淨", "靜", "勁", "鏡"], correctAnswer: "淨", explanation: "洗乾淨雙手預防傳染病。" }
];

const CHINESE_REORDER_TEMPLATES = [
  { question: "【句子重組】請依順序點擊字塊，排列成文法正確的完整句子：", scrambledWords: ["媽媽", "公園", "去", "帶我"], correctAnswer: "媽媽帶裝我去公園。", scrambledExplanation: "媽媽帶我去公園。" },
  { question: "【句子重組】請依順序點擊字塊，排列成文法正確的完整句子：", scrambledWords: ["小貓", "一隻", "有", "地上"], correctAnswer: "地上有一隻小貓。", scrambledExplanation: "地上有一隻小貓。" },
  { question: "【句子重組】請依順序點擊字塊，排列成文法正確的完整句子：", scrambledWords: ["妹妹", "在", "唱歌", "高興地"], correctAnswer: "妹妹在高興地唱歌。", scrambledExplanation: "妹妹在高興地唱歌。" },
  { question: "【句子重組】請依順序點擊字塊，排列成文法正確的完整句子：", scrambledWords: ["老師", "我們", "故事", "講", "聽"], correctAnswer: "我們聽老師講故事。", scrambledExplanation: "我們聽老師講故事。" },
  { question: "【句子重組】請依順序點擊字塊，排列成文法正確的完整句子：", scrambledWords: ["小鳥", "樹上", "在", "唱歌", "高聲"], correctAnswer: "小鳥在樹上高聲唱歌。", scrambledExplanation: "小鳥在樹上高聲唱歌。" },
  { question: "【句子重組】請依順序點擊字塊，排列成文法正確的完整句子：", scrambledWords: ["我們", "操場上", "在", "賽跑", "快樂地"], correctAnswer: "我們在操場上快樂地賽跑。", scrambledExplanation: "我們在操場上快樂地賽跑。" },
  { question: "【句子重組】請依順序點擊字塊，排列成文法正確的完整句子：", scrambledWords: ["爸爸", "買了", "一個", "大西瓜", "甜甜的"], correctAnswer: "爸爸買了一個甜甜的大西瓜。", scrambledExplanation: "爸爸買了一個甜甜的大西瓜。" },
  { question: "【句子重組】請依順序點擊字塊，排列成文法正確的完整句子：", scrambledWords: ["花園裏", "開滿了", "美麗的", "紅色玫瑰花"], correctAnswer: "花園裏開滿了美麗的紅色玫瑰花。", scrambledExplanation: "花園裏開滿了美麗的紅色玫瑰花。" },
  { question: "【句子重組】請依順序點擊字塊，排列成文法正確的完整句子：", scrambledWords: ["魚兒", "水裏", "在", "自由自在地", "游泳"], correctAnswer: "魚兒在水裏自由自在地游泳。", scrambledExplanation: "魚兒在水裏自由自在地游泳。" },
  { question: "【句子重組】請依順序點擊字塊，排列成文法正確的完整句子：", scrambledWords: ["太陽", "從", "東方", "升起來了", "亮晶晶的"], correctAnswer: "亮晶晶的太陽從東方升起來了。", scrambledExplanation: "亮晶晶的太陽從東方升起來了。" },
  { question: "【句子重組】請依順序點擊字塊，排列成文法正確的完整句子：", scrambledWords: ["小狗", "搖著尾巴", "迎接", "我", "回家"], correctAnswer: "小狗搖著尾巴迎接我回家。", scrambledExplanation: "小狗搖著尾巴迎接我回家。" },
  { question: "【句子重組】請依順序點擊字塊，排列成文法正確的完整句子：", scrambledWords: ["我", "一邊", "吃蘋果", "一邊", "聽音樂"], correctAnswer: "我一邊吃蘋果一邊聽音樂。", scrambledExplanation: "我一邊吃蘋果一邊聽音樂。" },
  { question: "【句子重組】請依順序點擊字塊，排列成文法正確的完整句子：", scrambledWords: ["天空", "雨後", "出現了", "一道", "彩虹"], correctAnswer: "雨後天空出現了一道彩虹。", scrambledExplanation: "雨後天空出現了一道彩虹。" },
  { question: "【句子重組】請依順序點擊字塊，排列成文法正確的完整句子：", scrambledWords: ["哥哥", "在書房", "認真地", "做功課"], correctAnswer: "哥哥在書房認真地做功課。", scrambledExplanation: "哥哥在書房認真地做功課。" },
  { question: "【句子重組】請依順序點擊字塊，排列成文法正確的完整句子：", scrambledWords: ["我和同學", "一齊", "高高興興地", "上學校"], correctAnswer: "我和同學一齊高高興興地上學校。", scrambledExplanation: "我和同學一齊高高興興地上學校。" }
];

// Chinese missing strokes (漢字修復) - 30 questions
const CHINESE_STROKE_TEMPLATES = [
  { question: "【漢字修復】「太」字如果漏寫了哪一個關鍵筆劃，就會變成「大」字？", options: ["丶 (點)", "丨 (豎)", "丿 (撇)", "乛 (橫折)"], correctAnswer: "丶 (點)", explanation: "「大」字中間下方加上一個「丶」(點) 筆劃，就會變成「太」字。" },
  { question: "【漢字修復】「木」字在最下方加上一橫「一」筆劃，會變成哪一個漢字？", options: ["本", "日", "禾", "犬"], correctAnswer: "本", explanation: "「木」字的根部加上一橫「一」代表樹木的根，就是「本」字。" },
  { question: "【漢字修復】「日」字中間加上一橫「一」筆劃會變成哪一個漢字？", options: ["目", "口", "田", "白"], correctAnswer: "目", explanation: "「日」字代表太陽，中間再加一橫「一」就會變成代表眼睛的「目」字。" },
  { question: "【漢字修復】「口」字中間穿過一豎「丨」筆劃，會變成哪一個漢字？", options: ["中", "日", "四", "田"], correctAnswer: "中", explanation: "「口」字中間穿過一豎「丨」，就成為「中心」的「中」字。" },
  { question: "【漢字修復】「人」字上面加上一橫「一」，會變成哪一個漢字？", options: ["大", "天", "木", "夫"], correctAnswer: "大", explanation: "「人」字頭上加上一橫「一」，就成了「大」字。" },
  { question: "【漢字修復】「大」字上面加上一橫「一」，會變成哪一個漢字？", options: ["天", "夫", "太", "犬"], correctAnswer: "天", explanation: "「大」字上面再加一橫「一」就是「天空」的「天」字。" },
  { question: "【漢字修復】「王」字如果右下方點一個「丶」(點)，會變成哪一個漢字？", options: ["玉", "主", "五", "壬"], correctAnswer: "玉", explanation: "「王」字加一「丶」(點) 筆劃就是美玉的「玉」字。" },
  { question: "【漢字修復】「日」字如果加了一撇「丿」和一折，變成圍起來的十字，也就是「田」，它是加了什麼筆劃？", options: ["十", "口", "二", "一"], correctAnswer: "十", explanation: "「日」字裏面再多加一個十字或筆劃，形成四方格就是「田」字。" },
  { question: "【漢字修復】「九」字如果中間加一撇「丿」，變成了丸子的「丸」，漏寫了哪個筆劃？", options: ["丶 (點)", "一 (橫)", "丨 (豎)", "丿 (撇)"], correctAnswer: "丶 (點)", explanation: "「九」字加一「丶」(點) 筆劃就成了藥丸、丸子的「丸」字。" },
  { question: "【漢字修復】「干」字上面加了一撇「丿」，會變成哪一個字？", options: ["千", "平", "手", "午"], correctAnswer: "千", explanation: "「干」字頭上加一撇，就是數值「一千」的「千」字。" },
  { question: "【漢字修復】「十」字如果加上一撇「丿」和一捺「乀」，會變成哪一個字？", options: ["木", "本", "米", "禾"], correctAnswer: "木", explanation: "「十」字加上撇捺就是大木頭的「木」字。" },
  { question: "【漢字修復】「木」字如果上面再多長了一撇「丿」，會變成哪一個與農作物有關的字？", options: ["禾", "米", "未", "末"], correctAnswer: "禾", explanation: "「木」字頂端加一撇代表垂下的稻穗，是「禾苗」的「禾」字。" },
  { question: "【漢字修復】「禾」字如果右上方加了一點「丶」，會變成哪一個代表寵物的字？", options: ["犬", "貓", "兔", "豬"], correctAnswer: "犬", explanation: "「大」字右上方加一點，就是小狗或「犬」隻的「犬」字。" },
  { question: "【漢字修復】「工」字如果中間再加一橫「一」，會變成哪一個代表泥土的字？", options: ["土", "士", "干", "王"], correctAnswer: "土", explanation: "「工」字底部較長，加一橫並調整長度，就成了泥土的「土」字。" },
  { question: "【漢字修復】「口」字如果裏面加了一個「人」，會變成哪一個代表囚禁、或外框圍住人的字？", options: ["囚", "因", "回", "四"], correctAnswer: "囚", explanation: "「口」字框裏面有個人，是「囚犯」的「囚」字。" },
  { question: "【漢字修復】「口」字裏面如果加了一個「口」字，會變成哪一個代表往回走的字？", options: ["回", "因", "四", "國"], correctAnswer: "回", explanation: "大口包小口，就是回家、回頭的「回」字。" },
  { question: "【漢字修復】「一」字如果下方加上一小橫和一長橫，會變成什麼字？", options: ["三", "二", "工", "土"], correctAnswer: "三", explanation: "三橫合在一起就是數字「三」。" },
  { question: "【漢字修復】「力」字如果頂端漏了出頭，左側加上一撇，會變成代表刀子的什麼字？", options: ["刀", "萬", "九", "乃"], correctAnswer: "刀", explanation: "「力」字頂部不出頭，就是切菜「刀」的「刀」字。" },
  { question: "【漢字修復】「牛」字如果頂部漏了出頭的一豎「丨」，會變成哪一個代表中午、午餐的字？", options: ["午", "牛", "半", "平"], correctAnswer: "午", explanation: "「牛」字頂部那一豎不出頭，就成了中午的「午」字。" },
  { question: "【漢字修復】「二」字如果中間加一豎「丨」，會變成什麼字？", options: ["工", "土", "干", "十"], correctAnswer: "工", explanation: "兩橫中間用一豎連起來，就是「工作」的「工」字。" },
  { question: "【漢字修復】「厂」字裏面如果加上了「力」字，會變成代表什麼字？", options: ["歷", "辦", "原", "力"], correctAnswer: "歷", explanation: "「厂」加「力」是部分簡體或古寫，但在繁體字中通常「厂」加「力」為「歷」字的草創部件或「厚」的變形。此處正確選項中「刀」和「力」的演變，我們選最常見的「力」字變形。" },
  { question: "【漢字修復】「巴」字如果左側加上「父」字，會變成哪一個稱呼？", options: ["爸", "把", "吧", "爬"], correctAnswer: "爸", explanation: "「父」字加上「巴」字就是「爸爸」的「爸」字。" },
  { question: "【漢字修復】「女」字如果右邊加上「馬」字，會變成哪一個稱呼？", options: ["媽", "妹", "姐", "姑"], correctAnswer: "媽", explanation: "「女」字旁加上「馬」就是「媽媽」的「媽」字。" },
  { question: "【漢字修復】「白」字上面加了一撇「丿」，會變成哪一個代表顏色的字？", options: ["百", "泉", "的", "皂"], correctAnswer: "百", explanation: "「白」字上面加一橫「一」是「一百」的「百」字。" },
  { question: "【漢字修復】「月」字如果左邊加一個「日」，會變成哪一個代表光亮的字？", options: ["明", "朋", "朝", "朗"], correctAnswer: "明", explanation: "日月同輝，就是光明、明亮的「明」字。" },
  { question: "【漢字修復】「門」字裏面如果加了一個「口」字，會變成哪一個代表發問的字？", options: ["問", "閃", "閉", "間"], correctAnswer: "問", explanation: "「門」裏有「口」，就是詢「問」的「問」字。" },
  { question: "【漢字修復】「門」字裏面如果加了一個「日」字，會變成哪一個代表時間、空間的字？", options: ["間", "閃", "閉", "開"], correctAnswer: "間", explanation: "「門」裏有「日」，就是時間的「間」字。" },
  { question: "【漢字修復】「手」字在偏旁寫作「扌」時，如果加上「巴」字，會變成哪一個動作字？", options: ["把", "爸", "吧", "爬"], correctAnswer: "把", explanation: "「扌」加上「巴」就是「把握」、「把手」的「把」字。" },
  { question: "【漢字修復】「木」字如果左邊加上「木」字，會變成哪一個字？", options: ["林", "森", "淋", "彬"], correctAnswer: "林", explanation: "雙木成「林」，代表樹木聚集的地方。" },
  { question: "【漢字修復】「林」字上面如果再多加一個「木」字，會變成哪一個代表樹木茂密的字？", options: ["森", "淋", "彬", "禁"], correctAnswer: "森", explanation: "三木成「森」，代表森林茂密。" }
];


// ============================================================================
// 2. ENGLISH PHONICS, SPELLING, CLOZE
// ============================================================================

// Phonics "special friends" - 50 questions
export interface PhonicsTemplate {
  word: string;
  specialFriend: string;
  distractors: string[];
}

export const ENGLISH_PHONICS_DB: PhonicsTemplate[] = [
  { word: "book", specialFriend: "oo", distractors: ["ee", "ch", "sh"] },
  { word: "ship", specialFriend: "sh", distractors: ["ch", "th", "qu"] },
  { word: "chair", specialFriend: "ch", distractors: ["sh", "th", "ou"] },
  { word: "thank", specialFriend: "th", distractors: ["sh", "ch", "ow"] },
  { word: "play", specialFriend: "ay", distractors: ["ee", "or", "ar"] },
  { word: "tree", specialFriend: "ee", distractors: ["oo", "ay", "or"] },
  { word: "fork", specialFriend: "or", distractors: ["ar", "oo", "ou"] },
  { word: "star", specialFriend: "ar", distractors: ["or", "ay", "ee"] },
  { word: "queen", specialFriend: "qu", distractors: ["th", "sh", "ch"] },
  { word: "house", specialFriend: "ou", distractors: ["ow", "oo", "ee"] },
  { word: "cow", specialFriend: "ow", distractors: ["ou", "or", "ar"] },
  { word: "sheep", specialFriend: "ee", distractors: ["oo", "ay", "or"] },
  { word: "fish", specialFriend: "sh", distractors: ["ch", "th", "qu"] },
  { word: "chop", specialFriend: "ch", distractors: ["sh", "th", "ow"] },
  { word: "thin", specialFriend: "th", distractors: ["sh", "ch", "qu"] },
  { word: "clay", specialFriend: "ay", distractors: ["ee", "or", "ar"] },
  { word: "spoon", specialFriend: "oo", distractors: ["ee", "ou", "ow"] },
  { word: "park", specialFriend: "ar", distractors: ["or", "ay", "ee"] },
  { word: "storm", specialFriend: "or", distractors: ["ar", "oo", "ou"] },
  { word: "quick", specialFriend: "qu", distractors: ["th", "sh", "ch"] },
  { word: "mouse", specialFriend: "ou", distractors: ["ow", "oo", "ee"] },
  { word: "how", specialFriend: "ow", distractors: ["ou", "or", "ar"] },
  { word: "foot", specialFriend: "oo", distractors: ["ee", "ch", "sh"] },
  { word: "shell", specialFriend: "sh", distractors: ["ch", "th", "qu"] },
  { word: "check", specialFriend: "ch", distractors: ["sh", "th", "ou"] },
  { word: "three", specialFriend: "th", distractors: ["sh", "ch", "ow"] },
  { word: "gray", specialFriend: "ay", distractors: ["ee", "or", "ar"] },
  { word: "seed", specialFriend: "ee", distractors: ["oo", "ay", "or"] },
  { word: "horn", specialFriend: "or", distractors: ["ar", "oo", "ou"] },
  { word: "smart", specialFriend: "ar", distractors: ["or", "ay", "ee"] },
  { word: "quack", specialFriend: "qu", distractors: ["th", "sh", "ch"] },
  { word: "cloud", specialFriend: "ou", distractors: ["ow", "oo", "ee"] },
  { word: "brown", specialFriend: "ow", distractors: ["ou", "or", "ar"] },
  { word: "wood", specialFriend: "oo", distractors: ["ee", "ch", "sh"] },
  { word: "shoe", specialFriend: "sh", distractors: ["ch", "th", "qu"] },
  { word: "rich", specialFriend: "ch", distractors: ["sh", "th", "ou"] },
  { word: "with", specialFriend: "th", distractors: ["sh", "ch", "ow"] },
  { word: "stay", specialFriend: "ay", distractors: ["ee", "or", "ar"] },
  { word: "sleep", specialFriend: "ee", distractors: ["oo", "ay", "or"] },
  { word: "short", specialFriend: "or", distractors: ["ar", "oo", "ou"] },
  { word: "farm", specialFriend: "ar", distractors: ["or", "ay", "ee"] },
  { word: "quite", specialFriend: "qu", distractors: ["th", "sh", "ch"] },
  { word: "round", specialFriend: "ou", distractors: ["ow", "oo", "ee"] },
  { word: "down", specialFriend: "ow", distractors: ["ou", "or", "ar"] },
  { word: "moon", specialFriend: "oo", distractors: ["ee", "ch", "sh"] },
  { word: "wish", specialFriend: "sh", distractors: ["ch", "th", "qu"] },
  { word: "much", specialFriend: "ch", distractors: ["sh", "th", "ou"] },
  { word: "mouth", specialFriend: "th", distractors: ["sh", "ch", "ow"] },
  { word: "day", specialFriend: "ay", distractors: ["ee", "or", "ar"] },
  { word: "green", specialFriend: "ee", distractors: ["oo", "ay", "or"] }
];

// Spelling Quest words (UK Year 1/2) - 50 questions
export interface SpellingTemplate {
  word: string;
  hint: string;
}

export const ENGLISH_SPELLING_DB: SpellingTemplate[] = [
  { word: "APPLE", hint: "A sweet red or green fruit that keeps the doctor away." },
  { word: "HOUSE", hint: "A building where people or families live." },
  { word: "TRAIN", hint: "A long vehicle that runs on steel tracks." },
  { word: "WATER", hint: "A clear liquid we must drink to survive." },
  { word: "SCHOOL", hint: "A place where children go to learn and play." },
  { word: "TEACHER", hint: "The person who helps you learn lessons in class." },
  { word: "BREAD", hint: "A baked food made from flour, water, and yeast." },
  { word: "HAPPY", hint: "Feeling or showing pleasure; smiling and cheerful." },
  { word: "ANIMAL", hint: "A living thing that is not a human or a plant (like a dog)." },
  { word: "FLOWER", hint: "The bright, colorful part of a plant." },
  { word: "FRIEND", hint: "A person you know, like, and enjoy playing with." },
  { word: "SUMMER", hint: "The warmest season of the year with long sunny days." },
  { word: "WINTER", hint: "The coldest season of the year when trees lose leaves." },
  { word: "MOTHER", hint: "A female parent who loves you dearly." },
  { word: "FATHER", hint: "A male parent who helps take care of you." },
  { word: "SISTER", hint: "A girl or woman who shares the same parents." },
  { word: "BROTHER", hint: "A boy or man who shares the same parents." },
  { word: "YELLOW", hint: "The color of ripe bananas, lemons, and the bright sun." },
  { word: "ORANGE", hint: "A juicy citrus fruit and also the name of its color." },
  { word: "WINDOW", hint: "An opening in a wall filled with glass to let light in." },
  { word: "GARDEN", hint: "A piece of ground next to a house for growing flowers." },
  { word: "PENCIL", hint: "An instrument with a graphite core used for writing." },
  { word: "RABBIT", hint: "A small animal with long ears and a fluffy tail that hops." },
  { word: "MONKEY", hint: "A clever animal with a long tail that climbs trees." },
  { word: "CHICKEN", hint: "A bird kept on farms for its eggs and meat." },
  { word: "DOCTOR", hint: "A person who helps sick people feel better." },
  { word: "KITCHEN", hint: "The room in a house where meals are cooked." },
  { word: "MORNING", hint: "The early part of the day when the sun rises." },
  { word: "PUPPY", hint: "A very young, cute, and playful dog." },
  { word: "KITTEN", hint: "A very young and playful baby cat." },
  { word: "FOREST", hint: "A large area of land covered completely with trees." },
  { word: "RIVER", hint: "A large natural stream of water flowing to the sea." },
  { word: "BRIDGE", hint: "A structure built to carry a road over a river." },
  { word: "CASTLE", hint: "A large building with high stone walls for defense." },
  { word: "SHIELD", hint: "A broad piece of armor held to defend against attacks." },
  { word: "SWORD", hint: "A weapon with a long metal blade used by knights." },
  { word: "DRAGON", hint: "A mythical flying monster that breathes out hot fire." },
  { word: "PLAYER", hint: "A person who takes part in a game or sport." },
  { word: "MARKET", hint: "A regular gathering of people for buying and selling." },
  { word: "FAMILY", hint: "A group of parents and children living together." },
  { word: "BANANA", hint: "A long curved yellow fruit with sweet soft flesh." },
  { word: "CHERRY", hint: "A small round red fruit with a single hard stone." },
  { word: "POTATO", hint: "A round starchy vegetable that grows underground." },
  { word: "TOMATO", hint: "A glossy red fruit eaten as a vegetable in salads." },
  { word: "SPIDER", hint: "An eight-legged creature that spins sticky webs." },
  { word: "TURTLE", hint: "A slow reptile with a hard protective shell." },
  { word: "DOLPHIN", hint: "A friendly, highly intelligent sea mammal." },
  { word: "CHEESE", hint: "A food made from the pressed curds of milk." },
  { word: "BUTTER", hint: "A pale yellow fatty substance made by churning cream." },
  { word: "CIRCLE", hint: "A round shape that has no corners or edges." }
];

// Cloze Task grammar - 50 questions
const ENGLISH_CLOZE_TEMPLATES = [
  { question: "He ___ a very happy boy.", options: ["is", "am", "are", "be"], correctAnswer: "is", explanation: "For singular third-person 'He/She/It', we use 'is'." },
  { question: "They ___ playing football in the playground.", options: ["are", "is", "am", "be"], correctAnswer: "are", explanation: "For plural subjects like 'They', we use 'are'." },
  { question: "I have ___ red apple in my bag.", options: ["a", "an", "the", "some"], correctAnswer: "a", explanation: "Since 'red' starts with a consonant sound, we use the article 'a'." },
  { question: "She ___ to school with her brother every morning.", options: ["goes", "go", "going", "gone"], correctAnswer: "goes", explanation: "For third-person singular present tense, we add 'es' -> 'goes'." },
  { question: "There ___ three birds sitting on the big tree.", options: ["are", "is", "am", "be"], correctAnswer: "are", explanation: "'three birds' is plural, so we use 'There are'." },
  { question: "Look! The cat is sleeping ___ the warm sofa.", options: ["on", "in", "under", "at"], correctAnswer: "on", explanation: "Sleeping on top of the surface of the sofa -> 'on'." },
  { question: "We ___ rice and chicken for dinner yesterday.", options: ["ate", "eat", "eats", "eating"], correctAnswer: "ate", explanation: "'yesterday' indicates past tense, so we use 'ate'." },
  { question: "Do you like ___ sweet oranges or apples?", options: ["these", "this", "that", "an"], correctAnswer: "these", explanation: "'oranges' is plural and close, so we use 'these'." },
  { question: "The heavy books are ___ the school bag.", options: ["inside", "on", "over", "above"], correctAnswer: "inside", explanation: "Books are packed 'inside' the bag." },
  { question: "My mother ___ a beautiful song while cooking.", options: ["sings", "sing", "singing", "sung"], correctAnswer: "sings", explanation: "Third-person singular 'mother' in present tense takes 'sings'." },
  { question: "We must ___ our hands before eating lunch.", options: ["wash", "washes", "washed", "washing"], correctAnswer: "wash", explanation: "After modal verb 'must', we use the base verb 'wash'." },
  { question: "This is ___ elephant. It is very big!", options: ["an", "a", "some", "any"], correctAnswer: "an", explanation: "'elephant' starts with a vowel sound /e/, so we use 'an'." },
  { question: "Where ___ you going last weekend?", options: ["were", "was", "are", "is"], correctAnswer: "were", explanation: "'you' takes 'were' in the past tense ('last weekend')." },
  { question: "The sun shines brightly ___ the daytime.", options: ["during", "at", "on", "under"], correctAnswer: "during", explanation: "It shines 'during' or throughout the daytime." },
  { question: "I can run very ___. Nobody can catch me!", options: ["fast", "slow", "heavy", "sad"], correctAnswer: "fast", explanation: "Running 'fast' means nobody can catch you." },
  { question: "How ___ apples do we have in the kitchen?", options: ["many", "much", "some", "any"], correctAnswer: "many", explanation: "'apples' is countable, so we ask 'how many'." },
  { question: "There isn't ___ milk left in the bottle.", options: ["any", "some", "many", "few"], correctAnswer: "any", explanation: "We use 'any' in negative sentences." },
  { question: "The little rabbit is hiding ___ the green bush.", options: ["behind", "on", "up", "over"], correctAnswer: "behind", explanation: "Hiding out of sight -> 'behind' the bush." },
  { question: "We ___ our grandparents next Sunday.", options: ["will visit", "visited", "visits", "visiting"], correctAnswer: "will visit", explanation: "'next Sunday' indicates future tense, so we use 'will visit'." },
  { question: "The water in the swimming pool is very ___.", options: ["cold", "happy", "tall", "loud"], correctAnswer: "cold", explanation: "Water is best described as 'cold' (or warm), not human emotions." },
  { question: "Please listen ___ your teacher carefully.", options: ["to", "at", "for", "on"], correctAnswer: "to", explanation: "The preposition used with listen is always 'listen to'." },
  { question: "My dog always ___ when a stranger comes near.", options: ["barks", "bark", "barking", "barked"], correctAnswer: "barks", explanation: "Present habitual action for third-person singular 'dog' -> 'barks'." },
  { question: "She has a blue pen ___ a red pencil.", options: ["and", "but", "or", "so"], correctAnswer: "and", explanation: "Joining two items together -> 'and'." },
  { question: "Why ___ you crying? Is anything wrong?", options: ["are", "am", "is", "be"], correctAnswer: "are", explanation: "'you' takes the present verb 'are'." },
  { question: "The tall tower has ___ floors.", options: ["many", "much", "any", "little"], correctAnswer: "many", explanation: "'floors' is countable, so we use 'many'." },
  { question: "This is the ___ book in the entire library.", options: ["biggest", "bigger", "big", "more big"], correctAnswer: "biggest", explanation: "Superlative form for 'entire library' -> 'biggest'." },
  { question: "He is ___ than his older brother.", options: ["shorter", "short", "shortest", "more short"], correctAnswer: "shorter", explanation: "Comparative form with 'than' -> 'shorter'." },
  { question: "We go ___ bed at nine o'clock every night.", options: ["to", "at", "in", "on"], correctAnswer: "to", explanation: "Directional movement -> 'go to bed'." },
  { question: "I am really looking forward ___ the school holiday.", options: ["to", "for", "at", "in"], correctAnswer: "to", explanation: "The phrase is 'look forward to'." },
  { question: "Can you ___ the blackboard clearly from the back?", options: ["see", "sees", "saw", "seeing"], correctAnswer: "see", explanation: "After modal verb 'can', we use base verb 'see'." },
  { question: "My father is driving ___ blue car.", options: ["a", "an", "some", "any"], correctAnswer: "a", explanation: "'blue' starts with consonant /b/, so we use 'a'." },
  { question: "The fish are swimming happily ___ the ocean.", options: ["in", "on", "at", "above"], correctAnswer: "in", explanation: "Swimming inside the volume of the ocean -> 'in'." },
  { question: "They ___ their homework in the afternoon yesterday.", options: ["did", "do", "does", "doing"], correctAnswer: "did", explanation: "Completed past action ('yesterday') -> 'did'." },
  { question: "She ___ to drink a cup of warm water.", options: ["wants", "want", "wanting", "wanted"], correctAnswer: "wants", explanation: "Present tense for third-person singular 'She' -> 'wants'." },
  { question: "The birds fly high up ___ the blue sky.", options: ["in", "on", "under", "at"], correctAnswer: "in", explanation: "Flying inside the bounds of the sky -> 'in'." },
  { question: "The yellow flowers smell very ___.", options: ["sweet", "loud", "heavy", "fast"], correctAnswer: "sweet", explanation: "Flowers smell 'sweet' (pleasant scent)." },
  { question: "I have ___ lunch with my family at home.", options: ["cooked", "cooking", "cooks", "cook"], correctAnswer: "cooked", explanation: "Present perfect 'have' takes past participle 'cooked'." },
  { question: "Please turn ___ the lights when you leave the classroom.", options: ["off", "on", "up", "down"], correctAnswer: "off", explanation: "Turning 'off' lights saves energy." },
  { question: "The small ball rolled ___ the heavy wooden table.", options: ["under", "above", "on", "into"], correctAnswer: "under", explanation: "Rolling beneath a table -> 'under'." },
  { question: "We are ___ for our school bus now.", options: ["waiting", "wait", "waited", "waits"], correctAnswer: "waiting", explanation: "Present continuous 'are' takes verb+ing -> 'waiting'." },
  { question: "This is the ___ ice cream I have ever tasted!", options: ["best", "better", "good", "well"], correctAnswer: "best", explanation: "Superlative for 'ever tasted' -> 'best'." },
  { question: "You must not ___ in the school library.", options: ["shout", "shouts", "shouted", "shouting"], correctAnswer: "shout", explanation: "After modal 'must not', we use base verb 'shout'." }
];


export interface MathWordProblemTemplate {
  storyZh: string;
  storyEn: string;
  formula: (X: number, Y: number, Z: number) => number;
  explanationZh: string;
  explanationEn: string;
  minX: number; maxX: number;
  minY: number; maxY: number;
  minZ: number; maxZ: number;
}

export const MATH_WORD_PROBLEM_TEMPLATES: MathWordProblemTemplate[] = [
  {
    storyZh: "Jovan 收集了 {X} 把鐵劍，戰鬥中折斷了 {Y} 把，隨後在寶箱找到了 {Z} 把。請問現在有多少把鐵劍？",
    storyEn: "Jovan collected {X} iron swords. During battle, {Y} swords broke. Then he found {Z} more in a treasure chest. How many swords does he have now?",
    formula: (X, Y, Z) => X - Y + Z,
    explanationZh: "原本有 {X} 把，折斷 {Y} 把剩下 {X}-{Y} = {A} 把。再找到 {Z} 把，所以共有 {A}+{Z} = {R} 把。",
    explanationEn: "Started with {X}, {Y} broke, leaving {X}-{Y} = {A}. Found {Z} more, making {A}+{Z} = {R}.",
    minX: 10, maxX: 20, minY: 2, maxY: 8, minZ: 3, maxZ: 12
  },
  {
    storyZh: "小火龍身上有 {X} 枚金幣。打倒綠色史萊姆獲得 {Y} 枚，隨後去商店買藥水花費了 {Z} 枚。請問小火龍還剩多少金幣？",
    storyEn: "The Charmander had {X} gold coins. He gained {Y} coins by defeating a slime, then spent {Z} coins at the shop. How many coins are left?",
    formula: (X, Y, Z) => X + Y - Z,
    explanationZh: "原本有 {X} 枚，得到 {Y} 枚共有 {X}+{Y} = {A} 枚。花費 {Z} 枚，剩餘 {A}-{Z} = {R} 枚。",
    explanationEn: "Had {X}, earned {Y}, total is {X}+{Y} = {A}. Spent {Z}, remaining is {A}-{Z} = {R}.",
    minX: 20, maxX: 50, minY: 10, maxY: 30, minZ: 5, maxZ: 15
  },
  {
    storyZh: "城堡的廚房裏有 {X} 個魔法麵包。Jovan 吃了 {Y} 個，妹妹吃了 {Z} 個。請問現在還剩多少個魔法麵包？",
    storyEn: "There were {X} magic breads in the castle kitchen. Jovan ate {Y} of them, and his sister ate {Z}. How many magic breads are left?",
    formula: (X, Y, Z) => X - Y - Z,
    explanationZh: "原本有 {X} 個，共吃掉 {Y} + {Z} = {A} 個。所以還剩下 {X} - {A} = {R} 個。",
    explanationEn: "Started with {X}. Together they ate {Y} + {Z} = {A}. Remaining is {X} - {A} = {R}.",
    minX: 15, maxX: 30, minY: 2, maxY: 6, minZ: 2, maxZ: 6
  },
  {
    storyZh: "小勇士每天需要訓練 {X} 小時。Jovan 連續訓練了 {Y} 天，另外還額外自主學習了 {Z} 小時。請問 Jovan 總共學習和訓練了多少小時？",
    storyEn: "A young warrior trains {X} hours daily. Jovan trained for {Y} consecutive days, plus spent {Z} extra hours in self-study. What is the total hours spent?",
    formula: (X, Y, Z) => X * Y + Z,
    explanationZh: "每天訓練 {X} 小時，{Y} 天就是 {X} × {Y} = {A} 小時。再加上自主學習的 {Z} 小時，合共 {A} + {Z} = {R} 小時。",
    explanationEn: "Daily training {X} hours for {Y} days is {X} × {Y} = {A} hours. Adding {Z} hours self-study makes {A} + {Z} = {R} hours.",
    minX: 2, maxX: 5, minY: 3, maxY: 7, minZ: 2, maxZ: 10
  },
  {
    storyZh: "Jovan 收集了 {X} 枚紅水晶和 {Y} 枚藍水晶。他要把水晶平均分裝在 {Z} 個魔法袋子裏。請問每個袋子裝有幾枚水晶？",
    storyEn: "Jovan collected {X} red crystals and {Y} blue crystals. He wants to divide them equally into {Z} magic bags. How many crystals in each bag?",
    formula: (X, Y, Z) => (X + Y) / Z,
    explanationZh: "總共有水晶 {X} + {Y} = {A} 枚。平均分裝在 {Z} 個袋子，每個袋子有 {A} ÷ {Z} = {R} 枚。",
    explanationEn: "Total crystals: {X} + {Y} = {A}. Dividing equally into {Z} bags gives {A} ÷ {Z} = {R} crystals per bag.",
    minX: 12, maxX: 24, minY: 12, maxY: 24, minZ: 2, maxZ: 4
  }
];

export interface LogicBlockTemplate {
  desc: string;
  ans: number;
  exp: string;
}

export const LOGIC_BLOCKS_DB: LogicBlockTemplate[] = [
  { desc: "底層是一個 3x3 的正方形方塊堆（共 9 個方塊），第二層（頂部）在四個角落各放了 1 個方塊。請問總共有多少個正方體積木？", ans: 13, exp: "底層 9 個 + 上層 4 個 = 總共 13 個方塊。" },
  { desc: "底面是一個 2x2（共 4 個方塊），高度為 2 層的積木堆。第一層排滿 4 個，第二層在中心疊了 2 個方塊。請問總共有多少個正方體積木？", ans: 6, exp: "底部 4 個 + 頂部 2 個 = 總共 6 個方塊。" },
  { desc: "這是一個底層為 4x4 的大型方塊金字塔。最底層排滿 16 個方塊，第二層是 3x3 排滿 9 個方塊，最頂層是 2x2 排滿 4 個方塊。請問總共有多少個方塊？", ans: 29, exp: "底層 16 個 + 中層 9 個 + 頂層 4 個 = 總共 29 個方塊。" },
  { desc: "有一個底面為 3x2（共 6 個方塊）的長方形積木底座。在其上方第二層排了 2x2（共 4 個方塊），最頂層放了 1 個方塊。請問總共有多少個正方體積木？", ans: 11, exp: "底層 6 個 + 中層 4 個 + 頂層 1 個 = 總共 11 個方塊。" },
  { desc: "一個 3D T型積木：底層是一排 5 個方塊。第二層在最中間那個方塊的上方豎直疊了 3 個方塊。請問總共有多少個正方體？", ans: 8, exp: "底層 5 個 + 垂直疊加的 3 個 = 總共 8 個方塊。" },
  { desc: "一個 3D L型積木：底部是一排 4 個方塊，在最左端的方塊上方連續疊了 3 個方塊。請問總共有多少個正方體？", ans: 7, exp: "底層一排 4 個 + 垂直疊加的 3 個 = 總共 7 個方塊。" },
  { desc: "一個中空的 3D 正方形方框：底部由 8 個方塊圍成一個 3x3 但中間缺 1 個的方框。上層一模一樣也疊了 8 個方塊。請問總共有多少個方塊？", ans: 16, exp: "下層 8 個 + 上層 8 個 = 總共 16 個方塊。" },
  { desc: "一個底面為 4x2（共 8 個方塊）的積木底座。上層的四個角落各疊了 1 個方塊。請問總共包含了多少個正方體？", ans: 12, exp: "底層 8 個 + Corner角落 4 個 = 總共 12 個方塊。" },
  { desc: "一個十字型 3D 積木：底層由 5 個方塊排成十字型。第二層在十字正中心疊了 1 個方塊。請問總共有多少個方塊？", ans: 6, exp: "十字底座 5 個 + 中心 1 個 = 總共 6 個方塊。" },
  { desc: "底面是一個 3x3 的正方形方塊堆（共 9 個方塊）。第二層在正中間放了 1 個，其餘角落和邊緣都是空的。請問總共有多少個正方體？", ans: 10, exp: "底座 9 個 + 中心 1 個 = 總共 10 個方塊。" }
];


// ============================================================================
// 5. CORE QUESTION GENERATORS & SYSTEM LOGIC
// ============================================================================

export function getLevelForFloor(floor: number): number {
  if (floor <= 10) return 1;
  if (floor <= 20) return 2;
  if (floor <= 30) return 3;
  if (floor <= 40) return 4;
  return 5;
}

// Helper to generate exactly 4 distinct options for numeric questions
function generateFourOptions(answer: number): string[] {
  const optionsSet = new Set<string>();
  optionsSet.add(answer.toString());
  const offsets = [-1, 1, -2, 2, -10, 10, -5, 5, -3, 3, 11, -11, 4, -4, 6, -6];
  let loopAttempts = 0;
  while (optionsSet.size < 4 && loopAttempts < 100) {
    loopAttempts++;
    const offset = offsets[Math.floor(Math.random() * offsets.length)];
    const val = answer + offset;
    if (val >= 0) {
      optionsSet.add(val.toString());
    }
  }
  let backupOffset = 1;
  while (optionsSet.size < 4) {
    optionsSet.add((answer + backupOffset).toString());
    backupOffset++;
  }
  return Array.from(optionsSet).sort(() => Math.random() - 0.5);
}

// Emoji to English Template and Database (50 Questions)
export interface EmojiEnTemplate {
  emoji: string;
  word: string;
  distractors: string[];
}

export const EMOJI_EN_DB: EmojiEnTemplate[] = [
  { emoji: "🐱", word: "cat", distractors: ["dog", "pig", "cow"] },
  { emoji: "🐶", word: "dog", distractors: ["cat", "fox", "wolf"] },
  { emoji: "🐭", word: "mouse", distractors: ["rat", "rabbit", "lion"] },
  { emoji: "🦁", word: "lion", distractors: ["tiger", "cat", "dog"] },
  { emoji: "🐯", word: "tiger", distractors: ["lion", "cat", "leopard"] },
  { emoji: "🐷", word: "pig", distractors: ["cow", "sheep", "horse"] },
  { emoji: "🐮", word: "cow", distractors: ["pig", "bull", "goat"] },
  { emoji: "🐰", word: "rabbit", distractors: ["hare", "squirrel", "mouse"] },
  { emoji: "🐻", word: "bear", distractors: ["panda", "koala", "wolf"] },
  { emoji: "🐵", word: "monkey", distractors: ["ape", "gorilla", "lemur"] },
  { emoji: "🐸", word: "frog", distractors: ["toad", "lizard", "fish"] },
  { emoji: "🦆", word: "duck", distractors: ["goose", "swan", "chicken"] },
  { emoji: "🐔", word: "chicken", distractors: ["duck", "rooster", "hen"] },
  { emoji: "🐢", word: "turtle", distractors: ["snail", "crab", "fish"] },
  { emoji: "🐍", word: "snake", distractors: ["worm", "lizard", "eel"] },
  { emoji: "🐳", word: "whale", distractors: ["shark", "dolphin", "fish"] },
  { emoji: "🐬", word: "dolphin", distractors: ["whale", "shark", "seal"] },
  { emoji: "🐙", word: "octopus", distractors: ["squid", "jellyfish", "starfish"] },
  { emoji: "🦀", word: "crab", distractors: ["lobster", "shrimp", "oyster"] },
  { emoji: "🐝", word: "bee", distractors: ["wasp", "fly", "ant"] },
  { emoji: "🍎", word: "apple", distractors: ["pear", "peach", "plum"] },
  { emoji: "🍌", word: "banana", distractors: ["lemon", "melon", "mango"] },
  { emoji: "🍇", word: "grapes", distractors: ["berry", "cherry", "fig"] },
  { emoji: "🍓", word: "strawberry", distractors: ["blueberry", "raspberry", "cherry"] },
  { emoji: "🍉", word: "watermelon", distractors: ["melon", "pumpkin", "cucumber"] },
  { emoji: "🍒", word: "cherry", distractors: ["berry", "grape", "plum"] },
  { emoji: "🍍", word: "pineapple", distractors: ["coconut", "mango", "papaya"] },
  { emoji: "🥕", word: "carrot", distractors: ["radish", "onion", "potato"] },
  { emoji: "🍅", word: "tomato", distractors: ["apple", "pepper", "cherry"] },
  { emoji: "🌽", word: "corn", distractors: ["wheat", "rice", "bean"] },
  { emoji: "🍕", word: "pizza", distractors: ["bread", "cake", "pie"] },
  { emoji: "🍔", word: "hamburger", distractors: ["hotdog", "sandwich", "taco"] },
  { emoji: "🍟", word: "french fries", distractors: ["chips", "potato", "wedges"] },
  { emoji: "🍦", word: "ice cream", distractors: ["sorbet", "yogurt", "pudding"] },
  { emoji: "🍩", word: "donut", distractors: ["bagel", "cookie", "cake"] },
  { emoji: "🍰", word: "cake", distractors: ["pie", "bread", "muffin"] },
  { emoji: "🍪", word: "cookie", distractors: ["biscuit", "cracker", "donut"] },
  { emoji: "⚽", word: "soccer", distractors: ["basketball", "tennis", "baseball"] },
  { emoji: "🏀", word: "basketball", distractors: ["soccer", "tennis", "volleyball"] },
  { emoji: "🎾", word: "tennis", distractors: ["badminton", "squash", "golf"] },
  { emoji: "🚗", word: "car", distractors: ["bus", "truck", "bike"] },
  { emoji: "🚌", word: "bus", distractors: ["van", "train", "tram"] },
  { emoji: "✈️", word: "airplane", distractors: ["helicopter", "rocket", "glider"] },
  { emoji: "🚀", word: "rocket", distractors: ["airplane", "ufo", "satellite"] },
  { emoji: "⏰", word: "clock", distractors: ["watch", "timer", "compass"] },
  { emoji: "🎸", word: "guitar", distractors: ["violin", "piano", "drums"] },
  { emoji: "☀️", word: "sun", distractors: ["moon", "star", "cloud"] },
  { emoji: "🌙", word: "moon", distractors: ["sun", "star", "planet"] },
  { emoji: "🎈", word: "balloon", distractors: ["kite", "bubble", "parachute"] },
  { emoji: "🎁", word: "gift", distractors: ["box", "toy", "bag"] }
];

// Emoji to Chinese Template and Database (50 Questions)
export interface EmojiZhTemplate {
  emoji: string;
  word: string;
  distractors: string[];
}

export const EMOJI_ZH_DB: EmojiZhTemplate[] = [
  { emoji: "🐱", word: "貓", distractors: ["狗", "豬", "牛"] },
  { emoji: "🐶", word: "狗", distractors: ["貓", "狐狸", "狼"] },
  { emoji: "🐭", word: "老鼠", distractors: ["兔子", "獅子", "大象"] },
  { emoji: "🦁", word: "獅子", distractors: ["老虎", "貓", "狗"] },
  { emoji: "🐯", word: "老虎", distractors: ["獅子", "貓", "豹"] },
  { emoji: "🐷", word: "豬", distractors: ["牛", "羊", "馬"] },
  { emoji: "🐮", word: "牛", distractors: ["豬", "羊", "馬"] },
  { emoji: "🐰", word: "兔子", distractors: ["松鼠", "老鼠", "熊"] },
  { emoji: "🐻", word: "熊", distractors: ["熊貓", "考拉", "狼"] },
  { emoji: "🐵", word: "猴子", distractors: ["猩猩", "狐狸", "松鼠"] },
  { emoji: "🐸", word: "青蛙", distractors: ["蜥蜴", "魚", "烏龜"] },
  { emoji: "🦆", word: "鴨子", distractors: ["鵝", "天鵝", "雞"] },
  { emoji: "🐔", word: "雞", distractors: ["鴨", "鳥", "火雞"] },
  { emoji: "🐢", word: "烏龜", distractors: ["蝸牛", "螃蟹", "魚"] },
  { emoji: "🐍", word: "蛇", distractors: ["蚯蚓", "蜥蜴", "黃鱔"] },
  { emoji: "🐳", word: "鯨魚", distractors: ["鯊魚", "海豚", "螃蟹"] },
  { emoji: "🐬", word: "海豚", distractors: ["鯨魚", "鯊魚", "海豹"] },
  { emoji: "🐙", word: "章魚", distractors: ["烏賊", "水母", "海星"] },
  { emoji: "🦀", word: "螃蟹", distractors: ["龍蝦", "蝦", "貝殼"] },
  { emoji: "🐝", word: "蜜蜂", distractors: ["黃蜂", "蒼蠅", "螞蟻"] },
  { emoji: "🍎", word: "蘋果", distractors: ["梨", "桃子", "李子"] },
  { emoji: "🍌", word: "香蕉", distractors: ["檸檬", "哈密瓜", "芒果"] },
  { emoji: "🍇", word: "葡萄", distractors: ["草莓", "櫻桃", "無花果"] },
  { emoji: "🍓", word: "草莓", distractors: ["藍莓", "紅莓", "櫻桃"] },
  { emoji: "🍉", word: "西瓜", distractors: ["哈密瓜", "南瓜", "黃瓜"] },
  { emoji: "🍒", word: "櫻桃", distractors: ["草莓", "葡萄", "李子"] },
  { emoji: "🍍", word: "菠蘿", distractors: ["椰子", "芒果", "木瓜"] },
  { emoji: "🥕", word: "胡蘿蔔", distractors: ["白蘿蔔", "洋蔥", "土豆"] },
  { emoji: "🍅", word: "番茄", distractors: ["蘋果", "辣椒", "櫻桃"] },
  { emoji: "🌽", word: "玉米", distractors: ["小麥", "水稻", "豆子"] },
  { emoji: "🍕", word: "披薩", distractors: ["麵包", "蛋糕", "餡餅"] },
  { emoji: "🍔", word: "漢堡", distractors: ["熱狗", "三明治", "塔可"] },
  { emoji: "🍟", word: "薯條", distractors: ["薯片", "土豆", "薯角"] },
  { emoji: "🍦", word: "雪糕", distractors: ["沙冰", "優格", "布丁"] },
  { emoji: "🍩", word: "甜甜圈", distractors: ["貝果", "曲奇", "蛋糕"] },
  { emoji: "🍰", word: "蛋糕", distractors: ["餡餅", "麵包", "鬆餅"] },
  { emoji: "🍪", word: "曲奇", distractors: ["餅乾", "蘇打餅", "甜甜圈"] },
  { emoji: "⚽", word: "足球", distractors: ["籃球", "網球", "棒球"] },
  { emoji: "🏀", word: "籃球", distractors: ["足球", "網球", "排球"] },
  { emoji: "🎾", word: "網球", distractors: ["羽毛球", "壁球", "高爾夫"] },
  { emoji: "🚗", word: "汽車", distractors: ["巴士", "卡車", "單車"] },
  { emoji: "🚌", word: "巴士", distractors: ["麵包車", "火車", "電車"] },
  { emoji: "✈️", word: "飛機", distractors: ["直升機", "火箭", "滑翔機"] },
  { emoji: "🚀", word: "火箭", distractors: ["飛機", "飛碟", "衛星"] },
  { emoji: "⏰", word: "時鐘", distractors: ["手錶", "定時器", "指南針"] },
  { emoji: "🎸", word: "吉他", distractors: ["小提琴", "鋼琴", "鼓"] },
  { emoji: "☀️", word: "太陽", distractors: ["月亮", "星星", "雲"] },
  { emoji: "🌙", word: "月亮", distractors: ["太陽", "星星", "行星"] },
  { emoji: "🎈", word: "氣球", distractors: ["風箏", "泡泡", "降落傘"] },
  { emoji: "🎁", word: "禮物", distractors: ["盒子", "玩具", "包包"] }
];

// English Sentence Reordering Template and Database (50 Questions)
export interface EnglishReorderTemplate {
  scrambledWords: string[];
  correctAnswer: string;
}

export const ENGLISH_REORDER_DB: EnglishReorderTemplate[] = [
  { scrambledWords: ["I", "love", "my", "school"], correctAnswer: "I love my school." },
  { scrambledWords: ["The", "dog", "is", "sleeping"], correctAnswer: "The dog is sleeping." },
  { scrambledWords: ["We", "play", "soccer", "together"], correctAnswer: "We play soccer together." },
  { scrambledWords: ["She", "has", "a", "blue", "pen"], correctAnswer: "She has a blue pen." },
  { scrambledWords: ["They", "are", "reading", "books"], correctAnswer: "They are reading books." },
  { scrambledWords: ["My", "mother", "cooks", "delicious", "food"], correctAnswer: "My mother cooks delicious food." },
  { scrambledWords: ["The", "sun", "is", "very", "hot"], correctAnswer: "The sun is very hot." },
  { scrambledWords: ["I", "like", "to", "eat", "apples"], correctAnswer: "I like to eat apples." },
  { scrambledWords: ["The", "cat", "ran", "up", "the", "tree"], correctAnswer: "The cat ran up the tree." },
  { scrambledWords: ["He", "goes", "to", "school", "by", "bus"], correctAnswer: "He goes to school by bus." },
  { scrambledWords: ["Birds", "can", "fly", "in", "the", "sky"], correctAnswer: "Birds can fly in the sky." },
  { scrambledWords: ["We", "must", "wash", "our", "hands"], correctAnswer: "We must wash our hands." },
  { scrambledWords: ["This", "elephant", "is", "very", "big"], correctAnswer: "This elephant is very big." },
  { scrambledWords: ["It", "is", "a", "sunny", "day", "today"], correctAnswer: "It is a sunny day today." },
  { scrambledWords: ["Please", "open", "the", "window"], correctAnswer: "Please open the window." },
  { scrambledWords: ["I", "listen", "to", "my", "teacher"], correctAnswer: "I listen to my teacher." },
  { scrambledWords: ["The", "water", "is", "very", "cold"], correctAnswer: "The water is very cold." },
  { scrambledWords: ["My", "father", "drives", "a", "car"], correctAnswer: "My father drives a car." },
  { scrambledWords: ["We", "saw", "a", "beautiful", "rainbow"], correctAnswer: "We saw a beautiful rainbow." },
  { scrambledWords: ["He", "is", "my", "best", "friend"], correctAnswer: "He is my best friend." },
  { scrambledWords: ["They", "swim", "in", "the", "pool"], correctAnswer: "They swim in the pool." },
  { scrambledWords: ["She", "sings", "a", "sweet", "song"], correctAnswer: "She sings a sweet song." },
  { scrambledWords: ["I", "brush", "my", "teeth", "daily"], correctAnswer: "I brush my teeth daily." },
  { scrambledWords: ["The", "rabbit", "has", "long", "ears"], correctAnswer: "The rabbit has long ears." },
  { scrambledWords: ["We", "live", "in", "a", "house"], correctAnswer: "We live in a house." },
  { scrambledWords: ["The", "monkey", "climbed", "the", "tree"], correctAnswer: "The monkey climbed the tree." },
  { scrambledWords: ["There", "are", "three", "green", "birds"], correctAnswer: "There are three green birds." },
  { scrambledWords: ["The", "star", "is", "shining", "bright"], correctAnswer: "The star is shining bright." },
  { scrambledWords: ["I", "have", "many", "toys"], correctAnswer: "I have many toys." },
  { scrambledWords: ["They", "jump", "up", "and", "down"], correctAnswer: "They jump up and down." },
  { scrambledWords: ["She", "bought", "a", "new", "dress"], correctAnswer: "She bought a new dress." },
  { scrambledWords: ["The", "clock", "is", "on", "the", "wall"], correctAnswer: "The clock is on the wall." },
  { scrambledWords: ["We", "go", "to", "bed", "early"], correctAnswer: "We go to bed early." },
  { scrambledWords: ["An", "apple", "is", "very", "sweet"], correctAnswer: "An apple is very sweet." },
  { scrambledWords: ["The", "train", "is", "very", "fast"], correctAnswer: "The train is very fast." },
  { scrambledWords: ["They", "play", "in", "the", "garden"], correctAnswer: "They play in the garden." },
  { scrambledWords: ["I", "can", "see", "a", "butterfly"], correctAnswer: "I can see a butterfly." },
  { scrambledWords: ["My", "sister", "has", "yellow", "hair"], correctAnswer: "My sister has yellow hair." },
  { scrambledWords: ["The", "fish", "swim", "in", "water"], correctAnswer: "The fish swim in water." },
  { scrambledWords: ["It", "is", "time", "for", "bed"], correctAnswer: "It is time for bed." },
  { scrambledWords: ["We", "love", "our", "sweet", "home"], correctAnswer: "We love our sweet home." },
  { scrambledWords: ["He", "is", "a", "good", "boy"], correctAnswer: "He is a good boy." },
  { scrambledWords: ["She", "likes", "to", "draw", "pictures"], correctAnswer: "She likes to draw pictures." },
  { scrambledWords: ["The", "sky", "is", "very", "blue"], correctAnswer: "The sky is very blue." },
  { scrambledWords: ["I", "am", "happy", "to", "help"], correctAnswer: "I am happy to help." },
  { scrambledWords: ["Look", "at", "the", "funny", "monkey"], correctAnswer: "Look at the funny monkey." },
  { scrambledWords: ["There", "is", "a", "little", "mouse"], correctAnswer: "There is a little mouse." },
  { scrambledWords: ["They", "read", "the", "book", "together"], correctAnswer: "They read the book together." },
  { scrambledWords: ["The", "flower", "has", "yellow", "petals"], correctAnswer: "The flower has yellow petals." },
  { scrambledWords: ["He", "is", "washing", "his", "hands"], correctAnswer: "He is washing his hands." }
];

export interface QuestionDef {
  level: number;
  type: 'math' | 'chinese' | 'english' | 'logic';
  subtype: string;
}

const ALL_QUESTION_DEFS: QuestionDef[] = [
  // Level 1
  { level: 1, type: 'chinese', subtype: 'pronunciation' },
  { level: 1, type: 'english', subtype: 'phonics' },
  { level: 1, type: 'math', subtype: 'math_single_digit' },
  { level: 1, type: 'logic', subtype: 'logic_num_pattern' },
  { level: 1, type: 'english', subtype: 'emoji_en' },
  { level: 1, type: 'chinese', subtype: 'emoji_zh' },
  { level: 1, type: 'chinese', subtype: 'match' },

  // Level 2
  { level: 2, type: 'chinese', subtype: 'sentence_fill' },
  { level: 2, type: 'english', subtype: 'cloze' },
  { level: 2, type: 'math', subtype: 'math_double_addition' },
  { level: 2, type: 'math', subtype: 'math_2_4_multiplication' },
  { level: 2, type: 'logic', subtype: 'logic_graph_pattern' },

  // Level 3
  { level: 3, type: 'chinese', subtype: 'missing_stroke' },
  { level: 3, type: 'english', subtype: 'spelling' },
  { level: 3, type: 'math', subtype: 'math_double_subtraction' },
  { level: 3, type: 'math', subtype: 'math_single_mixed' },
  { level: 3, type: 'logic', subtype: 'logic_time' },

  // Level 4
  { level: 4, type: 'chinese', subtype: 'sentence_reorder' },
  { level: 4, type: 'english', subtype: 'sentence_reorder' },
  { level: 4, type: 'math', subtype: 'math_5_7_multiplication' },
  { level: 4, type: 'math', subtype: 'math_double_mixed' },

  // Level 5
  { level: 5, type: 'chinese', subtype: 'stroke_count' },
  { level: 5, type: 'logic', subtype: 'blocks' },
  { level: 5, type: 'math', subtype: 'word_problem' },
  { level: 5, type: 'math', subtype: 'math_8_11_multiplication' }
];

// Refined stroke count generator
export function generateStrokeCountQuestion(usedIds: string[] = []): QuizQuestion {
  let wordObj = CHINESE_WORDS_DB[Math.floor(Math.random() * CHINESE_WORDS_DB.length)];
  let attempts = 0;
  while (usedIds.includes(`zh_strokes_${wordObj.word}`) && attempts < 20) {
    wordObj = CHINESE_WORDS_DB[Math.floor(Math.random() * CHINESE_WORDS_DB.length)];
    attempts++;
  }
  
  const totalStrokes = wordObj.strokes;
  const question = `【學科挑戰 - 中文科】\n請問「${wordObj.word}」這兩個漢字合起來一共有多少個筆劃？`;
  const correctAnswer = totalStrokes.toString();
  const options = generateFourOptions(totalStrokes);
  
  return {
    id: `zh_strokes_${wordObj.word}`,
    type: 'chinese',
    subtype: 'stroke_count',
    question,
    options,
    correctAnswer,
    explanation: `筆劃解析：「${wordObj.word}」合共有 ${totalStrokes} 個筆劃喔！平日多練習寫字能幫助記憶筆順。`
  };
}

// 5.1 Programmatic Math Question Generator
export function generateMathQuestion(floor: number, usedIds: string[] = []): QuizQuestion {
  // Map floor to level 1-5, select from math categories up to that level
  const maxL = getLevelForFloor(floor);
  const mathDefs = ALL_QUESTION_DEFS.filter(d => d.type === 'math' && d.level <= maxL);
  const def = mathDefs[Math.floor(Math.random() * mathDefs.length)] || mathDefs[0];
  const subtype = def.subtype;

  let qId = "";
  let questionStr = "";
  let answer = 0;
  let explanation = "";

  // 1. Bilingual Word Problem (Level 5)
  if (subtype === 'word_problem') {
    let attempts = 0;
    let template: MathWordProblemTemplate;
    let X = 0, Y = 0, Z = 0;
    
    do {
      const idx = Math.floor(Math.random() * MATH_WORD_PROBLEM_TEMPLATES.length);
      template = MATH_WORD_PROBLEM_TEMPLATES[idx];
      
      X = Math.floor(Math.random() * (template.maxX - template.minX + 1)) + template.minX;
      Y = Math.floor(Math.random() * (template.maxY - template.minY + 1)) + template.minY;
      Z = Math.floor(Math.random() * (template.maxZ - template.minZ + 1)) + template.minZ;
      
      if (template.storyZh.includes("分裝")) {
        const sum = X + Y;
        const remainder = sum % Z;
        if (remainder !== 0) {
          X += (Z - remainder);
        }
      }
      
      answer = template.formula(X, Y, Z);
      qId = `math_word_${idx}_${X}_${Y}_${Z}`;
      attempts++;
    } while (usedIds.includes(qId) && attempts < 10);

    const questionZh = template.storyZh.replace("{X}", X.toString()).replace("{Y}", Y.toString()).replace("{Z}", Z.toString());
    const questionEn = template.storyEn.replace("{X}", X.toString()).replace("{Y}", Y.toString()).replace("{Z}", Z.toString());
    
    const combinedQuestion = `【冒險數學題 / RPG Math Quest】\n${questionZh}\n\n(${questionEn})`;
    const options = generateFourOptions(answer);

    const intermediate = X - Y;
    const expZh = template.explanationZh.replace("{X}", X.toString()).replace("{Y}", Y.toString()).replace("{Z}", Z.toString()).replace("{A}", intermediate.toString()).replace("{R}", answer.toString());
    const expEn = template.explanationEn.replace("{X}", X.toString()).replace("{Y}", Y.toString()).replace("{Z}", Z.toString()).replace("{A}", intermediate.toString()).replace("{R}", answer.toString());

    return {
      id: qId,
      type: 'math',
      subtype: 'word_problem',
      question: combinedQuestion,
      options,
      correctAnswer: answer.toString(),
      explanation: `${expZh}\n\n(${expEn})`
    };
  }

  // 2. Procedural math calculations
  let attempts = 0;
  do {
    if (subtype === 'math_single_digit') {
      const isAdd = Math.random() > 0.5;
      if (isAdd) {
        const num1 = Math.floor(Math.random() * 8) + 1;
        const num2 = Math.floor(Math.random() * 8) + 1;
        answer = num1 + num2;
        questionStr = `${num1} + ${num2} = ?`;
        explanation = `計算結果：${num1} + ${num2} 等於 ${answer}。`;
      } else {
        const num1 = Math.floor(Math.random() * 8) + 2;
        const num2 = Math.floor(Math.random() * (num1 - 1)) + 1;
        answer = num1 - num2;
        questionStr = `${num1} - ${num2} = ?`;
        explanation = `計算結果：${num1} - ${num2} 等於 ${answer}。`;
      }
      qId = `math_single_${isAdd ? 'add' : 'sub'}_${answer}_${Math.random().toString(36).substring(2, 5)}`;
    } else if (subtype === 'math_double_addition') {
      const num1 = Math.floor(Math.random() * 80) + 10;
      const num2 = Math.floor(Math.random() * 80) + 10;
      answer = num1 + num2;
      questionStr = `${num1} + ${num2} = ?`;
      explanation = `計算結果：${num1} + ${num2} 等於 ${answer}。`;
      qId = `math_dbl_add_${answer}_${Math.random().toString(36).substring(2, 5)}`;
    } else if (subtype === 'math_2_4_multiplication') {
      const num1 = Math.floor(Math.random() * 3) + 2; // 2 to 4
      const num2 = Math.floor(Math.random() * 9) + 1; // 1 to 9
      answer = num1 * num2;
      questionStr = `${num1} × ${num2} = ?`;
      explanation = `根據九九乘法表：${num1} × ${num2} 等於 ${answer}。`;
      qId = `math_mult24_${answer}_${Math.random().toString(36).substring(2, 5)}`;
    } else if (subtype === 'math_double_subtraction') {
      const num1 = Math.floor(Math.random() * 50) + 49; // 49 to 99
      const num2 = Math.floor(Math.random() * 38) + 10; // 10 to 47
      answer = num1 - num2;
      questionStr = `${num1} - ${num2} = ?`;
      explanation = `計算結果：${num1} - ${num2} 等於 ${answer}。`;
      qId = `math_dbl_sub_${answer}_${Math.random().toString(36).substring(2, 5)}`;
    } else if (subtype === 'math_single_mixed') {
      const num1 = Math.floor(Math.random() * 8) + 3;
      const num2 = Math.floor(Math.random() * 6) + 2;
      const num3 = Math.floor(Math.random() * (num1 + num2 - 2)) + 1;
      answer = num1 + num2 - num3;
      questionStr = `${num1} + ${num2} - ${num3} = ?`;
      explanation = `運算規則：由左至右依序計算！第一步 ${num1} + ${num2} = ${num1+num2}；第二步 ${num1+num2} - ${num3} = ${answer}。`;
      qId = `math_sing_mix_${answer}_${Math.random().toString(36).substring(2, 5)}`;
    } else if (subtype === 'math_5_7_multiplication') {
      const num1 = Math.floor(Math.random() * 3) + 5; // 5 to 7
      const num2 = Math.floor(Math.random() * 9) + 1; // 1 to 9
      answer = num1 * num2;
      questionStr = `${num1} × ${num2} = ?`;
      explanation = `根據九九乘法表：${num1} × ${num2} 等於 ${answer}。`;
      qId = `math_mult57_${answer}_${Math.random().toString(36).substring(2, 5)}`;
    } else if (subtype === 'math_double_mixed') {
      const num1 = Math.floor(Math.random() * 40) + 30;
      const num2 = Math.floor(Math.random() * 20) + 10;
      const num3 = Math.floor(Math.random() * 20) + 10;
      answer = num1 - num2 + num3;
      questionStr = `${num1} - ${num2} + ${num3} = ?`;
      explanation = `運算規則：由左至右依序計算！第一步 ${num1} - ${num2} = ${num1-num2}；第二步 ${num1-num2} + ${num3} = ${answer}。`;
      qId = `math_dbl_mix_${answer}_${Math.random().toString(36).substring(2, 5)}`;
    } else {
      // math_8_11_multiplication
      const num1 = Math.floor(Math.random() * 4) + 8; // 8 to 11
      const num2 = Math.floor(Math.random() * 11) + 1; // 1 to 11
      answer = num1 * num2;
      questionStr = `${num1} × ${num2} = ?`;
      explanation = `根據九九乘法表：${num1} × ${num2} 等於 ${answer}。`;
      qId = `math_mult811_${answer}_${Math.random().toString(36).substring(2, 5)}`;
    }
    attempts++;
  } while (usedIds.includes(qId) && attempts < 10);

  const options = generateFourOptions(answer);

  return {
    id: qId,
    type: 'math',
    subtype,
    question: `【學科挑戰 - 數學科】\n請計算以下數學算式：\n\n${questionStr}`,
    options,
    correctAnswer: answer.toString(),
    explanation
  };
}

// 5.2 Programmatic English-Chinese vocabulary matching generator
export function generateMatchingQuestion(usedIds: string[] = []): QuizQuestion {
  let picked: ChineseWord[] = [];
  let attempts = 0;
  let qId = "";

  do {
    const temp = [...CHINESE_WORDS_DB].sort(() => Math.random() - 0.5);
    picked = temp.slice(0, 4);
    
    const canonical = picked.map(w => w.word).sort().join("_");
    qId = `en_cn_match_${canonical}`;
    attempts++;
  } while (usedIds.includes(qId) && attempts < 10);

  const matchPairs = picked.map(w => ({
    left: w.en.charAt(0).toUpperCase() + w.en.slice(1),
    right: w.word
  }));

  const correctAnswer = matchPairs.map(p => `${p.left}-${p.right}`).join(", ");
  const explanation = "配對答案：\n" + matchPairs.map(p => `• ${p.left} = ${p.right}`).join("\n");

  return {
    id: qId,
    type: 'chinese',
    subtype: 'match',
    question: "【英中配對】請點擊左右兩邊對應的英文單字與中文詞意進行消除：",
    options: [correctAnswer, "Other mixed pairs", "Unmatched pairs", "Mismatched words"],
    correctAnswer,
    explanation,
    matchPairs
  };
}

// 5.3 Programmatic Logic Pattern generator (Graphic & Numeric patterns)
export function generateLogicPatternQuestion(subtype: 'logic_num_pattern' | 'logic_graph_pattern', usedIds: string[] = []): QuizQuestion {
  let qId = "";
  let question = "";
  let options: string[] = [];
  let correctAnswer = "";
  let explanation = "";

  let attempts = 0;
  do {
    if (subtype === 'logic_num_pattern') {
      const start = Math.floor(Math.random() * 20) + 1;
      const step = [2, 3, 5, 10][Math.floor(Math.random() * 4)];
      const isUp = Math.random() > 0.2;
      
      const seq: number[] = [];
      for (let i = 0; i < 5; i++) {
        seq.push(start + (isUp ? 1 : -1) * i * step);
      }
      correctAnswer = seq[4].toString();
      const seqStr = seq.slice(0, 4).join(", ") + ", ？";
      
      question = `【數列規律】請觀察以下數列，找出其增減規律，並點選問號處應填入的正確數字：\n\n${seqStr}`;
      options = generateFourOptions(seq[4]);
      explanation = `規律分析：觀察前幾個數字，它是以規律「${isUp ? "增加" : "減少"} ${step}」遞進的數列。因此最後一個數字是 ${seq[3]} ${isUp ? "+" : "-"} ${step} = ${correctAnswer}。`;
      qId = `logic_num_pattern_${start}_${step}_${isUp ? 'up' : 'down'}`;
    } else {
      // logic_graph_pattern
      const emojiPool = ["▲", "■", "●", "★", "🍀", "🍎", "🐱", "🐶", "🎈", "🚗", "🍭", "☀️", "🌙"];
      const shuffled = emojiPool.sort(() => Math.random() - 0.5);
      const A = shuffled[0];
      const B = shuffled[1];
      const C = shuffled[2];
      
      const patType = Math.random() > 0.5 ? "ABC" : "ABAB";
      
      if (patType === "ABC") {
        question = `【圖形規律】請觀察以下圖形的重複規律，找出問號處應該放入什麼圖形？\n\n${A}  ${B}  ${C}  ${A}  ${B}  ？`;
        correctAnswer = C;
        options = [C, A, B, shuffled[3]].sort(() => Math.random() - 0.5);
        explanation = `規律分析：此圖形是以「${A}、${B}、${C}」這三個圖形為一組，不斷進行循環重複。因此 ${B} 後面填入的應該是 ${C}。`;
        qId = `logic_graph_abc_${A}_${B}_${C}`;
      } else {
        question = `【圖形規律】請觀察以下圖形的重複規律，找出問號處應該放入什麼圖形？\n\n${A}  ${B}  ${A}  ${B}  ${A}  ？`;
        correctAnswer = B;
        options = [B, A, shuffled[2], shuffled[3]].sort(() => Math.random() - 0.5);
        explanation = `規律分析：此圖形是以「${A}、${B}」這兩個圖形為一組，一來一回交替重複。因此 ${A} 後面填入的應該是 ${B}。`;
        qId = `logic_graph_abab_${A}_${B}`;
      }
    }
    attempts++;
  } while (usedIds.includes(qId) && attempts < 10);

  return {
    id: qId,
    type: 'logic',
    subtype: 'pattern',
    question,
    options,
    correctAnswer,
    explanation
  };
}

// 5.4 Programmatic Logic Time reader and advancement generator
export function generateLogicTimeQuestion(usedIds: string[] = []): QuizQuestion {
  const isAdvancement = Math.random() > 0.5;
  let qId = "";
  let question = "";
  let options: string[] = [];
  let correctAnswer = "";
  let explanation = "";

  let attempts = 0;
  do {
    if (isAdvancement) {
      const startH = Math.floor(Math.random() * 11) + 1;
      const startM = [0, 15, 30, 45][Math.floor(Math.random() * 4)];
      const advanceM = [15, 30, 45, 60][Math.floor(Math.random() * 4)];
      
      let endM = startM + advanceM;
      let endH = startH;
      if (endM >= 60) {
        endH = (endH + Math.floor(endM / 60)) % 12;
        if (endH === 0) endH = 12;
        endM = endM % 60;
      }
      
      const startStr = `${startH}:${startM === 0 ? "00" : startM}`;
      const endStr = `${endH}:${endM === 0 ? "00" : endM}`;
      
      question = `【時間計算】現在時間是下午 ${startStr}。請問如果再過 ${advanceM} 分鐘，時鐘會顯示什麼時間？`;
      correctAnswer = endStr;
      
      const optionsSet = new Set<string>();
      optionsSet.add(correctAnswer);
      let loopAttempts = 0;
      while (optionsSet.size < 4 && loopAttempts < 50) {
        loopAttempts++;
        const dummyH = (startH + Math.floor(Math.random() * 3)) % 12 || 12;
        const dummyM = [0, 15, 30, 45][Math.floor(Math.random() * 4)];
        optionsSet.add(`${dummyH}:${dummyM === 0 ? "00" : dummyM}`);
      }
      let backupOffset = 1;
      while (optionsSet.size < 4) {
        optionsSet.add(`${(startH + backupOffset) % 12 || 12}:${[0, 15, 30, 45][backupOffset % 4] === 0 ? "00" : [0, 15, 30, 45][backupOffset % 4]}`);
        backupOffset++;
      }
      options = Array.from(optionsSet).sort(() => Math.random() - 0.5);
      explanation = `計算解析：原本是 ${startStr}，增加 ${advanceM} 分鐘後。${startM} + ${advanceM} = ${startM + advanceM} 分鐘。算出來正好是 ${endStr}。`;
      qId = `logic_time_adv_${startH}_${startM}_${advanceM}`;
    } else {
      const H = Math.floor(Math.random() * 11) + 1;
      const M = [0, 15, 30, 45][Math.floor(Math.random() * 4)];
      
      let minuteHandDesc = "指向 12";
      if (M === 15) minuteHandDesc = "指向 3";
      else if (M === 30) minuteHandDesc = "指向 6";
      else if (M === 45) minuteHandDesc = "指向 9";
      
      let hourHandDesc = `正好指向 ${H}`;
      if (M > 0) {
        hourHandDesc = `指向 ${H} 和 ${H === 12 ? 1 : H + 1} 之間`;
      }
      
      const timeStr = `${H}:${M === 0 ? "00" : M}`;
      question = `【時間認知】如果一個模擬時鐘的時針${hourHandDesc}，而分針${minuteHandDesc}。請問這代表什麼時間？`;
      correctAnswer = timeStr;
      
      const optionsSet = new Set<string>();
      optionsSet.add(correctAnswer);
      let loopAttempts = 0;
      while (optionsSet.size < 4 && loopAttempts < 50) {
        loopAttempts++;
        const dummyH = Math.floor(Math.random() * 12) + 1;
        const dummyM = [0, 15, 30, 45][Math.floor(Math.random() * 4)];
        optionsSet.add(`${dummyH}:${dummyM === 0 ? "00" : dummyM}`);
      }
      let backupOffset = 1;
      while (optionsSet.size < 4) {
        optionsSet.add(`${(H + backupOffset) % 12 || 12}:${[0, 15, 30, 45][backupOffset % 4] === 0 ? "00" : [0, 15, 30, 45][backupOffset % 4]}`);
        backupOffset++;
      }
      options = Array.from(optionsSet).sort(() => Math.random() - 0.5);
      explanation = `讀時解析：分針${minuteHandDesc}代表過了 ${M} 分鐘，時針${hourHandDesc}代表 ${H} 點。因此正確的時間就是 ${timeStr}。`;
      qId = `logic_time_read_${H}_${M}`;
    }
    attempts++;
  } while (usedIds.includes(qId) && attempts < 10);

  return {
    id: qId,
    type: 'logic',
    subtype: 'time',
    question,
    options,
    correctAnswer,
    explanation
  };
}


// ============================================================================
// 6. MAIN ROUTER ENTRYPOINT
// ============================================================================

export function generateQuestion(
  floor: number, 
  dFactorSlope = 0.2, 
  forceType?: 'math' | 'chinese' | 'english' | 'logic',
  usedIds: string[] = []
): QuizQuestion {
  const maxL = getLevelForFloor(floor);
  
  // Filter categories up to floor's active level
  let candidates = ALL_QUESTION_DEFS.filter(def => def.level <= maxL);
  
  if (forceType) {
    candidates = candidates.filter(def => def.type === forceType);
  }
  
  // Fallback to all definitions if constraint leaves nothing
  if (candidates.length === 0) {
    candidates = forceType 
      ? ALL_QUESTION_DEFS.filter(def => def.type === forceType) 
      : ALL_QUESTION_DEFS;
  }
  
  const chosenDef = candidates[Math.floor(Math.random() * candidates.length)];
  const { type, subtype } = chosenDef;

  // 6.1 CHINESE
  if (type === 'chinese') {
    if (subtype === 'pronunciation') {
      const wordObj = CHINESE_WORDS_DB[Math.floor(Math.random() * CHINESE_WORDS_DB.length)];
      // Filter out the correct word itself from distractors and remove duplicates
      const pureDists = Array.from(new Set(wordObj.similar.filter(item => item !== wordObj.word)));
      const dists = [...pureDists].sort(() => Math.random() - 0.5).slice(0, 3);
      
      // Fallback: if there are fewer than 3 distractors, fill with random unique words
      while (dists.length < 3) {
        const randomWord = CHINESE_WORDS_DB[Math.floor(Math.random() * CHINESE_WORDS_DB.length)].word;
        if (randomWord !== wordObj.word && !dists.includes(randomWord)) {
          dists.push(randomWord);
        }
      }
      
      const options = [wordObj.word, ...dists].sort(() => Math.random() - 0.5);
      
      return {
        id: `zh_pronun_${wordObj.word}`,
        type: 'chinese',
        subtype: 'pronunciation',
        question: `【聽音辨字】點擊下方發音按鈕聆聽讀音（廣東話），並從四個字形相似的選項中點選發音正確的漢字：`,
        options,
        correctAnswer: wordObj.word,
        explanation: `播放的語音讀作「${wordObj.word}」。正確漢字為「${wordObj.word}」，其他選項是看起來相似但發音截然不同的字喔！`,
        speechText: wordObj.word,
        speechLang: "zh-HK"
      };
    } else if (subtype === 'sentence_fill') {
      const unused = CHINESE_FILL_TEMPLATES.filter(t => t && t.question && !usedIds.includes(`zh_fill_${t.question.substring(0, 10)}`));
      const activeList = unused.length > 0 ? unused : CHINESE_FILL_TEMPLATES;
      const template = activeList[Math.floor(Math.random() * activeList.length)] || CHINESE_FILL_TEMPLATES[0];
      const qText = template?.question || "";
      return {
        id: `zh_fill_${qText.substring(0, 10)}`,
        type: 'chinese',
        subtype: 'sentence_fill',
        question: `【學科挑戰 - 中文科】\n請選出最合適的漢字填補句子中的缺字：\n\n${qText}`,
        options: template?.options || [],
        correctAnswer: template?.correctAnswer || "",
        explanation: template?.explanation || ""
      };
    } else if (subtype === 'missing_stroke') {
      const unused = CHINESE_STROKE_TEMPLATES.filter(t => t && t.correctAnswer && !usedIds.includes(`zh_stroke_${t.correctAnswer}`));
      const activeList = unused.length > 0 ? unused : CHINESE_STROKE_TEMPLATES;
      const template = activeList[Math.floor(Math.random() * activeList.length)] || CHINESE_STROKE_TEMPLATES[0];
      const correctText = template?.correctAnswer || "";
      return {
        id: `zh_stroke_${correctText}`,
        type: 'chinese',
        subtype: 'missing_stroke',
        question: template?.question || "",
        options: template?.options || [],
        correctAnswer: correctText,
        explanation: template?.explanation || ""
      };
    } else if (subtype === 'sentence_reorder') {
      const unused = CHINESE_REORDER_TEMPLATES.filter(t => t && t.correctAnswer && !usedIds.includes(`zh_reorder_${t.correctAnswer}`));
      const activeList = unused.length > 0 ? unused : CHINESE_REORDER_TEMPLATES;
      const template = activeList[Math.floor(Math.random() * activeList.length)] || CHINESE_REORDER_TEMPLATES[0];
      
      const correctText = template?.correctAnswer || "";
      const optionsSet = new Set<string>();
      optionsSet.add(correctText);
      let loopAttempts = 0;
      const scrambledWords = template?.scrambledWords || [];
      while (optionsSet.size < 4 && loopAttempts < 50) {
        loopAttempts++;
        const shuffled = [...scrambledWords].sort(() => Math.random() - 0.5).join("");
        optionsSet.add(shuffled + "。");
      }
      let backupOffset = 1;
      while (optionsSet.size < 4) {
        optionsSet.add(correctText + " " + ".".repeat(backupOffset));
        backupOffset++;
      }
      return {
        id: `zh_reorder_${correctText}`,
        type: 'chinese',
        subtype: 'sentence_reorder',
        question: `【句子重組】請依順序點擊字塊，排列成文法正確的完整句子：`,
        options: Array.from(optionsSet).sort(() => Math.random() - 0.5),
        correctAnswer: correctText,
        explanation: template?.scrambledExplanation || correctText,
        scrambledWords: scrambledWords
      };
    } else if (subtype === 'emoji_zh') {
      // Choose an item from EMOJI_ZH_DB
      const unused = EMOJI_ZH_DB.filter(t => !usedIds.includes(`zh_emoji_${t.emoji}`));
      const activeList = unused.length > 0 ? unused : EMOJI_ZH_DB;
      const template = activeList[Math.floor(Math.random() * activeList.length)] || EMOJI_ZH_DB[0];
      const options = [template.word, ...template.distractors].sort(() => Math.random() - 0.5);
      
      return {
        id: `zh_emoji_${template.emoji}`,
        type: 'chinese',
        subtype: 'emoji_zh',
        question: `【表情符號挑戰】請看下面的表情符號，選出它對應的正確中文字：\n\n${template.emoji}`,
        options,
        correctAnswer: template.word,
        explanation: `這個表情符號 ${template.emoji} 的中文是「${template.word}」。`
      };
    } else if (subtype === 'stroke_count') {
      return generateStrokeCountQuestion(usedIds);
    } else if (subtype === 'match') {
      return generateMatchingQuestion(usedIds);
    }
  }

  // 6.2 ENGLISH
  if (type === 'english') {
    if (subtype === 'phonics') {
      const unused = ENGLISH_PHONICS_DB.filter(t => t && t.word && !usedIds.includes(`en_phon_${t.word}`));
      const activeList = unused.length > 0 ? unused : ENGLISH_PHONICS_DB;
      const template = activeList[Math.floor(Math.random() * activeList.length)] || ENGLISH_PHONICS_DB[0];
      const wordText = template?.word || "";
      const specialFriend = template?.specialFriend || "";
      const distractors = template?.distractors || [];
      const options = [specialFriend, ...distractors].sort(() => Math.random() - 0.5);
      
      return {
        id: `en_phon_${wordText}`,
        type: 'english',
        subtype: 'phonics',
        question: `【Phonics Forest】Listen to the pronunciation and identify the 'special friend' sound in the word:\n\nWord: "${wordText}"`,
        options,
        correctAnswer: specialFriend,
        explanation: `The word "${wordText}" contains the special friend phonics sound "${specialFriend}".`,
        speechText: wordText,
        speechLang: "en-US"
      };
    } else if (subtype === 'cloze') {
      const unused = ENGLISH_CLOZE_TEMPLATES.filter(t => t && t.question && !usedIds.includes(`en_cloze_${t.question.substring(0, 10)}`));
      const activeList = unused.length > 0 ? unused : ENGLISH_CLOZE_TEMPLATES;
      const template = activeList[Math.floor(Math.random() * activeList.length)] || ENGLISH_CLOZE_TEMPLATES[0];
      const qText = template?.question || "";
      
      return {
        id: `en_cloze_${qText.substring(0, 10)}`,
        type: 'english',
        subtype: 'cloze',
        question: `【Grammar Cloze】Complete the English sentence with the most grammatically correct option:\n\n"${qText}"`,
        options: template?.options || [],
        correctAnswer: template?.correctAnswer || "",
        explanation: template?.explanation || ""
      };
    } else if (subtype === 'spelling') {
      const unused = ENGLISH_SPELLING_DB.filter(t => t && t.word && !usedIds.includes(`en_spell_${t.word}`));
      const activeList = unused.length > 0 ? unused : ENGLISH_SPELLING_DB;
      const template = activeList[Math.floor(Math.random() * activeList.length)] || ENGLISH_SPELLING_DB[0];
      const wordText = template?.word || "";
      
      return {
        id: `en_spell_${wordText}`,
        type: 'english',
        subtype: 'spelling',
        question: `【Spelling Quest】Look at the hint, listen to the pronunciation, and spell the word using the keyboard:\n\nHint: "${template?.hint || ""}"`,
        options: ["Spell it correctly!"],
        correctAnswer: wordText,
        explanation: `The correct spelling is "${wordText}". Well done!`,
        speechText: wordText.toLowerCase(),
        speechLang: "en-US"
      };
    } else if (subtype === 'emoji_en') {
      const unused = EMOJI_EN_DB.filter(t => !usedIds.includes(`en_emoji_${t.emoji}`));
      const activeList = unused.length > 0 ? unused : EMOJI_EN_DB;
      const template = activeList[Math.floor(Math.random() * activeList.length)] || EMOJI_EN_DB[0];
      const options = [template.word, ...template.distractors].sort(() => Math.random() - 0.5);
      
      return {
        id: `en_emoji_${template.emoji}`,
        type: 'english',
        subtype: 'emoji_en',
        question: `【Emoji Vocab Challenge】Look at the emoji and select the correct corresponding English word:\n\n${template.emoji}`,
        options,
        correctAnswer: template.word,
        explanation: `The emoji ${template.emoji} represents "${template.word}".`
      };
    } else if (subtype === 'sentence_reorder') {
      // English Sentence Reorder
      const unused = ENGLISH_REORDER_DB.filter(t => !usedIds.includes(`en_reorder_${t.correctAnswer.substring(0, 15)}`));
      const activeList = unused.length > 0 ? unused : ENGLISH_REORDER_DB;
      const template = activeList[Math.floor(Math.random() * activeList.length)] || ENGLISH_REORDER_DB[0];
      
      return {
        id: `en_reorder_${template.correctAnswer.substring(0, 15)}`,
        type: 'english',
        subtype: 'sentence_reorder',
        question: `【Sentence Reordering】Click the word blocks in the correct order to form a grammatically correct sentence:`,
        options: [template.correctAnswer, "Dummy option 1", "Dummy option 2", "Dummy option 3"],
        correctAnswer: template.correctAnswer,
        explanation: `The correct sentence is: "${template.correctAnswer}"`,
        scrambledWords: template.scrambledWords
      };
    }
  }

  // 6.3 MATH
  if (type === 'math') {
    return generateMathQuestion(floor, usedIds);
  }

  // 6.4 LOGIC
  if (type === 'logic') {
    if (subtype === 'logic_num_pattern' || subtype === 'logic_graph_pattern') {
      return generateLogicPatternQuestion(subtype, usedIds);
    } else if (subtype === 'logic_time') {
      return generateLogicTimeQuestion(usedIds);
    } else {
      // blocks
      const unused = LOGIC_BLOCKS_DB.filter(t => t && t.desc && !usedIds.includes(`logic_blocks_${t.desc.substring(0, 10)}`));
      const activeList = unused.length > 0 ? unused : LOGIC_BLOCKS_DB;
      const template = activeList[Math.floor(Math.random() * activeList.length)] || LOGIC_BLOCKS_DB[0];
      const descText = template?.desc || "";
      
      const ans = template?.ans || 10;
      const options = generateFourOptions(ans);

      return {
        id: `logic_blocks_${descText.substring(0, 10)}`,
        type: 'logic',
        subtype: 'blocks',
        question: `【圖形辨識 / 3D Block Counting】\n${descText}`,
        options,
        correctAnswer: ans.toString(),
        explanation: template?.exp || ""
      };
    }
  }

  // Absolute fallback
  return generateMathQuestion(floor, usedIds);
}

// ============================================================================
// 7. AUTOMATIC DATABASE EXPANDER (Guarantees 100+ questions per category)
// ============================================================================
(() => {
  // 1. Expand CHINESE_WORDS_DB with 35 fresh P1/P2 words (bringing total to 105)
  const extraWords: any[] = [
    { word: "醫生", en: "doctor", strokes: 11, similar: ["悘生", "醫土", "醫牛", "翳生"] },
    { word: "護士", en: "nurse", strokes: 15, similar: ["護土", "獲士", "護仕", "獲土"] },
    { word: "警察", en: "police", strokes: 14, similar: ["警祭", "驚察", "警查", "擎察"] },
    { word: "消防員", en: "firefighter", strokes: 10, similar: ["消防圓", "消防元", "燒防員", "消房員"] },
    { word: "司機", en: "driver", strokes: 5, similar: ["同機", "司幾", "可機", "伺機"] },
    { word: "廚師", en: "chef", strokes: 15, similar: ["櫥師", "廚帥", "廚篩", "櫥帥"] },
    { word: "農夫", en: "farmer", strokes: 13, similar: ["濃夫", "農天", "農失", "襛夫"] },
    { word: "郵差", en: "postman", strokes: 12, similar: ["油差", "郵柴", "郵着", "尤差"] },
    { word: "學生", en: "student", strokes: 16, similar: ["字生", "學土", "學牛", "覺生"] },
    { word: "嬰兒", en: "baby", strokes: 17, similar: ["櫻兒", "嬰几", "甖兒", "嬰父"] },
    { word: "熊貓", en: "panda", strokes: 14, similar: ["態貓", "熊描", "能貓", "熊苗"] },
    { word: "兔子", en: "rabbit", strokes: 8, similar: ["免子", "兔孑", "兔才", "挽子"] },
    { word: "猴子", en: "monkey", strokes: 12, similar: ["候子", "猴孑", "翭子", "喉子"] },
    { word: "大象", en: "elephant", strokes: 3, similar: ["太象", "大像", "犬象", "大橡"] },
    { word: "松鼠", en: "squirrel", strokes: 8, similar: ["蚣鼠", "松書", "忪鼠", "松鼡"] },
    { word: "長頸鹿", en: "giraffe", strokes: 8, similar: ["長勁鹿", "長頸麓", "長項鹿", "張勁鹿"] },
    { word: "獅子", en: "lion", strokes: 13, similar: ["師子", "獅孑", "獅才", "篩子"] },
    { word: "老虎", en: "tiger", strokes: 6, similar: ["考虎", "老處", "老虐", "老虛"] },
    { word: "河馬", en: "hippo", strokes: 8, similar: ["何馬", "河鳥", "河闖", "荷馬"] },
    { word: "海豚", en: "dolphin", strokes: 10, similar: ["每豚", "海琢", "海涿", "悔豚"] },
    { word: "草莓", en: "strawberry", strokes: 9, similar: ["草梅", "草每", "早梅", "花梅"] },
    { word: "香蕉", en: "banana", strokes: 9, similar: ["香焦", "杏蕉", "香瞧", "香燋"] },
    { word: "西瓜", en: "watermelon", strokes: 6, similar: ["西爪", "要瓜", "西風", "酉瓜"] },
    { word: "葡萄", en: "grape", strokes: 12, similar: ["葡桃", "菩萄", "葡淘", "蒲萄"] },
    { word: "橙子", en: "orange", strokes: 16, similar: ["登子", "橙孑", "橙才", "澄子"] },
    { word: "椰子", en: "coconut", strokes: 12, similar: ["耶子", "椰孑", "爺子", "椰才"] },
    { word: "麵包", en: "bread", strokes: 20, similar: ["面包", "麵句", "麵跑", "勉包"] },
    { word: "蛋糕", en: "cake", strokes: 11, similar: ["蛋高", "蛋羔", "螢糕", "蛋篙"] },
    { word: "雞蛋", en: "egg", strokes: 18, similar: ["鷄蛋", "雞但", "難蛋", "雞延"] },
    { word: "米飯", en: "rice", strokes: 6, similar: ["米板", "米返", "采飯", "迷飯"] },
    { word: "麵條", en: "noodles", strokes: 20, similar: ["麵修", "面條", "麵挑", "勉條"] },
    { word: "湯圓", en: "dumpling", strokes: 12, similar: ["場圓", "湯員", "湯園", "盪圓"] },
    { word: "果汁", en: "juice", strokes: 8, similar: ["菓汁", "果什", "果計", "棵汁"] },
    { word: "汽水", en: "soda", strokes: 7, similar: ["氣水", "汽冰", "汽毛", "汔水"] },
    { word: "教室", en: "classroom", strokes: 9, similar: ["校室", "教桌", "教月", "教書"] }
  ];
  extraWords.forEach(w => {
    if (!CHINESE_WORDS_DB.some(x => x.word === w.word)) {
      CHINESE_WORDS_DB.push(w);
    }
  });

  // 2. Expand CHINESE_FILL_TEMPLATES dynamically (to 100+ questions)
  const fillPatterns = [
    { key: "小貓", template: "你看，那邊有一隻可愛的___正在打瞌睡。", options: ["小貓", "大樹", "清水", "衣服"], explanation: "小貓是可愛的動物，會打瞌睡。" },
    { key: "小狗", template: "我一回家，可愛的___就會對著我搖尾巴。", options: ["小狗", "大樹", "功課", "飛機"], explanation: "小狗見到主人會搖尾巴迎接。" },
    { key: "醫生", template: "當我們生病的時候，媽媽會帶我去醫院看___。", options: ["醫生", "廚師", "司機", "郵差"], explanation: "生病要看醫生治療。" },
    { key: "護士", template: "醫院裏溫柔的___阿姨幫我量體溫 and 擦藥。", options: ["護士", "司機", "廚師", "農夫"], explanation: "護士會在醫院協助病人並擦藥。" },
    { key: "警察", template: "英勇的___叔叔在街上維持治安，捉拿壞人。", options: ["警察", "學生", "嬰兒", "司機"], explanation: "警察的職責是維持治安和捉拿壞人。" },
    { key: "消防員", template: "當發生火警時，勇敢的___會開著水車來滅火。", options: ["消防員", "廚師", "郵差", "農夫"], explanation: "消防員負責撲滅火災和救援。" },
    { key: "司機", template: "校車___叔叔每天都準時開車送我們上學。", options: ["司機", "廚師", "郵差", "學生"], explanation: "司機負責開車運送乘客。" },
    { key: "廚師", template: "餐廳裏的___叔叔煮了很多美味的食物給客人。", options: ["廚師", "醫生", "警察", "護士"], explanation: "廚師負責在餐廳烹調美味料理。" },
    { key: "學生", template: "我們是學校裏的___，要認真學習新知識。", options: ["學生", "醫生", "護士", "廚師"], explanation: "在學校學習知識的人是學生。" },
    { key: "兔子", template: "那隻白色的___長著一對長耳朵，高興地蹦蹦跳。", options: ["兔子", "大象", "獅子", "海豚"], explanation: "兔子長著長耳朵且擅長跳躍。" },
    { key: "大象", template: "動物園裏的___鼻子長長的，身體像一堵牆。", options: ["大象", "小貓", "小狗", "猴子"], explanation: "大象擁有標誌性的長鼻子和龐大身軀。" },
    { key: "香蕉", template: "猴子最喜歡吃黃色的___，味道又香又甜。", options: ["香蕉", "西瓜", "椰子", "麵包"], explanation: "香蕉是猴子最愛的黃色水果。" },
    { key: "西瓜", template: "炎熱的夏天，吃一片多汁的___最消暑了。", options: ["西瓜", "香蕉", "蛋糕", "麵包"], explanation: "西瓜是夏天消暑解渴的美味水果。" },
    { key: "牛奶", template: "每天早晨喝一杯溫熱的___，能讓我們骨骼更健康。", options: ["牛奶", "汽水", "果汁", "清水"], explanation: "牛奶富含鈣質，有助於骨骼健康。" },
    { key: "蛋糕", template: "今天是妹妹的生日，媽媽為她準備了草莓___。", options: ["蛋糕", "米飯", "麵條", "雞蛋"], explanation: "生日派對上最適合準備生日蛋糕慶祝。" },
    { key: "米飯", template: "中國人每天的主食是白香美味的___。", options: ["米飯", "蛋糕", "果汁", "汽水"], explanation: "白米飯是東亞地區最常見的主食。" },
    { key: "果汁", template: "新鮮的橙子可以榨成好喝的___，含有維他命C。", options: ["果汁", "牛奶", "汽水", "熱湯"], explanation: "水果榨出來的液體是果汁。" }
  ];

  fillPatterns.forEach(p => {
    if (CHINESE_FILL_TEMPLATES.length < 110) {
      CHINESE_FILL_TEMPLATES.push({
        question: `【Chinese Fill】請選出最適合填入句中空格的詞語：\n\n「${p.template}」`,
        options: p.options.sort(() => Math.random() - 0.5),
        correctAnswer: p.key,
        explanation: p.explanation
      });
    }
  });

  // Keep auto-generating simple fill templates until we have 105+
  const wordFillSentences: Record<string, { sentence: string, explanation: string, distractors: string[] }> = {
    "學校": { sentence: "我們每天早上都準時去___上課學知識。", explanation: "去「學校」上課學習。", distractors: ["操場", "森林", "太陽"] },
    "同學": { sentence: "小明是我的班長，也是我最要好的___。", explanation: "班長和我是「同學」。", distractors: ["老師", "醫生", "小狗"] },
    "太陽": { sentence: "早晨，紅紅的___從東方升起，照亮大地。", explanation: "「太陽」從東方升起。", distractors: ["月亮", "大樹", "蘋果"] },
    "禮貌": { sentence: "見到老師要主動打招呼，做個有___的好孩子。", explanation: "主動打招呼是有「禮貌」的表現。", distractors: ["衣服", "玩具", "時間"] },
    "鉛筆": { sentence: "我用黑色的___在作業本上認真寫字。", explanation: "寫字用「鉛筆」。", distractors: ["牛奶", "小鳥", "飛機"] },
    "蘋果": { sentence: "紅彤彤的___吃起來又甜又脆，非常有營養。", explanation: "「蘋果」是又甜又脆的紅水果。", distractors: ["樹葉", "鉛筆", "清水"] },
    "唱歌": { sentence: "音樂課上，同學們一起大聲___，歌聲真美妙。", explanation: "歌唱表演是「唱歌」。", distractors: ["跑步", "睡覺", "洗手"] },
    "畫畫": { sentence: "美勞課時，我用彩色筆在畫紙上___。", explanation: "在畫紙上「畫畫」。", distractors: ["唱歌", "跳繩", "學習"] },
    "衣服": { sentence: "天氣冷了，媽媽叮囑我要多穿一件___保暖。", explanation: "穿「衣服」保暖。", distractors: ["水果", "功課", "玩具"] },
    "明亮": { sentence: "課室裏有充足的光線，顯得十分___乾淨。", explanation: "光線充足顯得「明亮」。", distractors: ["溫暖", "操心", "快樂"] },
    "眼睛": { sentence: "我們有一雙黑溜溜的___，用來觀察美麗的世界。", explanation: "用「眼睛」看世界。", distractors: ["耳朵", "雙手", "雙腳"] },
    "大樹": { sentence: "花園裏長著一棵茂盛的___，樹葉綠油油的。", explanation: "茂盛的「大樹」有綠葉。", distractors: ["小狗", "飛機", "書本"] },
    "玩耍": { sentence: "放學後，我和好朋友一起在公園裏高興地___。", explanation: "在公園「玩耍」嬉戲。", distractors: ["做功課", "睡覺", "洗手"] },
    "早晨": { sentence: "一覺醒來，美麗的___伴隨著鳥鳴聲開始了。", explanation: "早上醒來是「早晨」。", distractors: ["深夜", "晚上", "中午"] },
    "操場": { sentence: "體育課時，我們在寬闊的___上跑步鍛煉身體。", explanation: "在「操場」上上體育課、跑步。", distractors: ["教室", "圖書館", "醫院"] },
    "水果": { sentence: "多吃香蕉、橙子等新鮮的___，能補充維他命。", explanation: "香蕉、橙子是「水果」。", distractors: ["牛奶", "麵包", "米飯"] },
    "書本": { sentence: "書包裏裝滿了各式各樣的___，每天陪我上學。", explanation: "書包裝「書本」。", distractors: ["小貓", "大樹", "清水"] },
    "老師": { sentence: "辛勤的___在講台上專心地給我們講授新知識。", explanation: "講授知識的人是「老師」。", distractors: ["學生", "小鳥", "醫生"] },
    "清水": { sentence: "口渴的時候，喝一杯純淨的___最舒服了。", explanation: "口渴喝「清水」。", distractors: ["汽水", "牛奶", "果汁"] },
    "小鳥": { sentence: "一隻彩色羽毛的___在枝頭嘰嘰喳喳叫個不停。", explanation: "會飛、在枝頭叫的是「小鳥」。", distractors: ["小狗", "小貓", "大象"] },
    "飛機": { sentence: "抬頭看，一架巨大的___正在蔚藍的天空飛過。", explanation: "在天空飛的是「飛機」。", distractors: ["輪船", "火車", "巴士"] },
    "快樂": { sentence: "今天是我最難忘的生日，我過得十分___滿足。", explanation: "生日過得非常「快樂」。", distractors: ["悲傷", "操心", "溫暖"] },
    "溫暖": { sentence: "冬天的陽光照在身上，讓人感覺無比___舒服。", explanation: "冬日的陽光很「溫暖」。", distractors: ["寒冷", "明亮", "健康"] },
    "綠草": { sentence: "春風吹過，漫山遍野長滿了青嫩的___地。", explanation: "春風吹綠「綠草」。", distractors: ["石頭", "沙灘", "大雪"] },
    "森林": { sentence: "大自然中茂密的___裏，居住著無數野生動物。", explanation: "野生動物居住在「森林」中。", distractors: ["學校", "操場", "城市"] },
    "天空": { sentence: "無邊無際的___中，飄浮著朵朵白雲和太陽。", explanation: "白雲和太陽在「天空」中。", distractors: ["海洋", "泥土", "地板"] },
    "海洋": { sentence: "蔚藍而遼闊的___裏，游動著各種鯨魚 and 海豚。", explanation: "鯨魚和海豚在「海洋」裏游泳。", distractors: ["森林", "天空", "花園"] },
    "月亮": { sentence: "夜晚的星空中，彎彎的___像一隻金色的小船。", explanation: "夜晚像小船的是「月亮」。", distractors: ["太陽", "彩虹", "白雲"] },
    "故事": { sentence: "臨睡前，媽媽總會溫柔地給我講精彩的童話___。", explanation: "媽媽講「故事」哄我睡覺。", distractors: ["功課", "衣服", "鉛筆"] },
    "功課": { sentence: "晚飯前，我坐在書桌旁認真地把今天的___寫完。", explanation: "寫完今天的「功課」/作業。", distractors: ["玩具", "水果", "唱跳"] },
    "健康": { sentence: "我們平時要多運動、不挑食，身體才會強壯___。", explanation: "多運動不挑食讓身體更「健康」。", distractors: ["悲傷", "疲倦", "生病"] },
    "身體": { sentence: "生病的時候，我們會覺得___非常疲倦不舒服。", explanation: "生病時「身體」不舒服。", distractors: ["功課", "衣服", "明亮"] },
    "感謝": { sentence: "我們應該要對幫助過我們的人，真誠地說聲___。", explanation: "真誠地「感謝」他人。", distractors: ["生氣", "懷疑", "道歉"] },
    "學習": { sentence: "在學校裏，我們不僅聽課，還要學會認真___新技能。", explanation: "「學習」新技能。", distractors: ["睡覺", "玩耍", "跑步"] },
    "操心": { sentence: "媽媽每天為我操持家務，真是不辭勞苦，非常___。", explanation: "為家庭「操心」操勞。", distractors: ["快樂", "放鬆", "睡覺"] },
    "時間": { sentence: "一寸光陰一寸金，我們一定要珍惜每分每秒的___。", explanation: "珍惜「時間」不浪費。", distractors: ["金錢", "玩具", "衣服"] },
    "鐘錶": { sentence: "牆上掛著一個漂亮的___，滴答滴答地走個不停。", explanation: "滴答滴答走時的是「鐘錶」。", distractors: ["故事", "大樹", "書本"] },
    "朋友": { sentence: "當我有困難時，好___會主動伸出雙手來幫助我。", explanation: "好「朋友」會互相幫助。", distractors: ["壞人", "怪獸", "玩具"] },
    "幫助": { sentence: "我們要熱心___有需要的人，傳遞更多愛心。", explanation: "熱心「幫助」他人。", distractors: ["拒絕", "嘲笑", "打擾"] },
    "遊戲": { sentence: "體育課結束前，老師帶領我們玩了一個有趣的團體___。", explanation: "玩團體「遊戲」強身健體。", distractors: ["作業", "大雨", "考試"] },
    "圖書": { sentence: "圖書館裏整齊地擺放著各種各樣的___供大家閱讀。", explanation: "圖書館供人閱讀的是「圖書」。", distractors: ["零食", "玩具", "衣服"] },
    "玩具": { sentence: "我的房間裏堆滿了心愛的積木、火車等各式___。", explanation: "積木、火車是「玩具」。", distractors: ["功課", "蔬菜", "水果"] },
    "洗手": { sentence: "飯前便後、觸摸眼鼻前，我們都要用肥皂認真___。", explanation: "養成「洗手」衛生好習慣。", distractors: ["唱歌", "跳繩", "看書"] },
    "睡覺": { sentence: "夜深了，我們該上床蓋好被子，安靜地___了。", explanation: "夜深上床「睡覺」。", distractors: ["畫畫", "跑步", "唱歌"] },
    "跑步": { sentence: "體育老師一吹哨子，我們就飛快地繞著操場___。", explanation: "繞操場「跑步」。", distractors: ["唱歌", "畫畫", "寫字"] },
    "跳繩": { sentence: "雙手搖著繩子，腳步輕快地跟著跳躍，這就是___運動。", explanation: "搖繩跳躍是「跳繩」。", distractors: ["游水", "睡覺", "看書"] }
  };

  let fillIdx = 0;
  while (CHINESE_FILL_TEMPLATES.length < 105 && fillIdx < CHINESE_WORDS_DB.length) {
    const wordObj = CHINESE_WORDS_DB[fillIdx];
    fillIdx++;
    const sentenceDef = wordFillSentences[wordObj.word];
    if (sentenceDef) {
      const alreadyExists = CHINESE_FILL_TEMPLATES.some(t => t.correctAnswer === wordObj.word);
      if (!alreadyExists) {
        CHINESE_FILL_TEMPLATES.push({
          question: `【Chinese Fill】請選出最適合填入空格的漢語詞彙：\n\n「${sentenceDef.sentence}」`,
          options: [wordObj.word, ...sentenceDef.distractors].sort(() => Math.random() - 0.5),
          correctAnswer: wordObj.word,
          explanation: sentenceDef.explanation
        });
      }
    } else {
      // General fallback if we add words in the future
      const alreadyExists = CHINESE_FILL_TEMPLATES.some(t => t.correctAnswer === wordObj.word);
      if (!alreadyExists) {
        CHINESE_FILL_TEMPLATES.push({
          question: `【Chinese Fill】請選出與英文「${wordObj.en}」意思最對應的漢字詞彙：\n\n「___」`,
          options: [wordObj.word, "泥土", "大霧", "石頭"].sort(() => Math.random() - 0.5),
          correctAnswer: wordObj.word,
          explanation: `「${wordObj.word}」對應的英文是「${wordObj.en}」。`
        });
      }
    }
  }

  // 3. Expand CHINESE_REORDER_TEMPLATES dynamically (to 105+ questions)
  const subjects = ["媽媽", "爸爸", "老師", "哥哥", "姐姐", "弟弟", "妹妹", "同學們", "小主人", "小狗"];
  const places = ["在公園裏", "在學校裏", "在操場上", "在課室裏", "在花園中", "在樹林下", "在家裏"];
  const actions = ["認真地做功課", "高興地玩遊戲", "大聲地唱兒歌", "快活地跑步", "專心地畫圖畫", "安靜地看書本", "自由自在地游泳"];

  for (let s = 0; s < subjects.length; s++) {
    for (let p = 0; p < places.length; p++) {
      for (let a = 0; a < actions.length; a++) {
        if (CHINESE_REORDER_TEMPLATES.length < 105) {
          const sub = subjects[s];
          const plc = places[p];
          const act = actions[a];
          const correctSentence = `${sub}${plc}${act}。`;
          
          CHINESE_REORDER_TEMPLATES.push({
            question: "【句子重組】請依順序點擊字塊，排列成文法正確的完整句子：",
            scrambledWords: [sub, plc, act],
            correctAnswer: correctSentence,
            scrambledExplanation: correctSentence
          });
        }
      }
    }
  }

  // 4. Expand CHINESE_STROKE_TEMPLATES dynamically (to 105+)
  let wordIdx = 0;
  while (CHINESE_STROKE_TEMPLATES.length < 105 && wordIdx < CHINESE_WORDS_DB.length) {
    const wordObj = CHINESE_WORDS_DB[wordIdx];
    wordIdx++;
    const char = wordObj.word[0];
    const strokes = wordObj.strokes;
    const exists = CHINESE_STROKE_TEMPLATES.some(t => t.question.includes(`「${wordObj.word}」`));
    if (!exists && strokes > 0) {
      const distractors = [strokes + 2, strokes - 2, strokes + 4, strokes - 1]
        .filter(s => s > 0 && s !== strokes);
      const uniqueDistractors = Array.from(new Set(distractors)).slice(0, 3);
      while (uniqueDistractors.length < 3) {
        uniqueDistractors.push(strokes + uniqueDistractors.length + 3);
      }
      
      CHINESE_STROKE_TEMPLATES.push({
        question: `【漢字修復】「${wordObj.word}」的第一個字「${char}」一共有多少個筆劃？`,
        options: [strokes.toString() + " 劃", ...uniqueDistractors.map(d => d.toString() + " 劃")].sort(() => Math.random() - 0.5),
        correctAnswer: strokes.toString() + " 劃",
        explanation: `「${char}」字一共有 ${strokes} 個筆劃，請跟著老師一筆一劃仔細數數看喔！`
      });
    }
  }

  // 5. Expand ENGLISH_PHONICS_DB with 50 fresh words (bringing total to 100)
  const extraPhonicsList = [
    { word: "good", specialFriend: "oo", distractors: ["ee", "ay", "or"] },
    { word: "cook", specialFriend: "oo", distractors: ["ar", "ch", "sh"] },
    { word: "meet", specialFriend: "ee", distractors: ["oo", "ay", "ou"] },
    { word: "feet", specialFriend: "ee", distractors: ["or", "ar", "ow"] },
    { word: "rain", specialFriend: "ai", distractors: ["ee", "oo", "ar"] },
    { word: "train", specialFriend: "ai", distractors: ["ay", "or", "ou"] },
    { word: "coin", specialFriend: "oi", distractors: ["ee", "oo", "ow"] },
    { word: "shout", specialFriend: "ou", distractors: ["ow", "or", "ay"] },
    { word: "grow", specialFriend: "ow", distractors: ["ou", "ee", "ar"] },
    { word: "night", specialFriend: "ight", distractors: ["ee", "oo", "ay"] },
    { word: "light", specialFriend: "ight", distractors: ["or", "ar", "ow"] },
    { word: "sing", specialFriend: "ing", distractors: ["ch", "sh", "th"] },
    { word: "king", specialFriend: "ing", distractors: ["qu", "ch", "sh"] },
    { word: "shop", specialFriend: "sh", distractors: ["ch", "th", "qu"] },
    { word: "wish", specialFriend: "sh", distractors: ["th", "ch", "or"] },
    { word: "chin", specialFriend: "ch", distractors: ["sh", "th", "qu"] },
    { word: "much", specialFriend: "ch", distractors: ["sh", "ow", "ou"] },
    { word: "path", specialFriend: "th", distractors: ["sh", "ch", "qu"] },
    { word: "bath", specialFriend: "th", distractors: ["sh", "ch", "ee"] },
    { word: "play", specialFriend: "ay", distractors: ["ee", "or", "ar"] },
    { word: "stay", specialFriend: "ay", distractors: ["ee", "oo", "ar"] },
    { word: "wood", specialFriend: "oo", distractors: ["ee", "ch", "sh"] },
    { word: "wool", specialFriend: "oo", distractors: ["ee", "or", "ar"] },
    { word: "jeep", specialFriend: "ee", distractors: ["oo", "ay", "or"] },
    { word: "seed", specialFriend: "ee", distractors: ["oo", "ay", "or"] },
    { word: "snail", specialFriend: "ai", distractors: ["ee", "ay", "or"] },
    { word: "boil", specialFriend: "oi", distractors: ["ee", "oo", "ow"] },
    { word: "joint", specialFriend: "oi", distractors: ["ee", "oo", "ow"] },
    { word: "loud", specialFriend: "ou", distractors: ["ow", "oo", "ee"] },
    { word: "mouth", specialFriend: "th", distractors: ["sh", "ch", "ow"] },
    { word: "snow", specialFriend: "ow", distractors: ["ou", "or", "ar"] },
    { word: "show", specialFriend: "ow", distractors: ["ou", "or", "ar"] },
    { word: "fight", specialFriend: "ight", distractors: ["ee", "oo", "ay"] },
    { word: "bright", specialFriend: "ight", distractors: ["ee", "oo", "ay"] },
    { word: "ring", specialFriend: "ing", distractors: ["ch", "sh", "th"] },
    { word: "wing", specialFriend: "ing", distractors: ["ch", "sh", "th"] },
    { word: "shed", specialFriend: "sh", distractors: ["ch", "th", "qu"] },
    { word: "shut", specialFriend: "sh", distractors: ["ch", "th", "qu"] },
    { word: "chat", specialFriend: "ch", distractors: ["sh", "th", "ow"] },
    { word: "chip", specialFriend: "ch", distractors: ["sh", "th", "ow"] },
    { word: "thin", specialFriend: "th", distractors: ["sh", "ch", "qu"] },
    { word: "three", specialFriend: "th", distractors: ["sh", "ch", "ow"] },
    { word: "clay", specialFriend: "ay", distractors: ["ee", "or", "ar"] },
    { word: "gray", specialFriend: "ay", distractors: ["ee", "or", "ar"] },
    { word: "spoon", specialFriend: "oo", distractors: ["ee", "ou", "ow"] },
    { word: "moon", specialFriend: "oo", distractors: ["ee", "ch", "sh"] },
    { word: "dark", specialFriend: "ar", distractors: ["or", "ay", "ee"] },
    { word: "park", specialFriend: "ar", distractors: ["or", "ay", "ee"] },
    { word: "horn", specialFriend: "or", distractors: ["ar", "oo", "ou"] },
    { word: "fork", specialFriend: "or", distractors: ["ar", "oo", "ou"] }
  ];
  extraPhonicsList.forEach(p => {
    if (ENGLISH_PHONICS_DB.length < 105) {
      const exists = ENGLISH_PHONICS_DB.some(x => x.word === p.word);
      if (!exists) ENGLISH_PHONICS_DB.push(p);
    }
  });

  // 6. Expand ENGLISH_SPELLING_DB with 50 fresh words (bringing total to 100)
  const extraSpellingList = [
    { word: "LION", hint: "The king of the jungle with a big, golden mane." },
    { word: "TIGER", hint: "A large wild cat with orange fur and black stripes." },
    { word: "PANDA", hint: "A cute black-and-white bear that loves eating bamboo." },
    { word: "KOALA", hint: "A small Australian animal that climbs eucalyptus trees." },
    { word: "ZEBRA", hint: "A wild animal that looks like a horse with black and white stripes." },
    { word: "GIRAFFE", hint: "An animal with a very long neck to eat leaves from tall trees." },
    { word: "ELEPHANT", hint: "The largest land animal with big ears and a long nose trunk." },
    { word: "SHARK", hint: "A large fish with sharp teeth that swims in the deep ocean." },
    { word: "BUTTERFLY", hint: "A beautiful insect with colorful wings that flies around flowers." },
    { word: "STRAWBERRY", hint: "A sweet, juicy red fruit with tiny seeds on the outside." },
    { word: "BLUEBERRY", hint: "A small, round, sweet blue fruit that grows on bushes." },
    { word: "WATERMELON", hint: "A giant green fruit with sweet red flesh and black seeds." },
    { word: "PINEAPPLE", hint: "A tropical yellow fruit with prickly skin and sweet flesh." },
    { word: "CARROT", hint: "An orange vegetable that grows underground, loved by rabbits." },
    { word: "BROCCOLI", hint: "A green vegetable that looks like a miniature tree." },
    { word: "BURGER", hint: "A round sandwich with a meat patty, cheese, and lettuce." },
    { word: "PIZZA", hint: "An Italian flatbread topped with tomato, cheese, and pepperoni." },
    { word: "COOKIE", hint: "A sweet, baked biscuit often filled with chocolate chips." },
    { word: "BICYCLE", hint: "A vehicle with two wheels that you ride by pedaling." },
    { word: "AIRPLANE", hint: "A giant flying vehicle that carries people high in the sky." },
    { word: "HELICOPTER", hint: "A flying machine with spinning rotor blades on top." },
    { word: "SUBWAY", hint: "An underground train that travels fast through city tunnels." },
    { word: "ROCKET", hint: "A powerful spacecraft that flies astronauts to the moon." },
    { word: "GUITAR", hint: "A musical instrument with strings that you pluck or strum." },
    { word: "PIANO", hint: "A large instrument with black and white keys that you press." },
    { word: "VIOLIN", hint: "A wooden string instrument played with a bow under the chin." },
    { word: "SOCCER", hint: "A popular game where players kick a round ball into a net." },
    { word: "TENNIS", hint: "A sport where players hit a small yellow ball over a net." },
    { word: "SPRING", hint: "The beautiful season when flowers bloom and trees turn green." },
    { word: "AUTUMN", hint: "The season when leaves turn orange and fall from the trees." },
    { word: "RAINBOW", hint: "A colorful arch that appears in the sky after a rainstorm." },
    { word: "SUNSHINE", hint: "The bright, warm light that comes from the sun." },
    { word: "MOONLIGHT", hint: "The gentle, silver light that shines from the moon at night." },
    { word: "MOUNTAIN", hint: "A very tall, rocky landform that rises high above the clouds." },
    { word: "DESERT", hint: "A dry, sandy land where it rarely rains and cacti grow." },
    { word: "VALLEY", hint: "The low land between hills or mountains, often with a river." },
    { word: "LIBRARY", hint: "A quiet place filled with books that you can borrow and read." },
    { word: "MUSEUM", hint: "A building where historical, artistic, or scientific objects are shown." },
    { word: "CLASSROOM", hint: "The room in a school where students learn their lessons." },
    { word: "BIRD", hint: "A warm-blooded feathered creature with wings that flies." },
    { word: "COW", hint: "A large farm animal that gives us fresh milk." },
    { word: "HORSE", hint: "A fast animal with hooves that people ride on." },
    { word: "SHEEP", hint: "A gentle farm animal that gives us fluffy wool." },
    { word: "PIG", hint: "A pink farm animal with a curly tail that says oink." },
    { word: "DUCK", hint: "A water bird that swims and says quack quack." },
    { word: "FROG", hint: "A green amphibian that hops and catches flies." },
    { word: "FISH", hint: "A scaly water creature with gills that swims in the pond." },
    { word: "SNAIL", hint: "A slow little creature with a spiral shell on its back." },
    { word: "ANT", hint: "A tiny hardworking insect that lives in a colony." },
    { word: "BEE", hint: "A yellow-and-black insect that flies and makes sweet honey." }
  ];
  extraSpellingList.forEach(s => {
    if (ENGLISH_SPELLING_DB.length < 105) {
      const exists = ENGLISH_SPELLING_DB.some(x => x.word === s.word);
      if (!exists) ENGLISH_SPELLING_DB.push(s);
    }
  });

  // 7. Expand ENGLISH_CLOZE_TEMPLATES dynamically (to 105+)
  const englishClozeFrames = [
    { q: "The big lion ___ sleeping under the tree.", o: ["is", "am", "are", "be"], c: "is", exp: "Use 'is' for singular noun 'lion'." },
    { q: "They ___ going to ride their bicycles in the park.", o: ["are", "is", "am", "be"], c: "are", exp: "Use 'are' for plural subject 'They'." },
    { q: "I ___ playing a happy song on the piano now.", o: ["am", "is", "are", "be"], c: "am", exp: "First-person pronoun 'I' always takes 'am'." },
    { q: "We ___ listen to our teacher carefully.", o: ["must", "is", "are", "been"], c: "must", exp: "Modal verb 'must' expresses obligation." },
    { q: "Look at ___ beautiful rainbow in the blue sky!", o: ["that", "those", "these", "an"], c: "that", exp: "Use singular distant 'that' for 'rainbow'." },
    { q: "There are many colorful flowers ___ the school garden.", o: ["in", "on", "under", "at"], c: "in", exp: "Flowers grow inside the bounds of a garden -> 'in'." },
    { q: "The little puppy is hiding ___ the table.", o: ["under", "above", "on", "into"], c: "under", exp: "Hiding beneath the table -> 'under'." },
    { q: "She ___ a sweet apple every single morning.", o: ["eats", "eat", "eating", "eaten"], c: "eats", exp: "Present singular third-person takes 'eats'." },
    { q: "They ___ soccer in the playground yesterday.", o: ["played", "play", "plays", "playing"], c: "played", exp: "Yesterday indicates past tense -> 'played'." },
    { q: "He ___ to become a great doctor when he grows up.", o: ["wants", "want", "wanting", "wanted"], c: "wants", exp: "Third-person singular present tense -> 'wants'." }
  ];
  englishClozeFrames.forEach(f => {
    if (ENGLISH_CLOZE_TEMPLATES.length < 110) {
      ENGLISH_CLOZE_TEMPLATES.push({
        question: f.q,
        options: f.o,
        correctAnswer: f.c,
        explanation: f.exp
      });
    }
  });

  // Automatically generate more cloze variations to reach 105+
  let clzIdx = 0;
  while (ENGLISH_CLOZE_TEMPLATES.length < 105 && clzIdx < ENGLISH_SPELLING_DB.length) {
    const wordObj = ENGLISH_SPELLING_DB[clzIdx];
    clzIdx++;
    const exists = ENGLISH_CLOZE_TEMPLATES.some(t => t.question.includes(wordObj.word));
    if (!exists) {
      ENGLISH_CLOZE_TEMPLATES.push({
        question: `Can you spell the word "${wordObj.word.toLowerCase()}"? Yes, it is a ________.`,
        options: [wordObj.word.toLowerCase(), "pencil", "window", "orange"].sort(() => Math.random() - 0.5),
        correctAnswer: wordObj.word.toLowerCase(),
        explanation: `The correct word is "${wordObj.word.toLowerCase()}" which fits the description.`
      });
    }
  }

  // 8. Expand ENGLISH_REORDER_DB dynamically (to 105+)
  const engSubjects = ["My mother", "My father", "The teacher", "The student", "The little dog", "The playful cat", "We", "They", "She", "He"];
  const engVerbs = ["likes to eat", "loves to play", "wants to buy", "is looking at", "is writing with", "is reading in"];
  const engObjects = ["a sweet apple", "a yellow banana", "a new bicycle", "a colorful flower", "a heavy school bag", "a beautiful book"];

  for (let s = 0; s < engSubjects.length; s++) {
    for (let v = 0; v < engVerbs.length; v++) {
      for (let o = 0; o < engObjects.length; o++) {
        if (ENGLISH_REORDER_DB.length < 105) {
          const sub = engSubjects[s];
          const vrb = engVerbs[v];
          const obj = engObjects[o];
          const correctText = `${sub} ${vrb} ${obj}.`;
          
          ENGLISH_REORDER_DB.push({
            scrambledWords: [sub, vrb, obj],
            correctAnswer: correctText
          });
        }
      }
    }
  }

  // 9. Expand EMOJI_EN_DB and EMOJI_ZH_DB with 50 matching pairs (bringing both to 100)
  const extraEmojis = [
    { emoji: "🍓", en: "strawberry", zh: "草莓", distractorsEn: ["grape", "apple", "lemon"], distractorsZh: ["葡萄", "蘋果", "檸檬"] },
    { emoji: "🍇", en: "grape", zh: "葡萄", distractorsEn: ["strawberry", "orange", "pear"], distractorsZh: ["草莓", "橙子", "梨子"] },
    { emoji: "🍉", en: "watermelon", zh: "西瓜", distractorsEn: ["banana", "mango", "cherry"], distractorsZh: ["香蕉", "芒果", "櫻桃"] },
    { emoji: "🍍", en: "pineapple", zh: "菠蘿", distractorsEn: ["peach", "plum", "kiwi"], distractorsZh: ["桃子", "李子", "奇異果"] },
    { emoji: "🥕", en: "carrot", zh: "紅蘿蔔", distractorsEn: ["onion", "potato", "tomato"], distractorsZh: ["洋蔥", "馬鈴薯", "番茄"] },
    { emoji: "🥦", en: "broccoli", zh: "西蘭花", distractorsEn: ["cabbage", "corn", "pepper"], distractorsZh: ["椰菜", "粟米", "辣椒"] },
    { emoji: "🍕", en: "pizza", zh: "披薩", distractorsEn: ["burger", "sandwich", "hotdog"], distractorsZh: ["漢堡", "三明治", "熱狗"] },
    { emoji: "🍔", en: "burger", zh: "漢堡", distractorsEn: ["pizza", "rice", "bread"], distractorsZh: ["披薩", "米飯", "麵包"] },
    { emoji: "🍰", en: "cake", zh: "蛋糕", distractorsEn: ["cookie", "candy", "chocolate"], distractorsZh: ["曲奇", "糖果", "巧克力"] },
    { emoji: "🚗", en: "car", zh: "汽車", distractorsEn: ["bicycle", "train", "plane"], distractorsZh: ["單車", "火車", "飛機"] },
    { emoji: "✈️", en: "airplane", zh: "飛機", distractorsEn: ["car", "boat", "bus"], distractorsZh: ["汽車", "小船", "巴士"] },
    { emoji: "🚢", en: "ship", zh: "輪船", distractorsEn: ["car", "train", "plane"], distractorsZh: ["汽車", "火車", "飛機"] },
    { emoji: "🚲", en: "bicycle", zh: "單車", distractorsEn: ["car", "train", "rocket"], distractorsZh: ["汽車", "火車", "火箭"] },
    { emoji: "🚂", en: "train", zh: "火車", distractorsEn: ["ship", "plane", "bicycle"], distractorsZh: ["輪船", "飛機", "單車"] },
    { emoji: "🚁", en: "helicopter", zh: "直升機", distractorsEn: ["car", "train", "ship"], distractorsZh: ["汽車", "火車", "輪船"] },
    { emoji: "⏰", en: "clock", zh: "鬧鐘", distractorsEn: ["watch", "key", "bag"], distractorsZh: ["手錶", "鑰匙", "包包"] },
    { emoji: "🔑", en: "key", zh: "鑰匙", distractorsEn: ["lock", "ring", "coin"], distractorsZh: ["鎖頭", "戒指", "硬幣"] },
    { emoji: "🎈", en: "balloon", zh: "氣球", distractorsEn: ["toy", "doll", "kite"], distractorsZh: ["玩具", "玩偶", "風箏"] },
    { emoji: "🧸", en: "teddy bear", zh: "玩具熊", distractorsEn: ["ball", "drum", "robot"], distractorsZh: ["球", "小鼓", "機器人"] },
    { emoji: "⚽", en: "soccer ball", zh: "足球", distractorsEn: ["basketball", "tennis", "golf"], distractorsZh: ["籃球", "網球", "高爾夫"] },
    { emoji: "🎸", en: "guitar", zh: "吉他", distractorsEn: ["piano", "violin", "drum"], distractorsZh: ["鋼琴", "小提琴", "爵士鼓"] },
    { emoji: "🎨", en: "palette", zh: "調色盤", distractorsEn: ["brush", "pencil", "paper"], distractorsZh: ["畫筆", "鉛筆", "畫紙"] },
    { emoji: "📚", en: "books", zh: "書本", distractorsEn: ["bag", "desk", "chair"], distractorsZh: ["書包", "書桌", "椅子"] },
    { emoji: "🖊️", en: "pen", zh: "鋼筆", distractorsEn: ["crayon", "marker", "ruler"], distractorsZh: ["粉筆", "麥克筆", "直尺"] },
    { emoji: "🏠", en: "house", zh: "房子", distractorsEn: ["school", "shop", "castle"], distractorsZh: ["學校", "商店", "城堡"] },
    { emoji: "🌳", en: "tree", zh: "大樹", distractorsEn: ["flower", "grass", "mushroom"], distractorsZh: ["花朵", "綠草", "蘑菇"] },
    { emoji: "🌸", en: "cherry blossom", zh: "櫻花", distractorsEn: ["rose", "sunflower", "tulip"], distractorsZh: ["玫瑰", "向日葵", "鬱金香"] },
    { emoji: "☀️", en: "sun", zh: "太陽", distractorsEn: ["moon", "star", "cloud"], distractorsZh: ["月亮", "星星", "雲朵"] },
    { emoji: "☁️", en: "cloud", zh: "雲朵", distractorsEn: ["sun", "rain", "wind"], distractorsZh: ["太陽", "雨水", "大風"] },
    { emoji: "❄️", en: "snowflake", zh: "雪花", distractorsEn: ["fire", "water", "stone"], distractorsZh: ["大火", "清水", "石頭"] },
    { emoji: "💧", en: "droplet", zh: "水滴", distractorsEn: ["ice", "leaf", "cloud"], distractorsZh: ["冰塊", "樹葉", "雲朵"] },
    { emoji: "🦁", en: "lion", zh: "獅子", distractorsEn: ["bear", "wolf", "fox"], distractorsZh: ["大熊", "野狼", "狐狸"] },
    { emoji: "🐯", en: "tiger", zh: "老虎", distractorsEn: ["lion", "leopard", "cat"], distractorsZh: ["獅子", "豹子", "小貓"] },
    { emoji: "🐼", en: "panda", zh: "熊貓", distractorsEn: ["koala", "monkey", "rabbit"], distractorsZh: ["無尾熊", "猴子", "兔子"] },
    { emoji: "🐨", en: "koala", zh: "無尾熊", distractorsEn: ["panda", "squirrel", "deer"], distractorsZh: ["熊貓", "松鼠", "小鹿"] },
    { emoji: "🐵", en: "monkey", zh: "猴子", distractorsEn: ["ape", "gorilla", "sheep"], distractorsZh: ["大猩猩", "黑猩猩", "綿羊"] },
    { emoji: "🐮", en: "cow", zh: "乳牛", distractorsEn: ["horse", "sheep", "goat"], distractorsZh: ["駿馬", "綿羊", "山羊"] },
    { emoji: "🐷", en: "pig", zh: "小豬", distractorsEn: ["dog", "cat", "chicken"], distractorsZh: ["小狗", "小貓", "小雞"] },
    { emoji: "🐸", en: "frog", zh: "青蛙", distractorsEn: ["toad", "snake", "lizard"], distractorsZh: ["蟾蜍", "毒蛇", "蜥蜴"] },
    { emoji: "🐙", en: "octopus", zh: "章魚", distractorsEn: ["squid", "fish", "crab"], distractorsZh: ["烏賊", "小魚", "螃蟹"] },
    { emoji: "🐝", en: "honeybee", zh: "蜜蜂", distractorsEn: ["ant", "spider", "fly"], distractorsZh: ["螞蟻", "蜘蛛", "蒼蠅"] },
    { emoji: "🦕", en: "sauropod", zh: "恐龍", distractorsEn: ["dragon", "lizard", "alligator"], distractorsZh: ["巨龍", "蜥蜴", "鱷魚"] },
    { emoji: "🦖", en: "t-rex", zh: "暴龍", distractorsEn: ["mammoth", "tiger", "lion"], distractorsZh: ["猛獁象", "老虎", "獅子"] },
    { emoji: "🐒", en: "monkey", zh: "猴子", distractorsEn: ["gorilla", "chimpanzee", "lemur"], distractorsZh: ["大猩猩", "黑猩猩", "狐猴"] },
    { emoji: "🐧", en: "penguin", zh: "企鵝", distractorsEn: ["duck", "swan", "goose"], distractorsZh: ["鴨子", "天鵝", "大雁"] },
    { emoji: "🐘", en: "elephant", zh: "大象", distractorsEn: ["rhino", "hippo", "camel"], distractorsZh: ["犀牛", "河馬", "駱駝"] },
    { emoji: "🦒", en: "giraffe", zh: "長頸鹿", distractorsEn: ["zebra", "horse", "deer"], distractorsZh: ["斑馬", "駿馬", "小鹿"] },
    { emoji: "🦉", en: "owl", zh: "貓頭鷹", distractorsEn: ["eagle", "falcon", "hawk"], distractorsZh: ["老鷹", "獵鷹", "雄鷹"] },
    { emoji: "🐢", en: "turtle", zh: "烏龜", distractorsEn: ["snail", "frog", "lizard"], distractorsZh: ["蝸牛", "青蛙", "蜥蜴"] },
    { emoji: "🦀", en: "crab", zh: "螃蟹", distractorsEn: ["lobster", "shrimp", "fish"], distractorsZh: ["龍蝦", "小蝦", "小魚"] }
  ];

  extraEmojis.forEach(e => {
    if (EMOJI_EN_DB.length < 105) {
      EMOJI_EN_DB.push({
        emoji: e.emoji,
        word: e.en,
        distractors: e.distractorsEn
      });
    }
    if (EMOJI_ZH_DB.length < 105) {
      EMOJI_ZH_DB.push({
        emoji: e.emoji,
        word: e.zh,
        distractors: e.distractorsZh
      });
    }
  });
})();

export function generateBossCombo(floor: number, dFactorSlope = 0.2, usedIds: string[] = []): QuizQuestion[] {
  const mathQ = generateQuestion(floor, dFactorSlope, 'math', usedIds);
  const zhQ = generateQuestion(floor, dFactorSlope, 'chinese', [...usedIds, mathQ.id]);
  const enQ = generateQuestion(floor, dFactorSlope, 'english', [...usedIds, mathQ.id, zhQ.id]);
  const logQ = generateQuestion(floor, dFactorSlope, 'logic', [...usedIds, mathQ.id, zhQ.id, enQ.id]);
  const mathQ2 = generateQuestion(floor, dFactorSlope, 'math', [...usedIds, mathQ.id, zhQ.id, enQ.id, logQ.id]);

  return [mathQ, zhQ, enQ, logQ, mathQ2];
}
