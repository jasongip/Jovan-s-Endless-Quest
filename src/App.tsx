/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sword, 
  Shield, 
  Coins, 
  Heart, 
  Sparkles, 
  Trophy, 
  BookOpen, 
  Award, 
  Edit3, 
  Check, 
  ShoppingBag, 
  Play, 
  RefreshCw, 
  Calendar,
  AlertCircle,
  HelpCircle,
  Clock,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  LogOut,
  Home,
  ArrowLeft,
  Volume2,
  VolumeX,
  X,
  Lock
} from 'lucide-react';

import { GameState, QuizQuestion, LeaderboardEntry } from './types';
import { loadGameState, saveAndSyncGameState, awardXP, calculateWeeklyXP } from './utils/gameState';
import { generateQuestion, generateBossCombo } from './utils/questions';
import { GameBridge } from './game/GameBridge';
import { getLeaderboard } from './firebase-config';
import PhaserContainer from './components/PhaserContainer';
import HeroPixelPreview from './components/HeroPixelPreview';
import RetroSFX from './utils/sfx';
import { PETS_DATABASE, getPetById, PetData } from './utils/petsDb';
import { JOBS, getJobById, Job } from './data/jobs';

interface ParsedQuestion {
  header: string;
  instruction: string;
  content: string;
}

function parseQuestionText(question: string): ParsedQuestion {
  let header = "";
  let remainingText = question;

  // Extract header matching 【...】 at the very start
  const headerMatch = question.match(/^【([^】]+)】/);
  if (headerMatch) {
    header = `【${headerMatch[1]}】`;
    remainingText = question.substring(headerMatch[0].length).trim();
  }

  // Split remaining text by newlines
  const lines = remainingText.split('\n').map(l => l.trim()).filter(Boolean);

  let instruction = "";
  let content = "";

  if (lines.length > 0) {
    if (lines.length === 1) {
      content = lines[0];
    } else if (lines.length === 2) {
      instruction = lines[0];
      content = lines[1];
    } else {
      instruction = lines[0];
      content = lines.slice(1).join('\n');
    }
  }

  return { header, instruction, content };
}

function getElementChineseName(element: string): string {
  switch (element) {
    case 'Lightning': return '⚡ 雷系';
    case 'Earth': return '🍃 森系';
    case 'Water': return '💧 水系';
    case 'Ice': return '❄️ 冰系';
    case 'Light': return '✨ 光系';
    case 'Fire': return '🔥 火系';
    case 'Poison': return '☠️ 毒系';
    case 'Dark': return '🔮 暗系';
    case 'Gold': return '🪙 金系';
    case 'Wind': return '💨 風系';
    default: return '❓ 未知';
  }
}

export default function App() {
  // 1. Core State
  const [gameState, setGameState] = useState<GameState>(() => loadGameState());
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState<QuizQuestion | null>(null);
  
  // Limit Break & Pet states
  const [isPetChallengeActive, setIsPetChallengeActive] = useState(false);
  const [activePet, setActivePet] = useState<PetData | null>(null);
  const [petChallengeQuestions, setPetChallengeQuestions] = useState<QuizQuestion[]>([]);
  const [petChallengeIndex, setPetChallengeIndex] = useState<number>(0);
  const [petTimer, setPetTimer] = useState<number>(8);
  const [showPetCaptureCelebration, setShowPetCaptureCelebration] = useState<PetData | null>(null);
  const [showPetSelectorModal, setShowPetSelectorModal] = useState<boolean>(false);
  
  // Pet Skill active indicators
  const [isPetSkillUsedThisFloor, setIsPetSkillUsedThisFloor] = useState<boolean>(false);
  const [isThunderbirdShieldActive, setIsThunderbirdShieldActive] = useState<boolean>(false);
  const [isFairyRevealActive, setIsFairyRevealActive] = useState<boolean>(false);
  const [isLavaLionDoubleDamageActive, setIsLavaLionDoubleDamageActive] = useState<boolean>(false);
  const pendingBossLimitBreakDamageRef = useRef<number>(0);

  // Feedback states for answering quizzes
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isFeedbackShowing, setIsFeedbackShowing] = useState(false);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(false);
  const [flashingOption, setFlashingOption] = useState<string | null>(null);
  const [isScreenShaking, setIsScreenShaking] = useState(false);
  const [showSlashEffect, setShowSlashEffect] = useState<'correct' | 'wrong' | 'limit_break' | null>(null);
  
  // Sidebar / Modal displays
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showMerchantShop, setShowMerchantShop] = useState(false);
  const [tempHeroName, setTempHeroName] = useState(gameState.heroName);

  // Job system states
  const [warriorShield, setWarriorShield] = useState<boolean>(false);
  const [hasMageTeleportUsed, setHasMageTeleportUsed] = useState<boolean>(false);
  const [archerCharges, setArcherCharges] = useState<number>(10);
  const [archerExcludedOptions, setArcherExcludedOptions] = useState<string[]>([]);
  const [warlockCombo, setWarlockCombo] = useState<number>(0);
  const [samuraiExcludedOption, setSamuraiExcludedOption] = useState<string | null>(null);
  const [showJobSelectorModal, setShowJobSelectorModal] = useState<boolean>(false);
  
  // Leaderboard data
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLeaderboardLoading, setIsLeaderboardLoading] = useState(false);
  const [leaderboardTab, setLeaderboardTab] = useState<'weekly' | 'all-time'>('weekly');
  const [allTimeSort, setAllTimeSort] = useState<'xp' | 'floor'>('xp');
  
  // Sound manager state
  const [soundEnabled, setSoundEnabled] = useState(() => {
    try {
      const saved = localStorage.getItem('retro_sound_enabled');
      return saved !== 'false';
    } catch {
      return true;
    }
  });

  useEffect(() => {
    RetroSFX.setEnabled(soundEnabled);
    try {
      localStorage.setItem('retro_sound_enabled', String(soundEnabled));
    } catch {}
  }, [soundEnabled]);

  useEffect(() => {
    if (isPlaying && soundEnabled) {
      const isBossFloor = gameState.currentFloor > 0 && gameState.currentFloor % 10 === 0;
      RetroSFX.startMusic(isBossFloor);
    } else {
      RetroSFX.stopMusic();
    }
    return () => {
      RetroSFX.stopMusic();
    };
  }, [isPlaying, soundEnabled, gameState.currentFloor]);

  // Pre-load / warm up SpeechSynthesis voices on mount for iOS/iPad Safari compatibility
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.getVoices();
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
          window.speechSynthesis.onvoiceschanged = () => {
            window.speechSynthesis.getVoices();
          };
        }
      } catch (e) {
        console.warn("SpeechSynthesis warm-up failed:", e);
      }
    }
  }, []);
  
  // Standard monster question caching to allow retries of the exact same question
  const monsterQuestionsRef = useRef<Record<string, QuizQuestion>>({});
  
  // Track already used question IDs during the current spire run to prevent repetition
  const usedQuestionIdsRef = useRef<string[]>([]);
  // Track last 10 portal move directions for hidden chest vault activation
  const portalMoveHistoryRef = useRef<string[]>([]);

  // Custom interactive quiz states
  const [spellingInput, setSpellingInput] = useState("");
  const [reorderSelection, setReorderSelection] = useState<number[]>([]);
  const [matchLeftSelected, setMatchLeftSelected] = useState<string | null>(null);
  const [matchRightSelected, setMatchRightSelected] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);
  const [shuffledLeft, setShuffledLeft] = useState<string[]>([]);
  const [shuffledRight, setShuffledRight] = useState<string[]>([]);
  const [matchErrorFlash, setMatchErrorFlash] = useState(false);

  // Live quest scroll logs
  const [questLogs, setQuestLogs] = useState<string[]>([
    `📖 目前抵達第 ${gameState.currentFloor} 層。答對學科問題能消滅怪獸哦！`,
    `🛡️ 歡迎來到無限之塔！小勇士 ${gameState.heroName || "Jovan"}，開始你的學術冒險吧！`
  ]);
  const [isLogExpanded, setIsLogExpanded] = useState<boolean>(true);

  const logEndRef = useRef<HTMLDivElement>(null);
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Boss combo combat states
  const [bossCombo, setBossCombo] = useState<QuizQuestion[] | null>(null);
  const [bossComboIndex, setBossComboIndex] = useState<number>(0);
  const [bossHp, setBossHp] = useState<number>(5);
  const [bossMistakes, setBossMistakes] = useState<number>(0);
  const [activeMonsterId, setActiveMonsterId] = useState<string | null>(null);
  const [activeMonsterName, setActiveMonsterName] = useState<string>("");
  const [isElite, setIsElite] = useState<boolean>(false);
  const [eliteHp, setEliteHp] = useState<number>(1);
  const [eliteMaxHp, setEliteMaxHp] = useState<number>(1);
  const [restType, setRestType] = useState<'merchant' | 'elf' | 'campfire' | null>(null);
  const [showRareLootCelebration, setShowRareLootCelebration] = useState<boolean>(false);
  const [rareLootReward, setRareLootReward] = useState<{ xp: number; gold: number; slopeChange: string } | null>(null);

  // Developer Mode States
  const [isDevModeUnlocked, setIsDevModeUnlocked] = useState<boolean>(false);
  const [showDevPanel, setShowDevPanel] = useState<boolean>(false);
  const [devPassword, setDevPassword] = useState<string>("");
  const [devError, setDevError] = useState<string>("");
  const [devCustomGold, setDevCustomGold] = useState<string>("100");
  const [devCustomXP, setDevCustomXP] = useState<string>("150");
  const [devOverrides, setDevOverrides] = useState({
    petMode: 'default',
    eliteMode: 'default',
    chestMode: 'default',
    mutationMode: 'default'
  });

  const playTTS = (text: string, lang: string) => {
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        
        let processedText = text.replace(/【.*?】\s*/g, "").trim();
        const isEnglish = lang.toLowerCase().startsWith('en');
        const isChinese = lang.toLowerCase().startsWith('zh');

        // Natural pause for short terms/single words using commas instead of dots/ellipsis
        // which are verbally read out as "dot dot dot" on some devices.
        if (isEnglish && !text.includes(' ') && text.length < 25) {
          processedText = `${text}, , , ${text}`;
        } else if (isChinese && text.length <= 3) {
          processedText = `${text}`;
        }

        const normalizedLang = lang.replace('_', '-');
        const utterance = new SpeechSynthesisUtterance(processedText);
        utterance.lang = normalizedLang;
        
        // Try to find and select a high-quality voice installed on the user's device matching the language
        if (typeof window.speechSynthesis.getVoices === 'function') {
          const voices = window.speechSynthesis.getVoices();
          if (voices && voices.length > 0) {
            const target = normalizedLang.toLowerCase();
            
            let matchedVoice = null;
            if (target === 'zh-hk') {
              // 1. First, search for exact Cantonese matches
              matchedVoice = voices.find(v => {
                const l = v.lang.toLowerCase().replace('_', '-');
                return l === 'zh-hk' || l === 'zh-hk-hk';
              });
              
              // 2. If not found, look for any voice containing Cantonese markers: 'hk', 'cantonese', 'hong kong', 'yue', or '廣東' / '粵'
              if (!matchedVoice) {
                matchedVoice = voices.find(v => {
                  const l = v.lang.toLowerCase().replace('_', '-');
                  const n = v.name.toLowerCase();
                  return l.includes('hk') || n.includes('cantonese') || n.includes('hong kong') || l.includes('yue') || n.includes('廣東') || n.includes('粵');
                });
              }
              
              // CRITICAL iPadOS / iOS Fix: If we cannot find a genuine Cantonese voice, DO NOT fall back to 'zh' prefix (Mandarin).
              // Setting a Mandarin (zh-CN) voice forces the iOS engine to read Cantonese text in Mandarin pronunciation.
              // Leaving utterance.voice = null allows iOS/Safari to correctly fall back to its high-quality native default Cantonese engine.
            } else {
              // Standard matching for English/other languages
              matchedVoice = voices.find(v => v.lang.toLowerCase().replace('_', '-') === target);
              if (!matchedVoice) {
                const prefix = target.split('-')[0];
                matchedVoice = voices.find(v => v.lang.toLowerCase().replace('_', '-').startsWith(prefix));
              }
            }
            
            if (matchedVoice) {
              utterance.voice = matchedVoice;
            }
          }
        }

        // Adjust rate and pitch for optimal clarity and pronunciation distinction
        if (isEnglish) {
          utterance.rate = 0.8; // Speak slightly slower so phonics/spelling are exceptionally clear
          utterance.pitch = 1.0; 
        } else {
          utterance.rate = 0.9;
          utterance.pitch = 1.0;
        }

        // 50ms brief timeout buffer prevents Chrome/Windows audio API clipping bugs!
        setTimeout(() => {
          try {
            window.speechSynthesis.speak(utterance);
          } catch (speakErr) {
            console.warn("SpeechSynthesis speak failed:", speakErr);
          }
        }, 50);
      }
    } catch (err) {
      console.warn("SpeechSynthesis playTTS failed:", err);
    }
  };

  // Google Analytics Dynamic Integration
  useEffect(() => {
    const measurementId = (import.meta as any).env?.VITE_GA_MEASUREMENT_ID;
    if (measurementId && typeof window !== 'undefined') {
      // Inject standard Google Analytics script tags dynamically
      const script1 = document.createElement('script');
      script1.async = true;
      script1.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
      document.head.appendChild(script1);

      const script2 = document.createElement('script');
      script2.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${measurementId}');
      `;
      document.head.appendChild(script2);
      
      console.log(`[Google Analytics] Initialized with ID: ${measurementId}`);
    }
  }, []);

  // Archer (弓箭手) options exclusion reset on new question
  useEffect(() => {
    setArcherExcludedOptions([]);
  }, [activeQuiz]);

  // Samurai (武士) "心眼" ability: when HP is 1, automatically exclude one wrong answer (4 choices to 3 choices)
  useEffect(() => {
    if (activeQuiz && gameState.selectedJobId === 'samurai' && gameState.hp === 1 && activeQuiz.options) {
      const wrongOptions = (activeQuiz.options || []).filter(opt => opt !== activeQuiz.correctAnswer);
      if (wrongOptions.length > 0) {
        const excluded = wrongOptions[Math.floor(Math.random() * wrongOptions.length)];
        setSamuraiExcludedOption(excluded);
        // Log it!
        pushLog(`👤 【心眼】武士心眼已開（HP 1點）！看破迷惘，為你排除一個錯誤解答：【${excluded}】！🔍`);
      } else {
        setSamuraiExcludedOption(null);
      }
    } else {
      setSamuraiExcludedOption(null);
    }
  }, [activeQuiz, gameState.selectedJobId, gameState.hp]);

  // Timer countdown effect for Pet Capture Challenge
  useEffect(() => {
    if (!isPetChallengeActive || !activePet || isFeedbackShowing) return;
    
    setPetTimer(8);
    const interval = setInterval(() => {
      setPetTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          handlePetTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isPetChallengeActive, activePet, petChallengeIndex, isFeedbackShowing]);

  const handlePetTimeUp = () => {
    setIsAnswerCorrect(false);
    setSelectedOption("⏱️ 【超時 TIME OUT】");
    setIsFeedbackShowing(true);
    RetroSFX.playHurt();
    
    // Inject custom timeout explanation dynamically
    if (activeQuiz) {
      activeQuiz.explanation = "回答時間已超過 8 秒！野生的魔寵警覺性很高，受到驚嚇就溜走囉！下次答題一定要更快喔！";
    }
  };

  const handleLimitBreak = () => {
    if (gameState.limitBreakBar < 10) return;
    
    RetroSFX.playHit();
    setGameState(prev => ({ ...prev, limitBreakBar: 0 }));
    
    setIsScreenShaking(true);
    setTimeout(() => setIsScreenShaking(false), 800);
    
    setShowSlashEffect('limit_break');
    setTimeout(() => setShowSlashEffect(null), 1500);

    if (!activeQuiz) {
      const isSage = gameState.selectedJobId === 'sage';
      const isBossFloor = gameState.currentFloor % 5 === 0;
      if (isBossFloor) {
        const preDmg = isSage ? 4 : 2;
        pendingBossLimitBreakDamageRef.current += preDmg;
        if (isSage) {
          pushLog(`⚡🔮 【雷霆萬鈞】賢者引導九天神雷，超前震懾高塔守護者！Boss 的初始生命值將減少 4 點！💥`);
        } else {
          pushLog(`💥 Jovan 釋放了【極限超必殺技】！強大能量直接震懾了高塔守護者！Boss 的初始生命值將減少 2 點！💥`);
        }
        GameBridge.wipeAllMonsters();
      } else {
        if (isSage) {
          pushLog(`⚡🔮 【雷霆萬鈞】賢者召喚滅世狂雷，全螢幕小怪灰飛煙滅！💥`);
        } else {
          pushLog(`💥 Jovan 釋放了【極限超必殺技】！全螢幕小怪直接秒殺！💥`);
        }
        GameBridge.wipeAllMonsters();
      }
      fetchLeaderboard();
      return;
    }

    if (bossCombo) {
      const isSage = gameState.selectedJobId === 'sage';
      const dmg = isSage ? 4 : 2;
      const nextBossHp = Math.max(0, bossHp - dmg);
      setBossHp(nextBossHp);
      if (isSage) {
        pushLog(`⚡🔮 【雷霆萬鈞】賢者釋放雷霆奧義！對巨型 Boss 造成 4 點狂暴雷擊傷害！💥`);
      } else {
        pushLog(`💥 Jovan 釋放了【極限超必殺技】！對巨型 Boss 造成雙倍致命傷害！Boss HP -2！💥`);
      }
      GameBridge.wipeAllMonsters(); // Let Phaser play boss damage effect/shake/tint red!
      
      if (nextBossHp <= 0) {
        setIsAnswerCorrect(true);
        setSelectedOption("［極限爆發：超必殺技］");
        setIsFeedbackShowing(true);
        if (activeQuiz) {
          activeQuiz.explanation = isSage 
            ? "⚡🔮 狂雷九天！賢者的雷霆萬鈞奧義將守護者徹底撕裂，Boss 灰飛煙滅！"
            : "💥 完美爆發！超必殺技直接撕碎了巨型守護者的防禦，Boss 灰飛煙滅！";
        }
      } else {
        const nextIdx = bossComboIndex + 1;
        setBossComboIndex(nextIdx);
        let nextQuestion: QuizQuestion;
        if (nextIdx < bossCombo.length) {
          nextQuestion = bossCombo[nextIdx];
        } else {
          const types: ('math' | 'chinese' | 'english' | 'logic')[] = ['math', 'chinese', 'english', 'logic'];
          const nextType = types[nextIdx % 4];
          nextQuestion = generateQuestion(gameState.currentFloor, gameState.dFactorSlope || 0.2, nextType, usedQuestionIdsRef.current);
          if (!usedQuestionIdsRef.current.includes(nextQuestion.id)) {
            usedQuestionIdsRef.current.push(nextQuestion.id);
          }
          setBossCombo(prev => prev ? [...prev, nextQuestion] : [nextQuestion]);
        }
        setActiveQuiz(nextQuestion);
        setSelectedOption(null);
        setIsFeedbackShowing(false);
      }
    } else {
      const isSage = gameState.selectedJobId === 'sage';
      if (isSage) {
        pushLog(`⚡🔮 【雷霆萬鈞】賢者引導狂烈雷霆奧義，全螢幕小怪灰飛煙滅！💥`);
        // 20% chance to capture a random uncaptured pet
        const roll = Math.random();
        if (roll < 0.20) {
          const uncapturedPets = PETS_DATABASE.filter(p => !gameState.capturedPetIds.includes(p.id));
          const petToCapture = uncapturedPets.length > 0 
            ? uncapturedPets[Math.floor(Math.random() * uncapturedPets.length)] 
            : PETS_DATABASE[Math.floor(Math.random() * PETS_DATABASE.length)];
          
          setGameState(prev => {
            const alreadyHas = prev.capturedPetIds.includes(petToCapture.id);
            return {
              ...prev,
              capturedPetIds: alreadyHas ? prev.capturedPetIds : [...prev.capturedPetIds, petToCapture.id]
            };
          });
          setShowPetCaptureCelebration(petToCapture);
          pushLog(`🎉 【聖人降服】賢者的雷霆萬鈞感化了眼前的怪獸，怪獸當即臣服！化身為新魔寵：${petToCapture.emoji} 【${petToCapture.name}】加入了你的收集庫！✨`);
        } else {
          pushLog(`🍃 雖然雷霆威力無比，但可惜本次未能成功降服怪物化為魔寵。`);
        }
      } else {
        pushLog(`💥 Jovan 釋放了【極限超必殺技】！全螢幕小怪直接秒殺！💥`);
      }
      GameBridge.resolveCombat(true, true);
      
      if (activeQuiz) {
        let foundKey: string | null = null;
        for (const key in monsterQuestionsRef.current) {
          if (monsterQuestionsRef.current[key]?.id === activeQuiz.id) {
            foundKey = key;
            break;
          }
        }
        if (foundKey) {
          delete monsterQuestionsRef.current[foundKey];
        }
      }
      
      setActiveQuiz(null);
      setIsFeedbackShowing(false);
      setSelectedOption(null);
      fetchLeaderboard();
    }
  };

  const handleUsePetSkill = () => {
    if (!gameState.equippedPetId || isPetSkillUsedThisFloor) return;
    
    const pet = getPetById(gameState.equippedPetId);
    if (!pet) return;
    
    RetroSFX.playHit();
    setIsPetSkillUsedThisFloor(true);
    
    if (pet.id === 'pet_1') {
      setIsThunderbirdShieldActive(true);
      pushLog(`🦅⚡【避雷電網】金冠雷鳥施展電路防禦！下一次守備失誤將不扣生命值！`);
    } else if (pet.id === 'pet_2') {
      setGameState(prev => ({ ...prev, hp: Math.min(prev.maxHp, prev.hp + 1) }));
      pushLog(`🐸🍃【生命泉源】翡翠樹蛙灑落露水！生命值成功回復 1 點 ❤️！`);
    } else if (pet.id === 'pet_3') {
      if (isPetChallengeActive) {
        setPetTimer(8);
        pushLog(`⏳👾【時間凝結】時之沙漏怪重設了魔寵收服挑戰時間為 8 秒！`);
      } else {
        pushLog(`⏳👾【時間凝結】時之沙漏怪在戰鬥中為你爭取了更多專注時間！`);
      }
    } else if (pet.id === 'pet_4') {
      setIsFairyRevealActive(true);
      pushLog(`🧚✨【預知眼眸】智慧精靈指出正確解答是：【${activeQuiz?.correctAnswer}】喔！`);
    } else if (pet.id === 'pet_5') {
      pushLog(`🧹🌀【空間躍遷】神祕飛毯發動！直接繞過此題！`);
      if (bossCombo) {
        const nextBossHp = Math.max(0, bossHp - 1);
        setBossHp(nextBossHp);
        if (nextBossHp <= 0) {
          setIsAnswerCorrect(true);
          setSelectedOption("［空間躍遷：飛毯繞過］");
          setIsFeedbackShowing(true);
          if (activeQuiz) {
            activeQuiz.explanation = "💥 空間躍遷！神祕飛毯瞬間穿透 BOSS 核心防禦，將其直接瓦解！";
          }
        } else {
          const nextIdx = bossComboIndex + 1;
          setBossComboIndex(nextIdx);
          let nextQuestion: QuizQuestion;
          if (nextIdx < bossCombo.length) {
            nextQuestion = bossCombo[nextIdx];
          } else {
            const types: ('math' | 'chinese' | 'english' | 'logic')[] = ['math', 'chinese', 'english', 'logic'];
            const nextType = types[nextIdx % 4];
            nextQuestion = generateQuestion(gameState.currentFloor, gameState.dFactorSlope || 0.2, nextType, usedQuestionIdsRef.current);
            if (!usedQuestionIdsRef.current.includes(nextQuestion.id)) {
              usedQuestionIdsRef.current.push(nextQuestion.id);
            }
            setBossCombo(prev => prev ? [...prev, nextQuestion] : [nextQuestion]);
          }
          setActiveQuiz(nextQuestion);
          setSelectedOption(null);
          setIsFeedbackShowing(false);
        }
      } else {
        GameBridge.resolveCombat(true, true);
        if (activeQuiz) {
          let foundKey: string | null = null;
          for (const key in monsterQuestionsRef.current) {
            if (monsterQuestionsRef.current[key]?.id === activeQuiz.id) {
              foundKey = key;
              break;
            }
          }
          if (foundKey) delete monsterQuestionsRef.current[foundKey];
        }
        setActiveQuiz(null);
        setIsFeedbackShowing(false);
        setSelectedOption(null);
        fetchLeaderboard();
      }
    } else if (pet.id === 'pet_9') {
      setIsLavaLionDoubleDamageActive(true);
      pushLog(`🦁🔥【爆炎重擊】烈焰獅王怒吼！下一次答對問題將對怪物造成雙倍傷害！`);
    }
  };

  // Reset custom interactive quiz states when question changes
  useEffect(() => {
    if (activeQuiz) {
      setSpellingInput("");
      setReorderSelection([]);
      setMatchLeftSelected(null);
      setMatchRightSelected(null);
      setMatchedPairs([]);
      setMatchErrorFlash(false);
      
      if (activeQuiz.subtype === 'match' && activeQuiz.matchPairs) {
        setShuffledLeft([...activeQuiz.matchPairs.map(p => p.left)].sort(() => Math.random() - 0.5));
        setShuffledRight([...activeQuiz.matchPairs.map(p => p.right)].sort(() => Math.random() - 0.5));
      }

      // Auto-trigger Speech Synthesis TTS if applicable
      if (activeQuiz.speechText && activeQuiz.speechLang) {
        const timer = setTimeout(() => {
          playTTS(activeQuiz.speechText!, activeQuiz.speechLang!);
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [activeQuiz]);

  const handleMatchClick = (side: 'left' | 'right', value: string) => {
    if (isFeedbackShowing || matchErrorFlash) return;
    
    if (side === 'left') {
      setMatchLeftSelected(value);
      if (matchRightSelected) {
        checkMatchPair(value, matchRightSelected);
      }
    } else {
      setMatchRightSelected(value);
      if (matchLeftSelected) {
        checkMatchPair(matchLeftSelected, value);
      }
    }
  };

  const checkMatchPair = (left: string, right: string) => {
    const isCorrect = activeQuiz?.matchPairs?.some(p => p.left === left && p.right === right);
    if (isCorrect) {
      const newMatched = [...matchedPairs, left];
      setMatchedPairs(newMatched);
      setMatchLeftSelected(null);
      setMatchRightSelected(null);
      
      if (newMatched.length === activeQuiz?.matchPairs?.length) {
        // Trigger success automatically
        handleAnswerSubmit(activeQuiz.correctAnswer);
      }
    } else {
      setMatchErrorFlash(true);
      setTimeout(() => {
        setMatchErrorFlash(false);
        setMatchLeftSelected(null);
        setMatchRightSelected(null);
      }, 500);
    }
  };

  // 1.5 Auto-save and sync game state to LocalStorage and database when it changes
  useEffect(() => {
    saveAndSyncGameState(gameState).then(() => {
      // Sync leaderboard updates
      fetchLeaderboard();
    }).catch(console.error);
  }, [gameState]);

  // 1.6 Trigger window resize event when logs panel is toggled to let Phaser scale accordingly
  useEffect(() => {
    const handleResize = setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 150); // triggers after transition begins to adjust size smoothly
    return () => clearTimeout(handleResize);
  }, [isLogExpanded]);

  // 2. Load Leaderboard & Setup Game Bridge Callbacks
  useEffect(() => {
    fetchLeaderboard();
    
    // Clear standard monster questions cache on floor change
    monsterQuestionsRef.current = {};
    
    // Register Bridge callbacks to receive data directly from Phaser
    GameBridge.onMonsterCollide = (monsterId, questionType, name, isEliteVal, eliteHpVal, petDbId) => {
      const isEliteMonster = !!isEliteVal;
      const monsterName = name || "怪獸";
      const hpVal = eliteHpVal || 1;
      
      setActiveMonsterId(monsterId);
      setActiveMonsterName(monsterName);
      setIsElite(isEliteMonster);
      setEliteHp(hpVal);
      setEliteMaxHp(hpVal);

      if (questionType === 'pet') {
        const pet = getPetById(petDbId || '');
        if (pet) {
          setActivePet(pet);
          setIsPetChallengeActive(true);
          setPetChallengeIndex(0);
          
          const petQuestions: QuizQuestion[] = [];
          const usedIdsTemp = [...usedQuestionIdsRef.current];
          const types: ('math' | 'chinese' | 'english' | 'logic')[] = ['math', 'chinese', 'english', 'logic'];
          for (let i = 0; i < 5; i++) {
            const qType = types[Math.floor(Math.random() * types.length)];
            const q = generateQuestion(gameState.currentFloor, gameState.dFactorSlope || 0.2, qType, usedIdsTemp);
            petQuestions.push(q);
            usedIdsTemp.push(q.id);
          }
          setPetChallengeQuestions(petQuestions);
          setActiveQuiz(petQuestions[0]);
          setPetTimer(8);
          
          setTimeout(() => {
            pushLog(`✨ 遇見了神秘魔寵！Jovan 開始收服挑戰：${pet.emoji} 【${pet.name}】！必須連續答對 5 條問題，每題限時 8 秒！`);
          }, 0);
        }
        setSelectedOption(null);
        setIsFeedbackShowing(false);
        return;
      }

      if (questionType === 'boss') {
        // Boss Battle Combo setup!
        const combo = generateBossCombo(gameState.currentFloor, gameState.dFactorSlope || 0.2, usedQuestionIdsRef.current);
        setBossCombo(combo);
        setBossComboIndex(0);
        
        // Sage skill: boss HP decreases by 1 initially.
        let baseBossHp = 5;
        if (gameState.selectedJobId === 'sage') {
          baseBossHp = 4;
          setTimeout(() => {
            pushLog("📜✨【破魔聖言】賢者之威降臨！BOSS 的初始生命值一開始就扣減了 1 點！💥");
          }, 50);
        }

        // Apply pending limit break damage if any, then reset it
        const finalHp = Math.max(1, baseBossHp - pendingBossLimitBreakDamageRef.current);
        setBossHp(finalHp);
        pendingBossLimitBreakDamageRef.current = 0;
        
        setBossMistakes(0);
        
        // Push all combo question ids to used list
        combo.forEach(q => {
          if (!usedQuestionIdsRef.current.includes(q.id)) {
            usedQuestionIdsRef.current.push(q.id);
          }
        });
        
        // Load first question of the combo
        setActiveQuiz(combo[0]);
      } else {
        // Standard Monster setup
        setBossCombo(null);
        
        // Retrieve cached question for this monster if it exists, otherwise generate a new one
        let question = monsterQuestionsRef.current[monsterId];
        if (!question) {
          question = generateQuestion(gameState.currentFloor, gameState.dFactorSlope || 0.2, questionType as any, usedQuestionIdsRef.current);
          monsterQuestionsRef.current[monsterId] = question;
          
          if (!usedQuestionIdsRef.current.includes(question.id)) {
            usedQuestionIdsRef.current.push(question.id);
          }
        }
        setActiveQuiz(question);
      }
      setSelectedOption(null);
      setIsFeedbackShowing(false);
    };

    GameBridge.onMerchantCollide = (restTypeVal) => {
      setRestType(restTypeVal || 'merchant');
      setShowMerchantShop(true);
    };

    GameBridge.onGoldGained = (amount) => {
      setGameState(prev => ({ ...prev, goldCoins: prev.goldCoins + amount }));
    };

    GameBridge.onXPGained = (amount) => {
      const isDolphin = gameState.equippedPetId === 'pet_10';
      if (isDolphin) {
        setTimeout(() => {
          pushLog(`🐬 【聰明過人】小智商海豚發揮奇效！獲得雙倍 XP 學習點數 (+${amount} XP)！`);
        }, 50);
      }
      setGameState(prev => awardXP(prev, amount));
    };

    GameBridge.onHpLost = (amount) => {
      setGameState(prev => ({ ...prev, hp: Math.max(0, prev.hp - amount) }));
    };

    GameBridge.onHpHealed = (amount) => {
      setGameState(prev => {
        const isDwarf = prev.selectedJobId === 'dwarf';
        const effMax = (prev.maxHp || 5) + (isDwarf ? 2 : 0);
        return {
          ...prev,
          hp: Math.min(effMax, prev.hp + amount)
        };
      });
    };

    GameBridge.onPortalReached = (portalDir?: string) => {
      setIsThunderbirdShieldActive(false);
      setIsFairyRevealActive(false);
      setIsLavaLionDoubleDamageActive(false);

      const isFalling = portalDir === 'DOWN';

      let isVaultTriggered = false;
      if (portalDir && !isFalling) {
        portalMoveHistoryRef.current.push(portalDir);
        if (portalMoveHistoryRef.current.length > 5) {
          portalMoveHistoryRef.current.shift();
        }
        if (portalMoveHistoryRef.current.length === 5) {
          let isAlternating = true;
          for (let i = 1; i < 5; i++) {
            if (portalMoveHistoryRef.current[i] === portalMoveHistoryRef.current[i - 1]) {
              isAlternating = false;
              break;
            }
          }
          if (isAlternating) {
            isVaultTriggered = true;
            portalMoveHistoryRef.current = [];
          }
        }
      }

      setGameState(prev => {
        const nextFloor = isFalling 
          ? Math.max(1, prev.currentFloor - 1) 
          : prev.currentFloor + 1;
        const newMaxFloor = Math.max(prev.maxFloorReached, nextFloor);
        
        const isFirstVaultVisit = !prev.hasVisitedTreasureVaultThisRun;
        const actualVaultTriggered = !isFalling && isVaultTriggered && isFirstVaultVisit;

        // Push floor log outside the state updater synchronously using setTimeout
        setTimeout(() => {
          if (isFalling) {
            pushLog(`🕳️【地圖破洞】不幸踩空跌落破洞！摔落回到了第 ${nextFloor} 層！小心翼翼再接再厲！`);
          } else if (actualVaultTriggered) {
            pushLog(`✨【奇蹟再臨】連續 5 次選擇不同方向傳送門！觸發隱藏傳送陣！進入了「全寶箱隱藏關卡」（本局限定一次）！💎💰`);
          } else {
            pushLog(`🎉 恭喜通過第 ${prev.currentFloor} 層！成功爬上第 ${nextFloor} 層之塔！⚔️`);
          }
        }, 0);
        
        return {
          ...prev,
          currentFloor: nextFloor,
          maxFloorReached: newMaxFloor,
          isTreasureVault: actualVaultTriggered,
          hasVisitedTreasureVaultThisRun: prev.hasVisitedTreasureVaultThisRun || actualVaultTriggered,
          currentFloorState: null
        };
      });
    };

    GameBridge.onLogUpdated = (logMsg) => {
      pushLog(logMsg);
    };

    GameBridge.onFloorStateCreated = (floorState) => {
      setGameState(prev => ({
        ...prev,
        currentFloorState: floorState
      }));
    };

    GameBridge.onEntityInteracted = (entityId, updates) => {
      setGameState(prev => {
        if (!prev.currentFloorState || prev.currentFloorState.floor !== prev.currentFloor) {
          return prev;
        }
        if (entityId === 'portal') {
          return {
            ...prev,
            currentFloorState: {
              ...prev.currentFloorState,
              portalActive: !!updates.portalActive
            }
          };
        }
        const updatedEntities = prev.currentFloorState.entities.map(ent => {
          if (ent.id === entityId) {
            return { ...ent, ...updates };
          }
          return ent;
        });
        return {
          ...prev,
          currentFloorState: {
            ...prev.currentFloorState,
            entities: updatedEntities
          }
        };
      });
    };

    GameBridge.onPlayerMoved = (gridX, gridY) => {
      setGameState(prev => {
        if (!prev.currentFloorState || prev.currentFloorState.floor !== prev.currentFloor) {
          return prev;
        }
        return {
          ...prev,
          currentFloorState: {
            ...prev.currentFloorState,
            playerGridX: gridX,
            playerGridY: gridY
          }
        };
      });
    };

    return () => {
      GameBridge.onMonsterCollide = null;
      GameBridge.onMerchantCollide = null;
      GameBridge.onGoldGained = null;
      GameBridge.onXPGained = null;
      GameBridge.onPortalReached = null;
      GameBridge.onHpLost = null;
      GameBridge.onHpHealed = null;
      GameBridge.onLogUpdated = null;
      GameBridge.onFloorStateCreated = null;
      GameBridge.onEntityInteracted = null;
      GameBridge.onPlayerMoved = null;
    };
  }, [gameState.currentFloor]);

  // Auto-scroll quest logs to top cleanly without displacing viewport position
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = 0;
    }
  }, [questLogs]);

  // Refresh leaderboard list from server or local backup
  const fetchLeaderboard = async () => {
    setIsLeaderboardLoading(true);
    try {
      const data = await getLeaderboard();
      setLeaderboard(data);
    } catch (e) {
      console.warn(e);
    } finally {
      setIsLeaderboardLoading(false);
    }
  };

  const pushLog = (msg: string) => {
    setQuestLogs(prev => [msg, ...prev.slice(0, 19)]); // Keep last 20 logs for fast rendering, newest at top
  };

  const handleMageTeleport = () => {
    if (!activeQuiz || hasMageTeleportUsed || isFeedbackShowing || flashingOption) return;
    setHasMageTeleportUsed(true);
    pushLog("🔮 【時空傳送】法師施展了深奧的星界法術！一陣強烈的奧術藍光將眼前的魔物完全籠罩，瞬間將其傳送至虛空！避戰成功，不消耗生命值，亦不獲得金幣或 XP！🌌");
    
    // Wipe monster sprite in Phaser without giving rewards
    GameBridge.wipeAllMonsters(true);
    
    // Clear the active quiz immediately
    setActiveQuiz(null);
    setSelectedOption(null);
    setIsFeedbackShowing(false);
    setIsElite(false);

    // Clean cached questions
    let foundKey: string | null = null;
    for (const key in monsterQuestionsRef.current) {
      if (monsterQuestionsRef.current[key]?.id === activeQuiz.id) {
        foundKey = key;
        break;
      }
    }
    if (foundKey) {
      delete monsterQuestionsRef.current[foundKey];
    }
  };

  const handleArcher5050 = () => {
    if (!activeQuiz || archerCharges <= 0 || isFeedbackShowing || flashingOption || archerExcludedOptions.length > 0) return;
    if (activeQuiz.subtype === 'spelling' || activeQuiz.subtype === 'match' || activeQuiz.subtype === 'sentence_reorder') return;
    
    const correct = activeQuiz.correctAnswer;
    const wrongOptions = (activeQuiz.options || []).filter(opt => opt !== correct);
    
    if (wrongOptions.length >= 2) {
      const shuffledWrong = [...wrongOptions].sort(() => Math.random() - 0.5);
      const toExclude = [shuffledWrong[0], shuffledWrong[1]];
      setArcherExcludedOptions(toExclude);
      setArcherCharges(prev => prev - 1);
      pushLog(`🏹【雙重鷹眼】弓箭手集中精力發動鷹眼專注！排除兩個錯誤答案，僅剩二選一！🎯 (剩餘次數：${archerCharges - 1} / 10)`);
      RetroSFX.playShop();
    }
  };

  const handleDancerSkip = () => {
    if (!activeQuiz || isFeedbackShowing || flashingOption) return;
    
    const nextHp = gameState.hp - 1;
    if (nextHp <= 0) {
      setGameState(prev => ({ ...prev, hp: 0 }));
      pushLog("💃🥀【獻祭之舞】舞者試圖施展極限獻祭之舞，但體力不支（HP 歸零）！不幸力竭戰敗！");
      
      GameBridge.resolveCombat(false, true);
      setActiveQuiz(null);
      setSelectedOption(null);
      setIsFeedbackShowing(false);
      setIsElite(false);
    } else {
      setGameState(prev => ({ ...prev, hp: nextHp }));
      pushLog(`💃✨【獻祭之舞】舞者優雅起舞，消耗 1 點生命值（當前 HP: ${nextHp}/${effectiveMaxHp}）！成功施展獻祭之舞，直接將當前問題視為答對！🕊️`);
      RetroSFX.playHurt();
      
      // Treat as correct and show feedback overlay to reap rewards
      setIsAnswerCorrect(true);
      setSelectedOption(activeQuiz.correctAnswer);
      setIsFeedbackShowing(true);
    }
  };

  const handleSelectJob = (jobId: string) => {
    if (isPlaying || gameState.currentFloor > 1) {
      pushLog(`⚠️ 冒險進行中（當前：第 ${gameState.currentFloor} 層），無法進行轉職！請繼續挑戰直至玩家戰敗結束後，方可在大廳重新選擇職業。`);
      return;
    }
    const job = getJobById(jobId);
    if (!job) return;
    if (gameState.totalXP < job.unlockXP) {
      pushLog(`🔒 職業【${job.name}】尚未解鎖！需要累計達 ${job.unlockXP} XP。目前：${gameState.totalXP} XP。`);
      return;
    }
    setGameState(prev => {
      const isDwarf = jobId === 'dwarf';
      const effMax = (prev.maxHp || 5) + (isDwarf ? 2 : 0);
      return {
        ...prev,
        selectedJobId: jobId,
        hp: effMax
      };
    });
    pushLog(`👑 成功轉職為職業：【${job.emoji} ${job.name}】！`);
    setShowJobSelectorModal(false);
    RetroSFX.playShop();

    // Set initial skill states on switching job at Floor 1
    setWarriorShield(jobId === 'warrior');
    setHasMageTeleportUsed(false);
    setArcherCharges(10);
    setArcherExcludedOptions([]);
    setWarlockCombo(0);
    setSamuraiExcludedOption(null);
  };

  const incrementWarlockCombo = () => {
    if (gameState.selectedJobId !== 'warlock') return;
    setWarlockCombo(prev => {
      const nextCombo = prev + 1;
      if (nextCombo === 3) {
        setTimeout(() => {
          setGameState(pState => {
            const isDwarf = pState.selectedJobId === 'dwarf';
            const effMax = (pState.maxHp || 5) + (isDwarf ? 2 : 0);
            const heals = Math.min(effMax, pState.hp + 1);
            if (heals > pState.hp) {
              pushLog(`🔮 【靈魂抽取】黑魔導士達成 3 連擊！吸取怪獸靈魂能量，成功回復了 1 點 HP！💚`);
            } else {
              pushLog(`🔮 【靈魂抽取】黑魔導士達成 3 連擊！吸取了怪獸靈魂（生命值已滿）。`);
            }
            return { ...pState, hp: heals };
          });
        }, 0);
        return 0;
      }
      return nextCombo;
    });
  };

  // 3. Game Actions
  const handleAnswerSubmit = (option: string) => {
    if (!activeQuiz || isFeedbackShowing || flashingOption) return;
    
    setFlashingOption(option);
    
    // Play light click sound on selection
    RetroSFX.playClick();
    
    // Play dramatic 8-bit flashing interval
    setTimeout(() => {
      setSelectedOption(option);
      let correct = option === activeQuiz.correctAnswer;
      if (activeQuiz.subtype === 'sentence_reorder') {
        const normalize = (str: string) => 
          str.replace(/[.,?!。，？！]/g, '').replace(/\s+/g, ' ').trim().toLowerCase();
        correct = normalize(option) === normalize(activeQuiz.correctAnswer);
      }
      setIsAnswerCorrect(correct);
      setIsFeedbackShowing(true);
      setFlashingOption(null);
      
      // Play retro correct/hurt SFX
      if (correct) {
        RetroSFX.playHit();
        setShowSlashEffect('correct');
      } else {
        RetroSFX.playHurt();
        setShowSlashEffect('wrong');
      }
      setTimeout(() => setShowSlashEffect(null), 1200);
      
      // Trigger retro screen shake feedback
      setIsScreenShaking(true);
      setTimeout(() => setIsScreenShaking(false), 500);
    }, 450);
  };

  const handleCloseFeedback = () => {
    // 0. Pet Capture Challenge resolution
    if (isPetChallengeActive) {
      const correct = isAnswerCorrect;
      
      if (correct) {
        if (petChallengeIndex < 4) {
          const nextIdx = petChallengeIndex + 1;
          setPetChallengeIndex(nextIdx);
          setActiveQuiz(petChallengeQuestions[nextIdx]);
          setPetTimer(8);
          setSelectedOption(null);
          setIsFeedbackShowing(false);
          return;
        } else {
          // Captured successfully!
          setIsPetChallengeActive(false);
          setActiveQuiz(null);
          setSelectedOption(null);
          setIsFeedbackShowing(false);
          
          const pet = activePet!;
          setGameState(prev => {
            const hasPet = prev.capturedPetIds.includes(pet.id);
            return {
              ...prev,
              capturedPetIds: hasPet ? prev.capturedPetIds : [...prev.capturedPetIds, pet.id]
            };
          });
          
          GameBridge.resolveCombat(true, true);
          setShowPetCaptureCelebration(pet);
          pushLog(`🎉 【成功收服】Jovan 連續答對 5 題！成功收服了魔寵：${pet.emoji} 【${pet.name}】！已經將牠帶回收集庫。`);
          setActivePet(null);
          return;
        }
      } else {
        // Capture failed
        setIsPetChallengeActive(false);
        setActiveQuiz(null);
        setSelectedOption(null);
        setIsFeedbackShowing(false);
        
        const pet = activePet!;
        GameBridge.resolveCombat(false, true);
        pushLog(`😢 【挑戰失敗】答題錯誤或答題超時！魔寵 ${pet.emoji} 【${pet.name}】受驚，一閃身溜進了高塔陰影中逃跑了...`);
        setActivePet(null);
        return;
      }
    }

    if (bossCombo) {
      // Boss Combo Challenge flow
      const correct = isAnswerCorrect;
      
      // Calculate next states
      let finalBossHp = bossHp;
      let finalPlayerHp = gameState.hp;
      const nextBossMistakes = !correct ? bossMistakes + 1 : bossMistakes;

      // Limit Break Charging
      if (correct) {
        const hasUnicorn = gameState.equippedPetId === 'pet_7';
        const bonusChance = hasUnicorn && Math.random() < 0.5;
        const gain = bonusChance ? 2 : 1;
        setGameState(prev => {
          const nextVal = Math.min(10, (prev.limitBreakBar || 0) + gain);
          if (bonusChance) {
            setTimeout(() => {
              pushLog(`🦄 【極限共鳴】神聖小馬發揮奇效！極限 Bar 額外增加 1 點！`);
            }, 50);
          }
          return { ...prev, limitBreakBar: nextVal };
        });
        
        // Double damage if Lava Lion is active
        let damage = 1;
        if (isLavaLionDoubleDamageActive) {
          setIsLavaLionDoubleDamageActive(false);
          damage = 2;
          setTimeout(() => {
            pushLog(`🦁🔥【爆炎重擊】烈焰斬擊！對巨型 Boss 造成 2 點雙倍致命傷害！`);
          }, 50);
        }
        finalBossHp = Math.max(0, bossHp - damage);
        setBossHp(finalBossHp);
      } else {
        // Answer wrong
        setGameState(prev => ({ ...prev, limitBreakBar: 0 }));
        pushLog(`💔 答錯了！極限 Bar (Limit Break) 已被重置為 0！小勇士要更專注喔！`);

        if (isThunderbirdShieldActive) {
          setIsThunderbirdShieldActive(false);
          setTimeout(() => {
            pushLog(`🦅⚡ 【避雷電網】雷鳥電磁護網抵擋了這一次防禦失誤！HP 沒有減少！❤️`);
          }, 50);
        } else {
          finalPlayerHp = Math.max(0, gameState.hp - 1);
          setBossMistakes(nextBossMistakes);
          setGameState(prev => ({ ...prev, hp: finalPlayerHp }));
        }
      }

      // Check termination conditions first!
      if (finalPlayerHp <= 0) {
        // 1. PLAYER DEFEAT!
        pushLog(`💀 Jovan 在與 BOSS 的激戰中不敵倒下！被傳送回第 1 層重新開始。`);
        // Tell Phaser combat resolved (failed)
        GameBridge.resolveCombat(false);
        
        setActiveQuiz(null);
        setIsFeedbackShowing(false);
        setBossCombo(null);
        setSelectedOption(null);
        return;
      }

      if (finalBossHp <= 0) {
        // 2. BOSS DEFEATED (VICTORY!)
        // Relays victory back to Phaser to destroy the boss sprite
        GameBridge.resolveCombat(true);

        // Calculate DDS Slope adjustments based on performance
        const hadPerfect = nextBossMistakes === 0 && finalPlayerHp === gameState.maxHp;
        const hadHardVictory = finalPlayerHp <= 2;
        
        let slopeChangeMsg = "";
        let nextSlope = gameState.dFactorSlope || 0.2;
        if (hadPerfect) {
          nextSlope = Number((nextSlope + 0.05).toFixed(2));
          slopeChangeMsg = "Perfect 通關！系統已自動調高後續難度系數增幅 (+0.05) 🔥";
          pushLog(`🔥 [DDS] Perfect 通關！勇士 Jovan 完美擊倒 BOSS！後續塔層難度斜率已調高！`);
        } else if (hadHardVictory) {
          nextSlope = Number(Math.max(0.1, nextSlope - 0.05).toFixed(2));
          slopeChangeMsg = "險勝通關！系統已調低難度增幅以維持信心 (-0.05) 🛡️";
          pushLog(`🛡️ [DDS] 險勝通關！勇士 Jovan 艱難擊倒 BOSS，後續難度系數增幅已放緩。`);
        } else {
          slopeChangeMsg = "順利通關！難度增幅維持穩定 📈";
          pushLog(`🎉 順利通關！勇士 Jovan 成功擊敗 BOSS 巨型守護者！`);
        }

        // Grant Rare Loot 💎
        let bonusXP = 10 + Math.floor(Math.random() * 6); // 10 to 15 XP
        let bonusGold = 50;

        setGameState(prev => {
          const nextMaxHp = prev.maxHp + 1;
          const isDwarf = prev.selectedJobId === 'dwarf';
          const effectiveMax = nextMaxHp + (isDwarf ? 2 : 0);
          const withLoot = {
            ...prev,
            goldCoins: prev.goldCoins + bonusGold,
            dFactorSlope: nextSlope,
            maxHp: nextMaxHp,
            hp: Math.min(effectiveMax, prev.hp + 1) // Heal 1 heart as well!
          };
          return awardXP(withLoot, bonusXP);
        });

        // Trigger celebratory Rare Loot Overlay Modal
        setRareLootReward({
          xp: bonusXP,
          gold: bonusGold,
          slopeChange: slopeChangeMsg
        });
        setShowRareLootCelebration(true);

        setActiveQuiz(null);
        setIsFeedbackShowing(false);
        setBossCombo(null);
        setSelectedOption(null);
        fetchLeaderboard();
        return;
      }

      // 3. BATTLE CONTINUES: Progress to next pre-populated question, or generate a new one if we exceed the array
      const nextIdx = bossComboIndex + 1;
      setBossComboIndex(nextIdx);

      let nextQuestion: QuizQuestion;
      if (nextIdx < bossCombo.length) {
        nextQuestion = bossCombo[nextIdx];
      } else {
        // Cycle types dynamically: 'math', 'chinese', 'english', 'logic'
        const types: ('math' | 'chinese' | 'english' | 'logic')[] = ['math', 'chinese', 'english', 'logic'];
        const nextType = types[nextIdx % 4];
        nextQuestion = generateQuestion(gameState.currentFloor, gameState.dFactorSlope || 0.2, nextType, usedQuestionIdsRef.current);
        if (!usedQuestionIdsRef.current.includes(nextQuestion.id)) {
          usedQuestionIdsRef.current.push(nextQuestion.id);
        }

        // Append to our boss combo state
        setBossCombo(prev => {
          if (!prev) return [nextQuestion];
          return [...prev, nextQuestion];
        });
      }

      setActiveQuiz(nextQuestion);
      setSelectedOption(null);
      setIsFeedbackShowing(false);
    } else {
      // Standard Monster flow
      if (activeQuiz) {
        const correct = isAnswerCorrect;

        // Limit Break Charging
        if (correct) {
          const hasUnicorn = gameState.equippedPetId === 'pet_7';
          const bonusChance = hasUnicorn && Math.random() < 0.5;
          const gain = bonusChance ? 2 : 1;
          setGameState(prev => {
            const nextVal = Math.min(10, (prev.limitBreakBar || 0) + gain);
            if (bonusChance) {
              setTimeout(() => {
                pushLog(`🦄 【極限共鳴】神聖小馬發揮奇效！極限 Bar 額外增加 1 點！`);
              }, 50);
            }
            return { ...prev, limitBreakBar: nextVal };
          });
        } else {
          setGameState(prev => ({ ...prev, limitBreakBar: 0 }));
          pushLog(`💔 答錯了！極限 Bar (Limit Break) 已被重置為 0！小勇士要更專注喔！`);
        }
        
        if (isElite) {
          if (correct) {
            incrementWarlockCombo();
            let damage = 1;
            if (isLavaLionDoubleDamageActive) {
              setIsLavaLionDoubleDamageActive(false);
              damage = 2;
              pushLog(`🦁🔥【爆炎重擊】對精英怪獸【${activeMonsterName}】造成 2 點雙倍致命傷害！`);
            }
            const nextEliteHp = eliteHp - damage;
            setEliteHp(nextEliteHp);
            
            if (nextEliteHp > 0) {
              // Not yet defeated! Tell Phaser correct but not defeated
              if (GameBridge.onEntityInteracted && activeMonsterId) {
                GameBridge.onEntityInteracted(activeMonsterId, { eliteHp: nextEliteHp });
              }
              GameBridge.resolveCombat(true, false);
              pushLog(`⚔️ 命中！精英怪獸【${activeMonsterName}】受到重擊，但它依然站立著！(剩餘 HP: ${nextEliteHp}/${eliteMaxHp})`);
              
              // Generate a new follow-up question for this elite battle!
              const nextType = activeQuiz.type;
              const nextQuestion = generateQuestion(gameState.currentFloor, gameState.dFactorSlope || 0.2, nextType, usedQuestionIdsRef.current);
              if (!usedQuestionIdsRef.current.includes(nextQuestion.id)) {
                usedQuestionIdsRef.current.push(nextQuestion.id);
              }
              
              // Load the next question immediately
              setActiveQuiz(nextQuestion);
              setSelectedOption(null);
              setIsFeedbackShowing(false);
              return;
            } else {
              // Defeated!
              if (gameState.selectedJobId === 'thief') {
                setGameState(prev => {
                  const isDwarf = prev.selectedJobId === 'dwarf';
                  const maxVal = (prev.maxHp || 5) + (isDwarf ? 2 : 0);
                  const newHp = Math.min(maxVal, prev.hp + 1);
                  return { ...prev, hp: newHp };
                });
                pushLog("🦊🧪【神偷秘藥】盜賊成功擊倒精英怪！順手牽羊偷到一瓶回復藥，自動回復了 1 點生命值！❤️");
                RetroSFX.playShop();
              }
              GameBridge.resolveCombat(true, true);
              setIsElite(false);
            }
          } else {
            // Player answered incorrectly
            if (gameState.selectedJobId === 'warlock') {
              setWarlockCombo(0);
            }
            if (isThunderbirdShieldActive) {
              setIsThunderbirdShieldActive(false);
              pushLog(`🦅⚡ 【避雷電網】雷鳥電磁護網抵擋了這一次防禦失誤！HP 沒有減少！❤️`);
              GameBridge.resolveCombat(false, true);
              setIsElite(false);
            } else if (warriorShield) {
              setWarriorShield(false);
              pushLog(`🛡️ 【盾牌防護】劍士盾牌防護發動！消耗一次性護盾抵擋了防禦失誤！HP 沒有減少！❤️`);
              GameBridge.resolveCombat(false, true);
              setIsElite(false);
            } else {
              GameBridge.resolveCombat(false, true);
              setIsElite(false);
            }
          }
        } else {
          // Normal monster
          if (correct) {
            incrementWarlockCombo();
            if (isLavaLionDoubleDamageActive) {
              setIsLavaLionDoubleDamageActive(false);
            }
            GameBridge.resolveCombat(true, true);
          } else {
            // Player answered incorrectly
            if (gameState.selectedJobId === 'warlock') {
              setWarlockCombo(0);
            }
            if (isThunderbirdShieldActive) {
              setIsThunderbirdShieldActive(false);
              pushLog(`🦅⚡ 【避雷電網】雷鳥電磁護網抵擋了這一次防禦失誤！HP 沒有減少！❤️`);
              GameBridge.resolveCombat(false, true);
            } else if (warriorShield) {
              setWarriorShield(false);
              pushLog(`🛡️ 【盾牌防護】劍士盾牌防護發動！消耗一次性護盾抵擋了防禦失誤！HP 沒有減少！❤️`);
              GameBridge.resolveCombat(false, true);
            } else {
              GameBridge.resolveCombat(false, true);
            }
          }
        }

        // Clean cache if defeated/resolved correctly
        if (correct) {
          let foundKey: string | null = null;
          for (const key in monsterQuestionsRef.current) {
            if (monsterQuestionsRef.current[key]?.id === activeQuiz.id) {
              foundKey = key;
              break;
            }
          }
          if (foundKey) {
            delete monsterQuestionsRef.current[foundKey];
          }
        }
      }
      setActiveQuiz(null);
      setIsFeedbackShowing(false);
      setSelectedOption(null);
      fetchLeaderboard(); // Update leaderboard stats
    }
  };

  const handleBuyItem = (itemType: string, cost: number) => {
    if (gameState.goldCoins < cost) {
      pushLog(`❌ 秘境商人：『 喔不，勇士！你的金幣不夠 ${cost} 個，無法購買此商品喔！』`);
      RetroSFX.playHurt();
      return;
    }

    if (itemType === 'shake') {
      if (gameState.hp >= effectiveMaxHp) {
        pushLog(`❤️ 秘境商人：『 你的體力已經全滿 (${gameState.hp}/${effectiveMaxHp}) 囉！不需要補血。』`);
        return;
      }
      setGameState(prev => ({
        ...prev,
        hp: Math.min(effectiveMaxHp, prev.hp + 1),
        goldCoins: prev.goldCoins - cost
      }));
      pushLog(`🥛 Jovan 購買並喝下了「特製草莓奶昔」！${isCleric ? '⛪ 修士神聖恩賜：費用全免（0 金幣）！' : ''}生命值 +1 ❤️`);
      RetroSFX.playShop();
    } else if (itemType === 'crystal') {
      if (gameState.maxHp >= shopMaxHpLimit) {
        pushLog(`🛡️ 秘境商人：『 你的生命上限已達最大極限 (${shopMaxHpLimit})，無法再提升了！』`);
        return;
      }
      setGameState(prev => {
        const nextMax = prev.maxHp + 1;
        return {
          ...prev,
          maxHp: nextMax,
          hp: prev.hp + 1, // Restores 1 HP along with the increase
          goldCoins: prev.goldCoins - cost
        };
      });
      const isDwarf = gameState.selectedJobId === 'dwarf';
      pushLog(`💖 Jovan 融合了「活力心之結晶」！${isCleric ? '⛪ 修士神聖恩賜：費用全免（0 金幣）！' : ''}最大生命上限增加至 ${gameState.maxHp + 1}${isDwarf ? '（外加矮人重裝體魄加成：有效上限為 ' + (gameState.maxHp + 3) + '）' : ''} ❤️！`);
      RetroSFX.playShop();
    } else if (itemType === 'potion') {
      setGameState(prev => {
        const withCoins = {
          ...prev,
          goldCoins: prev.goldCoins - cost
        };
        const nextState = awardXP(withCoins, 300);
        return nextState;
      });
      pushLog(`✨ Jovan 飲用了「知識神聖藥水」，腦海中湧現無窮智慧！${isCleric ? '⛪ 修士神聖恩賜：費用全免（0 金幣）！' : ''}獲得 +300 XP 📖！`);
      RetroSFX.playShop();
    }

    pushLog(`🛒 秘境商人收下金幣並打包了商品。隨後，他收拾行囊融入了秘境陰影中，消失不見了...`);
    
    // Merchant disappears after one purchase!
    if (GameBridge.currentScene && typeof GameBridge.currentScene.destroyMerchant === 'function') {
      GameBridge.currentScene.destroyMerchant();
    }
    setShowMerchantShop(false);
    fetchLeaderboard();
  };

  const handleCloseMerchantShop = () => {
    setShowMerchantShop(false);
    if (restType === 'elf') {
      pushLog("🧚 精靈 Miko：『 願森林的微風守護你，再見囉！』");
    } else if (restType === 'campfire') {
      pushLog("🔥 營火燃燒殆盡，餘燼隨風飄散。Jovan 站起身，重新踏上旅途。");
    } else {
      pushLog("🧙‍♂️ 秘境商人：『 祝你好運，勇士！期待我們在更高層重逢。』");
    }
  };

  // Lite Permadeath: resets currentFloor back to Floor 1 if HP reaches 0
  const handleReviveHero = () => {
    setGameState(prev => {
      const isDwarf = prev.selectedJobId === 'dwarf';
      return { 
        ...prev, 
        currentFloor: 1, 
        startRunMaxFloor: prev.maxFloorReached || 1,
        hp: isDwarf ? 7 : 5,
        maxHp: 5,
        goldCoins: 0,
        limitBreakBar: 0,
        dFactorSlope: 0.2,
        currentFloorState: null,
        hasVisitedTreasureVaultThisRun: false,
        isTreasureVault: false
      };
    });
    pushLog(`💀 戰敗力竭！勇士 Jovan 的體力歸零，被魔法水晶傳送回「第 1 層」重頭開始！金幣與本局狀態已重置，但冒險生涯累積的 ${gameState.totalXP} XP 職業進度永久保留！🌟`);
    setIsPlaying(false); // Reset back to Lobby Hub
    usedQuestionIdsRef.current = []; // Reset used questions list for a brand new run!
    setIsPetSkillUsedThisFloor(false);
    pendingBossLimitBreakDamageRef.current = 0;

    // Reset job abilities on death
    setWarriorShield(gameState.selectedJobId === 'warrior');
    setHasMageTeleportUsed(false);
    setArcherCharges(10);
    setArcherExcludedOptions([]);
    setWarlockCombo(0);
    setSamuraiExcludedOption(null);
  };

  const handleEnterSpire = () => {
    setIsPlaying(true);
    usedQuestionIdsRef.current = [];
    setIsPetSkillUsedThisFloor(false);
    pendingBossLimitBreakDamageRef.current = 0;

    // Only reset/heal if starting a brand-new run on Floor 1
    if (gameState.currentFloor === 1) {
      setWarriorShield(gameState.selectedJobId === 'warrior');
      setHasMageTeleportUsed(false);
      setArcherCharges(10);
      setArcherExcludedOptions([]);
      setWarlockCombo(0);
      setSamuraiExcludedOption(null);

      // Heal to full HP (including any dwarf or max HP upgrades) when starting a new run
      setGameState(prev => {
        const isDwarf = prev.selectedJobId === 'dwarf';
        const effMax = (prev.maxHp || 5) + (isDwarf ? 2 : 0);
        return {
          ...prev,
          hp: effMax,
          currentFloorState: null,
          hasVisitedTreasureVaultThisRun: false,
          isTreasureVault: false
        };
      });

      const job = getJobById(gameState.selectedJobId || 'warrior') || JOBS[0];
      pushLog(`🏰 進入無限之塔！你當前扮演的職業是：【${job.emoji} ${job.name}】（招式：${job.skillName}）。祝你冒險順利！`);
    } else {
      // Resuming an active run
      const job = getJobById(gameState.selectedJobId || 'warrior') || JOBS[0];
      pushLog(`🏰 重新回到無限之塔第 ${gameState.currentFloor} 層！保留你先前的生命值（${gameState.hp}/${effectiveMaxHp}）與技能狀態。繼續你的冒險！`);
    }
  };

  const handleUpdateNameSubmit = () => {
    const trimmed = tempHeroName.trim();
    if (trimmed.length > 0 && trimmed.length <= 15) {
      setGameState(prev => ({ ...prev, heroName: trimmed }));
      setShowRenameModal(false);
      pushLog(`✏️ 英雄名已成功更改為：${trimmed}！`);
    }
  };

  // Helper values
  const currentWeeklyXP = calculateWeeklyXP(gameState.dailyLog);
  const nextLevelXP = gameState.currentFloor * 100;
  const xpPercentage = Math.min(100, (gameState.totalXP / nextLevelXP) * 100);
  const equippedPet = gameState.equippedPetId ? getPetById(gameState.equippedPetId) : null;
  const effectiveMaxHp = (gameState.maxHp || 5) + (gameState.selectedJobId === 'dwarf' ? 2 : 0);
  const currentJob = getJobById(gameState.selectedJobId || 'warrior') || JOBS[0];
  const isCleric = gameState.selectedJobId === 'cleric';
  const shakePrice = isCleric ? 0 : 10;
  const crystalPrice = isCleric ? 0 : 50;
  const potionPrice = isCleric ? 0 : 100;
  const shopMaxHpLimit = gameState.selectedJobId === 'dwarf' ? 10 : 8;

  // Generate date markers for the past 7 days to draw the visual quest log
  const getPastSevenDays = () => {
    const days = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dayStr = d.toISOString().split('T')[0];
      const weekdayName = ['日', '一', '二', '三', '四', '五', '六'][d.getDay()];
      
      // Find XP in daily logs
      const logItem = gameState.dailyLog.find(item => item.date === dayStr);
      days.push({
        date: dayStr,
        displayDate: `${d.getMonth() + 1}/${d.getDate()}`,
        weekday: weekdayName,
        xp: logItem ? logItem.xp : 0
      });
    }
    return days;
  };

  const pastSevenDays = getPastSevenDays();

  return (
    <div className="w-full min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans select-none overflow-x-hidden relative" style={{ fontFamily: '"Fredoka", sans-serif' }}>
      
      {/* 1. TOP HEADER UI BAR */}
      <header className="w-full bg-slate-950/90 border-b-4 border-indigo-950 px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-md sticky top-0 z-40">
        
        {/* Hero Identity Section */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-xl border-2 border-yellow-400 bg-zinc-950 flex items-center justify-center overflow-hidden shadow-lg">
              <HeroPixelPreview jobId={gameState.selectedJobId || 'warrior'} size={44} className="border-0 bg-transparent shadow-none" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-yellow-300 flex items-center gap-1">
                {gameState.heroName}
              </h2>
              <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700">
                第 {gameState.currentFloor} 層
              </span>
            </div>
            
            {/* XP ProgressBar */}
            <div className="w-40 sm:w-48 bg-slate-800 h-2 rounded-full mt-1 border border-slate-700 overflow-hidden relative">
              <div 
                className="bg-gradient-to-r from-blue-400 to-indigo-500 h-full transition-all duration-300"
                style={{ width: `${xpPercentage}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              學習點數 (XP): {gameState.totalXP}
            </div>
          </div>
        </div>

        {/* Dynamic Status / Mode Text */}
        {isPlaying && (
          <div className="hidden md:flex items-center gap-2 text-indigo-400 font-extrabold bg-indigo-950/40 border border-indigo-800/40 px-4 py-2 rounded-full text-sm">
            城堡 🏰 正在攀登無限之塔第 {gameState.currentFloor} 層
          </div>
        )}

        {/* Currency & Statistics Section */}
        <div className="flex items-center gap-3">
          
          {/* Gold coins */}
          <div className="flex items-center gap-2 bg-amber-950/60 border-2 border-amber-500/30 px-3 py-1.5 rounded-full text-amber-300 font-bold shadow-sm text-sm">
            <Coins size={16} className="text-yellow-400 animate-bounce" />
            <span>{gameState.goldCoins}</span>
          </div>

          {/* 7-day rolling XP Indicator */}
          <div className="flex items-center gap-2 bg-blue-950/60 border-2 border-blue-500/30 px-3 py-1.5 rounded-full text-blue-300 font-bold shadow-sm text-sm">
            <Award size={16} className="text-blue-400" />
            <span>{currentWeeklyXP} XP</span>
          </div>

          {/* Sound toggle button */}
          <button
            onClick={() => {
              setSoundEnabled(prev => !prev);
              if (!soundEnabled) {
                // Play coin sound when unmuted as feedback
                setTimeout(() => RetroSFX.playCoin(), 50);
              }
            }}
            className={`p-2 rounded-xl border transition active:scale-95 cursor-pointer flex items-center justify-center ${
              soundEnabled
                ? 'bg-indigo-950/80 text-indigo-400 border-indigo-500/40 hover:bg-indigo-900/80'
                : 'bg-zinc-900/80 text-zinc-500 border-zinc-700/40 hover:bg-zinc-800/80'
            }`}
            title={soundEnabled ? "關閉音效" : "開啟音效"}
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>

          {/* Back to lobby / start button */}
          {isPlaying ? (
            <button 
              id="lobby-exit-top"
              onClick={() => setIsPlaying(false)}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition border-b-4 border-rose-800 shadow-md active:scale-95 cursor-pointer"
            >
              <LogOut size={12} />
              <span>返回大廳</span>
            </button>
          ) : (
            <button 
              id="lobby-enter-top"
              onClick={handleEnterSpire}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition border-b-4 border-emerald-800 shadow-md active:scale-95 cursor-pointer"
            >
              <Play size={12} className="fill-white" />
              <span>進入爬塔</span>
            </button>
          )}

        </div>

      </header>

      {/* 2. LOBBY / HUB MODE SCREEN */}
      {!isPlaying ? (
        <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 md:p-8 md:py-12 flex flex-col gap-4 sm:gap-6 md:gap-8 animate-fade-in justify-center">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
            
            {/* Left Column: Hero Status & Companion Pet */}
            <div className="lg:col-span-5 flex flex-col gap-4 sm:gap-6">
              
              {/* Compact Hero Card */}
              <div className="w-full bg-gradient-to-b from-slate-950 to-indigo-950 border-2 border-indigo-900 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden flex flex-col gap-4">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-300 via-indigo-900 to-transparent pointer-events-none" />
                
                {/* Avatar and Name */}
                <div className="flex items-center gap-4 z-10">
                  <div className="relative flex-shrink-0 group">
                    <button
                      id="avatar-job-selector-btn"
                      onClick={() => setShowJobSelectorModal(true)}
                      className="w-20 h-20 rounded-2xl border-2 border-yellow-400 bg-zinc-950/80 flex items-center justify-center shadow-xl cursor-pointer transition transform hover:scale-105 active:scale-95 group relative overflow-hidden"
                      title="點擊更換職業"
                    >
                      <HeroPixelPreview jobId={gameState.selectedJobId || 'warrior'} size={72} className="border-0 bg-transparent shadow-none" />
                      <span className="absolute -inset-0.5 bg-yellow-400/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-300 pointer-events-none" />
                      {/* Interactive indicator overlay */}
                      <span className="absolute bottom-0 inset-x-0 bg-slate-950/90 text-[10px] text-yellow-300 font-bold py-0.5 text-center rounded-b-none scale-0 group-hover:scale-100 transition-transform origin-bottom">
                        更換職業
                      </span>
                    </button>
                    <div className="absolute -bottom-1 -right-1 bg-yellow-400 text-slate-950 px-2 py-0.5 rounded-full text-xs font-black shadow border border-slate-950 pointer-events-none">
                      LV {Math.floor(gameState.totalXP / 100) + 1}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-400 truncate">
                        {gameState.heroName}
                      </h1>
                    </div>
                    {/* Clickable Job Badge */}
                    <div className="mt-1 flex items-center gap-1.5">
                      <button
                        onClick={() => setShowJobSelectorModal(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/50 hover:border-indigo-500 text-indigo-300 hover:text-indigo-200 text-sm font-black rounded-full shadow-inner transition cursor-pointer"
                      >
                        <span>{currentJob.emoji} {currentJob.name}</span>
                        <span className="text-[11px] text-indigo-400 opacity-80">(點擊更換)</span>
                      </button>
                    </div>
                    <p className="text-sm text-slate-400 mt-1 line-clamp-1">
                      《Jovan's Endless Quest》無限學術之塔
                    </p>
                  </div>
                </div>

                {/* RPG Style Stats Grid */}
                <div className="grid grid-cols-3 gap-2.5 z-10 mt-1">
                  <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-center">
                    <div className="text-xs text-slate-400 font-semibold mb-1">目前層數</div>
                    <div className="text-base font-black text-indigo-400">第 {gameState.currentFloor} 層</div>
                  </div>
                  <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-center">
                    <div className="text-xs text-slate-400 font-semibold mb-1">累計 XP</div>
                    <div className="text-base font-black text-emerald-400">{gameState.totalXP}</div>
                  </div>
                  <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-center">
                    <div className="text-xs text-slate-400 font-semibold mb-1">金幣</div>
                    <div className="text-base font-black text-amber-400">{gameState.goldCoins} 🟡</div>
                  </div>
                </div>

                {/* Main CTA Button & Floor Selection */}
                <div className="flex flex-col gap-3 z-10 mt-2">
                  <button
                    id="enter-spire-cta"
                    onClick={handleEnterSpire}
                    className="w-full py-4.5 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-slate-950 font-black text-xl rounded-xl flex items-center justify-center gap-2 transition transform hover:scale-[1.02] active:scale-95 shadow-[0_5px_15px_rgba(245,158,11,0.25)] border-b-4 border-amber-700 cursor-pointer"
                  >
                    <Sword size={24} className="animate-pulse" />
                    <span>［ 進入無限之塔 ］</span>
                  </button>

                  {/* Floor Selector inside Hero Card replaced with display-only text */}
                  <div className="text-center text-xs sm:text-sm text-yellow-300/85 font-mono tracking-wider animate-pulse font-bold mt-1 bg-slate-900/50 p-3 rounded-xl border border-slate-850">
                    👑 歷史最高挑戰記錄：第 {gameState.maxFloorReached} 層 • 目前蓄勢攀登：第 {gameState.currentFloor} 層
                  </div>

                  {/* Version & Last Update info row */}
                  <div className="mt-2 pt-2 border-t border-indigo-950/80 flex flex-row items-center justify-between text-[10px] text-indigo-400/80 font-mono tracking-wider">
                    <span>版本: v3.0.0-RELEASE</span>
                    <span>更新: 2026-07-22 17:30</span>
                  </div>
                </div>

              </div>

              {/* Equipped Pet & Companion Panel (compacted) */}
              <div className="w-full bg-slate-950/80 border-2 border-amber-500/30 rounded-2xl p-5 shadow-xl flex flex-col gap-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
                
                <div className="flex items-start gap-3">
                  {gameState.equippedPetId ? (() => {
                    const pet = getPetById(gameState.equippedPetId);
                    if (!pet) return null;
                    return (
                      <>
                        <div className="w-14 h-14 flex-shrink-0 rounded-xl border-2 border-amber-400 bg-amber-950/40 flex items-center justify-center text-3xl shadow-lg relative animate-pulse">
                          {pet.emoji}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-base font-black text-amber-400">{pet.name}</h4>
                            <span className="text-xs bg-amber-950/80 text-amber-300 px-2 py-0.5 rounded-full border border-amber-800 font-bold uppercase tracking-wider">
                              {getElementChineseName(pet.element)}魔寵
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed">
                            <span className="font-bold text-amber-500">技能：【{pet.skillName}】</span> — {pet.skillDescription}
                          </p>
                        </div>
                      </>
                    );
                  })() : (
                    <>
                      <div className="w-14 h-14 flex-shrink-0 rounded-xl border-2 border-zinc-700 bg-zinc-900 flex items-center justify-center text-3xl shadow-md">
                        🐾
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-black text-zinc-400">尚未裝備魔寵伴侶</h4>
                        <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-snug">
                          攜帶魔寵可提供被動能力加成，或在戰鬥中施放主動大招！
                        </p>
                        <p className="text-xs text-slate-500 mt-1.5 italic font-medium">
                          💡 遇見魔寵時，連續答對 5 題即可捕捉！
                        </p>
                      </div>
                    </>
                  )}
                </div>

                <button
                  onClick={() => {
                    RetroSFX.playClick();
                    setShowPetSelectorModal(true);
                  }}
                  className="w-full py-3 bg-amber-950/50 hover:bg-amber-900 border border-amber-500/50 text-amber-300 font-black text-sm rounded-xl transition active:scale-95 shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>🎒 進入魔寵收集庫 </span>
                  <span className="text-xs bg-amber-500 text-slate-950 px-2 py-0.5 rounded font-black">
                    {gameState.capturedPetIds.length} 隻
                  </span>
                </button>

                {/* Developer Mode Entry Trigger */}
                <button
                  onClick={() => {
                    RetroSFX.playClick();
                    setDevError("");
                    setDevPassword("");
                    setShowDevPanel(true);
                  }}
                  className="w-full mt-1 py-1.5 bg-slate-900/60 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white font-bold text-xs rounded-lg transition active:scale-95 shadow-sm flex items-center justify-center gap-1 cursor-pointer"
                >
                  🛠️ {isDevModeUnlocked ? "開啟開發者測試控制台 (已解鎖)" : "開發者測試模式"}
                </button>
              </div>

            </div>

            {/* Right Column: Unified 7-Day Log & Leaderboard */}
            <div className="lg:col-span-7 flex flex-col gap-4 sm:gap-6">
              
              {/* Unified Academic Log & Leaderboard Card */}
              <div className="bg-slate-950/85 border-2 border-indigo-950 rounded-2xl p-5 flex flex-col shadow-lg gap-5">
                
                {/* Part 1: 7-Day learning log */}
                <div>
                  <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2.5">
                    <h3 className="text-lg font-black text-slate-200 flex items-center gap-1.5">
                      <Calendar size={20} className="text-emerald-400" />
                      7天學習日誌
                    </h3>
                    <span className="text-xs text-slate-400 flex items-center gap-1 bg-slate-900 px-2.5 py-0.5 rounded-full border border-slate-800 font-medium">
                      <Clock size={12} /> 即時記錄
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-400 mb-4 leading-relaxed font-medium">
                    你最近一週每日冒險所得 XP 紀錄。擊敗怪獸或完成挑戰便能累積在此！
                  </p>
                  
                  <div className="grid grid-cols-7 gap-1.5">
                    {pastSevenDays.map((day, idx) => {
                      const isToday = idx === 6;
                      const hasXP = day.xp > 0;
                      return (
                        <div 
                          key={day.date} 
                          className={`flex flex-col items-center p-2 rounded-lg border transition duration-150 ${
                            isToday 
                              ? 'bg-indigo-950/40 border-indigo-500/60 ring-1 ring-indigo-500/30' 
                              : hasXP 
                                ? 'bg-emerald-950/20 border-emerald-800/40' 
                                : 'bg-slate-900/40 border-slate-800/60'
                          }`}
                        >
                          <span className="text-xs text-slate-500 font-semibold">{day.displayDate}</span>
                          <span className="text-xs sm:text-sm font-black text-slate-300 mt-0.5">{day.weekday}</span>
                          
                          <div className="my-1.5 text-xl">
                            {hasXP ? (
                              <motion.span 
                                animate={{ scale: [1, 1.2, 1] }} 
                                transition={{ duration: 2, repeat: -1 }}
                                className="inline-block"
                              >
                                ⭐
                              </motion.span>
                            ) : (
                              <span className="opacity-10 text-[14px]">🛡️</span>
                            )}
                          </div>
                          
                          <span className={`text-xs sm:text-sm font-black ${hasXP ? 'text-emerald-400' : 'text-slate-500'}`}>
                            {hasXP ? `+${day.xp}` : '0'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-850 mt-3.5 flex items-center justify-between shadow-inner">
                    <span className="text-xs sm:text-sm text-slate-300 font-bold">過去 7 天累計學習點數 (XP)：</span>
                    <span className="text-sm sm:text-base font-black text-emerald-400 flex items-center gap-1 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-850">
                      +{currentWeeklyXP} XP ⭐
                    </span>
                  </div>
                </div>

                {/* Horizontal divider */}
                <div className="border-t-2 border-slate-800/60 my-1"></div>

                {/* Part 2: Global Leaderboard */}
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <h3 className="text-lg font-black text-slate-200 flex items-center gap-1.5">
                      <Trophy size={20} className="text-yellow-400" />
                      無限之塔勇士榜 🏆
                    </h3>
                    
                    <div className="flex items-center gap-2">
                      {/* Refresh button */}
                      <button 
                        id="refresh-leaderboard-lobby"
                        onClick={fetchLeaderboard}
                        className="p-1.5 hover:bg-slate-850 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 transition cursor-pointer"
                        title="重新整理"
                      >
                        <RefreshCw size={14} className={isLeaderboardLoading ? "animate-spin" : ""} />
                      </button>
                    </div>
                  </div>

                  {/* Tabs and Sorters */}
                  <div className="flex flex-col gap-2 mb-4 bg-slate-900/40 p-2 rounded-xl border border-slate-900">
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => { RetroSFX.playClick(); setLeaderboardTab('weekly'); }}
                        className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-black transition duration-150 ${
                          leaderboardTab === 'weekly'
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        📅 7天累積排行 (Last 7 Days)
                      </button>
                      <button
                        onClick={() => { RetroSFX.playClick(); setLeaderboardTab('all-time'); }}
                        className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-black transition duration-150 ${
                          leaderboardTab === 'all-time'
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        👑 累積總體排行 (All-Time)
                      </button>
                    </div>

                    {/* Secondary sorting option */}
                    <AnimatePresence mode="wait">
                      {leaderboardTab === 'all-time' && (
                        <motion.div 
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="flex items-center justify-between border-t border-slate-800/50 pt-2 px-1"
                        >
                          <span className="text-[11px] text-slate-400 font-bold">選擇總體排序依據：</span>
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => { RetroSFX.playClick(); setAllTimeSort('xp'); }}
                              className={`py-1 px-2.5 rounded text-[10px] font-black transition duration-150 ${
                                allTimeSort === 'xp'
                                  ? 'bg-amber-500 text-slate-950 font-black'
                                  : 'bg-slate-800 text-slate-400 hover:text-slate-300'
                              }`}
                            >
                              ⭐ 總計 XP Sorting
                            </button>
                            <button
                              onClick={() => { RetroSFX.playClick(); setAllTimeSort('floor'); }}
                              className={`py-1 px-2.5 rounded text-[10px] font-black transition duration-150 ${
                                allTimeSort === 'floor'
                                  ? 'bg-amber-500 text-slate-950 font-black'
                                  : 'bg-slate-800 text-slate-400 hover:text-slate-300'
                              }`}
                            >
                              🏰 最高樓層 Sorting
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <p className="text-xs text-slate-400 mb-3 leading-relaxed font-medium">
                    {leaderboardTab === 'weekly' 
                      ? "📊 依據「最近7天」累積的 XP 排行，每週更新競爭激烈！" 
                      : allTimeSort === 'xp' 
                        ? "👑 依據「歷代總累計 XP」排行，展現小勇士的宏偉學術總成就！" 
                        : "🏰 依據「攀登的最高樓層」排行，展現小勇士探索無限之塔的深度！"
                    }
                  </p>

                  {isLeaderboardLoading ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-10">
                      <RefreshCw size={24} className="animate-spin text-indigo-400 mb-1.5" />
                      <span className="text-xs text-slate-400">正在同步雲端數據中...</span>
                    </div>
                  ) : (
                    <div className="overflow-y-auto space-y-1.5 pr-0.5 max-h-[280px] scrollbar-thin scrollbar-thumb-slate-800">
                      {(() => {
                        const sorted = [...leaderboard].sort((a, b) => {
                          if (leaderboardTab === 'weekly') {
                            return (b.weeklyXP || 0) - (a.weeklyXP || 0) || (b.xp || 0) - (a.xp || 0);
                          } else {
                            if (allTimeSort === 'xp') {
                              return (b.xp || 0) - (a.xp || 0) || (b.maxFloorReached || 0) - (a.maxFloorReached || 0);
                            } else {
                              return (b.maxFloorReached || 0) - (a.maxFloorReached || 0) || (b.xp || 0) - (a.xp || 0);
                            }
                          }
                        });

                        if (sorted.length === 0) {
                          return (
                            <div className="text-center py-8 text-slate-500 text-sm italic">
                              暫無資料。開始爬塔來登錄勇士榜吧！
                            </div>
                          );
                        }

                        return sorted.slice(0, 50).map((entry, idx) => {
                          const isMe = entry.name.toLowerCase() === gameState.heroName.toLowerCase();
                          const rankColors = ['bg-yellow-400 text-slate-950', 'bg-slate-300 text-slate-950', 'bg-amber-600 text-white'];
                          
                          return (
                            <div 
                              key={entry.name + idx} 
                              className={`p-2.5 rounded-lg border flex items-center justify-between text-xs transition duration-150 ${
                                isMe 
                                  ? 'bg-indigo-950/50 border-indigo-500/70 shadow-[0_0_10px_rgba(99,102,241,0.2)]' 
                                  : 'bg-slate-900/50 border-slate-850 hover:border-slate-800'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className={`w-6 h-6 rounded-full flex items-center justify-center font-extrabold font-mono text-xs ${idx < 3 ? rankColors[idx] : 'bg-slate-800 text-slate-400'}`}>
                                  {idx + 1}
                                </span>
                                
                                <div>
                                  <div className="font-extrabold text-slate-100 flex items-center gap-1.5">
                                    <span className="text-sm">{entry.name}</span>
                                    {isMe && <span className="text-[10px] bg-indigo-500 text-white px-1.5 py-0.2 rounded font-black">你</span>}
                                  </div>
                                  <div className="text-xs text-slate-400 mt-0.5">
                                    總 XP: {entry.xp} | 最高: 第 {entry.maxFloorReached} 層
                                  </div>
                                </div>
                              </div>

                              <div className="text-right">
                                <div className="font-black text-emerald-400 text-sm">
                                  {leaderboardTab === 'weekly' ? `${entry.weeklyXP} XP` : allTimeSort === 'xp' ? `${entry.xp} XP` : `第 ${entry.maxFloorReached} 層`}
                                </div>
                                <div className="text-[10px] text-slate-500 uppercase font-black">
                                  {leaderboardTab === 'weekly' ? '7天累積' : allTimeSort === 'xp' ? '總學習點' : '最高探險'}
                                </div>
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  )}
                </div>

              </div>
            </div>

          </div>



        </main>
      ) : (
        /* 3. GAMEPLAY IMMERSIVE FOCUS VIEW (Zero logs/leaderboard distraction) */
        <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 md:p-8 md:py-12 flex flex-col gap-4 sm:gap-6 md:gap-8 animate-fade-in justify-center">
          
          <div className={`w-full ${isLogExpanded ? 'grid grid-cols-1 lg:grid-cols-12' : 'flex flex-col w-full'} gap-6 md:gap-8 items-start`}>
            
            {/* Phaser Viewport and HP HUD */}
            <section className={`${isLogExpanded ? 'lg:col-span-8' : 'w-full'} flex flex-col gap-4 sm:gap-6 transition-all duration-300`}>
              
              <div className="w-full relative">
                {gameState.hp <= 0 ? (
                  /* Classic hard roguelike lite Permadeath screen with Double Border */
                  <div className="w-full aspect-[16/10] bg-black border-[6px] border-white p-1 flex flex-col items-center justify-center text-center shadow-lg relative overflow-hidden">
                    <div className="border-2 border-white p-6 sm:p-10 bg-black w-full h-full flex flex-col items-center justify-center">
                      <div className="text-7xl mb-4 animate-bounce">💀🥀🛡️</div>
                      <h3 className="text-2xl sm:text-3xl font-extrabold text-red-500 mb-3 tracking-widest font-mono">
                        ［ 勇士 Jovan 戰敗了！ ］
                      </h3>
                      <p className="text-white max-w-md text-sm sm:text-base mb-6 font-mono leading-relaxed">
                        體力已全部用盡！由於闖關失敗，你必須從塔底「第 1 層」重新出發！別灰心，每一次失敗都會讓你更聰明、更強大！
                      </p>
                      <button
                        id="restart-tower-button"
                        onClick={handleReviveHero}
                        className="px-8 py-4 bg-black border-4 border-white text-white hover:bg-white hover:text-black font-mono font-bold text-lg sm:text-xl transition cursor-pointer flex items-center gap-2 active:scale-95 shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                      >
                        <RefreshCw size={20} className="animate-spin" />
                        ［ 👉 重新進入無限之塔 ］
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <PhaserContainer 
                      currentFloor={gameState.currentFloor} 
                      equippedPetId={gameState.equippedPetId} 
                      selectedJobId={gameState.selectedJobId || 'warrior'}
                      devOverrides={isDevModeUnlocked ? devOverrides : undefined}
                      currentFloorState={gameState.currentFloorState}
                      isTreasureFloor={gameState.isTreasureVault}
                      maxFloorReached={gameState.startRunMaxFloor ?? gameState.maxFloorReached ?? 1}
                    />
                    
                    {/* Floating Limit Break Trigger directly on top of game canvas for iPad & mobile accessibility */}
                    {gameState.limitBreakBar >= 10 && (
                      <button
                        id="floating-limit-break-btn"
                        onClick={handleLimitBreak}
                        className="absolute top-4 left-4 z-50 px-3.5 py-2 bg-gradient-to-r from-amber-500 via-yellow-400 to-red-500 text-slate-950 font-black rounded-xl text-xs sm:text-sm tracking-wider shadow-[0_0_20px_rgba(245,158,11,0.9)] animate-bounce border-2 border-yellow-200 cursor-pointer flex items-center gap-1.5 hover:scale-105 active:scale-95"
                      >
                        <Sparkles size={16} className="animate-spin text-slate-950" />
                        <span>💥 發動極限超必殺技 ⚔️</span>
                      </button>
                    )}

                    {/* Floating Expand Book Button in top-right corner when collapsed */}
                    {!isLogExpanded && (
                      <button
                        id="floating-expand-logs-btn"
                        onClick={() => setIsLogExpanded(true)}
                        className="absolute top-4 right-4 z-50 p-3 bg-indigo-950/90 hover:bg-indigo-900 text-indigo-300 hover:text-white rounded-xl border border-indigo-500/50 hover:border-indigo-400 shadow-xl cursor-pointer transition flex items-center gap-2 text-xs font-bold animate-fade-in hover:scale-105 active:scale-95"
                        title="展開即時紀錄"
                      >
                        <BookOpen size={16} className="animate-pulse" />
                        <span>展開紀錄 ▶</span>
                      </button>
                    )}
                  </>
                )}
              </div>

              {/* Status & Lives Tracker JRPG Bento HUD Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Column 1: Player Status */}
                <div className="bg-slate-950/80 border-2 border-slate-800 p-4 rounded-xl flex flex-col justify-between gap-3 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-rose-950/50 text-rose-400 rounded-lg border border-rose-800/40">
                      <Heart size={18} className="fill-rose-500 animate-pulse text-rose-500" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">當前勇士生命值</h4>
                      <p className="text-sm font-bold text-slate-200">{gameState.heroName || "Jovan"}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 bg-slate-900/60 px-3 py-2 rounded-lg border border-slate-800/40">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: effectiveMaxHp }).map((_, idx) => {
                        const active = idx < gameState.hp;
                        return (
                          <span 
                            key={idx}
                            className="text-xl drop-shadow-[0_0_4px_rgba(244,63,94,0.4)]"
                          >
                            {active ? '❤️' : '🖤'}
                          </span>
                        );
                      })}
                    </div>
                    <span className="text-xs font-extrabold text-slate-300 bg-slate-950 px-2.5 py-0.5 rounded-full">
                      {gameState.hp}/{effectiveMaxHp}
                    </span>
                  </div>

                  <button
                    id="hud-toggle-logs-btn"
                    onClick={() => setIsLogExpanded(!isLogExpanded)}
                    className="w-full py-2 bg-indigo-950/60 hover:bg-indigo-900 text-indigo-300 hover:text-white rounded-lg border border-indigo-900/60 transition cursor-pointer flex items-center justify-center gap-2 text-xs font-bold shadow-sm"
                  >
                    <BookOpen size={12} />
                    <span>{isLogExpanded ? "收起戰事紀錄" : "展開戰事紀錄"}</span>
                  </button>
                </div>

                {/* Column 2: Limit Break */}
                <div className="bg-slate-950/80 border-2 border-slate-800 p-4 rounded-xl flex flex-col justify-between gap-3 shadow-sm relative overflow-hidden">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-950/50 text-amber-400 rounded-lg border border-amber-800/40">
                      <Sparkles size={18} className="animate-spin text-amber-500" style={{ animationDuration: '3s' }} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">極限必殺能量 (Streak)</h4>
                      <p className="text-xs text-slate-300">
                        {gameState.limitBreakBar >= 10 ? '🔥 能量全滿！蓄勢待發！' : `儲力進度：${gameState.limitBreakBar} / 10`}
                      </p>
                    </div>
                  </div>

                  {/* Visual Bar */}
                  <div className="space-y-1">
                    <div className="relative w-full h-4 bg-slate-900 rounded-full border border-slate-800 overflow-hidden flex">
                      {/* Segmented meter */}
                      <div 
                        className={`h-full transition-all duration-300 ${
                          gameState.limitBreakBar >= 10 
                            ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-red-500 animate-pulse shadow-[0_0_12px_rgba(251,191,36,0.8)]' 
                            : 'bg-gradient-to-r from-indigo-500 to-purple-500'
                        }`}
                        style={{ width: `${Math.min(100, gameState.limitBreakBar * 10)}%` }}
                      />
                      {/* Grid dividers */}
                      <div className="absolute inset-0 grid grid-cols-10 pointer-events-none">
                        {Array.from({ length: 9 }).map((_, i) => (
                          <div key={i} className="border-r border-slate-950/40 h-full" />
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>0%</span>
                      <span>50%</span>
                      <span>100% READY</span>
                    </div>
                  </div>

                  {/* Trigger or Indicator Button */}
                  {gameState.limitBreakBar >= 10 ? (
                    <button
                      id="hud-use-limit-break-btn"
                      onClick={handleLimitBreak}
                      className="w-full py-2 bg-gradient-to-r from-amber-500 via-yellow-500 to-red-500 hover:brightness-110 text-slate-950 font-black rounded-lg text-xs tracking-wider transition active:scale-95 shadow-[0_0_15px_rgba(245,158,11,0.6)] animate-bounce cursor-pointer border border-yellow-300"
                    >
                      💥 發動極限超必殺技 ⚔️
                    </button>
                  ) : (
                    <div className="w-full py-2 bg-slate-900 border border-slate-800 text-slate-500 rounded-lg text-center text-xs font-medium">
                      🔒 請連續答對 10 題解鎖
                    </div>
                  )}
                </div>

                {/* Column 3: Equipped Pet & Companion Skills */}
                {equippedPet ? (
                  <div className="bg-slate-950/80 border-2 border-slate-800 p-4 rounded-xl flex flex-col justify-between gap-3 shadow-sm relative">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="text-3xl p-1 bg-slate-900 rounded-lg border border-yellow-500/40 shadow-[0_0_8px_rgba(234,179,8,0.2)] animate-pulse">
                          {equippedPet.emoji}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1">
                            ⭐️ 隨行魔寵夥伴
                          </h4>
                          <p className="text-xs font-bold text-slate-200">{equippedPet.name}</p>
                        </div>
                      </div>
                    </div>

                    {/* Skill Info */}
                    <div className="bg-slate-900/40 p-2 rounded border border-slate-800/40">
                      <p className="text-[10px] font-bold text-amber-300">
                        招式：{equippedPet.skillName} {equippedPet.isActive ? '⚡【主動】' : '⭐【被動】'}
                      </p>
                      <p className="text-[10px] text-slate-400 leading-relaxed mt-0.5">
                        {equippedPet.skillDescription}
                      </p>
                    </div>

                    {/* Trigger Skill Button or Passive State */}
                    {equippedPet.isActive ? (
                      isPetSkillUsedThisFloor ? (
                        <div className="w-full py-2 bg-slate-900 border border-slate-800 text-slate-500 rounded-lg text-center text-xs font-bold flex items-center justify-center gap-1">
                          <span>🚫 本次登塔已使用 (限用一次)</span>
                        </div>
                      ) : (
                        <button
                          id="hud-use-pet-skill-btn"
                          onClick={handleUsePetSkill}
                          className="w-full py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black rounded-lg text-xs tracking-wide transition active:scale-95 shadow-[0_0_10px_rgba(245,158,11,0.3)] cursor-pointer"
                        >
                          ✨ 施展魔寵奧義技能！
                        </button>
                      )
                    ) : (
                      <div className="w-full py-2 bg-emerald-950/30 border border-emerald-900/40 text-emerald-400 rounded-lg text-center text-xs font-bold flex items-center justify-center gap-1.5">
                        <span className="animate-pulse">🟢</span>
                        <span>被動加成效果正常生效中</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-slate-950/80 border-2 border-slate-800 p-4 rounded-xl flex flex-col justify-center items-slate-stretch gap-3 shadow-sm min-h-[140px]">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-slate-900 text-slate-600 rounded-lg border border-slate-800 text-2xl">
                        🐾
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">當前魔寵夥伴</h4>
                        <p className="text-xs text-slate-500">尚未指派任何寵物伴隨出戰</p>
                      </div>
                    </div>

                    <p className="text-[10px] text-slate-400 text-center italic mt-2 leading-relaxed">
                      「可在首頁『進入魔寵收集庫』裝備你的夥伴！在塔中冒險時有機會遭遇並成功收服傳奇魔寵喔！」
                    </p>
                  </div>
                )}

              </div>

            </section>

            {/* Right Side Info & Live Quest Feed (Columns 9-12 when expanded, completely hidden when collapsed) */}
            {isLogExpanded && (
              <section className="lg:col-span-4 flex flex-col gap-4 transition-all duration-300 w-full">
                
                {/* Dynamic instruction hint */}
                <div className="bg-indigo-950/30 border-2 border-indigo-900/60 p-4 rounded-xl shadow-sm">
                  <h4 className="text-sm font-bold text-indigo-300 flex items-center gap-2 mb-2">
                    <Sparkles size={16} />
                    爬塔挑戰中：第 {gameState.currentFloor} 層
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    點擊地圖上的怪獸，答對問題即可將牠們擊退！在第 3-5 層中，點擊地圖上的隨機商人可以用金幣補血。
                  </p>
                </div>

                {/* Live Quest Logs Container */}
                <div className="bg-slate-950/80 border-2 border-slate-800 rounded-2xl p-4 flex-1 flex flex-col min-h-[380px] shadow-sm">
                  <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3 flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="flex items-center gap-2">
                      <Shield size={14} />
                      戰事與學習即時紀錄
                    </span>
                    <button 
                      id="collapse-logs-btn"
                      onClick={() => setIsLogExpanded(false)}
                      className="text-[10px] text-slate-400 hover:text-white px-2.5 py-1 bg-slate-900 hover:bg-indigo-950 border border-slate-800 rounded-lg flex items-center gap-1 cursor-pointer transition"
                    >
                      <span>收起</span>
                      <ChevronRight size={12} />
                    </button>
                  </h3>
                  
                  <div ref={logContainerRef} className="flex-1 overflow-y-auto pr-1 space-y-2 text-xs font-mono scrollbar-thin scrollbar-thumb-slate-800">
                    {questLogs.map((log, i) => (
                      <div key={i} className="text-slate-300 py-1.5 border-b border-slate-900/40 leading-relaxed">
                        {log}
                      </div>
                    ))}
                  </div>
                </div>

              </section>
            )}

          </div>

        </main>
      )}

      {/* 3. FLOATING Retro Pixel Quiz Overlay (Domain Question Generator) - Optimized for iPad scroll-free view */}
      <AnimatePresence>
        {activeQuiz && (
          <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-1 sm:p-3 overflow-y-auto">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className={`w-full max-w-3xl bg-black border-4 border-white p-0.5 text-white font-mono relative shadow-2xl my-auto ${isScreenShaking ? "animate-shake" : ""}`}
            >
              <div className="border border-white p-2.5 sm:p-4 flex flex-col items-stretch bg-black">
                
                {/* RPG Header / Monster encounter */}
                <div className="mb-2.5 border-b border-dashed border-white/30 pb-2 text-center">
                  {bossCombo ? (
                    <div>
                      <span className="text-red-500 font-extrabold text-sm sm:text-base tracking-widest block font-mono uppercase animate-pulse">
                        ⚠️ 巨型 👹 塔之守護者 BOSS 臨世！ ⚠️
                      </span>
                      <div className="mt-1 bg-zinc-950 p-1 border border-red-500/40 rounded-lg max-w-sm mx-auto">
                        <div className="flex justify-between items-center text-[10px] text-slate-400 mb-0.5">
                          <span className="font-bold text-red-400">👹 BOSS 護盾生命 (HP)</span>
                          <span className="font-mono text-red-500 font-bold">{bossHp} / 5</span>
                        </div>
                        <div className="grid grid-cols-5 gap-0.5 h-1.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <div 
                              key={i} 
                              className={`rounded-sm transition duration-300 ${
                                i < bossHp ? 'bg-red-600 shadow-[0_0_4px_#ef4444]' : 'bg-zinc-800'
                              }`} 
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-yellow-400 font-bold text-[10px] uppercase tracking-widest block mt-1">
                        ⚔️ 連環防禦：第 {bossComboIndex + 1} 輪 ⚔️ — 領域：
                        {activeQuiz?.type === 'math' && '【數學思維 🧮】'}
                        {activeQuiz?.type === 'chinese' && '【漢語詞彙 📖】'}
                        {activeQuiz?.type === 'english' && '【英語實用 🇬🇧】'}
                        {activeQuiz?.type === 'logic' && '【邏輯推理 💡】'}
                      </span>
                    </div>
                  ) : isPetChallengeActive && activePet ? (
                    <div>
                      <span className="text-teal-400 font-extrabold text-sm sm:text-base tracking-widest block font-mono uppercase animate-pulse">
                        💖 遇見神秘魔寵：{activePet.emoji} {activePet.name} 💖
                      </span>
                      <span className="text-yellow-400 font-bold text-[10px] sm:text-xs uppercase tracking-widest block mt-1">
                        🌟 連續答對進度：第 <span className="text-teal-300 font-mono text-xs font-black">{petChallengeIndex + 1}</span> / 5 關
                      </span>
                    </div>
                  ) : (
                    <div>
                      <span className="text-yellow-400 font-bold text-xs sm:text-sm tracking-wider block font-mono">
                        {activeQuiz?.type === 'math' 
                          ? '野生的 👾 數之惡魔 發動了 數學衝擊 ⚡！' 
                          : '野生的 🏮 漢字精靈 發動了 中文魔法 🔮！'
                        }
                      </span>
                      <span className="text-red-500 font-extrabold text-[9px] sm:text-[10px] uppercase tracking-widest block mt-0.5">
                        ⚔️ 勇士 Jovan，請做出完美防禦！ ⚔️
                      </span>
                    </div>
                  )}
                </div>

                {/* JRPG Tactical Battle Status HUD */}
                <div className="mb-3 bg-zinc-950 p-3 sm:p-4 border-2 border-zinc-850 rounded-xl text-left max-w-lg mx-auto grid grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm font-sans select-none">
                  {/* Left: Player & HP */}
                  <div className="border-r border-zinc-800 pr-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-yellow-400 font-black text-sm">👤 {gameState.heroName || "Jovan"}</span>
                      <span className="text-[10px] bg-indigo-950 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-800/60 font-bold">LV {Math.floor(gameState.totalXP / 100) + 1}</span>
                    </div>
                    <div className="flex items-center gap-1 flex-wrap mt-1">
                      <span className="text-rose-400 font-black text-xs sm:text-sm">HP:</span>
                      <span className="tracking-tighter">
                        {Array.from({ length: effectiveMaxHp }).map((_, idx) => (
                          <span key={idx} className="text-xs sm:text-sm md:text-base">
                            {idx < gameState.hp ? '❤️' : '🖤'}
                          </span>
                        ))}
                      </span>
                      <span className="text-xs text-zinc-400 ml-auto font-bold">({gameState.hp}/{effectiveMaxHp})</span>
                    </div>
                  </div>

                  {/* Right: Selected Job Talent & Live Buff Status */}
                  <div className="pl-2 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-cyan-400 font-black flex items-center gap-1 text-xs sm:text-sm">
                        <span>{currentJob.emoji}</span>
                        <span>{currentJob.name}</span>
                      </span>
                      <span className="text-[10px] text-zinc-500 font-black">特技</span>
                    </div>
                    
                    <div className="text-xs sm:text-sm flex items-center justify-between mt-1">
                      {gameState.selectedJobId === 'warrior' ? (
                        <>
                          <span className="text-zinc-400 font-bold">🛡️ 防護:</span>
                          <span className={warriorShield ? "text-emerald-400 font-black animate-pulse font-mono text-xs sm:text-sm" : "text-rose-500 line-through font-bold font-mono text-xs sm:text-sm"}>
                            {warriorShield ? "🟢 有" : "🔴 無"}
                          </span>
                        </>
                      ) : gameState.selectedJobId === 'mage' ? (
                        <>
                          <span className="text-zinc-400 font-bold">🔮 傳送:</span>
                          <span className={hasMageTeleportUsed ? "text-rose-500 line-through font-bold font-mono text-xs sm:text-sm" : "text-emerald-400 font-black font-mono text-xs sm:text-sm"}>
                            {hasMageTeleportUsed ? "🔴 完" : "🟢 可"}
                          </span>
                        </>
                      ) : gameState.selectedJobId === 'samurai' ? (
                        <>
                          <span className="text-zinc-400 font-bold">👤 看破:</span>
                          <span className={gameState.hp === 1 ? "text-amber-400 font-black animate-pulse font-mono text-xs sm:text-sm" : "text-zinc-500 font-bold font-mono text-xs sm:text-sm"}>
                            {gameState.hp === 1 ? "🔥 開" : "🔒 關"}
                          </span>
                        </>
                      ) : gameState.selectedJobId === 'archer' ? (
                        <>
                          <span className="text-zinc-400 font-bold">🏹 鷹眼:</span>
                          <span className={archerCharges === 0 ? "text-rose-500 line-through font-bold font-mono text-xs sm:text-sm" : "text-emerald-400 font-black font-mono text-xs sm:text-sm"}>
                            剩餘 {archerCharges} 次
                          </span>
                        </>
                      ) : gameState.selectedJobId === 'dancer' ? (
                        <>
                          <span className="text-zinc-400 font-bold">💃 避戰:</span>
                          <span className="text-pink-400 font-black font-mono text-xs sm:text-sm">
                            1 HP 跳過 🕊️
                          </span>
                        </>
                      ) : gameState.selectedJobId === 'cleric' ? (
                        <>
                          <span className="text-zinc-400 font-bold">⛪ 恩賜:</span>
                          <span className="text-indigo-400 font-black font-mono text-xs sm:text-sm">
                            商店 0 元 🛒
                          </span>
                        </>
                      ) : gameState.selectedJobId === 'warlock' ? (
                        <>
                          <span className="text-zinc-400 font-bold">🔮 魂魄:</span>
                          <span className="text-indigo-400 font-black font-mono text-xs sm:text-sm">
                            連擊 {warlockCombo}/3 ⚡
                          </span>
                        </>
                      ) : gameState.selectedJobId === 'sage' ? (
                        <>
                          <span className="text-zinc-400 font-bold">📜 聖言:</span>
                          <span className="text-cyan-400 font-black font-mono text-xs sm:text-sm">
                            BOSS 生命 -1 💥
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="text-zinc-400 font-bold">✨ {currentJob.skillName}:</span>
                          <span className="text-emerald-400 font-black font-mono text-xs sm:text-sm">🟢 生效</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Highly visible Pet Capture countdown timer */}
                {isPetChallengeActive && !isFeedbackShowing && (
                  <div className="mb-2.5 bg-zinc-950 p-2 border-2 border-teal-500/50 rounded-lg max-w-sm mx-auto shadow-[0_0_8px_rgba(45,212,191,0.2)]">
                    <div className="flex justify-between items-center text-[10px] mb-1">
                      <span className="font-extrabold text-teal-400 animate-pulse flex items-center gap-1 font-mono uppercase">
                        ⚡ 捕捉限時倒數：
                      </span>
                      <span className={`font-mono font-black text-sm ${petTimer <= 3 ? 'text-red-500 animate-ping' : 'text-yellow-300'}`}>
                        {petTimer} 秒
                      </span>
                    </div>
                    {/* Visual Progress Bar for the 8s Timer */}
                    <div className="w-full bg-zinc-900 rounded-full h-2 border border-zinc-800 overflow-hidden">
                      <motion.div 
                        initial={{ width: "100%" }}
                        animate={{ width: `${(petTimer / 8) * 100}%` }}
                        transition={{ duration: 1, ease: "linear" }}
                        className={`h-full rounded-full ${
                          petTimer <= 3 ? 'bg-red-500 shadow-[0_0_8px_#ef4444]' : 'bg-teal-400 shadow-[0_0_8px_#2dd4bf]'
                        }`}
                      />
                    </div>
                  </div>
                )}

                {/* Giant Retro Question Box */}
                <div className="w-full bg-black border-2 border-double border-white p-3.5 mb-3 text-center shadow-inner relative overflow-hidden">
                  {(() => {
                    const { header, instruction, content } = parseQuestionText(activeQuiz?.question || "");
                    return (
                      <>
                        {header && (
                          <div className="mb-1.5">
                            <span className="inline-block px-2.5 py-0.5 text-xs sm:text-sm font-black uppercase tracking-widest text-amber-400 bg-zinc-950 border border-amber-500/40 rounded-md">
                              {header.replace(/【|】/g, '')}
                            </span>
                          </div>
                        )}
                        {instruction && (
                          <p className="text-lg sm:text-2xl md:text-[36px] lg:text-[40px] font-black text-indigo-200 mb-3 leading-normal md:leading-relaxed">
                            {instruction}
                          </p>
                        )}
                        <div className="mt-1">
                          {activeQuiz?.type === 'math' ? (
                            <h4 className={`font-black text-yellow-300 tracking-wide font-sans py-1 drop-shadow-[0_1px_6px_rgba(253,224,71,0.3)] ${
                              content.length > 20 ? 'text-2xl sm:text-3xl md:text-4xl lg:text-[40px]' : 'text-3xl sm:text-4xl md:text-5xl lg:text-[54px]'
                            }`}>
                              {content}
                            </h4>
                          ) : (activeQuiz?.subtype === 'emoji_en' || activeQuiz?.subtype === 'emoji_zh') ? (
                            <div className="flex flex-col items-center justify-center p-1.5">
                              <motion.span 
                                animate={{ scale: [1, 1.05, 1], rotate: [0, -2, 2, 0] }}
                                transition={{ duration: 2.5, repeat: -1, ease: "easeInOut" }}
                                className="text-6xl sm:text-7xl lg:text-8xl drop-shadow-[0_4px_8px_rgba(255,255,255,0.15)] select-none filter hover:brightness-110 active:scale-95 duration-100"
                              >
                                {content}
                              </motion.span>
                            </div>
                          ) : (
                            <h4 className="text-xl sm:text-2xl md:text-3xl lg:text-[38px] font-black text-white leading-relaxed">
                              {content.split('___').map((part, i, arr) => (
                                <span key={i}>
                                  {part}
                                  {i < arr.length - 1 && (
                                    <span className="inline-block mx-2 bg-zinc-950 px-4 py-1 border-b-2 border-dashed border-white text-yellow-300 font-black min-w-[70px] text-center text-xl sm:text-2xl md:text-[36px] lg:text-[38px] rounded">
                                      {selectedOption || "___"}
                                    </span>
                                  )}
                                </span>
                              ))}
                            </h4>
                          )}
                        </div>
                      </>
                    );
                  })()}
                </div>

                {/* Custom TTS Speech Button */}
                {activeQuiz?.speechText && (
                  <div className="flex justify-center mb-2">
                    <button
                      onClick={() => playTTS(activeQuiz.speechText!, activeQuiz.speechLang!)}
                      className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-[11px] rounded-full flex items-center gap-1 animate-pulse cursor-pointer border border-white shadow transition-all active:scale-95"
                    >
                      <span>
                        {activeQuiz.speechLang?.startsWith('zh') 
                          ? '🗣️ 點擊朗讀 / 重聽 (Click to Read / Replay) 🔊' 
                          : activeQuiz.subtype === 'spelling' || activeQuiz.subtype === 'phonics'
                            ? '🗣️ 點擊發音 (Click to Hear Word) 🔊'
                            : '🗣️ Listen / Replay 🔊'}
                      </span>
                    </button>
                  </div>
                )}

                {/* Conditional Rendering of Game Modes */}
                {activeQuiz?.subtype === 'spelling' ? (
                  /* Spelling Virtual Keyboard QWERTY Mode */
                  <div className="flex flex-col gap-2.5 items-center w-full max-w-2xl mx-auto mb-1.5 bg-zinc-950 p-3.5 border-2 border-white rounded-xl shadow-lg">
                    <p className="text-zinc-200 text-sm sm:text-base mb-1 font-extrabold tracking-wide text-center">👉 請使用虛擬鍵盤或實體鍵盤拼寫單字：</p>
                    
                    <div className="flex justify-center gap-1.5 mb-2.5 flex-wrap">
                      {Array.from({ length: activeQuiz?.correctAnswer?.length || 0 }).map((_, i) => {
                        const char = spellingInput[i] || "";
                        return (
                          <div 
                            key={i} 
                            className="w-10 h-12 sm:w-12 sm:h-14 bg-zinc-900 border border-white text-yellow-300 font-black text-xl sm:text-2xl md:text-3xl flex items-center justify-center rounded-lg uppercase font-mono shadow-[0_2px_0_#fff] transition-all"
                          >
                            {char}
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex gap-1 justify-center w-full">
                      {"QWERTYUIOP".split("").map(char => (
                        <button
                          key={char}
                          onClick={() => {
                            if (activeQuiz?.correctAnswer && spellingInput.length < activeQuiz.correctAnswer.length) {
                              setSpellingInput(prev => prev + char);
                            }
                          }}
                          disabled={isFeedbackShowing}
                          className="flex-1 py-2.5 sm:py-3.5 bg-black hover:bg-white hover:text-black border-2 border-white/90 font-mono text-lg sm:text-xl md:text-2xl font-black text-white rounded-md cursor-pointer active:scale-90 transition-all shadow-[0_1.5px_0_#fff]"
                        >
                          {char}
                        </button>
                      ))}
                    </div>
                    
                    <div className="flex gap-1 justify-center w-full max-w-[95%]">
                      {"ASDFGHJKL".split("").map(char => (
                        <button
                          key={char}
                          onClick={() => {
                            if (activeQuiz?.correctAnswer && spellingInput.length < activeQuiz.correctAnswer.length) {
                              setSpellingInput(prev => prev + char);
                            }
                          }}
                          disabled={isFeedbackShowing}
                          className="flex-1 py-2.5 sm:py-3.5 bg-black hover:bg-white hover:text-black border-2 border-white/90 font-mono text-lg sm:text-xl md:text-2xl font-black text-white rounded-md cursor-pointer active:scale-90 transition-all shadow-[0_1.5px_0_#fff]"
                        >
                          {char}
                        </button>
                      ))}
                    </div>

                    <div className="flex gap-1 justify-center w-full max-w-[90%]">
                      <button
                        onClick={() => setSpellingInput(prev => prev.slice(0, -1))}
                        disabled={isFeedbackShowing}
                        className="px-3 py-2.5 sm:py-3.5 bg-red-950 hover:bg-red-800 border-2 border-red-500 font-mono text-xs sm:text-sm md:text-base font-black text-red-200 rounded-md cursor-pointer active:scale-90 transition shadow-[0_1.5px_0_#f43f5e]"
                      >
                        ⌫ 退格
                      </button>
                      {"ZXCVBNM".split("").map(char => (
                        <button
                          key={char}
                          onClick={() => {
                            if (activeQuiz?.correctAnswer && spellingInput.length < activeQuiz.correctAnswer.length) {
                              setSpellingInput(prev => prev + char);
                            }
                          }}
                          disabled={isFeedbackShowing}
                          className="flex-1 py-2.5 sm:py-3.5 bg-black hover:bg-white hover:text-black border-2 border-white/90 font-mono text-lg sm:text-xl md:text-2xl font-black text-white rounded-md cursor-pointer active:scale-90 transition-all shadow-[0_1.5px_0_#fff]"
                        >
                          {char}
                        </button>
                      ))}
                      <button
                        onClick={() => setSpellingInput("")}
                        disabled={isFeedbackShowing}
                        className="px-3 py-2.5 sm:py-3.5 bg-zinc-900 hover:bg-zinc-700 border-2 border-white font-mono text-xs sm:text-sm md:text-base font-black text-white rounded-md cursor-pointer active:scale-90 transition shadow-[0_1.5px_0_#fff]"
                      >
                        重置
                      </button>
                    </div>
                    
                    <button
                      onClick={() => {
                        if (spellingInput.length === 0) return;
                        handleAnswerSubmit(spellingInput.toUpperCase());
                      }}
                      disabled={isFeedbackShowing || spellingInput.length === 0}
                      className={`w-full mt-2 py-3 border-2 border-white font-mono font-black text-sm sm:text-base md:text-lg transition-all rounded-lg active:scale-95 ${
                        activeQuiz?.correctAnswer && spellingInput.length === activeQuiz.correctAnswer.length
                          ? 'bg-yellow-400 text-black hover:bg-white hover:text-black cursor-pointer shadow'
                          : 'bg-zinc-900 text-zinc-500 border-zinc-700 cursor-not-allowed'
                      }`}
                    >
                      ［ 🔮 提交拼字答案 ］
                    </button>
                  </div>
                ) : activeQuiz?.subtype === 'sentence_reorder' ? (
                  /* Sentence Reordering Block Mode */
                  <div className="flex flex-col gap-3 items-center w-full max-w-3xl mx-auto mb-1.5 bg-zinc-950 p-4 border-2 border-white rounded-xl shadow-lg">
                    <p className="text-zinc-200 text-base sm:text-xl md:text-2xl mb-2 font-extrabold text-center">
                      👉 請點擊下方的字塊組合成正確的{activeQuiz?.type === 'english' ? '英文' : '中文'}句子：
                    </p>
                    
                    <div className="w-full bg-zinc-900/60 border border-dashed border-white/60 p-3 rounded-lg min-h-[80px] flex flex-wrap justify-center items-center gap-2 mb-3">
                      {reorderSelection.length === 0 ? (
                        <span className="text-zinc-500 text-base sm:text-lg md:text-xl font-bold">依正確語序依次點擊下方字塊...</span>
                      ) : (
                        reorderSelection.map((idx) => {
                          const word = activeQuiz?.scrambledWords?.[idx];
                          return (
                            <button
                              key={idx}
                              onClick={() => {
                                if (isFeedbackShowing) return;
                                setReorderSelection(prev => prev.filter(x => x !== idx));
                              }}
                              className="px-4 py-2 sm:px-5 sm:py-2.5 bg-indigo-600 hover:bg-red-600 text-white font-black border border-white font-sans text-base sm:text-lg md:text-2xl rounded-lg shadow-[0_2px_0_#fff] cursor-pointer transition active:scale-90"
                            >
                              {word}
                            </button>
                          );
                        })
                      )}
                    </div>

                    <div className="flex flex-wrap justify-center gap-2 mb-3">
                      {activeQuiz?.scrambledWords?.map((word, idx) => {
                        const isSelected = reorderSelection.includes(idx);
                        return (
                          <button
                            key={idx}
                            disabled={isSelected || isFeedbackShowing}
                            onClick={() => {
                              setReorderSelection(prev => [...prev, idx]);
                            }}
                            className={`px-4 py-2 sm:px-5 sm:py-2.5 border text-base sm:text-lg md:text-2xl font-black font-sans transition rounded-lg ${
                              isSelected 
                                ? 'bg-zinc-900 border-zinc-800 text-zinc-700 opacity-30 cursor-not-allowed' 
                                : 'bg-black border-white text-white hover:bg-white hover:text-black cursor-pointer shadow-[0_2px_0_#fff] active:scale-90'
                            }`}
                          >
                            {word}
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex gap-2.5 w-full justify-center">
                      <button
                        onClick={() => setReorderSelection([])}
                        disabled={isFeedbackShowing || reorderSelection.length === 0}
                        className="px-4 py-2 sm:px-5 sm:py-2.5 border border-white bg-black hover:bg-white hover:text-black font-sans font-extrabold text-sm sm:text-base md:text-xl rounded-lg cursor-pointer active:scale-95 transition"
                      >
                        全部清除 🧹
                      </button>
                      <button
                        onClick={() => {
                          const isEnglish = activeQuiz?.type === 'english';
                          const separator = isEnglish ? " " : "";
                          const suffix = isEnglish ? "." : "。";
                          const built = reorderSelection.map(idx => activeQuiz?.scrambledWords?.[idx] || "").join(separator);
                          handleAnswerSubmit(built + suffix);
                        }}
                        disabled={isFeedbackShowing || reorderSelection.length !== (activeQuiz?.scrambledWords?.length || 0)}
                        className={`px-5 py-2 sm:px-6 sm:py-2.5 border border-white font-sans font-black text-sm sm:text-base md:text-xl rounded-lg transition active:scale-95 ${
                          reorderSelection.length === (activeQuiz?.scrambledWords?.length || 0)
                            ? 'bg-yellow-400 text-black hover:bg-white hover:text-black cursor-pointer shadow'
                            : 'bg-zinc-950 text-zinc-600 border-zinc-800 cursor-not-allowed'
                        }`}
                      >
                        ［ ⚔️ 確認並發動攻擊 ］
                      </button>
                    </div>
                  </div>
                ) : activeQuiz?.subtype === 'match' ? (
                  /* Word Matching Columns Mode */
                  <div className="w-full max-w-3xl mx-auto bg-zinc-950 border-2 border-white rounded-xl p-4 mb-2 shadow-lg">
                    <p className="text-center font-sans text-zinc-200 text-base sm:text-xl md:text-2xl font-extrabold mb-4">👉 請點擊一個英文與一個中文，將它們兩兩配對消除：</p>
                    <div className="grid grid-cols-2 gap-4">
                      {/* Left Column - English */}
                      <div className="flex flex-col gap-2.5">
                        <span className="text-center font-black text-sm sm:text-base md:text-xl text-indigo-400 border-b border-indigo-400/20 pb-1.5 font-sans tracking-widest">ENGLISH 🔤</span>
                        {shuffledLeft.map((val) => {
                          const isMatched = matchedPairs.includes(val);
                          const isSelected = matchLeftSelected === val;
                          return (
                            <button
                              key={val}
                              disabled={isMatched || isFeedbackShowing}
                              onClick={() => handleMatchClick('left', val)}
                              className={`py-3 px-3 sm:py-4.5 sm:px-4 border border-white font-black font-sans text-center rounded-lg text-base sm:text-xl md:text-2xl lg:text-[28px] transition-all duration-100 active:scale-95 ${
                                isMatched 
                                  ? 'bg-zinc-900 border-zinc-800 text-zinc-700 line-through opacity-30 cursor-not-allowed'
                                  : isSelected
                                    ? matchErrorFlash 
                                      ? 'bg-red-600 border-red-500 text-white shadow-md shadow-red-500/50 scale-102' 
                                      : 'bg-indigo-600 text-white border-white shadow-md scale-102'
                                    : 'bg-black border-white text-white hover:bg-white hover:text-black cursor-pointer shadow-[0_2.5px_0_#fff]'
                              }`}
                            >
                              {val}
                            </button>
                          );
                        })}
                      </div>

                      {/* Right Column - Chinese */}
                      <div className="flex flex-col gap-2.5">
                        <span className="text-center font-black text-sm sm:text-base md:text-xl text-yellow-400 border-b border-yellow-400/20 pb-1.5 font-sans tracking-widest">中文翻譯 🧧</span>
                        {shuffledRight.map((val) => {
                          const pair = activeQuiz?.matchPairs?.find(p => p.right === val);
                           const isMatched = pair ? matchedPairs.includes(pair.left) : false;
                          const isSelected = matchRightSelected === val;
                          return (
                            <button
                              key={val}
                              disabled={isMatched || isFeedbackShowing}
                              onClick={() => handleMatchClick('right', val)}
                              className={`py-3 px-3 sm:py-4.5 sm:px-4 border border-white font-black font-sans text-center rounded-lg text-base sm:text-xl md:text-2xl lg:text-[28px] transition-all duration-100 active:scale-95 ${
                                isMatched 
                                  ? 'bg-zinc-900 border-zinc-800 text-zinc-700 line-through opacity-30 cursor-not-allowed'
                                  : isSelected
                                    ? matchErrorFlash 
                                      ? 'bg-red-600 border-red-500 text-white shadow-md shadow-red-500/50 scale-102' 
                                      : 'bg-yellow-500 text-black border-white shadow-md scale-102'
                                    : 'bg-black border-white text-white hover:bg-white hover:text-black cursor-pointer shadow-[0_2.5px_0_#fff]'
                              }`}
                            >
                              {val}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    
                    <div className="text-center text-sm sm:text-base text-zinc-400 mt-4 font-sans font-black tracking-widest">
                      🎯 配對進度: <span className="text-yellow-400 font-bold text-base sm:text-lg">{matchedPairs.length}</span> / {activeQuiz?.matchPairs?.length || 4}
                    </div>
                  </div>
                ) : (
                  /* Standard 4-Option Multiple Choice Grid */
                  <>
                    {/* Prompt Instruction */}
                    <p className="text-zinc-300 text-base sm:text-xl md:text-2xl mb-3 text-center font-black tracking-wider">
                      👉 選擇防禦指令以反擊：
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      {(activeQuiz?.options || [])
                        .filter(opt => opt !== samuraiExcludedOption && !archerExcludedOptions.includes(opt))
                        .map((opt, idx) => {
                          const isSelected = selectedOption === opt;
                        const isFlashing = flashingOption === opt;
                        
                        return (
                          <button
                            key={idx}
                            id={`option-btn-${idx}`}
                            onClick={() => handleAnswerSubmit(opt)}
                            disabled={isFeedbackShowing || !!flashingOption}
                            className={`py-4 px-4 sm:py-5 sm:px-6 text-left font-sans font-black transition-all duration-75 border-2 border-white rounded-xl flex flex-row items-center justify-between gap-3 active:scale-95 shadow-[0_4px_0_#fff] ${
                              isFlashing 
                                ? 'animate-rpg-flash' 
                                : isSelected 
                                  ? 'bg-white text-black shadow-lg scale-[1.02]' 
                                  : 'bg-black text-white hover:bg-white hover:text-black cursor-pointer'
                            }`}
                          >
                            <span className="flex items-center gap-3 sm:gap-4.5 w-full justify-start text-left">
                              <span 
                                className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg flex items-center justify-center shrink-0 border border-white/40 shadow-sm transition-transform duration-100"
                                style={{ 
                                  backgroundColor: idx === 0 ? '#b91c1c' : idx === 1 ? '#1d4ed8' : idx === 2 ? '#6b21a8' : '#9a3412'
                                }}
                              >
                                <span className="text-xl sm:text-2xl md:text-3xl select-none">
                                  {idx === 0 && "⚔️"}
                                  {idx === 1 && "🛡️"}
                                  {idx === 2 && "🔮"}
                                  {idx === 3 && "🏃"}
                                </span>
                              </span>
                              <span className="leading-tight break-words text-lg sm:text-xl md:text-2xl lg:text-[38px] font-black tracking-wide">{opt}</span>
                            </span>
                            <span className={`text-xs sm:text-sm md:text-base font-black px-2.5 py-1 rounded-md border shrink-0 uppercase tracking-wider whitespace-nowrap ${
                              idx === 0 ? 'bg-red-950 text-red-400 border-red-800' :
                              idx === 1 ? 'bg-blue-950 text-blue-400 border-blue-800' :
                              idx === 2 ? 'bg-purple-950 text-purple-400 border-purple-800' :
                              'bg-orange-950 text-orange-400 border-orange-800'
                            }`}>
                              {idx === 0 && "攻擊"}
                              {idx === 1 && "防禦"}
                              {idx === 2 && "魔法"}
                              {idx === 3 && "逃跑"}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}

                {/* Job Special Active Skills Section */}
                {isPlaying && activeQuiz && !isFeedbackShowing && !flashingOption && (
                  <div className="mt-4 pt-4 border-t border-zinc-800 flex flex-wrap gap-2 justify-center">
                    {/* Mage Teleport */}
                    {gameState.selectedJobId === 'mage' && !hasMageTeleportUsed && !bossCombo && (
                      <button
                        onClick={handleMageTeleport}
                        className="py-2 px-4 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white font-sans font-black text-xs rounded-xl flex items-center gap-2 border-2 border-indigo-400 shadow-[0_3px_0_#4338ca] active:translate-y-0.5 active:shadow-[0_1px_0_#4338ca] transition-all cursor-pointer"
                      >
                        <span>🧙‍♂️ 奧術魔法：［時空傳送］</span>
                        <span className="bg-indigo-950 text-indigo-300 text-[9px] px-1.5 py-0.5 rounded-full border border-indigo-800">每局一次</span>
                      </button>
                    )}

                    {/* Archer 50/50 */}
                    {gameState.selectedJobId === 'archer' && archerCharges > 0 && (
                      <button
                        onClick={handleArcher5050}
                        disabled={activeQuiz?.subtype === 'spelling' || activeQuiz?.subtype === 'match' || activeQuiz?.subtype === 'sentence_reorder' || archerExcludedOptions.length > 0}
                        className={`py-2 px-4 font-sans font-black text-xs rounded-xl flex items-center gap-2 border-2 transition-all cursor-pointer ${
                          activeQuiz?.subtype === 'spelling' || activeQuiz?.subtype === 'match' || activeQuiz?.subtype === 'sentence_reorder' || archerExcludedOptions.length > 0
                            ? 'bg-zinc-800 border-zinc-700 text-zinc-500 cursor-not-allowed opacity-60'
                            : 'bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white border-teal-400 shadow-[0_3px_0_#0f766e] active:translate-y-0.5 active:shadow-[0_1px_0_#0f766e]'
                        }`}
                      >
                        {activeQuiz?.subtype === 'spelling' || activeQuiz?.subtype === 'match' || activeQuiz?.subtype === 'sentence_reorder' ? (
                          <span>🏹 雙重鷹眼：［❌ 配對拼字不適用］</span>
                        ) : archerExcludedOptions.length > 0 ? (
                          <span>🏹 雙重鷹眼：［已發動］</span>
                        ) : (
                          <>
                            <span>🏹 雙重鷹眼：［二選一］</span>
                            <span className="bg-teal-950 text-teal-300 text-[9px] px-1.5 py-0.5 rounded-full border border-teal-800">剩餘 {archerCharges} 次</span>
                          </>
                        )}
                      </button>
                    )}

                    {/* Dancer Skip (Sacrifice Dance) */}
                    {gameState.selectedJobId === 'dancer' && (
                      <button
                        onClick={handleDancerSkip}
                        className="py-2 px-4 bg-gradient-to-r from-rose-600 to-pink-700 hover:from-rose-500 hover:to-pink-600 text-white font-sans font-black text-xs rounded-xl flex items-center gap-2 border-2 border-pink-400 shadow-[0_3px_0_#be185d] active:translate-y-0.5 active:shadow-[0_1px_0_#be185d] transition-all cursor-pointer"
                      >
                        <span>💃 獻祭之舞：［消耗 1 HP 答對］</span>
                        <span className="bg-pink-950 text-pink-300 text-[9px] px-1.5 py-0.5 rounded-full border border-pink-800">可重複使用</span>
                      </button>
                    )}
                  </div>
                )}

              </div>

              {/* FEEDBACK EXPLANATION OVERLAY */}
              <AnimatePresence>
                {isFeedbackShowing && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black border border-white flex flex-col items-center justify-center p-3 sm:p-4 text-center z-10 overflow-y-auto py-4"
                  >
                    <div className="mb-2">
                      {isAnswerCorrect ? (
                        <span className="text-4xl sm:text-5xl block animate-bounce">⚡💥⚔️</span>
                      ) : (
                        <span className="text-4xl sm:text-5xl block animate-pulse">🥀💔🛡️</span>
                      )}
                    </div>

                    {/* Dramatic Action Feedback */}
                    <h4 className={`text-lg sm:text-xl md:text-2xl font-black mb-3 font-mono tracking-wide ${isAnswerCorrect ? 'text-green-400' : 'text-red-500'}`}>
                      {isAnswerCorrect 
                        ? `💥 Jovan 發動了暴擊！${activeMonsterName || '怪獸'} HP -50！` 
                        : `🛡️ Jovan 守備失誤！遭受了 ${activeMonsterName || '怪獸'} 的強力反擊！`
                      }
                    </h4>

                    {/* Explanatory Scroll Box */}
                    <div className="bg-zinc-950 border border-double border-white p-4 max-w-xl text-left text-white text-sm sm:text-base mb-3 leading-relaxed w-full rounded-xl">
                      <p className="font-bold text-yellow-400 mb-1 text-sm">
                        📜 戰鬥結算紀錄：
                      </p>
                      <p className="mb-2 text-xs sm:text-sm font-bold">
                        正確解答是：<span className="text-green-400 font-black underline text-base sm:text-lg md:text-xl ml-1">{activeQuiz?.correctAnswer}</span>
                      </p>
                      <p className="text-zinc-300 italic text-xs sm:text-sm leading-relaxed border-t border-dashed border-zinc-800 pt-2 mt-1">
                        "{activeQuiz?.explanation}"
                      </p>
                    </div>

                    {/* Confirm to close and trigger combat results */}
                    <button
                      id="close-feedback-btn"
                      onClick={handleCloseFeedback}
                      className="px-6 py-3 bg-black border-2 border-white text-white hover:bg-white hover:text-black font-mono font-black text-sm sm:text-base md:text-lg transition duration-150 flex items-center gap-2 cursor-pointer active:scale-95 rounded-lg shadow-[0_2px_0_#fff]"
                    >
                      <span>［ {isAnswerCorrect ? '進行致命一擊 ⚔️' : '重新整裝防禦 🛡️'} ］</span>
                      <ChevronRight size={18} />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. ADAPTIVE Rest Floor / Merchant Shop Modal */}
      <AnimatePresence>
        {showMerchantShop && (
          <div className="fixed inset-0 bg-black/95 z-50 overflow-y-auto flex items-center justify-center p-2 sm:p-4 py-6 sm:py-12">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-lg bg-black border-[6px] border-white p-1 text-white font-mono relative shadow-2xl my-auto"
            >
              <div className="border-2 border-white p-5 flex flex-col bg-black">
                
                {/* 1. ELF MIKO ENCOUNTER */}
                {restType === 'elf' && (
                  <div className="text-center py-2">
                    <div className="text-6xl mb-4 animate-bounce">🧚</div>
                    <span className="text-pink-400 font-extrabold text-lg sm:text-xl tracking-wider block font-mono">
                      ✨ 聖潔精靈 Miko 的奇妙之泉 ✨
                    </span>
                    <p className="text-slate-300 text-xs sm:text-sm mt-4 leading-relaxed bg-zinc-950 border-2 border-dashed border-pink-500/50 p-4 rounded">
                      『 勇敢的 Jovan 勇士，你一路上辛苦了。讓我用精靈古老的森林搖籃曲，為你注入滿盈的治癒奇蹟吧！ 』
                    </p>
                    <div className="my-6 text-sm text-slate-400">
                      效果：<span className="text-pink-400 font-bold">完全恢復所有 HP ❤️ ({effectiveMaxHp}/{effectiveMaxHp})</span>
                    </div>
                    <button
                      onClick={() => {
                        setGameState(prev => ({ ...prev, hp: effectiveMaxHp }));
                        pushLog(`🧚 精靈 Miko 施展神聖全回復魔法！Jovan 的生命值完全恢復了 (${effectiveMaxHp}/${effectiveMaxHp})！❤️`);
                        if (GameBridge.currentScene && typeof GameBridge.currentScene.destroyMerchant === 'function') {
                          GameBridge.currentScene.destroyMerchant();
                        }
                        setShowMerchantShop(false);
                      }}
                      className="w-full py-4 bg-pink-600 text-white font-bold border-2 border-white hover:bg-white hover:text-black transition cursor-pointer text-sm uppercase"
                    >
                      ［ ✨ 接受 Miko 的神聖全回復治癒 ］
                    </button>
                  </div>
                )}

                {/* 2. CAMPFIRE ENCOUNTER */}
                {restType === 'campfire' && (
                  <div className="text-center py-2">
                    <div className="text-6xl mb-4 animate-pulse">🔥</div>
                    <span className="text-orange-400 font-extrabold text-lg sm:text-xl tracking-wider block font-mono">
                      🪵 秘境營火營地 🪵
                    </span>
                    <p className="text-slate-300 text-xs sm:text-sm mt-4 leading-relaxed bg-zinc-950 border-2 border-dashed border-orange-500/50 p-4 rounded">
                      劈啪作響的溫暖柴火驅散了古老高塔中的陰冷寒風。在此處坐火小憩片刻，緊繃的心靈與身體得到了些許喘息。
                    </p>
                    <div className="my-6 text-sm text-slate-400">
                      效果：<span className="text-orange-400 font-bold">恢復 1 格生命值 ❤️</span>
                      <div className="text-xs text-slate-500 mt-1">目前生命: {gameState.hp}/{effectiveMaxHp}</div>
                    </div>
                    <button
                      onClick={() => {
                        if (gameState.hp >= effectiveMaxHp) {
                          pushLog(`🔥 Jovan 在營火旁烤火聊天，雖然生命值已滿，但精神倍增！`);
                        } else {
                          setGameState(prev => ({ ...prev, hp: Math.min(effectiveMaxHp, prev.hp + 1) }));
                          pushLog(`🔥 Jovan 在營火旁舒適地休息了一會，生命值恢復了 1 點。❤️`);
                        }
                        if (GameBridge.currentScene && typeof GameBridge.currentScene.destroyMerchant === 'function') {
                          GameBridge.currentScene.destroyMerchant();
                        }
                        setShowMerchantShop(false);
                      }}
                      className="w-full py-4 bg-orange-600 text-white font-bold border-2 border-white hover:bg-white hover:text-black transition cursor-pointer text-sm uppercase"
                    >
                      ［ 🪵 坐火休息（回復 1 點 HP） ］
                    </button>
                  </div>
                )}

                {/* 3. RETRO MERCHANT SHOP */}
                {restType === 'merchant' && (
                  <>
                    {/* Shop Header */}
                    <div className="mb-4 border-b-2 border-dashed border-white/40 pb-3 text-center">
                      <span className="text-yellow-400 font-bold text-lg sm:text-xl tracking-wider block font-mono">
                        🧙‍♂️ 秘境流浪商店 🧙‍♂️
                      </span>
                      <span className="text-emerald-400 font-extrabold text-[11px] uppercase tracking-widest block mt-1">
                        『 孩子，購買你需要的冒險補給。但記住，我每一層只出售一件神秘寶物。 』
                      </span>
                    </div>

                    {/* Player Gold Balance Check */}
                    <div className="mb-4 flex justify-between items-center bg-slate-900 px-3 py-2 rounded-lg border border-slate-800 text-xs text-slate-300 font-bold">
                      <span>Jovan 目前的金幣餘額：</span>
                      <span className="text-yellow-400 text-sm font-extrabold flex items-center gap-1">
                        {gameState.goldCoins} <span className="text-xs">🟡</span>
                      </span>
                    </div>

                    {/* Items Catalog */}
                    <div className="space-y-3 mb-5 max-h-[300px] overflow-y-auto pr-1">
                      
                      {/* Item 1: Strawberry Milkshake (shakePrice Gold) */}
                      <div className="bg-zinc-950 border-2 border-slate-800 p-3 flex items-center justify-between gap-3 hover:border-slate-700 transition">
                        <div className="flex-1">
                          <div className="text-sm font-bold text-yellow-400 flex items-center gap-1.5">
                            <span>🥛 特製草莓奶昔</span>
                            <span className="text-xs text-slate-500 font-normal">| 恢復 1 HP</span>
                          </div>
                          <div className="text-[11px] text-slate-300 mt-1">效果：恢復 1 點生命值 ❤️</div>
                          <div className="text-[10px] text-slate-500 italic mt-0.5">目前生命: {gameState.hp}/{effectiveMaxHp}</div>
                        </div>
                        <button
                          onClick={() => handleBuyItem('shake', shakePrice)}
                          disabled={gameState.goldCoins < shakePrice || gameState.hp >= effectiveMaxHp}
                          className={`px-3 py-2 text-xs font-mono font-bold border border-white transition ${
                            gameState.goldCoins >= shakePrice && gameState.hp < effectiveMaxHp
                              ? 'bg-white text-black hover:bg-black hover:text-white cursor-pointer'
                              : 'bg-zinc-900 text-zinc-600 border-zinc-700 cursor-not-allowed opacity-50'
                          }`}
                        >
                          {gameState.hp >= effectiveMaxHp ? "❤️ 已滿血" : `${shakePrice} 🟡 購買`}
                        </button>
                      </div>

                      {/* Item 2: Heart Crystal (crystalPrice Gold) */}
                      <div className="bg-zinc-950 border-2 border-slate-800 p-3 flex items-center justify-between gap-3 hover:border-slate-700 transition">
                        <div className="flex-1">
                          <div className="text-sm font-bold text-pink-400 flex items-center gap-1.5">
                            <span>💖 活力心之結晶</span>
                            <span className="text-xs text-slate-500 font-normal">| 上限突破</span>
                          </div>
                          <div className="text-[11px] text-slate-300 mt-1">效果：最大生命上限 +1 ❤️ (最高 {shopMaxHpLimit})</div>
                          <div className="text-[10px] text-slate-500 italic mt-0.5">目前最大生命: {gameState.maxHp} {gameState.selectedJobId === 'dwarf' ? '(外加矮人加成 +2)' : ''}</div>
                        </div>
                        <button
                          onClick={() => handleBuyItem('crystal', crystalPrice)}
                          disabled={gameState.goldCoins < crystalPrice || gameState.maxHp >= shopMaxHpLimit}
                          className={`px-3 py-2 text-xs font-mono font-bold border border-white transition ${
                            gameState.goldCoins >= crystalPrice && gameState.maxHp < shopMaxHpLimit
                              ? 'bg-white text-black hover:bg-black hover:text-white cursor-pointer'
                              : 'bg-zinc-900 text-zinc-600 border-zinc-700 cursor-not-allowed opacity-50'
                          }`}
                        >
                          {gameState.maxHp >= shopMaxHpLimit ? "🚫 已達上限" : `${crystalPrice} 🟡 購買`}
                        </button>
                      </div>

                      {/* Item 3: Wisdom Potion (100 Gold) */}
                      <div className="bg-zinc-950 border-2 border-slate-800 p-3 flex items-center justify-between gap-3 hover:border-slate-700 transition">
                        <div className="flex-1">
                          <div className="text-sm font-bold text-sky-400 flex items-center gap-1.5">
                            <span>✨ 知識神聖藥水</span>
                            <span className="text-xs text-slate-500 font-normal">| 智慧經驗</span>
                          </div>
                          <div className="text-[11px] text-slate-300 mt-1">效果：立刻獲得 +300 點 XP 📖</div>
                        </div>
                        <button
                          onClick={() => handleBuyItem('potion', potionPrice)}
                          disabled={gameState.goldCoins < potionPrice}
                          className={`px-3 py-2 text-xs font-mono font-bold border border-white transition ${
                            gameState.goldCoins >= potionPrice
                              ? 'bg-white text-black hover:bg-black hover:text-white cursor-pointer'
                              : 'bg-zinc-900 text-zinc-600 border-zinc-700 cursor-not-allowed opacity-50'
                          }`}
                        >
                          {potionPrice} 🟡 購買
                        </button>
                      </div>

                    </div>

                    {/* Leave Button */}
                    <button
                      id="merchant-leave-btn"
                      onClick={handleCloseMerchantShop}
                      className="py-3 px-4 text-center font-mono font-bold text-sm bg-black text-white hover:bg-white hover:text-black border-2 border-white cursor-pointer transition w-full"
                    >
                      ［ 🏃 離開商店 ］
                    </button>
                  </>
                )}

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. RENAME MODAL */}
      <AnimatePresence>
        {showRenameModal && (
          <div className="fixed inset-0 bg-slate-950/85 z-50 overflow-y-auto flex items-center justify-center p-2 sm:p-4 py-6 sm:py-12">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border-4 border-slate-700 p-6 rounded-2xl w-full max-w-sm text-center shadow-lg my-auto"
            >
              <div className="text-4xl mb-2">✏️</div>
              <h3 className="text-xl font-bold text-slate-200 mb-1">輸入 Jovan 的勇士名字</h3>
              <p className="text-xs text-slate-400 mb-4">這會同步更改你在雲端排行榜上的暱稱哦！</p>
              
              <input 
                id="rename-input-field"
                type="text" 
                maxLength={15}
                value={tempHeroName}
                onChange={(e) => setTempHeroName(e.target.value)}
                placeholder="請輸入名字..."
                className="w-full bg-slate-950 border-2 border-slate-800 rounded-xl px-4 py-3 text-center text-slate-200 font-bold focus:border-indigo-500 mb-4"
              />

              <div className="flex gap-2">
                <button 
                  id="cancel-rename-btn"
                  onClick={() => setShowRenameModal(false)}
                  className="flex-1 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-750 font-bold text-sm text-slate-400 transition"
                >
                  取消
                </button>
                <button 
                  id="confirm-rename-btn"
                  onClick={handleUpdateNameSubmit}
                  disabled={tempHeroName.trim().length === 0}
                  className="flex-1 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 font-bold text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  確認修改
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5.5. JOB SELECTOR MODAL */}
      <AnimatePresence>
        {showJobSelectorModal && (
          <div className="fixed inset-0 bg-slate-950/90 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-6 py-10">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-slate-900 border-4 border-indigo-900/60 p-5 sm:p-8 rounded-2xl w-full max-w-4xl shadow-2xl my-auto relative"
            >
              {/* Close Button */}
              <button
                onClick={() => setShowJobSelectorModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-750 p-1.5 rounded-full transition cursor-pointer"
              >
                <X size={18} />
              </button>

              <div className="text-center mb-6">
                <span className="text-4xl">👑</span>
                <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-indigo-400 mt-2 font-sans">
                  勇士職業公會 • 轉職聖殿
                </h3>
                <p className="text-xs text-slate-400 mt-2">
                  冒險生涯累積的總經驗值（XP）會永久解除新職業的封印。
                </p>
                <div className="mt-3 inline-flex items-center gap-2 bg-indigo-950/50 border border-indigo-800/40 px-4 py-1.5 rounded-full text-xs font-bold text-indigo-300">
                  <span>✨ 冒險生涯累積：</span>
                  <span className="text-yellow-400 font-mono text-sm">{gameState.totalXP}</span>
                  <span>XP</span>
                </div>
              </div>

              {/* Grid list of jobs */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[50vh] overflow-y-auto pr-1 select-none">
                {JOBS.map((job) => {
                  const isUnlocked = gameState.totalXP >= job.unlockXP;
                  const isCurrent = (gameState.selectedJobId || 'warrior') === job.id;
                  
                  return (
                    <div
                      key={job.id}
                      onClick={() => isUnlocked && handleSelectJob(job.id)}
                      className={`p-4 rounded-xl border-2 transition-all relative flex flex-col justify-between h-[180px] ${
                        isCurrent 
                          ? 'bg-gradient-to-b from-indigo-950 to-slate-950 border-yellow-400 shadow-[0_4px_12px_rgba(234,179,8,0.2)]' 
                          : isUnlocked 
                            ? 'bg-slate-950/70 border-slate-850 hover:border-indigo-500 hover:bg-indigo-950/20 cursor-pointer' 
                            : 'bg-zinc-950/50 border-zinc-900/60 opacity-60'
                      }`}
                    >
                      <div>
                        {/* Header: Emoji & Name */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <HeroPixelPreview jobId={job.id} size={40} className="border-2 border-indigo-950 bg-indigo-950/40 shrink-0" />
                            <div>
                              <h4 className="text-sm font-black text-slate-100 flex items-center gap-1">
                                <span>{job.emoji}</span>
                                <span>{job.name}</span>
                              </h4>
                              <p className="text-[10px] text-slate-500 font-mono tracking-wider uppercase">{job.englishName}</p>
                            </div>
                          </div>

                          {/* Status Badge */}
                          {isCurrent && (
                            <span className="text-[9px] font-black text-slate-950 bg-yellow-400 px-1.5 py-0.5 rounded border border-yellow-300">
                              當前職業
                            </span>
                          )}
                          {!isUnlocked && (
                            <span className="text-[9px] font-bold text-rose-400 bg-rose-950/40 px-1.5 py-0.5 rounded border border-rose-900/40 flex items-center gap-1">
                              🔒 需 {job.unlockXP} XP
                            </span>
                          )}
                          {isUnlocked && !isCurrent && (
                            <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-900/40">
                              已解鎖
                            </span>
                          )}
                        </div>

                        {/* Skill description */}
                        <div className="mt-3 bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/40">
                          <p className="text-[11px] text-yellow-300 font-extrabold flex items-center gap-1">
                            <span>✨ 專屬被動：【{job.skillName}】</span>
                          </p>
                          <p className="text-[10px] text-slate-300 mt-1 leading-relaxed">
                            {job.skillDesc}
                          </p>
                        </div>
                      </div>

                      {/* Action button at bottom inside card */}
                      <div className="mt-3">
                        {isCurrent ? (
                          <div className="w-full text-center text-[10px] font-bold text-yellow-400 bg-yellow-950/30 py-1.5 rounded-lg border border-yellow-900/40">
                            正在穿戴此天賦
                          </div>
                        ) : isUnlocked ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectJob(job.id);
                            }}
                            className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black rounded-lg transition-all shadow-[0_2px_0_#4338ca] hover:translate-y-[-1px] cursor-pointer"
                          >
                            切換為該職業
                          </button>
                        ) : (
                          <div className="w-full text-center text-[10px] font-bold text-slate-500 bg-zinc-900/50 py-1.5 rounded-lg border border-zinc-800/40">
                            還差 {job.unlockXP - gameState.totalXP} XP 解鎖
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Close Action at footer */}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowJobSelectorModal(false)}
                  className="px-6 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 text-sm font-bold rounded-xl transition cursor-pointer"
                >
                  關閉轉職公會
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 6. BOSS DEFEATED CELEBRATION (Rare Loot 💎 Overlay) */}
      <AnimatePresence>
        {showRareLootCelebration && rareLootReward && (
          <div className="fixed inset-0 bg-black/95 z-50 overflow-y-auto flex items-center justify-center p-2 sm:p-4 py-6 sm:py-12">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-zinc-950 border-[6px] border-amber-500 p-1 rounded-2xl w-full max-w-md text-center shadow-2xl relative overflow-hidden my-auto"
            >
              <div className="border-2 border-amber-500 rounded-xl p-6 bg-zinc-950 flex flex-col items-center">
                {/* Visual sparkles */}
                <span className="text-6xl animate-bounce mb-3">💎✨🏆</span>
                
                <h3 className="text-2xl font-extrabold text-amber-400 mb-1 tracking-widest font-mono uppercase">
                  ［ 擊敗守護者！ ］
                </h3>
                <p className="text-xs text-slate-400 font-bold tracking-widest uppercase mb-4 text-emerald-400">
                  ★ 獲得 BOSS 級別稀有戰利品 ★
                </p>

                {/* Loot Items Display */}
                <div className="w-full bg-black border-4 border-double border-amber-500 p-4 rounded-xl space-y-3.5 mb-6 text-left">
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-mono">🎁 稀有寶石獎勵：</span>
                    <span className="text-yellow-400 font-extrabold font-mono text-sm">+{rareLootReward.gold} Gold Coins 🟡</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-mono">📖 領悟學識經驗：</span>
                    <span className="text-indigo-400 font-extrabold font-mono text-sm">+{rareLootReward.xp} XP 💎</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-mono">❤️ 生命上限增加：</span>
                    <span className="text-rose-500 font-extrabold font-mono text-sm">+1 Max HP 上限 ❤️</span>
                  </div>

                  <div className="border-t border-white/10 pt-2.5">
                    <div className="text-[11px] text-slate-400 font-mono text-center">
                      📈 動態難度微調 (DDS)：
                    </div>
                    <div className="text-xs text-center text-amber-300 font-extrabold mt-1 leading-relaxed">
                      {rareLootReward.slopeChange}
                    </div>
                  </div>

                </div>

                <button
                  onClick={() => setShowRareLootCelebration(false)}
                  className="px-8 py-3 bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold rounded-lg transition cursor-pointer active:scale-95 text-sm"
                >
                  收下寶物，繼續登塔！ 👉
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Dynamic fullscreen attack/damage dramatic visual effects */}
      <AnimatePresence>
        {showSlashEffect === 'correct' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 1, 0], scale: [0.8, 1.15, 1, 1.25] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="fixed inset-0 pointer-events-none z-[100] bg-white/45 flex items-center justify-center overflow-hidden"
          >
            {/* Multiple laser / sword slash streaks */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div 
                initial={{ rotate: -45, scaleX: 0 }}
                animate={{ scaleX: [0, 2.5, 0], x: [-300, 300] }}
                transition={{ duration: 0.35 }}
                className="w-[200%] h-16 bg-gradient-to-r from-transparent via-yellow-300 to-transparent shadow-[0_0_50px_#fde047] absolute"
              />
              <motion.div 
                initial={{ rotate: 45, scaleX: 0 }}
                animate={{ scaleX: [0, 2.5, 0], x: [300, -300] }}
                transition={{ duration: 0.35, delay: 0.1 }}
                className="w-[200%] h-16 bg-gradient-to-r from-transparent via-green-400 to-transparent shadow-[0_0_50px_#22c55e] absolute"
              />
              <motion.div 
                initial={{ rotate: -15, scaleX: 0 }}
                animate={{ scaleX: [0, 2.2, 0], x: [-250, 250] }}
                transition={{ duration: 0.35, delay: 0.2 }}
                className="w-[200%] h-16 bg-gradient-to-r from-transparent via-purple-500 to-transparent shadow-[0_0_50px_#a855f7] absolute"
              />
              <motion.div 
                initial={{ rotate: 105, scaleX: 0 }}
                animate={{ scaleX: [0, 2.2, 0], y: [-250, 250] }}
                transition={{ duration: 0.35, delay: 0.25 }}
                className="w-[200%] h-16 bg-gradient-to-r from-transparent via-orange-500 to-transparent shadow-[0_0_50px_#f97316] absolute"
              />
            </div>

            {/* Burst of giant golden/emerald stars and sparkles */}
            <div className="flex gap-4">
              {["💥", "✨", "⚔️", "🌟", "🔥", "⚡"].map((emoji, idx) => (
                <motion.span
                  key={idx}
                  initial={{ scale: 0, y: 150, rotate: 0 }}
                  animate={{ 
                    scale: [0, 4.5, 3, 0], 
                    y: [150, -250 - Math.random() * 200], 
                    x: [(idx - 2.5) * 110, (idx - 2.5) * 160 + (Math.random() - 0.5) * 80],
                    rotate: [0, idx * 120 + 360] 
                  }}
                  transition={{ duration: 0.75, ease: "easeOut" }}
                  className="text-8xl sm:text-[10rem] md:text-[12rem] lg:text-[14rem] drop-shadow-[0_10px_25px_rgba(253,224,71,0.6)] select-none"
                >
                  {emoji}
                </motion.span>
              ))}
            </div>
          </motion.div>
        )}
        {showSlashEffect === 'wrong' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 1, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="fixed inset-0 pointer-events-none z-[100] bg-red-950/65 flex items-center justify-center overflow-hidden"
          >
            {/* Full screen red flashing filter and heavy vibration shake */}
            <motion.div 
              animate={{ opacity: [1, 0.2, 1, 0.2, 1, 0.2, 1, 0] }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0 bg-red-600/50"
            />
            
            {/* Big Broken Shield or Hurt Emoji impact */}
            <div className="flex flex-col items-center gap-6">
              <motion.span
                initial={{ scale: 0, rotate: 0 }}
                animate={{ 
                  scale: [0, 5, 4, 6, 0], 
                  rotate: [-15, 25, -25, 10, 0], 
                  x: [0, -15, 15, -15, 15, 0],
                  y: [0, 10, -10, 10, -10, 0]
                }}
                transition={{ duration: 0.75, ease: "easeInOut" }}
                className="text-9xl sm:text-[13rem] md:text-[17rem] lg:text-[22rem] drop-shadow-[0_10px_35px_rgba(239,68,68,0.85)] select-none"
              >
                💔🛡️⚡
              </motion.span>
              <motion.div
                initial={{ y: 80, opacity: 0 }}
                animate={{ y: [80, -20], opacity: [0, 1, 1, 0] }}
                transition={{ duration: 0.75 }}
                className="text-red-500 font-mono font-black text-2xl sm:text-5xl bg-black border-4 border-red-500 rounded-3xl px-12 py-5 shadow-2xl shadow-red-600/50"
              >
                HP -1 ❤️
              </motion.div>
            </div>
          </motion.div>
        )}
        {showSlashEffect === 'limit_break' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 1, 0], scale: [0.8, 1.2, 1, 1.3] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="fixed inset-0 pointer-events-none z-[100] bg-yellow-400/30 flex items-center justify-center overflow-hidden"
          >
            <motion.div 
              animate={{ opacity: [1, 0.4, 1, 0.4, 1, 0] }}
              transition={{ duration: 1.2 }}
              className="absolute inset-0 bg-yellow-400/20"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div 
                initial={{ rotate: -30, scaleX: 0 }}
                animate={{ scaleX: [0, 3, 0], x: [-500, 500] }}
                transition={{ duration: 0.6 }}
                className="w-[300%] h-32 bg-gradient-to-r from-transparent via-white to-transparent shadow-[0_0_100px_#f59e0b] absolute"
              />
              <motion.div 
                initial={{ rotate: 60, scaleX: 0 }}
                animate={{ scaleX: [0, 3, 0], x: [500, -500] }}
                transition={{ duration: 0.6, delay: 0.25 }}
                className="w-[300%] h-32 bg-gradient-to-r from-transparent via-white to-transparent shadow-[0_0_100px_#fbbf24] absolute"
              />
            </div>
            <div className="flex flex-col items-center gap-6">
              <motion.span
                initial={{ scale: 0, rotate: 0 }}
                animate={{ 
                  scale: [0, 6, 5, 7, 0], 
                  rotate: [0, 360, 720] 
                }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="text-9xl sm:text-[15rem] md:text-[20rem] lg:text-[25rem] drop-shadow-[0_0_55px_#f59e0b] select-none"
              >
                💥🐉🔥
              </motion.span>
              <motion.div
                initial={{ y: 80, opacity: 0 }}
                animate={{ y: [80, 0], opacity: [0, 1, 1, 0] }}
                transition={{ duration: 1.2 }}
                className="text-amber-400 font-extrabold text-3xl sm:text-6xl bg-slate-950 border-8 border-amber-500 rounded-3xl px-16 py-6 shadow-2xl shadow-yellow-500/50 uppercase tracking-widest font-mono"
              >
                ⚡ 極限超必殺技 LIMIT BREAK ⚡
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 7. PET SELECTION LIBRARY MODAL */}
      <AnimatePresence>
        {showPetSelectorModal && (
          <div className="fixed inset-0 bg-black/95 z-50 overflow-y-auto flex items-center justify-center p-2 sm:p-4 py-6 sm:py-12">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-zinc-950 border-[6px] border-amber-500 rounded-3xl w-full max-w-4xl p-1 shadow-2xl my-auto relative"
            >
              <div className="border-2 border-amber-500 rounded-2xl p-5 sm:p-8 bg-zinc-950 flex flex-col h-full max-h-[85vh] overflow-y-auto">
                <div className="text-center mb-6">
                  <span className="text-5xl">🎒🐾✨</span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-amber-400 mt-2 tracking-widest font-mono">
                    魔寵伴侶與召喚獸收集庫
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-xl mx-auto leading-relaxed">
                    在爬塔過程中，你有機率遇見野生的傳奇魔寵！回答 5 條限時挑戰題目即可成功捕捉。
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                  {PETS_DATABASE.map(pet => {
                    const isCaptured = gameState.capturedPetIds.includes(pet.id);
                    const isEquipped = gameState.equippedPetId === pet.id;
                    
                    return (
                      <div 
                        key={pet.id} 
                        className={`p-4 rounded-2xl border-4 flex gap-4 transition relative ${
                          isEquipped
                            ? 'border-yellow-400 bg-amber-950/20 shadow-[0_0_15px_rgba(234,179,8,0.25)]'
                            : isCaptured
                              ? 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
                              : 'border-zinc-900 bg-zinc-950/60 opacity-60'
                        }`}
                      >
                        {/* Pet icon & element */}
                        <div className="flex flex-col items-center gap-2">
                          <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-3xl border-2 ${
                            isCaptured ? 'bg-slate-950 border-amber-500/50' : 'bg-zinc-900 border-zinc-800'
                          }`}>
                            {pet.emoji}
                          </div>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
                            {getElementChineseName(pet.element)}
                          </span>
                        </div>

                        {/* Pet metadata */}
                        <div className="flex-1 flex flex-col justify-between text-xs">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-sm text-slate-100">{pet.name}</span>
                              {isEquipped && (
                                <span className="text-[9px] bg-yellow-400 text-slate-950 px-1.5 py-0.2 rounded font-black animate-pulse">
                                  攜帶中
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-amber-500 font-extrabold mt-0.5">
                              技能：【{pet.skillName}】
                            </p>
                            <p className="text-[10px] text-slate-300 mt-1 leading-tight">
                              {pet.skillDescription}
                            </p>
                          </div>

                          {/* Pet Actions */}
                          <div className="mt-3 pt-2 border-t border-slate-900 flex justify-end gap-2">
                            {isCaptured ? (
                              isEquipped ? (
                                <button
                                  onClick={() => {
                                    RetroSFX.playClick();
                                    setGameState(prev => ({ ...prev, equippedPetId: null }));
                                    pushLog(`🐾 Jovan 卸下了魔寵伴侶：${pet.emoji} 【${pet.name}】。`);
                                  }}
                                  className="px-3 py-1.5 bg-zinc-900 text-zinc-400 hover:bg-zinc-800 font-bold rounded-lg cursor-pointer transition text-[11px]"
                                >
                                  卸下 (Unequip)
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    RetroSFX.playClick();
                                    setGameState(prev => ({ ...prev, equippedPetId: pet.id }));
                                    pushLog(`🐾 Jovan 裝備了魔寵伴侶：${pet.emoji} 【${pet.name}】，牠將伴隨你一同攀登高塔！`);
                                  }}
                                  className="px-3 py-1.5 bg-amber-500 text-slate-950 font-extrabold rounded-lg hover:bg-amber-400 cursor-pointer transition text-[11px]"
                                >
                                  帶領出戰 (Equip)
                                </button>
                              )
                            ) : (
                              <div className="px-3 py-1.5 bg-zinc-900/80 text-zinc-500 border border-zinc-800 rounded-lg text-[11px] font-bold">
                                🔒 需在無限塔中遭遇並答題收服
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 flex justify-center">
                  <button
                    onClick={() => {
                      RetroSFX.playClick();
                      setShowPetSelectorModal(false);
                    }}
                    className="px-8 py-3 bg-zinc-900 hover:bg-zinc-800 text-slate-300 font-bold border-2 border-slate-700 rounded-xl transition cursor-pointer active:scale-95 text-sm"
                  >
                    ［ 🚪 關閉魔寵收集庫 ］
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 8. PET CAPTURE CELEBRATION MODAL */}
      <AnimatePresence>
        {showPetCaptureCelebration && (
          <div className="fixed inset-0 bg-black/95 z-50 overflow-y-auto flex items-center justify-center p-2 sm:p-4 py-6 sm:py-12">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-zinc-950 border-[6px] border-yellow-400 p-1 rounded-3xl w-full max-w-md text-center shadow-2xl relative overflow-hidden my-auto"
            >
              <div className="border-2 border-yellow-400 rounded-2xl p-6 bg-zinc-950 flex flex-col items-center">
                <span className="text-7xl animate-bounce mb-4">💖🐾✨</span>
                
                <h3 className="text-2xl font-extrabold text-yellow-300 mb-1 tracking-widest font-mono uppercase">
                  ［ 收服成功！ ］
                </h3>
                <p className="text-xs text-slate-400 font-bold tracking-widest uppercase mb-6 text-emerald-400">
                  ★ 獲得了新魔寵伴侶與召喚獸 ★
                </p>

                <div className="w-full bg-slate-900 border-2 border-slate-800 p-5 rounded-2xl flex flex-col items-center gap-3 mb-6">
                  <div className="w-20 h-20 bg-amber-500/10 border-4 border-yellow-400 rounded-2xl flex items-center justify-center text-5xl shadow-lg shadow-yellow-500/20 animate-pulse">
                    {showPetCaptureCelebration.emoji}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-yellow-300">{showPetCaptureCelebration.name}</h4>
                    <p className="text-xs text-amber-500 font-extrabold mt-1">
                      技能：【{showPetCaptureCelebration.skillName}】
                    </p>
                    <p className="text-[11px] text-slate-300 mt-2 max-w-[280px] leading-relaxed mx-auto">
                      "{showPetCaptureCelebration.description}"
                    </p>
                  </div>
                </div>

                <p className="text-[10px] text-slate-400 mb-6 max-w-xs leading-tight">
                  🎉 太棒了！你連續答對了 5 條限時問題！已經成功將牠帶回你的魔寵收集庫中，你隨時可以在首頁選擇裝備牠喔！
                </p>

                <button
                  onClick={() => setShowPetCaptureCelebration(null)}
                  className="px-8 py-3 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-mono font-black rounded-xl transition cursor-pointer active:scale-95 text-sm shadow-md shadow-yellow-500/20"
                >
                  太棒了，繼續挑戰！ 🐾👉
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Developer Mode Control Panel Modal */}
      <AnimatePresence>
        {showDevPanel && (
          <div className="fixed inset-0 bg-black/85 z-50 overflow-y-auto flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-950 border-4 border-slate-700 p-5 rounded-2xl w-full max-w-md shadow-2xl relative"
            >
              <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-4">
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5 font-mono">
                  🛠️ 開發者測試控制台
                </h3>
                <button
                  onClick={() => setShowDevPanel(false)}
                  className="text-slate-400 hover:text-white font-bold text-sm cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {!isDevModeUnlocked ? (
                /* Password Entry Screen */
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (devPassword === "10030627") {
                      setIsDevModeUnlocked(true);
                      setDevError("");
                      pushLog("🛠️ [開發者] 密碼驗證成功！已解鎖開發者測試控制台。");
                    } else {
                      setDevError("❌ 密碼錯誤！請重新輸入。");
                      RetroSFX.playHit();
                    }
                  }}
                  className="space-y-4"
                >
                  <p className="text-xs text-slate-400 leading-relaxed font-sans">
                    本區域僅供關卡測試與學科調校使用。請輸入管理員解鎖密碼：
                  </p>
                  <div>
                    <input
                      type="password"
                      placeholder="請輸入 8 位數密碼"
                      value={devPassword}
                      onChange={(e) => setDevPassword(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-indigo-500"
                      autoFocus
                    />
                    {devError && (
                      <p className="text-red-500 text-[10px] mt-1 font-bold">{devError}</p>
                    )}
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => setShowDevPanel(false)}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-400 text-xs font-bold rounded-lg cursor-pointer"
                    >
                      取消
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg cursor-pointer"
                    >
                      驗證解鎖
                    </button>
                  </div>
                </form>
              ) : (
                /* Developer Controls Panel Screen */
                <div className="space-y-5">
                  {/* Jump Floor Selector */}
                  <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-850 space-y-3">
                    <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider font-mono">
                      🌟 直接跳轉樓層
                    </h4>
                    <p className="text-[10px] text-slate-400 font-sans">
                      您可以直接輸入或調整 Jovan 空間跳躍至任何指定樓層。
                    </p>
                    
                    {/* Direct Numeric Input Box */}
                    <div className="flex items-center justify-between gap-3 bg-slate-950 p-2 rounded-lg border border-slate-800">
                      <span className="text-xs text-slate-400 font-semibold">跳轉至指定樓層：</span>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min="1"
                          max="999"
                          value={gameState.currentFloor}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            if (!isNaN(val) && val >= 1) {
                              setGameState(prev => ({ 
                                ...prev, 
                                currentFloor: val, 
                                maxFloorReached: Math.max(prev.maxFloorReached, val) 
                              }));
                              pushLog(`🛠️ [開發者] 樓層跳轉至：第 ${val} 層`);
                            }
                          }}
                          className="w-16 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-center font-mono font-bold text-sm text-yellow-300 focus:outline-none focus:border-yellow-400"
                        />
                        <span className="text-xs text-slate-400 font-bold">層</span>
                      </div>
                    </div>

                    {/* Step Controls */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const nextF = Math.max(1, gameState.currentFloor - 5);
                          setGameState(prev => ({ ...prev, currentFloor: nextF, maxFloorReached: Math.max(prev.maxFloorReached, nextF) }));
                          pushLog(`🛠️ [開發者] 樓層跳轉至：第 ${nextF} 層`);
                        }}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold rounded cursor-pointer"
                      >
                        -5 層
                      </button>
                      <button
                        onClick={() => {
                          const nextF = Math.max(1, gameState.currentFloor - 1);
                          setGameState(prev => ({ ...prev, currentFloor: nextF, maxFloorReached: Math.max(prev.maxFloorReached, nextF) }));
                          pushLog(`🛠️ [開發者] 樓層跳轉至：第 ${nextF} 層`);
                        }}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold rounded cursor-pointer"
                      >
                        -1 層
                      </button>
                      <span className="flex-1 text-center font-mono font-black text-xs text-yellow-300">
                        目前：第 {gameState.currentFloor} 層
                      </span>
                      <button
                        onClick={() => {
                          const nextF = gameState.currentFloor + 1;
                          setGameState(prev => ({ ...prev, currentFloor: nextF, maxFloorReached: Math.max(prev.maxFloorReached, nextF) }));
                          pushLog(`🛠️ [開發者] 樓層跳轉至：第 ${nextF} 層`);
                        }}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold rounded cursor-pointer"
                      >
                        +1 層
                      </button>
                      <button
                        onClick={() => {
                          const nextF = gameState.currentFloor + 5;
                          setGameState(prev => ({ ...prev, currentFloor: nextF, maxFloorReached: Math.max(prev.maxFloorReached, nextF) }));
                          pushLog(`🛠️ [開發者] 樓層跳轉至：第 ${nextF} 層`);
                        }}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold rounded cursor-pointer"
                      >
                        +5 層
                      </button>
                    </div>
                  </div>

                  {/* Overrides Selection */}
                  <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-850 space-y-4">
                    <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider font-mono">
                      👾 怪物與地標生成機率調校
                    </h4>

                    {/* Pet Toggle */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs font-sans">
                        <span className="font-semibold text-slate-300">🐾 魔寵 (Pets) 出現機率：</span>
                        <span className="font-bold font-mono text-indigo-400">
                          {devOverrides.petMode === 'default' ? '預設 (2% / 5%)' : devOverrides.petMode === 'force_yes' ? '🔥 100% 強制生成' : '❌ 完全不生成'}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        {['default', 'force_yes', 'force_no'].map(m => (
                          <button
                            key={m}
                            onClick={() => setDevOverrides(prev => ({ ...prev, petMode: m }))}
                            className={`py-1 text-[9px] font-bold rounded transition cursor-pointer ${
                              devOverrides.petMode === m
                                ? 'bg-indigo-600 text-white border border-indigo-400'
                                : 'bg-slate-800 hover:bg-slate-750 text-slate-400 border border-transparent'
                            }`}
                          >
                            {m === 'default' ? '機率生成' : m === 'force_yes' ? '強制生成' : '完全關閉'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Elite Toggle */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs font-sans">
                        <span className="font-semibold text-slate-300">⭐ 精英怪 (Elites) 出現機率：</span>
                        <span className="font-bold font-mono text-emerald-400">
                          {devOverrides.eliteMode === 'default' ? '預設 (30%)' : devOverrides.eliteMode === 'force_yes' ? '🔥 100% 強制生成' : '❌ 完全不生成'}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        {['default', 'force_yes', 'force_no'].map(m => (
                          <button
                            key={m}
                            onClick={() => setDevOverrides(prev => ({ ...prev, eliteMode: m }))}
                            className={`py-1 text-[9px] font-bold rounded transition cursor-pointer ${
                              devOverrides.eliteMode === m
                                ? 'bg-emerald-600 text-white border border-emerald-400'
                                : 'bg-slate-800 hover:bg-slate-750 text-slate-400 border border-transparent'
                            }`}
                          >
                            {m === 'default' ? '機率生成' : m === 'force_yes' ? '強制生成' : '完全關閉'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Chest Toggle */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs font-sans">
                        <span className="font-semibold text-slate-300">🎁 寶箱與錢袋 (Chests/Bags) 出現：</span>
                        <span className="font-bold font-mono text-amber-400">
                          {devOverrides.chestMode === 'default' ? '預設 (隨機配給)' : devOverrides.chestMode === 'force_yes' ? '🔥 100% 保證生成' : '❌ 關閉寶箱生成'}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        {['default', 'force_yes', 'force_no'].map(m => (
                          <button
                            key={m}
                            onClick={() => setDevOverrides(prev => ({ ...prev, chestMode: m }))}
                            className={`py-1 text-[9px] font-bold rounded transition cursor-pointer ${
                              devOverrides.chestMode === m
                                ? 'bg-amber-600 text-slate-950 border border-amber-400'
                                : 'bg-slate-800 hover:bg-slate-750 text-slate-400 border border-transparent'
                            }`}
                          >
                            {m === 'default' ? '隨機物資' : m === 'force_yes' ? '保證寶物' : '關閉寶物'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Mutation Toggle */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs font-sans">
                        <span className="font-semibold text-slate-300">🌀 關卡環境異變 (Environmental Mutation)：</span>
                        <span className="font-bold font-mono text-cyan-400">
                          {devOverrides.mutationMode === 'default' ? '預設 (動態幾率，第5層50%+1%/層)' :
                           devOverrides.mutationMode === 'fog' ? '🌫️ 強制濃霧' :
                           devOverrides.mutationMode === 'hazard_fire' ? '🔥 烈焰陷阱' :
                           devOverrides.mutationMode === 'hazard_ice' ? '❄️ 霜凍陷阱' :
                           devOverrides.mutationMode === 'hazard_poison' ? '☠️ 劇毒陷阱' :
                           devOverrides.mutationMode === 'hazard' ? '🌋 隨機陷阱' :
                           devOverrides.mutationMode === 'frenzy' ? '⚡ 強制狂暴' :
                           devOverrides.mutationMode === 'pitfall' ? '🕳️ 強制破洞' :
                           devOverrides.mutationMode === 'nest' ? '👾 強制巢穴' :
                           devOverrides.mutationMode === 'treasure' ? '💰 寶箱關卡' : '🚫 無異變'}
                        </span>
                      </div>
                      <div className="grid grid-cols-5 gap-1">
                        {[
                          { id: 'default', label: '預設' },
                          { id: 'fog', label: '🌫️ 濃霧' },
                          { id: 'hazard_fire', label: '🔥 烈焰' },
                          { id: 'hazard_ice', label: '❄️ 霜凍' },
                          { id: 'hazard_poison', label: '☠️ 劇毒' },
                          { id: 'pitfall', label: '🕳️ 破洞' },
                          { id: 'frenzy', label: '⚡ 狂暴' },
                          { id: 'nest', label: '👾 巢穴' },
                          { id: 'treasure', label: '💰 寶箱關' },
                          { id: 'none', label: '🚫 無' }
                        ].map(item => (
                          <button
                            key={item.id}
                            onClick={() => setDevOverrides(prev => ({ ...prev, mutationMode: item.id }))}
                            className={`py-1 text-[9px] font-bold rounded transition cursor-pointer ${
                              devOverrides.mutationMode === item.id
                                ? 'bg-cyan-600 text-white border border-cyan-400'
                                : 'bg-slate-800 hover:bg-slate-750 text-slate-400 border border-transparent'
                            }`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Limit Break Controls */}
                  <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-850 space-y-2">
                    <div className="flex justify-between items-center text-xs font-sans">
                      <span className="font-semibold text-slate-300">⚡ 極限爆發 (Limit Break) 能量：</span>
                      <span className="font-bold font-mono text-cyan-400">
                        {gameState.limitBreakBar} / 10
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      <button
                        onClick={() => {
                          setGameState(prev => ({ ...prev, limitBreakBar: 10 }));
                          pushLog("🛠️ [開發者] 已將極限能量充能至 10/10 全滿！⚡");
                        }}
                        className="py-1 text-[9px] font-bold rounded bg-slate-850 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 cursor-pointer active:scale-95 duration-75"
                      >
                        ⚡ 10/10 (全滿)
                      </button>
                      <button
                        onClick={() => {
                          setGameState(prev => ({ ...prev, limitBreakBar: Math.min(10, (prev.limitBreakBar || 0) + 1) }));
                          pushLog("🛠️ [開發者] 極限能量 +1 ⚡");
                        }}
                        className="py-1 text-[9px] font-bold rounded bg-slate-850 hover:bg-slate-800 text-slate-200 border border-slate-700 cursor-pointer active:scale-95 duration-75"
                      >
                        ⚡ 能量 +1
                      </button>
                      <button
                        onClick={() => {
                          setGameState(prev => ({ ...prev, limitBreakBar: 0 }));
                          pushLog("🛠️ [開發者] 已清空極限能量 💨");
                        }}
                        className="py-1 text-[9px] font-bold rounded bg-slate-850 hover:bg-slate-800 text-slate-400 border border-slate-700 cursor-pointer active:scale-95 duration-75"
                      >
                        💨 歸零
                      </button>
                    </div>
                  </div>

                   {/* Debug stats utilities */}
                   <div className="space-y-3.5 border-t border-slate-900 pt-3.5">
                     <div>
                       <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1.5">💰 自訂獲得與設定資源（支援直接設定或歸零）</p>
                       <div className="grid grid-cols-2 gap-4">
                         {/* Gold Coins input & add/set buttons */}
                         <div className="space-y-1.5 bg-slate-950/60 p-2.5 rounded-xl border border-slate-900">
                           <label className="text-[10px] text-yellow-500 font-black block">🟡 金幣數量管理</label>
                           <input
                             type="number"
                             value={devCustomGold}
                             onChange={(e) => setDevCustomGold(e.target.value)}
                             className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-yellow-400 font-mono w-full focus:outline-none focus:border-yellow-500"
                             placeholder="100"
                           />
                           <div className="grid grid-cols-2 gap-1.5 mt-1.5">
                             <button
                               onClick={() => {
                                 const amount = parseInt(devCustomGold, 10);
                                 if (!isNaN(amount)) {
                                   setGameState(prev => ({ ...prev, goldCoins: prev.goldCoins + amount }));
                                   pushLog(`🛠️ [開發者] 金幣增加了 +${amount} 🟡`);
                                 }
                               }}
                               className="py-1 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/20 text-yellow-400 text-[10px] font-bold rounded cursor-pointer transition active:scale-95"
                             >
                               ➕ 增加
                             </button>
                             <button
                               onClick={() => {
                                 const amount = parseInt(devCustomGold, 10);
                                 if (!isNaN(amount) && amount >= 0) {
                                   setGameState(prev => ({ ...prev, goldCoins: amount }));
                                   pushLog(`🛠️ [開發者] 直接設定金幣為 ${amount} 🟡`);
                                 }
                               }}
                               className="py-1 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-[10px] font-black rounded cursor-pointer transition active:scale-95"
                             >
                               🎯 設定
                             </button>
                           </div>
                         </div>

                         {/* XP Input & add/set buttons */}
                         <div className="space-y-1.5 bg-slate-950/60 p-2.5 rounded-xl border border-slate-900">
                           <label className="text-[10px] text-emerald-400 font-black block">⭐ XP 學習點數管理</label>
                           <input
                             type="number"
                             value={devCustomXP}
                             onChange={(e) => setDevCustomXP(e.target.value)}
                             className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-emerald-400 font-mono w-full focus:outline-none focus:border-emerald-500"
                             placeholder="150"
                           />
                           <div className="grid grid-cols-2 gap-1.5 mt-1.5">
                             <button
                               onClick={() => {
                                 const amount = parseInt(devCustomXP, 10);
                                 if (!isNaN(amount)) {
                                   setGameState(prev => awardXP(prev, amount));
                                   pushLog(`🛠️ [開發者] 獲得學習點數 +${amount} XP ⭐`);
                                 }
                               }}
                               className="py-1 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded cursor-pointer transition active:scale-95"
                             >
                               ➕ 增加
                             </button>
                             <button
                               onClick={() => {
                                 const amount = parseInt(devCustomXP, 10);
                                 if (!isNaN(amount) && amount >= 0) {
                                   setGameState(prev => ({ ...prev, totalXP: amount }));
                                   pushLog(`🛠️ [開發者] 直接設定生涯總學習點數為 ${amount} XP ⭐`);
                                 }
                               }}
                               className="py-1 bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/40 text-teal-300 text-[10px] font-black rounded cursor-pointer transition active:scale-95"
                             >
                               🎯 設定
                             </button>
                           </div>
                         </div>
                       </div>
                     </div>

                     {/* Quick Zero Presets Row */}
                     <div className="flex flex-wrap justify-between gap-2 bg-slate-950/40 p-2 rounded-lg border border-slate-900">
                       <button
                         onClick={() => {
                           setGameState(prev => ({ ...prev, goldCoins: 0 }));
                           pushLog("🛠️ [開發者] 金幣已歸零 🟡");
                         }}
                         className="px-2 py-1 bg-rose-950/40 hover:bg-rose-900/40 border border-rose-900/50 text-rose-300 text-[9px] font-bold rounded cursor-pointer flex-1 text-center transition"
                       >
                         🧹 金幣一鍵歸零
                       </button>
                       <button
                         onClick={() => {
                           setGameState(prev => ({ ...prev, totalXP: 0, dailyLog: [] }));
                           pushLog("🛠️ [開發者] 生涯總 XP 及每日學習日誌已歸零 ⭐");
                         }}
                         className="px-2 py-1 bg-rose-950/40 hover:bg-rose-900/40 border border-rose-900/50 text-rose-300 text-[9px] font-bold rounded cursor-pointer flex-1 text-center transition"
                       >
                         🧹 XP 一鍵歸零
                       </button>
                       <button
                         onClick={() => {
                           setGameState(prev => ({ ...prev, currentFloor: 1, maxFloorReached: 1, startRunMaxFloor: 1, hasVisitedTreasureVaultThisRun: false, isTreasureVault: false }));
                           pushLog("🛠️ [開發者] 目前樓層及最高挑戰樓層已重置為第 1 層 🏰");
                         }}
                         className="px-2 py-1 bg-rose-950/40 hover:bg-rose-900/40 border border-rose-900/50 text-rose-300 text-[9px] font-bold rounded cursor-pointer flex-1 text-center transition"
                       >
                         🧹 樓層一鍵重置
                       </button>
                     </div>
                   </div>

                  <div className="flex justify-center pt-2">
                    <button
                      onClick={() => setShowDevPanel(false)}
                      className="px-6 py-2.5 bg-indigo-650 hover:bg-indigo-600 text-white font-extrabold rounded-xl border border-indigo-500 transition cursor-pointer active:scale-95 text-xs w-full font-mono"
                    >
                      ［ 🚪 關閉並儲存設定 ］
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
