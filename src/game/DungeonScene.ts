/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GameBridge } from './GameBridge';
import { getMonstersByBiome, getRandomMonster } from '../utils/monsterDb';
import { BOSS_DATABASE, BossData } from '../utils/bossDb';
import { PETS_DATABASE, PetData } from '../utils/petsDb';
import RetroSFX from '../utils/sfx';

// Declare the CDN-loaded Phaser library as any to bypass strict TypeScript checks
declare const Phaser: any;

export class DungeonScene extends Phaser.Scene {
  private grid: number[][] = [];
  private cols = 16;
  private rows = 10;
  private tileSize = 48;
  
  private player!: any;
  private playerGridX = 1;
  private playerGridY = 8;
  
  private pathQueue: { x: number; y: number }[] = [];
  private isMoving = false;
  private currentTargetTile: { x: number; y: number } | null = null;
  
  private monstersGroup!: any;
  private interactivesGroup!: any;
  private merchantsGroup!: any;
  private portalsGroup!: any;
  private portalActive = false;
  private isTransitioning = false;
  
  private currentFloor = 1;
  private equippedPetId: string | null = null;
  private selectedJobId: string | null = null;
  private devOverrides: any = null;
  private currentFloorState: any = null;
  private activeMonsterId: string | null = null;
  private activeMonsterSprite: any = null;
  
  private tileSprites: any[][] = [];
  private pathHighlights: any = null;

  constructor() {
    super({ key: 'DungeonScene' });
  }

  init(data: { floor?: number; equippedPetId?: string | null; selectedJobId?: string | null; devOverrides?: any; floorState?: any }) {
    this.currentFloor = data.floor || 1;
    this.equippedPetId = data.equippedPetId || null;
    this.selectedJobId = data.selectedJobId || null;
    this.devOverrides = data.devOverrides || null;
    this.currentFloorState = data.floorState || null;
    this.playerGridX = 1;
    this.playerGridY = 8;
    this.isMoving = false;
    this.pathQueue = [];
    this.activeMonsterId = null;
    this.activeMonsterSprite = null;
    this.portalActive = false;
    this.isTransitioning = false;
    GameBridge.currentScene = this;
  }

  preload() {
    // Generate textures on the fly only if they do not exist
    if (!this.textures.exists('grass')) this.createGrassTexture();
    if (!this.textures.exists('wall')) this.createWallTexture();
    
    if (!this.textures.exists('cave')) this.createCaveTexture();
    if (!this.textures.exists('stone_wall')) this.createStoneWallTexture();

    if (!this.textures.exists('snow')) this.createSnowTexture();
    if (!this.textures.exists('ice_wall')) this.createIceWallTexture();

    if (!this.textures.exists('volcano')) this.createVolcanoTexture();
    if (!this.textures.exists('lava_wall')) this.createLavaWallTexture();

    if (!this.textures.exists('ruins')) this.createRuinsTexture();
    if (!this.textures.exists('ruin_wall')) this.createRuinWallTexture();

    // Create beautiful job-specific JRPG hero sprites
    const jobsList = ['warrior', 'samurai', 'dwarf', 'mage', 'warlock', 'cleric', 'thief', 'dancer', 'archer', 'sage'];
    jobsList.forEach(jobId => {
      const texKey = `hero_${jobId}`;
      if (!this.textures.exists(texKey)) {
        this.createHeroTextureForJob(texKey, jobId);
      }
    });
    if (!this.textures.exists('hero')) {
      this.createHeroTextureForJob('hero', 'warrior');
    }
    if (!this.textures.exists('math_monster')) this.createMonsterTexture('math_monster', '#a855f7', '#6b21a8'); // Purple
    if (!this.textures.exists('chinese_monster')) this.createMonsterTexture('chinese_monster', '#f43f5e', '#be123c'); // Pink
    if (!this.textures.exists('boss_monster')) this.createMonsterTexture('boss_monster', '#eab308', '#ef4444'); // Golden body with red horns
    if (!this.textures.exists('merchant')) this.createMerchantTexture();
    if (!this.textures.exists('chest')) this.createChestTexture();
    if (!this.textures.exists('portal')) this.createPortalTexture();
    if (!this.textures.exists('gold_coin')) this.createCoinTexture();
    
    // New interactives & rest entity preloads
    if (!this.textures.exists('rock')) this.createRockTexture();
    if (!this.textures.exists('skeleton')) this.createSkeletonTexture();
    if (!this.textures.exists('money_bag')) this.createMoneyBagTexture();
    if (!this.textures.exists('campfire')) this.createCampfireTexture();
    if (!this.textures.exists('elf')) this.createElfTexture();
  }

  getBiomeKeys() {
    const floor = this.currentFloor;
    if (floor <= 3) {
      return { floor: 'grass', wall: 'wall', name: '🟢 翡翠草原' };
    } else if (floor <= 6) {
      return { floor: 'cave', wall: 'stone_wall', name: '🪨 幽暗岩洞' };
    } else if (floor <= 9) {
      return { floor: 'snow', wall: 'ice_wall', name: '❄️ 寒冰雪域' };
    } else if (floor <= 12) {
      return { floor: 'volcano', wall: 'lava_wall', name: '🔥 烈焰火山' };
    } else {
      return { floor: 'ruins', wall: 'ruin_wall', name: '🏛️ 古老遺跡' };
    }
  }

  create() {
    this.cameras.main.resetFX();
    this.cameras.main.fadeIn(400, 9, 13, 22);
    this.cameras.main.setBackgroundColor('#090d16');
    this.pathHighlights = this.add.graphics();
    
    // 1. Generate Maze Grid
    this.generateMaze();
    
    // 2. Render Grid Map
    this.renderGrid();
    
    // 3. Create Groups
    this.monstersGroup = this.add.group();
    this.interactivesGroup = this.add.group();
    this.merchantsGroup = this.add.group();
    
    // 4. Place Player
    this.spawnPlayer();
    
    // 5. Place Portals on 3 sides (TOP, RIGHT, LEFT)
    this.spawnPortals();
    
    // 6. Spawn Monsters and Chests
    this.spawnEntities();
    
    // 7. Interactive touch listeners
    this.input.on('pointerdown', (pointer: any) => {
      if (this.activeMonsterId) return;
      
      const gridX = Math.floor(pointer.x / this.tileSize);
      const gridY = Math.floor(pointer.y / this.tileSize);
      
      if (gridX >= 0 && gridX < this.cols && gridY >= 0 && gridY < this.rows) {
        if (this.grid[gridY][gridX] === 0) {
          this.navigateToCell(gridX, gridY);
        }
      }
    });

    const biome = this.getBiomeKeys();
    const isBoss = this.currentFloor % 5 === 0;
    const isMerchant = this.currentFloor % 5 === 4;
    
    let guideMessage = `🏰 勇士進入了「${biome.name}」第 ${this.currentFloor} 層！ 擊敗怪獸開啟傳送門！ 🌀`;
    if (isBoss) {
      guideMessage = `👹 警告！第 ${this.currentFloor} 層為 BOSS 關卡！準備迎戰巨型守護者！ ⚔️`;
      const bossIndex = Math.floor((this.currentFloor / 5) - 1) % BOSS_DATABASE.length;
      const bossData = BOSS_DATABASE[bossIndex];
      if (bossData) {
        this.createBossAmbientEffects(bossData);
      }
    } else if (isMerchant) {
      guideMessage = `🧙‍♂️ 抵達第 ${this.currentFloor} 層安全區！快找流浪商人購買道具或補血吧！ 🟡`;
    }

    // Floating helpful guide text
    const guideText = this.add.text(
      400, 
      458, 
      guideMessage, 
      {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '13px',
        color: isBoss ? '#ef4444' : (isMerchant ? '#10b981' : '#facc15'),
        backgroundColor: '#000000aa',
        padding: { x: 12, y: 5 }
      }
    ).setOrigin(0.5);

    this.tweens.add({
      targets: guideText,
      alpha: 0.3,
      delay: 8000,
      duration: 1000
    });
  }

  update() {
    if (this.isMoving || this.pathQueue.length === 0 || this.activeMonsterId) return;
    
    const nextTile = this.pathQueue.shift();
    if (nextTile) {
      this.movePlayerToTile(nextTile.x, nextTile.y);
    }
  }

  private generateMaze() {
    if (this.currentFloorState && this.currentFloorState.floor === this.currentFloor && this.currentFloorState.grid) {
      this.grid = JSON.parse(JSON.stringify(this.currentFloorState.grid));
      this.playerGridX = this.currentFloorState.playerGridX;
      this.playerGridY = this.currentFloorState.playerGridY;
      this.portalActive = this.currentFloorState.portalActive;
      return;
    }

    this.grid = [];
    for (let r = 0; r < this.rows; r++) {
      const row: number[] = [];
      for (let c = 0; c < this.cols; c++) {
        if (r === 0 || r === this.rows - 1 || c === 0 || c === this.cols - 1) {
          row.push(1);
        } else {
          row.push(Math.random() < 0.22 ? 1 : 0);
        }
      }
      this.grid.push(row);
    }

    this.grid[this.playerGridY][this.playerGridX] = 0;
    this.grid[this.playerGridY - 1][this.playerGridX] = 0;
    this.grid[this.playerGridY][this.playerGridX + 1] = 0;
  }

  private renderGrid() {
    this.tileSprites = [];
    const biome = this.getBiomeKeys();
    for (let r = 0; r < this.rows; r++) {
      const rowSprites: any[] = [];
      for (let c = 0; c < this.cols; c++) {
        const x = c * this.tileSize + this.tileSize / 2;
        const y = r * this.tileSize + this.tileSize / 2;
        
        const isWall = this.grid[r][c] === 1;
        const tileSprite = this.add.image(x, y, isWall ? biome.wall : biome.floor);
        
        if (!isWall) {
          tileSprite.setAngle([0, 90, 180, 270][Math.floor(Math.random() * 4)]);
        }
        
        rowSprites.push(tileSprite);
      }
      this.tileSprites.push(rowSprites);
    }
  }

  private spawnPlayer() {
    const startX = this.playerGridX * this.tileSize + this.tileSize / 2;
    const startY = this.playerGridY * this.tileSize + this.tileSize / 2;
    
    this.player = this.add.container(startX, startY);
    
    const activeJobKey = `hero_${this.selectedJobId || 'warrior'}`;
    const texKey = this.textures.exists(activeJobKey) ? activeJobKey : 'hero';
    const sprite = this.add.sprite(0, 0, texKey);
    sprite.setName('body');
    this.player.add(sprite);

    const accessory = this.add.star(0, -22, 5, 4, 8, 0xfacc15).setAngle(15);
    this.tweens.add({
      targets: accessory,
      y: -25,
      angle: 345,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    this.player.add(accessory);
  }

  private spawnPortals() {
    this.portalsGroup = this.add.group();
    
    const locations = [
      { x: 8, y: 0 },
      { x: 15, y: 5 },
      { x: 0, y: 5 }
    ];
    
    locations.forEach((portalLoc) => {
      this.grid[portalLoc.y][portalLoc.x] = 0;
      if (portalLoc.y === 0) this.grid[1][portalLoc.x] = 0;
      if (portalLoc.x === 0) this.grid[portalLoc.y][1] = 0;
      if (portalLoc.x === 15) this.grid[portalLoc.y][14] = 0;

      const px = portalLoc.x * this.tileSize + this.tileSize / 2;
      const py = portalLoc.y * this.tileSize + this.tileSize / 2;
      
      // If Scout Hamster (pet_8) is equipped, draw a beautiful pulsing radar beacon below the portal!
      if (this.equippedPetId === 'pet_8') {
        const beacon = this.add.graphics();
        beacon.lineStyle(3, 0x10b981, 0.7);
        beacon.strokeCircle(px, py, 26);
        this.tweens.add({
          targets: beacon,
          scaleX: 1.5,
          scaleY: 1.5,
          alpha: 0,
          duration: 1500,
          repeat: -1
        });
      }

      const portal = this.add.sprite(px, py, 'portal');
      portal.setData('gridX', portalLoc.x);
      portal.setData('gridY', portalLoc.y);
      portal.setScale(0.8);
      portal.setAlpha(0.5);

      this.tweens.add({
        targets: portal,
        angle: 360,
        duration: 3000,
        repeat: -1
      });

      this.portalsGroup.add(portal);
    });
  }

  private spawnEntities() {
    if (this.currentFloorState && this.currentFloorState.floor === this.currentFloor && this.currentFloorState.entities) {
      this.portalActive = this.currentFloorState.portalActive;
      this.portalsGroup.getChildren().forEach((pObj: any) => {
        pObj.setAlpha(this.portalActive ? 1.0 : 0.5);
      });

      this.currentFloorState.entities.forEach((ent: any) => {
        if (ent.isInteracted) {
          return;
        }

        const ex = ent.gridX * this.tileSize + this.tileSize / 2;
        const ey = ent.gridY * this.tileSize + this.tileSize / 2;

        if (ent.type === 'merchant' || ent.type === 'elf' || ent.type === 'campfire') {
          let textureKey = 'campfire';
          if (ent.type === 'merchant') textureKey = 'merchant';
          else if (ent.type === 'elf') textureKey = 'elf';

          const restEntity = this.add.sprite(ex, ey, textureKey);
          restEntity.setData('type', ent.type);
          restEntity.setData('gridX', ent.gridX);
          restEntity.setData('gridY', ent.gridY);
          restEntity.setData('id', ent.id || `rest_${ent.gridX}_${ent.gridY}`);
          
          this.tweens.add({
            targets: restEntity,
            scaleY: ent.type === 'campfire' ? 1.1 : 1.15,
            duration: 900,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
          });
          
          this.merchantsGroup.add(restEntity);
        }
        else if (ent.type === 'boss') {
          const bossData = BOSS_DATABASE.find(b => b.id === ent.bossDbId) || BOSS_DATABASE[0];
          const bossTexKey = `boss_tex_${bossData.id}`;
          
          if (!this.textures.exists(bossTexKey)) {
            this.createProceduralBossTexture(bossTexKey, bossData);
          }

          const boss = this.add.sprite(ex, ey, bossTexKey);
          boss.setData('id', ent.id);
          boss.setData('bossDbId', bossData.id);
          boss.setData('gridX', ent.gridX);
          boss.setData('gridY', ent.gridY);
          boss.setData('type', 'boss');
          boss.setData('bossData', bossData);

          const baseScale = bossData.size === 13 ? 1.6 : 1.25;
          boss.setScale(baseScale);
          
          this.tweens.add({
            targets: boss,
            y: ey - 8,
            duration: 700,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
          });

          let crownColor = 0xfacc15;
          if (bossData.element === 'Ice') crownColor = 0x60a5fa;
          if (bossData.element === 'Poison') crownColor = 0xa855f7;
          if (bossData.element === 'Fire') crownColor = 0xef4444;
          if (bossData.element === 'Dark') crownColor = 0xd8b4fe;
          if (bossData.element === 'Lightning') crownColor = 0xffffff;

          const crown = this.add.star(ex, ey - 45, 5, 5, 10, crownColor);
          this.tweens.add({
            targets: crown,
            y: ey - 50,
            angle: 360,
            duration: 2500,
            repeat: -1
          });
          
          boss.on('destroy', () => {
            crown.destroy();
          });
          
          this.monstersGroup.add(boss);
          this.startBossStageAnimations(bossData.element);
        }
        else if (ent.type === 'pet') {
          const petData = PETS_DATABASE.find(p => p.id === ent.petDbId) || PETS_DATABASE[0];
          this.spawnPet({ x: ent.gridX, y: ent.gridY }, petData, ent.id);
        }
        else if (ent.type === 'monster') {
          const mKey = `monster_${ent.id}`;
          if (!this.textures.exists(mKey)) {
            const biomeType = (this.currentFloor <= 3 ? 'grass' : 
                               this.currentFloor <= 6 ? 'cave' : 
                               this.currentFloor <= 9 ? 'snow' : 
                               this.currentFloor <= 12 ? 'volcano' : 'ruins') as 'grass' | 'cave' | 'snow' | 'volcano' | 'ruins';
            const biomeMonsters = getMonstersByBiome(biomeType);
            const foundMonster = biomeMonsters.find(m => m.name === ent.monsterName) || biomeMonsters[0] || { shape: 'slime', bodyColor: '#a855f7', accentColor: '#6b21a8' };
            this.createProceduralMonsterTexture(mKey, foundMonster.shape, foundMonster.bodyColor, foundMonster.accentColor);
          }

          const monster = this.add.sprite(ex, ey, mKey);
          monster.setData('id', ent.id);
          monster.setData('gridX', ent.gridX);
          monster.setData('gridY', ent.gridY);
          monster.setData('type', ent.monsterType || 'math');
          monster.setData('name', ent.monsterName || '怪獸');
          monster.setData('isElite', ent.isElite || false);
          monster.setData('eliteHp', ent.eliteHp || 1);
          monster.setData('eliteMaxHp', ent.eliteMaxHp || 1);

          if (ent.isElite) {
            monster.setScale(1.3);
            const eliteStar = this.add.star(ex, ey - 24, 4, 3, 6, 0xfacc15);
            this.tweens.add({
              targets: eliteStar,
              y: ey - 28,
              angle: 180,
              duration: 1500,
              yoyo: true,
              repeat: -1
            });
            monster.on('destroy', () => {
              eliteStar.destroy();
            });
          }

          this.tweens.add({
            targets: monster,
            y: ey - 6,
            duration: 800 + Math.random() * 400,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
          });

          this.monstersGroup.add(monster);
        }
        else {
          let textureKey = ent.type;
          if (ent.type === 'bag') textureKey = 'money_bag';

          const sprite = this.add.sprite(ex, ey, textureKey);
          sprite.setData('type', ent.type);
          sprite.setData('gridX', ent.gridX);
          sprite.setData('gridY', ent.gridY);
          sprite.setData('id', ent.id);

          if (this.equippedPetId === 'pet_8' && (ent.type === 'chest' || ent.type === 'bag')) {
            const beacon = this.add.graphics();
            beacon.lineStyle(3, 0xeab308, 0.7);
            beacon.strokeCircle(ex, ey, 22);
            this.tweens.add({
              targets: beacon,
              scaleX: 1.5,
              scaleY: 1.5,
              alpha: 0,
              duration: 1500,
              repeat: -1
            });
          }

          this.tweens.add({
            targets: sprite,
            scale: 1.1,
            duration: 1000 + Math.random() * 500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
          });

          this.interactivesGroup.add(sprite);
        }
      });

      return;
    }

    const eligibleCells: { x: number; y: number }[] = [];
    
    for (let r = 1; r < this.rows - 1; r++) {
      for (let c = 1; c < this.cols - 1; c++) {
        if (this.grid[r][c] === 0) {
          const dist = Math.abs(c - this.playerGridX) + Math.abs(r - this.playerGridY);
          if (dist > 3) {
            eligibleCells.push({ x: c, y: r });
          }
        }
      }
    }

    eligibleCells.sort(() => Math.random() - 0.5);

    const isBoss = this.currentFloor % 5 === 0;
    const isRest = this.currentFloor % 5 === 4;

    if (isRest) {
      // 1. Rest Safe Zone (No combat, portals always unlocked)
      this.portalActive = true;
      this.portalsGroup.getChildren().forEach((pObj: any) => {
        pObj.setAlpha(1.0);
      });

      if (eligibleCells.length > 0) {
        // Spawn rest entity near the center
        const centerCell = eligibleCells.reduce((best, cell) => {
          const bestDist = Math.abs(best.x - 8) + Math.abs(best.y - 5);
          const cellDist = Math.abs(cell.x - 8) + Math.abs(cell.y - 5);
          return cellDist < bestDist ? cell : best;
        }, eligibleCells[0]);

        const tx = centerCell.x * this.tileSize + this.tileSize / 2;
        const ty = centerCell.y * this.tileSize + this.tileSize / 2;
        
        // Random rest entity type: 40% Merchant, 20% Elf Miko, 40% Campfire
        let restType: 'merchant' | 'elf' | 'campfire' = 'campfire';
        const rand = Math.random();
        if (rand < 0.40) {
          restType = 'merchant';
        } else if (rand < 0.60) {
          restType = 'elf'; // Miko
        } else {
          restType = 'campfire';
        }
        
        let textureKey = 'campfire';
        if (restType === 'merchant') textureKey = 'merchant';
        else if (restType === 'elf') textureKey = 'elf';

        const restEntity = this.add.sprite(tx, ty, textureKey);
        const restId = `rest_${centerCell.x}_${centerCell.y}`;
        restEntity.setData('id', restId);
        restEntity.setData('type', restType);
        restEntity.setData('gridX', centerCell.x);
        restEntity.setData('gridY', centerCell.y);
        
        this.tweens.add({
          targets: restEntity,
          scaleY: restType === 'campfire' ? 1.1 : 1.15,
          duration: 900,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
        
        this.merchantsGroup.add(restEntity);
        this.carvePath(this.playerGridX, this.playerGridY, centerCell.x, centerCell.y);
      }
    } else if (isBoss) {
      // 2. Boss Stage (Giant combat encounter, portals locked initially)
      this.portalActive = false;
      this.portalsGroup.getChildren().forEach((pObj: any) => {
        pObj.setAlpha(0.5);
      });

      if (eligibleCells.length > 0) {
        // Retrieve the current progressive boss from the BOSS_DATABASE
        const bossIndex = Math.floor((this.currentFloor / 5) - 1) % BOSS_DATABASE.length;
        const bossData = BOSS_DATABASE[bossIndex];

        // Spawn Boss near the center
        const centerCell = eligibleCells.reduce((best, cell) => {
          const bestDist = Math.abs(best.x - 8) + Math.abs(best.y - 5);
          const cellDist = Math.abs(cell.x - 8) + Math.abs(cell.y - 5);
          return cellDist < bestDist ? cell : best;
        }, eligibleCells[0]);

        const mx = centerCell.x * this.tileSize + this.tileSize / 2;
        const my = centerCell.y * this.tileSize + this.tileSize / 2;
        
        const bossId = `boss_${Date.now()}`;
        const bossTexKey = `boss_tex_${bossData.id}`;
        
        // Build the procedurally generated massive boss texture if not yet cached
        if (!this.textures.exists(bossTexKey)) {
          this.createProceduralBossTexture(bossTexKey, bossData);
        }

        const boss = this.add.sprite(mx, my, bossTexKey);
        boss.setData('id', bossId);
        boss.setData('bossDbId', bossData.id);
        boss.setData('gridX', centerCell.x);
        boss.setData('gridY', centerCell.y);
        boss.setData('type', 'boss');
        boss.setData('bossData', bossData); // Store full boss data inside the sprite

        // Scale up to 9x9 or 13x13 proportions! 
        // A size 13 boss is massive, while size 9 is slightly smaller but still very imposing.
        const baseScale = bossData.size === 13 ? 1.6 : 1.25;
        boss.setScale(baseScale);
        
        // Menacing hover tween
        this.tweens.add({
          targets: boss,
          y: my - 8,
          duration: 700,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });

        // Add matching glowing aura/crown based on element
        let crownColor = 0xfacc15;
        if (bossData.element === 'Ice') crownColor = 0x60a5fa;
        if (bossData.element === 'Poison') crownColor = 0xa855f7;
        if (bossData.element === 'Fire') crownColor = 0xef4444;
        if (bossData.element === 'Dark') crownColor = 0xd8b4fe;
        if (bossData.element === 'Lightning') crownColor = 0xffffff;

        const crown = this.add.star(mx, my - 45, 5, 5, 10, crownColor);
        this.tweens.add({
          targets: crown,
          y: my - 50,
          angle: 360,
          duration: 2500,
          repeat: -1
        });
        
        boss.on('destroy', () => {
          crown.destroy();
        });
        
        this.monstersGroup.add(boss);
        this.carvePath(this.playerGridX, this.playerGridY, centerCell.x, centerCell.y);

        // Start the immersive stage animations for this element!
        this.startBossStageAnimations(bossData.element);

        // Boss level pet spawning (5% chance)
        let shouldSpawnPet = Math.random() < 0.05;
        if (this.devOverrides?.petMode === 'force_yes') {
          shouldSpawnPet = true;
        } else if (this.devOverrides?.petMode === 'force_no') {
          shouldSpawnPet = false;
        }

        if (shouldSpawnPet && eligibleCells.length > 0) {
          const petCell = eligibleCells.pop()!;
          const randomPet = PETS_DATABASE[Math.floor(Math.random() * PETS_DATABASE.length)];
          this.spawnPet(petCell, randomPet);
        }
      }
    } else {
      // 3. Normal Stage (Portals locked initially, normal/elite monsters & interactives)
      this.portalActive = false;
      this.portalsGroup.getChildren().forEach((pObj: any) => {
        pObj.setAlpha(0.5);
      });

      // Get current biome for the floor
      const biomeType = (this.currentFloor <= 3 ? 'grass' : 
                         this.currentFloor <= 6 ? 'cave' : 
                         this.currentFloor <= 9 ? 'snow' : 
                         this.currentFloor <= 12 ? 'volcano' : 'ruins') as 'grass' | 'cave' | 'snow' | 'volcano' | 'ruins';

      // Load biome monsters and shuffle to ensure uniqueness
      const biomeMonsters = [...getMonstersByBiome(biomeType)].sort(() => Math.random() - 0.5);

      // Standalone pet spawning (2% chance)
      let shouldSpawnPet = Math.random() < 0.02;
      if (this.devOverrides?.petMode === 'force_yes') {
        shouldSpawnPet = true;
      } else if (this.devOverrides?.petMode === 'force_no') {
        shouldSpawnPet = false;
      }

      if (shouldSpawnPet && eligibleCells.length > 0) {
        const petCell = eligibleCells.pop()!;
        const randomPet = PETS_DATABASE[Math.floor(Math.random() * PETS_DATABASE.length)];
        this.spawnPet(petCell, randomPet);
        this.carvePath(this.playerGridX, this.playerGridY, petCell.x, petCell.y);
      }

      const numMonsters = Math.min(3, eligibleCells.length);
      for (let i = 0; i < numMonsters; i++) {
        if (biomeMonsters.length === 0) break;
        const cell = eligibleCells.pop()!;
        const mx = cell.x * this.tileSize + this.tileSize / 2;
        const my = cell.y * this.tileSize + this.tileSize / 2;
        
        // Elite settings (30% chance for floor >= 2)
        let isElite = Math.random() < 0.3 && this.currentFloor >= 2;
        if (this.devOverrides?.eliteMode === 'force_yes') {
          isElite = true;
        } else if (this.devOverrides?.eliteMode === 'force_no') {
          isElite = false;
        }
        
        // Elite monster pet transformation (5% chance)
        let isPetTransform = isElite && Math.random() < 0.05;
        if (this.devOverrides?.petMode === 'force_yes') {
          isPetTransform = isElite && true; // high chance if forced
        } else if (this.devOverrides?.petMode === 'force_no') {
          isPetTransform = false;
        }

        if (isPetTransform) {
          const randomPet = PETS_DATABASE[Math.floor(Math.random() * PETS_DATABASE.length)];
          this.spawnPet(cell, randomPet);
          this.carvePath(this.playerGridX, this.playerGridY, cell.x, cell.y);
          continue;
        }

        const monsterData = biomeMonsters.pop()!;
        const mKey = `monster_${monsterData.id}`;
        
        // Create dynamic texture on-demand if it doesn't exist
        if (!this.textures.exists(mKey)) {
          this.createProceduralMonsterTexture(mKey, monsterData.shape, monsterData.bodyColor, monsterData.accentColor);
        }

        const monsterId = `monster_${Date.now()}_${i}`;
        const monster = this.add.sprite(mx, my, mKey);
        
        const eliteHp = isElite ? (Math.random() < 0.5 ? 2 : 3) : 1;

        monster.setData('id', monsterId);
        monster.setData('gridX', cell.x);
        monster.setData('gridY', cell.y);
        monster.setData('type', monsterData.type);
        monster.setData('name', monsterData.name);
        monster.setData('isElite', isElite);
        monster.setData('eliteHp', eliteHp);
        monster.setData('eliteMaxHp', eliteHp);

        if (isElite) {
          monster.setScale(1.3); // Scale up Elite monsters!
          
          // Add sparkling star overhead for elites
          const eliteStar = this.add.star(mx, my - 24, 4, 3, 6, 0xfacc15);
          this.tweens.add({
            targets: eliteStar,
            y: my - 28,
            angle: 180,
            duration: 1500,
            yoyo: true,
            repeat: -1
          });
          // Track and destroy the star when the monster is destroyed
          monster.on('destroy', () => {
            eliteStar.destroy();
          });
        }
        
        this.tweens.add({
          targets: monster,
          y: my - 6,
          duration: 800 + Math.random() * 400,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
        
        this.monstersGroup.add(monster);
        this.carvePath(this.playerGridX, this.playerGridY, cell.x, cell.y);
      }

      // Spawn random interactives (Rocks, Skeletons, Bags, Chests)
      const numInteractives = Math.min(2, eligibleCells.length);
      const interactiveTypes: ('rock' | 'skeleton' | 'bag' | 'chest')[] = ['rock', 'skeleton', 'bag', 'chest'];
      
      for (let i = 0; i < numInteractives; i++) {
        const cell = eligibleCells.pop()!;
        const cx = cell.x * this.tileSize + this.tileSize / 2;
        const cy = cell.y * this.tileSize + this.tileSize / 2;
        
        let type = interactiveTypes[Math.floor(Math.random() * interactiveTypes.length)];
        if (this.devOverrides?.chestMode === 'force_yes') {
          type = Math.random() < 0.5 ? 'chest' : 'bag';
        } else if (this.devOverrides?.chestMode === 'force_no') {
          type = Math.random() < 0.5 ? 'rock' : 'skeleton';
        }
        
        let textureKey: string = type;
        if (type === 'bag') textureKey = 'money_bag';

        const sprite = this.add.sprite(cx, cy, textureKey);
        const interactiveId = `interactive_${cell.x}_${cell.y}`;
        sprite.setData('id', interactiveId);
        sprite.setData('type', type);
        sprite.setData('gridX', cell.x);
        sprite.setData('gridY', cell.y);

        // If Scout Hamster (pet_8) is equipped, draw a golden pulsing beacon below chests and money bags!
        if (this.equippedPetId === 'pet_8' && (type === 'chest' || type === 'bag')) {
          const beacon = this.add.graphics();
          beacon.lineStyle(3, 0xeab308, 0.7);
          beacon.strokeCircle(cx, cy, 22);
          this.tweens.add({
            targets: beacon,
            scaleX: 1.5,
            scaleY: 1.5,
            alpha: 0,
            duration: 1500,
            repeat: -1
          });
        }
        
        this.tweens.add({
          targets: sprite,
          scale: 1.1,
          duration: 1000 + Math.random() * 500,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
        
        this.interactivesGroup.add(sprite);
        this.carvePath(this.playerGridX, this.playerGridY, cell.x, cell.y);
      }
    }

    // Carve reachable paths to all 3 portals!
    this.portalsGroup.getChildren().forEach((pObj: any) => {
      const px = pObj.getData('gridX');
      const py = pObj.getData('gridY');
      this.carvePath(this.playerGridX, this.playerGridY, px, py);
    });

    if (!this.currentFloorState) {
      const entitiesToSave: any[] = [];
      
      this.monstersGroup.getChildren().forEach((mObj: any) => {
        entitiesToSave.push({
          id: mObj.getData('id'),
          type: mObj.getData('type') === 'boss' ? 'boss' : (mObj.getData('type') === 'pet' ? 'pet' : 'monster'),
          gridX: mObj.getData('gridX'),
          gridY: mObj.getData('gridY'),
          isInteracted: false,
          monsterType: mObj.getData('type'),
          monsterName: mObj.getData('name'),
          isElite: mObj.getData('isElite') || false,
          eliteHp: mObj.getData('eliteHp') || 1,
          eliteMaxHp: mObj.getData('eliteMaxHp') || 1,
          petDbId: mObj.getData('petDbId'),
          bossDbId: mObj.getData('bossDbId')
        });
      });

      this.merchantsGroup.getChildren().forEach((merch: any) => {
        entitiesToSave.push({
          id: merch.getData('id') || `rest_${merch.getData('gridX')}_${merch.getData('gridY')}`,
          type: merch.getData('type'),
          gridX: merch.getData('gridX'),
          gridY: merch.getData('gridY'),
          isInteracted: false,
          restType: merch.getData('type')
        });
      });

      this.interactivesGroup.getChildren().forEach((iObj: any) => {
        entitiesToSave.push({
          id: iObj.getData('id') || `interactive_${iObj.getData('gridX')}_${iObj.getData('gridY')}`,
          type: iObj.getData('type'),
          gridX: iObj.getData('gridX'),
          gridY: iObj.getData('gridY'),
          isInteracted: false
        });
      });

      const generatedFloorState = {
        floor: this.currentFloor,
        grid: this.grid,
        playerGridX: this.playerGridX,
        playerGridY: this.playerGridY,
        portalActive: this.portalActive,
        entities: entitiesToSave
      };

      this.safeCall(GameBridge.onFloorStateCreated, generatedFloorState);
    }
  }

  private carvePath(x1: number, y1: number, x2: number, y2: number) {
    let curX = x1;
    let curY = y1;
    const biome = this.getBiomeKeys();
    
    while (curX !== x2) {
      curX += (x2 > curX) ? 1 : -1;
      if (curX >= 1 && curX < this.cols - 1 && curY >= 1 && curY < this.rows - 1) {
        if (this.grid[curY][curX] === 1) {
          this.grid[curY][curX] = 0;
          this.tileSprites[curY][curX].setTexture(biome.floor);
        }
      }
    }
    
    while (curY !== y2) {
      curY += (y2 > curY) ? 1 : -1;
      if (curX >= 1 && curX < this.cols - 1 && curY >= 1 && curY < this.rows - 1) {
        if (this.grid[curY][curX] === 1) {
          this.grid[curY][curX] = 0;
          this.tileSprites[curY][curX].setTexture(biome.floor);
        }
      }
    }
  }

  private navigateToCell(targetX: number, targetY: number) {
    const startTile = this.isMoving && this.currentTargetTile
      ? this.currentTargetTile
      : { x: this.playerGridX, y: this.playerGridY };

    const path = this.findBFSPath(
      startTile,
      { x: targetX, y: targetY }
    );
    
    if (path) {
      this.pathQueue = path;
      this.drawPathHighlights(path);
    }
  }

  private drawPathHighlights(path: { x: number; y: number }[]) {
    if (!this.pathHighlights) return;
    this.pathHighlights.clear();
    
    this.pathHighlights.lineStyle(3, 0xfacc15, 0.4);
    this.pathHighlights.beginPath();
    
    const startX = this.playerGridX * this.tileSize + this.tileSize / 2;
    const startY = this.playerGridY * this.tileSize + this.tileSize / 2;
    this.pathHighlights.moveTo(startX, startY);
    
    for (const node of path) {
      const nx = node.x * this.tileSize + this.tileSize / 2;
      const ny = node.y * this.tileSize + this.tileSize / 2;
      this.pathHighlights.lineTo(nx, ny);
    }
    
    this.pathHighlights.strokePath();

    for (const node of path) {
      this.pathHighlights.fillStyle(0xfacc15, 0.5);
      this.pathHighlights.fillCircle(
        node.x * this.tileSize + this.tileSize / 2,
        node.y * this.tileSize + this.tileSize / 2,
        4
      );
    }
  }

  private movePlayerToTile(tx: number, ty: number) {
    this.isMoving = true;
    this.currentTargetTile = { x: tx, y: ty };
    const nextX = tx * this.tileSize + this.tileSize / 2;
    const nextY = ty * this.tileSize + this.tileSize / 2;
    
    const bodySprite = this.player.list[0];
    this.tweens.add({
      targets: bodySprite,
      scaleY: 0.8,
      scaleX: 1.2,
      yoyo: true,
      duration: 100,
      repeat: 0
    });

    this.tweens.add({
      targets: this.player,
      x: nextX,
      y: nextY,
      duration: 200,
      ease: 'Power1',
      onComplete: () => {
        this.playerGridX = tx;
        this.playerGridY = ty;
        this.currentTargetTile = null;
        this.isMoving = false;
        this.drawPathHighlights(this.pathQueue);
        this.checkCollisions();
        this.safeCall(GameBridge.onPlayerMoved, tx, ty);
      }
    });
  }

  private checkCollisions() {
    this.interactivesGroup.getChildren().forEach((iObj: any) => {
      const cx = iObj.getData('gridX');
      const cy = iObj.getData('gridY');
      
      if (cx === this.playerGridX && cy === this.playerGridY) {
        this.triggerInteractive(iObj);
      }
    });

    this.monstersGroup.getChildren().forEach((mObj: any) => {
      const mx = mObj.getData('gridX');
      const my = mObj.getData('gridY');
      
      if (mx === this.playerGridX && my === this.playerGridY) {
        this.pathQueue = [];
        if (this.pathHighlights) this.pathHighlights.clear();
        
        this.activeMonsterId = mObj.getData('id');
        this.activeMonsterSprite = mObj;
        
        const type = mObj.getData('type');
        const name = mObj.getData('name') || "未知怪獸";
        const isElite = mObj.getData('isElite') || false;
        const eliteHp = mObj.getData('eliteHp') || 1;
        const petDbId = mObj.getData('petDbId');
        
        this.safeCall(GameBridge.onMonsterCollide, this.activeMonsterId!, type, name, isElite, eliteHp, petDbId);
      }
    });

    this.merchantsGroup.getChildren().forEach((merch: any) => {
      const mx = merch.getData('gridX');
      const my = merch.getData('gridY');
      
      if (mx === this.playerGridX && my === this.playerGridY) {
        this.pathQueue = [];
        if (this.pathHighlights) this.pathHighlights.clear();
        
        const restType = merch.getData('type') || 'merchant';
        this.safeCall(GameBridge.onMerchantCollide, restType);
        
        this.bounceBackFromMerchant(merch);
      }
    });

    let hitPortal: any = null;
    this.portalsGroup.getChildren().forEach((pObj: any) => {
      const px = pObj.getData('gridX');
      const py = pObj.getData('gridY');
      if (this.playerGridX === px && this.playerGridY === py) {
        hitPortal = pObj;
      }
    });

    if (hitPortal) {
      if (this.portalActive) {
        if (!this.isTransitioning) {
          this.isTransitioning = true;
          this.pathQueue = [];
          if (this.pathHighlights) this.pathHighlights.clear();
          
          RetroSFX.playWarp();
          this.cameras.main.fade(400, 9, 13, 22);
          this.cameras.main.once('camerafadeoutcomplete', () => {
            this.safeCall(GameBridge.onPortalReached);
          });
        }
      } else {
        this.showFloatingText(
          hitPortal.x, 
          hitPortal.y - 30, 
          "👹 擊敗所有怪獸以解鎖傳送門！", 
          "#ef4444"
        );
        this.bounceBackFromPortal();
      }
    }
  }

  private bounceBackFromPortal() {
    const directions = [
      {x: 0, y: 1}, {x: 0, y: -1}, {x: 1, y: 0}, {x: -1, y: 0}
    ];
    for (const dir of directions) {
      const nx = this.playerGridX + dir.x;
      const ny = this.playerGridY + dir.y;
      if (nx >= 0 && nx < this.cols && ny >= 0 && ny < this.rows) {
        if (this.grid[ny][nx] === 0) {
          this.playerGridX = nx;
          this.playerGridY = ny;
          this.tweens.add({
            targets: this.player,
            x: nx * this.tileSize + this.tileSize / 2,
            y: ny * this.tileSize + this.tileSize / 2,
            duration: 150
          });
          break;
        }
      }
    }
  }

  private bounceBackFromMerchant(merch: any) {
    const mx = merch.getData('gridX');
    const my = merch.getData('gridY');
    const directions = [
      {x: 0, y: 1}, {x: 0, y: -1}, {x: 1, y: 0}, {x: -1, y: 0}
    ];
    for (const dir of directions) {
      const nx = this.playerGridX + dir.x;
      const ny = this.playerGridY + dir.y;
      if (nx >= 0 && nx < this.cols && ny >= 0 && ny < this.rows) {
        if (this.grid[ny][nx] === 0 && (nx !== mx || ny !== my)) {
          this.playerGridX = nx;
          this.playerGridY = ny;
          this.tweens.add({
            targets: this.player,
            x: nx * this.tileSize + this.tileSize / 2,
            y: ny * this.tileSize + this.tileSize / 2,
            duration: 150
          });
          break;
        }
      }
    }
  }

  private triggerInteractive(iObj: any) {
    const type = iObj.getData('type');
    this.safeCall(GameBridge.onEntityInteracted, iObj.getData('id'), { isInteracted: true });
    this.interactivesGroup.remove(iObj);
    
    this.tweens.add({
      targets: iObj,
      scale: 0,
      angle: 180,
      duration: 300,
      onComplete: () => {
        iObj.destroy();
      }
    });

    this.createConfetti(iObj.x, iObj.y);

    if (type === 'rock') {
      // Rock: 1-5 gold coins
      const gold = 1 + Math.floor(Math.random() * 5);
      this.safeCall(GameBridge.onGoldGained, gold);
      RetroSFX.playCoin();
      this.safeCall(GameBridge.onLogUpdated, `🪨 Jovan 翻開了一塊路邊的奇異原石...驚喜地發現了 ${gold} 金幣！🟡`);
      this.showFloatingText(iObj.x, iObj.y - 20, `+${gold} 金幣 🟡`, '#cbd5e1');
    } 
    else if (type === 'skeleton') {
      // Skeleton: 10% damage, 90% loot (max 5 gold or 5 XP)
      const isDamaged = Math.random() < 0.1;
      if (isDamaged) {
        this.safeCall(GameBridge.onHpLost, 1);
        RetroSFX.playHurt();
        this.safeCall(GameBridge.onLogUpdated, `💀 糟糕！骷髏頭骨突然射出幽藍詛咒射線！Jovan 受到詛咒，HP -1 ❤️`);
        this.showFloatingText(iObj.x, iObj.y - 20, "詛咒傷害！HP -1 ❤️", '#ef4444');
      } else {
        const rewardType = Math.random() < 0.4 ? 'potion' : 'gold';
        if (rewardType === 'potion') {
          const isHp = Math.random() < 0.5;
          if (isHp) {
            this.safeCall(GameBridge.onHpHealed, 1);
            RetroSFX.playFanfare();
            this.safeCall(GameBridge.onLogUpdated, `💀 從散落的骸骨堆中，Jovan 發現並喝下「微光生命藥水」！HP +1 ❤️`);
            this.showFloatingText(iObj.x, iObj.y - 20, "生命藥水！HP +1 ❤️", '#4ade80');
          } else {
            const xp = 1 + Math.floor(Math.random() * 5);
            this.safeCall(GameBridge.onXPGained, xp);
            RetroSFX.playFanfare();
            this.safeCall(GameBridge.onLogUpdated, `💀 從散落的骸骨堆中，Jovan 發現並喝下「微光智慧藥水」！獲得 +${xp} XP ⭐`);
            this.showFloatingText(iObj.x, iObj.y - 20, `+${xp} XP ⭐`, '#60a5fa');
          }
        } else {
          const gold = 1 + Math.floor(Math.random() * 5);
          this.safeCall(GameBridge.onGoldGained, gold);
          RetroSFX.playCoin();
          this.safeCall(GameBridge.onLogUpdated, `💀 從骸骨堆中，Jovan 搜刮到 ${gold} 金幣！🟡`);
          this.showFloatingText(iObj.x, iObj.y - 20, `+${gold} 金幣 🟡`, '#facc15');
        }
      }
    } 
    else if (type === 'bag') {
      // Money Bag: random potion or gold (1-5 gold or 1-5 XP)
      const isPotion = Math.random() < 0.3;
      if (isPotion) {
        const isHp = Math.random() < 0.5;
        if (isHp) {
          this.safeCall(GameBridge.onHpHealed, 1);
          RetroSFX.playFanfare();
          this.safeCall(GameBridge.onLogUpdated, `💰 拾起錢袋，裡面裝有一瓶「微光生命藥水」！立即飲用 HP +1 ❤️`);
          this.showFloatingText(iObj.x, iObj.y - 20, "生命藥水！HP +1 ❤️", '#4ade80');
        } else {
          const xp = 1 + Math.floor(Math.random() * 5);
          this.safeCall(GameBridge.onXPGained, xp);
          RetroSFX.playFanfare();
          this.safeCall(GameBridge.onLogUpdated, `💰 拾起錢袋，裡面裝有一瓶「微光智慧藥水」！立即飲用獲得 +${xp} XP ⭐`);
          this.showFloatingText(iObj.x, iObj.y - 20, `+${xp} XP ⭐`, '#60a5fa');
        }
      } else {
        const gold = 1 + Math.floor(Math.random() * 5);
        this.safeCall(GameBridge.onGoldGained, gold);
        RetroSFX.playCoin();
        this.safeCall(GameBridge.onLogUpdated, `💰 撿到遺落的錢袋！獲得了 ${gold} 金幣。🟡`);
        this.showFloatingText(iObj.x, iObj.y - 20, `+${gold} 金幣 🟡`, '#facc15');
      }
    } 
    else if (type === 'chest') {
      // Treasure Chest: 5% mimic, 95% rewards (1-5 gold or 1-5 XP)
      const isMimic = Math.random() < 0.05;
      if (isMimic) {
        this.safeCall(GameBridge.onHpLost, 1);
        RetroSFX.playHurt();
        this.safeCall(GameBridge.onLogUpdated, `⚠️ 糟糕！寶箱居然長出尖牙，是擬態寶箱怪！Jovan 被咬了一口，HP -1 ❤️`);
        this.showFloatingText(iObj.x, iObj.y - 20, "寶箱怪咬擊！HP -1 ❤️", '#ef4444');
      } else {
        const isPotion = Math.random() < 0.4;
        if (isPotion) {
          const isHp = Math.random() < 0.5;
          if (isHp) {
            this.safeCall(GameBridge.onHpHealed, 1);
            RetroSFX.playFanfare();
            this.safeCall(GameBridge.onLogUpdated, `🎁 打開古老寶箱，裡面藏有「強效生命藥水」！立即飲用 HP +1 ❤️`);
            this.showFloatingText(iObj.x, iObj.y - 20, "生命藥水！HP +1 ❤️", '#4ade80');
          } else {
            const xp = 1 + Math.floor(Math.random() * 5);
            this.safeCall(GameBridge.onXPGained, xp);
            RetroSFX.playFanfare();
            this.safeCall(GameBridge.onLogUpdated, `🎁 打開古老寶箱，裡面藏有「強效智慧藥水」！獲得 +${xp} XP ⭐`);
            this.showFloatingText(iObj.x, iObj.y - 20, `+${xp} XP ⭐`, '#60a5fa');
          }
        } else {
          const gold = 1 + Math.floor(Math.random() * 5);
          this.safeCall(GameBridge.onGoldGained, gold);
          RetroSFX.playCoin();
          this.safeCall(GameBridge.onLogUpdated, `🎁 寶箱打開了！獲得了 ${gold} 金幣。🟡`);
          this.showFloatingText(iObj.x, iObj.y - 20, `+${gold} 金幣 🟡`, '#facc15');
        }
      }
    }
  }

  public resolveCombat(correct: boolean, isDefeated: boolean = true) {
    if (!this.activeMonsterSprite) {
      this.activeMonsterId = null;
      this.activeMonsterSprite = null;
      return;
    }
    
    const monsterSprite = this.activeMonsterSprite;
    const monsterX = monsterSprite.x;
    const monsterY = monsterSprite.y;
    const isPet = monsterSprite.getData('type') === 'pet';
    
    // Safety check to ensure references are cleared immediately upon defeat or escape
    if (isPet || (correct && isDefeated)) {
      this.activeMonsterId = null;
      this.activeMonsterSprite = null;
    }
    
    if (isPet) {
      if (correct) {
        // Pet successfully captured!
        this.tweens.add({
          targets: this.player,
          x: monsterX,
          y: monsterY,
          duration: 150,
          yoyo: true,
          hold: 50,
          onComplete: () => {
            this.cameras.main.flash(200, 255, 255, 255);
            this.cameras.main.shake(250, 0.025);
            this.createConfetti(monsterX, monsterY);
            RetroSFX.playHit();
            
            this.showFloatingText(monsterX, monsterY - 20, "成功收服！💖", "#2dd4bf");
            
            this.tweens.add({
              targets: monsterSprite,
              scale: 0,
              angle: 360,
              duration: 350,
              onComplete: () => {
                if (monsterSprite && monsterSprite.active) {
                  this.monstersGroup.remove(monsterSprite);
                  monsterSprite.destroy();
                }
                this.checkPortalUnlockStatus();
              }
            });
          }
        });
      } else {
        // Pet capture failed (answer wrong or time up) -> Pet disappears immediately!
        this.cameras.main.flash(150, 255, 255, 255);
        this.cameras.main.shake(150, 0.015);
        
        this.showFloatingText(monsterX, monsterY - 20, "受到驚嚇溜走了！💨", "#94a3b8");
        
        this.tweens.add({
          targets: monsterSprite,
          scale: 0,
          alpha: 0,
          angle: 180,
          duration: 350,
          onComplete: () => {
            if (monsterSprite && monsterSprite.active) {
              this.monstersGroup.remove(monsterSprite);
              monsterSprite.destroy();
            }
            this.checkPortalUnlockStatus();
          }
        });
      }
      return;
    }

    if (correct) {
      if (!isDefeated) {
        // Monster is damaged but not yet defeated!
        this.cameras.main.flash(150, 255, 255, 255);
        this.cameras.main.shake(200, 0.015);
        this.createConfetti(monsterX, monsterY);
        RetroSFX.playHit();
        this.showFloatingText(monsterX, monsterY - 20, "命中！💥", "#facc15");
        
        // Flash the monster red
        if (monsterSprite && monsterSprite.active) {
          monsterSprite.setTint(0xff0000);
          this.time.delayedCall(250, () => {
            if (monsterSprite && monsterSprite.active) {
              monsterSprite.clearTint();
            }
          });
        }
        return;
      }

      this.tweens.add({
        targets: this.player,
        x: monsterX,
        y: monsterY,
        duration: 150,
        yoyo: true,
        hold: 50,
        onComplete: () => {
          this.cameras.main.flash(200, 255, 255, 255);
          this.cameras.main.shake(250, 0.025);
          this.createConfetti(monsterX, monsterY);
          RetroSFX.playHit();
          
          const isElite = monsterSprite.getData('isElite') || false;
          this.showFloatingText(monsterX, monsterY - 20, isElite ? "超強一擊！擊潰！☠️" : "必殺擊倒！💥", "#4ade80");
          
          this.tweens.add({
            targets: monsterSprite,
            scale: 0,
            angle: 360,
            duration: 350,
            onComplete: () => {
              if (monsterSprite && monsterSprite.active) {
                this.monstersGroup.remove(monsterSprite);
                monsterSprite.destroy();
              }
              
              // Clear any running boss environmental effect loops immediately upon defeat
              this.bossTimerEvents.forEach(e => {
                try { e.destroy(); } catch (err) {}
              });
              this.bossTimerEvents = [];
              
              // Elite grants 2x gold and 2.5x XP rewards!
              const goldMultiplier = isElite ? 2 : 1;

              const lootGold = Math.floor((15 + Math.floor(Math.random() * 11)) * goldMultiplier);
              const lootXP = isElite 
                ? (5 + Math.floor(Math.random() * 6)) // 5 to 10 XP
                : (1 + Math.floor(Math.random() * 5)); // 1 to 5 XP
              
              this.safeCall(GameBridge.onGoldGained, lootGold);
              this.safeCall(GameBridge.onXPGained, lootXP);
              RetroSFX.playCoin();
              this.safeCall(GameBridge.onLogUpdated, isElite 
                ? `⚔️ 成功消滅精英怪！獲得巨額戰利品：${lootGold} 金幣與 ${lootXP} XP！🏆`
                : `⚔️ 擊敗怪獸！奪取了 ${lootGold} 金幣與 ${lootXP} XP。`
              );
              
              this.showFloatingText(monsterX, monsterY - 35, `+${lootGold} 金幣 🟡`, '#facc15');
              this.showFloatingText(monsterX, monsterY - 55, `+${lootXP} XP ⭐`, '#60a5fa');
              
              this.checkPortalUnlockStatus();
            }
          });
        }
      });
    } else {
      // Wrong answer
      this.tweens.add({
        targets: monsterSprite,
        x: this.player.x,
        y: this.player.y,
        duration: 150,
        yoyo: true,
        hold: 50,
        onComplete: () => {
          this.cameras.main.flash(200, 255, 0, 0); // Flash RED!
          this.cameras.main.shake(300, 0.035); // Super shake!
          RetroSFX.playHurt();
          
          const bodySprite = this.player.list[0];
          if (bodySprite && bodySprite.setTint) {
            bodySprite.setTint(0xff0000);
            this.time.delayedCall(300, () => {
              if (bodySprite && bodySprite.clearTint) bodySprite.clearTint();
            });
          }

          this.showFloatingText(this.player.x, this.player.y - 30, "哎呀！HP -1 ❤️", "#ef4444");
          
          this.safeCall(GameBridge.onHpLost, 1);
          this.safeCall(GameBridge.onLogUpdated, `👾 答錯了！遭受怪獸反擊，損失了 1 點生命值。`);

          this.bounceAwayFromMonster(monsterSprite);
        }
      });
    }
  }

  public destroyMerchant() {
    this.merchantsGroup.getChildren().forEach((m: any) => {
      this.safeCall(GameBridge.onEntityInteracted, m.getData('id'), { isInteracted: true });
      this.tweens.add({
        targets: m,
        scale: 0,
        angle: 180,
        duration: 300,
        onComplete: () => {
          m.destroy();
        }
      });
    });
  }

  public wipeAllMonsters(noRewards = false) {
    const monsters = this.monstersGroup.getChildren();
    if (monsters.length === 0) return;

    this.cameras.main.flash(400, 255, 230, 0);
    this.cameras.main.shake(500, 0.04);
    RetroSFX.playHit();

    // To prevent modification of array during iteration, copy the list
    const listCopy = [...monsters];
    listCopy.forEach((monsterSprite: any) => {
      const type = monsterSprite.getData('type');
      if (type === 'boss') {
        monsterSprite.setTint(0xff0000);
        this.time.delayedCall(500, () => {
          monsterSprite.clearTint();
        });
        this.showFloatingText(monsterSprite.x, monsterSprite.y - 30, "重創 -2 HP！💥", "#ef4444");
        return; // Skip boss
      }

      this.safeCall(GameBridge.onEntityInteracted, monsterSprite.getData('id'), { isInteracted: true });

      const mx = monsterSprite.x;
      const my = monsterSprite.y;
      const isElite = monsterSprite.getData('isElite') || false;

      this.createConfetti(mx, my);

      // Remove from the group IMMEDIATELY so remaining checks are instantly accurate!
      this.monstersGroup.remove(monsterSprite);

      this.tweens.add({
        targets: monsterSprite,
        scale: 0,
        angle: 720,
        duration: 500,
        onComplete: () => {
          monsterSprite.destroy();

          if (!noRewards) {
            const goldMultiplier = isElite ? 2 : 1;
            const lootGold = Math.floor((15 + Math.floor(Math.random() * 11)) * goldMultiplier);
            const lootXP = isElite 
              ? (5 + Math.floor(Math.random() * 6)) // 5 to 10 XP
              : (1 + Math.floor(Math.random() * 5)); // 1 to 5 XP

            this.safeCall(GameBridge.onGoldGained, lootGold);
            this.safeCall(GameBridge.onXPGained, lootXP);
            
            this.showFloatingText(mx, my - 20, `+${lootGold} 🟡`, '#facc15');
            this.showFloatingText(mx, my - 40, `+${lootXP} ⭐`, '#60a5fa');
          }
        }
      });
    });

    this.activeMonsterId = null;
    this.activeMonsterSprite = null;

    this.checkPortalUnlockStatus();

    this.time.delayedCall(600, () => {
      this.checkPortalUnlockStatus();
    });
  }

  private bounceAwayFromMonster(monsterSprite: any) {
    const mx = monsterSprite.getData('gridX');
    const my = monsterSprite.getData('gridY');
    
    const checkOffsets = [
      {x: 0, y: 1}, {x: 0, y: -1}, {x: -1, y: 0}, {x: 1, y: 0}
    ];
    for (const offset of checkOffsets) {
      const nx = this.playerGridX + offset.x;
      const ny = this.playerGridY + offset.y;
      
      if (nx >= 0 && nx < this.cols && ny >= 0 && ny < this.rows) {
        if (this.grid[ny][nx] === 0 && (nx !== mx || ny !== my)) {
          this.playerGridX = nx;
          this.playerGridY = ny;
          this.tweens.add({
            targets: this.player,
            x: nx * this.tileSize + this.tileSize / 2,
            y: ny * this.tileSize + this.tileSize / 2,
            duration: 200,
            onComplete: () => {
              this.activeMonsterId = null;
              this.activeMonsterSprite = null;
            }
          });
          return;
        }
      }
    }
    
    this.activeMonsterId = null;
    this.activeMonsterSprite = null;
  }

  private checkPortalUnlockStatus() {
    const remaining = this.monstersGroup.getLength();
    if (remaining === 0) {
      this.portalActive = true;
      
      this.portalsGroup.getChildren().forEach((pObj: any) => {
        pObj.setAlpha(1.0);
        this.tweens.add({
          targets: pObj,
          scale: 1.1,
          yoyo: true,
          duration: 300,
          repeat: 2
        });
      });

      const alertBg = this.add.rectangle(400, 240, 800, 80, 0x0f172a, 0.85);
      const alertTxt = this.add.text(
        400, 
        240, 
        '🌀 傳送門已解鎖！趕快踩上任一傳送門爬上下一層塔！', 
        {
          fontFamily: 'Fredoka, sans-serif',
          fontSize: '22px',
          fontStyle: 'bold',
          color: '#facc15'
        }
      ).setOrigin(0.5);

      this.time.delayedCall(3000, () => {
        alertBg.destroy();
        alertTxt.destroy();
      });

      this.safeCall(GameBridge.onLogUpdated, "✨ 全部的怪獸都被消滅了！三個傳送門同時閃爍著奇妙的光彩！");
    }
  }

  private showFloatingText(x: number, y: number, text: string, color: string) {
    const txt = this.add.text(x, y, text, {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '15px',
      color: color,
      backgroundColor: '#000000aa',
      padding: { x: 6, y: 2 }
    }).setOrigin(0.5);

    this.tweens.add({
      targets: txt,
      y: y - 50,
      alpha: 0,
      duration: 1500,
      onComplete: () => txt.destroy()
    });
  }

  private createConfetti(x: number, y: number) {
    for (let i = 0; i < 12; i++) {
      const spark = this.add.image(x, y, 'gold_coin');
      spark.setScale(0.5 + Math.random() * 0.4);
      
      const angle = Math.random() * Math.PI * 2;
      const speed = 50 + Math.random() * 150;
      const targetX = x + Math.cos(angle) * speed;
      const targetY = y + Math.sin(angle) * speed;
      
      this.tweens.add({
        targets: spark,
        x: targetX,
        y: targetY,
        angle: Math.random() * 360,
        alpha: 0,
        scale: 0.1,
        duration: 800 + Math.random() * 400,
        ease: 'Cubic.easeOut',
        onComplete: () => spark.destroy()
      });
    }
  }

  private findBFSPath(start: { x: number; y: number }, end: { x: number; y: number }): { x: number; y: number }[] | null {
    const queue: { x: number; y: number; path: { x: number; y: number }[] }[] = [];
    const visited = new Set<string>();
    
    queue.push({ x: start.x, y: start.y, path: [] });
    visited.add(`${start.x},${start.y}`);
    
    const directions = [
      { x: 0, y: -1 },
      { x: 0, y: 1 },
      { x: -1, y: 0 },
      { x: 1, y: 0 }
    ];

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (current.x === end.x && current.y === end.y) {
        return current.path;
      }
      
      for (const dir of directions) {
        const nx = current.x + dir.x;
        const ny = current.y + dir.y;
        const key = `${nx},${ny}`;
        
        if (nx >= 0 && nx < this.cols && ny >= 0 && ny < this.rows) {
          if (this.grid[ny][nx] === 0 && !visited.has(key)) {
            visited.add(key);
            queue.push({
              x: nx,
              y: ny,
              path: [...current.path, { x: nx, y: ny }]
            });
          }
        }
      }
    }
    return null;
  }

  // --- Dynamic Canvas Textures Drawing Functions ---

  private createGrassTexture() {
    const canvas = this.textures.createCanvas('grass', this.tileSize, this.tileSize);
    const ctx = canvas.getContext();
    
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(0, 0, this.tileSize, this.tileSize);
    
    ctx.fillStyle = '#4ade80';
    ctx.fillRect(8, 8, 4, 4);
    ctx.fillRect(32, 12, 4, 4);
    ctx.fillRect(16, 28, 4, 4);
    ctx.fillRect(36, 36, 4, 4);
    
    ctx.fillStyle = '#15803d';
    ctx.fillRect(12, 16, 4, 12);
    ctx.fillRect(16, 20, 4, 8);
    ctx.fillRect(28, 30, 4, 10);
    ctx.fillRect(32, 34, 4, 6);
    
    canvas.refresh();
  }

  private createCaveTexture() {
    const canvas = this.textures.createCanvas('cave', this.tileSize, this.tileSize);
    const ctx = canvas.getContext();
    ctx.fillStyle = '#334155';
    ctx.fillRect(0, 0, this.tileSize, this.tileSize);
    ctx.fillStyle = '#475569';
    ctx.fillRect(4, 10, 6, 4);
    ctx.fillRect(28, 6, 8, 3);
    ctx.fillRect(16, 32, 5, 5);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(10, 20, 12, 4);
    ctx.fillRect(32, 28, 6, 6);
    canvas.refresh();
  }

  private createStoneWallTexture() {
    const canvas = this.textures.createCanvas('stone_wall', this.tileSize, this.tileSize);
    const ctx = canvas.getContext();
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, this.tileSize, this.tileSize);
    ctx.fillStyle = '#334155';
    ctx.fillRect(0, 0, this.tileSize, 8);
    ctx.fillRect(0, 24, this.tileSize, 8);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 22, this.tileSize, 2);
    ctx.fillRect(16, 0, 4, 22);
    ctx.fillRect(32, 24, 4, 24);
    canvas.refresh();
  }

  private createSnowTexture() {
    const canvas = this.textures.createCanvas('snow', this.tileSize, this.tileSize);
    const ctx = canvas.getContext();
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(0, 0, this.tileSize, this.tileSize);
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(8, 12, 10, 10);
    ctx.fillRect(32, 24, 8, 8);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(20, 4, 4, 4);
    ctx.fillRect(12, 32, 6, 6);
    canvas.refresh();
  }

  private createIceWallTexture() {
    const canvas = this.textures.createCanvas('ice_wall', this.tileSize, this.tileSize);
    const ctx = canvas.getContext();
    ctx.fillStyle = '#93c5fd';
    ctx.fillRect(0, 0, this.tileSize, this.tileSize);
    ctx.fillStyle = '#bfdbfe';
    ctx.fillRect(4, 4, this.tileSize - 8, 6);
    ctx.fillRect(4, 14, 10, 20);
    ctx.fillStyle = '#2563eb';
    ctx.fillRect(0, 0, this.tileSize, 2);
    ctx.fillRect(0, 46, this.tileSize, 2);
    ctx.fillRect(15, 10, 2, 20);
    ctx.fillRect(30, 25, 2, 15);
    canvas.refresh();
  }

  private createVolcanoTexture() {
    const canvas = this.textures.createCanvas('volcano', this.tileSize, this.tileSize);
    const ctx = canvas.getContext();
    ctx.fillStyle = '#450a0a';
    ctx.fillRect(0, 0, this.tileSize, this.tileSize);
    ctx.fillStyle = '#ea580c';
    ctx.fillRect(10, 0, 4, this.tileSize);
    ctx.fillRect(0, 20, this.tileSize, 4);
    ctx.fillStyle = '#f97316';
    ctx.fillRect(10, 18, 5, 5);
    ctx.fillRect(28, 28, 6, 6);
    canvas.refresh();
  }

  private createLavaWallTexture() {
    const canvas = this.textures.createCanvas('lava_wall', this.tileSize, this.tileSize);
    const ctx = canvas.getContext();
    ctx.fillStyle = '#7f1d1d';
    ctx.fillRect(0, 0, this.tileSize, this.tileSize);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(0, 12, this.tileSize, 4);
    ctx.fillRect(20, 0, 4, this.tileSize);
    ctx.fillStyle = '#f97316';
    ctx.fillRect(18, 10, 8, 8);
    canvas.refresh();
  }

  private createRuinsTexture() {
    const canvas = this.textures.createCanvas('ruins', this.tileSize, this.tileSize);
    const ctx = canvas.getContext();
    ctx.fillStyle = '#115e59';
    ctx.fillRect(0, 0, this.tileSize, this.tileSize);
    ctx.fillStyle = '#134e4a';
    ctx.fillRect(4, 8, 16, 12);
    ctx.fillRect(24, 28, 12, 12);
    ctx.fillStyle = '#0d9488';
    ctx.fillRect(14, 14, 3, 3);
    ctx.fillRect(30, 10, 3, 3);
    canvas.refresh();
  }

  private createRuinWallTexture() {
    const canvas = this.textures.createCanvas('ruin_wall', this.tileSize, this.tileSize);
    const ctx = canvas.getContext();
    ctx.fillStyle = '#134e4a';
    ctx.fillRect(0, 0, this.tileSize, this.tileSize);
    ctx.fillStyle = '#115e59';
    ctx.fillRect(0, 0, this.tileSize, 6);
    ctx.fillRect(0, 24, this.tileSize, 6);
    ctx.fillStyle = '#042f2e';
    ctx.fillRect(10, 0, 4, 24);
    ctx.fillRect(28, 24, 4, 24);
    canvas.refresh();
  }

  private createWallTexture() {
    const canvas = this.textures.createCanvas('wall', this.tileSize, this.tileSize);
    const ctx = canvas.getContext();
    
    ctx.fillStyle = '#475569';
    ctx.fillRect(0, 0, this.tileSize, this.tileSize);
    
    ctx.fillStyle = '#64748b';
    ctx.fillRect(0, 0, this.tileSize, 6);
    ctx.fillRect(0, 24, this.tileSize, 6);
    
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 22, this.tileSize, 2);
    ctx.fillRect(0, 46, this.tileSize, 2);
    ctx.fillRect(22, 0, 2, 22);
    ctx.fillRect(12, 24, 2, 24);
    ctx.fillRect(34, 24, 2, 24);
    
    canvas.refresh();
  }

  private createHeroTextureForJob(key: string, jobId: string) {
    const canvas = this.textures.createCanvas(key, this.tileSize, this.tileSize);
    const ctx = canvas.getContext();
    
    ctx.clearRect(0, 0, this.tileSize, this.tileSize);
    
    // Default values
    let bodyColor = '#3b82f6'; // Blue warrior plate
    let hairColor = '#eab308'; // Golden blond
    let hairHighlightColor = '#fef08a';
    let skinColor = '#fed7aa'; // Peach skin
    let rightWeaponColor = '#cbd5e1';
    let rightWeaponHandleColor = '#ea580c';
    let hasShield = false;
    let hasConicalHat = false;
    let conicalHatColor = '#581c87';
    let conicalHatTrimColor = '#c084fc';
    let hasHalo = false;
    let isStout = false; // Dwarf has wider, shorter body
    let hasBeard = false;
    let beardColor = '#ea580c';
    let eyesColor = '#0f172a';

    // Customize values based on jobId
    if (jobId === 'warrior') {
      bodyColor = '#3b82f6'; // blue armor
      hairColor = '#fbbf24'; // blonde
      hairHighlightColor = '#fef08a';
      hasShield = true;
    } else if (jobId === 'samurai') {
      bodyColor = '#b91c1c'; // deep red
      hairColor = '#111827'; // black
      hairHighlightColor = '#374151';
      rightWeaponColor = '#f8fafc'; // gleaming steel katana
      rightWeaponHandleColor = '#111827';
    } else if (jobId === 'dwarf') {
      bodyColor = '#b45309'; // copper/bronze mail
      hairColor = '#d97706'; // ginger hair
      hairHighlightColor = '#f59e0b';
      isStout = true;
      hasBeard = true;
      beardColor = '#ea580c';
      rightWeaponColor = '#94a3b8'; // big twin iron axe
      rightWeaponHandleColor = '#78350f';
    } else if (jobId === 'mage') {
      bodyColor = '#6b21a8'; // purple robes
      hairColor = '#e2e8f0'; // silver white hair
      hairHighlightColor = '#ffffff';
      hasConicalHat = true;
      conicalHatColor = '#581c87';
      conicalHatTrimColor = '#c084fc';
      rightWeaponColor = '#38bdf8'; // azure glowing wand orb
      rightWeaponHandleColor = '#78350f'; // wooden staff
    } else if (jobId === 'warlock') {
      bodyColor = '#1e1b4b'; // dark void purple robe
      hairColor = '#a855f7'; // violet spiky hair
      hairHighlightColor = '#e9d5ff';
      hasConicalHat = true;
      conicalHatColor = '#0f172a'; // void black hat
      conicalHatTrimColor = '#22c55e'; // lime green trim
      rightWeaponColor = '#a3e635'; // acidic green spellbook glow
      rightWeaponHandleColor = '#1e1b4b';
    } else if (jobId === 'cleric') {
      bodyColor = '#f8fafc'; // pure white robes
      hairColor = '#78350f'; // soft brown hair
      hairHighlightColor = '#b45309';
      hasHalo = true;
      rightWeaponColor = '#facc15'; // golden cross staff
      rightWeaponHandleColor = '#eab308';
    } else if (jobId === 'thief') {
      bodyColor = '#064e3b'; // dark forest green leather
      hairColor = '#7c2d12'; // auburn hair
      hairHighlightColor = '#ba5911';
      rightWeaponColor = '#94a3b8'; // dual silver daggers
      rightWeaponHandleColor = '#111827';
    } else if (jobId === 'dancer') {
      bodyColor = '#db2777'; // ruby pink dance dress
      hairColor = '#f472b6'; // pink flowing hair
      hairHighlightColor = '#fbcfe8';
      rightWeaponColor = '#ec4899'; // pink silk fan
      rightWeaponHandleColor = '#fbbf24'; // gold fan handle
    } else if (jobId === 'archer') {
      bodyColor = '#16a34a'; // emerald green outfit
      hairColor = '#84cc16'; // lime hair
      hairHighlightColor = '#bef264';
      rightWeaponColor = '#a16207'; // wooden longbow
      rightWeaponHandleColor = '#eab308';
    } else if (jobId === 'sage') {
      bodyColor = '#1d4ed8'; // deep sapphire robe
      hairColor = '#cbd5e1'; // long white sage beard & hair
      hairHighlightColor = '#f1f5f9';
      hasBeard = true;
      beardColor = '#cbd5e1';
      rightWeaponColor = '#ffffff'; // glowing ancient tome
      rightWeaponHandleColor = '#b45309'; // leather book binding
    }

    // 1. Draw Body/Robes/Armor
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    if (isStout) {
      ctx.arc(24, 29, 14, 0, Math.PI * 2);
    } else {
      ctx.arc(24, 26, 12, 0, Math.PI * 2);
    }
    ctx.fill();

    // 2. Draw Hair (back & crown)
    ctx.fillStyle = hairColor;
    ctx.beginPath();
    ctx.arc(24, 18, 11, Math.PI, 0);
    ctx.fill();

    // Hair highlights
    ctx.fillStyle = hairHighlightColor;
    ctx.fillRect(14, 17, 20, 3);

    // 3. Draw Face (skin)
    ctx.fillStyle = skinColor;
    if (isStout) {
      ctx.fillRect(15, 22, 18, 6);
    } else {
      ctx.fillRect(16, 21, 16, 6);
    }

    // 4. Draw Beard
    if (hasBeard) {
      ctx.fillStyle = beardColor;
      ctx.fillRect(15, 26, 18, 8);
      ctx.fillRect(13, 22, 2, 6);
      ctx.fillRect(33, 22, 2, 6);
    }

    // 5. Draw Eyes
    ctx.fillStyle = eyesColor;
    ctx.fillRect(18, 22, 3, 3);
    ctx.fillRect(27, 22, 3, 3);

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(18, 22, 1, 1);
    ctx.fillRect(27, 22, 1, 1);

    // Pink Cheeks
    ctx.fillStyle = '#f43f5e';
    ctx.fillRect(15, 25, 2, 2);
    ctx.fillRect(31, 25, 2, 2);

    // 6. Conical wizard/warlock hat
    if (hasConicalHat) {
      ctx.fillStyle = conicalHatColor;
      ctx.fillRect(10, 12, 28, 4);
      
      ctx.beginPath();
      ctx.moveTo(12, 12);
      ctx.lineTo(24, 0);
      ctx.lineTo(36, 12);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = conicalHatTrimColor;
      ctx.fillRect(14, 11, 20, 2);
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(23, 8, 3, 3);
    }

    // 7. Halo
    if (hasHalo) {
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(24, 6, 8, 3, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // 8. Shield
    if (hasShield) {
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(6, 18, 5, 12);
      ctx.fillStyle = '#475569';
      ctx.fillRect(8, 20, 1, 8);
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(5, 18, 1, 12);
      ctx.fillRect(11, 18, 1, 12);
      ctx.fillRect(5, 17, 7, 1);
      ctx.fillRect(5, 30, 7, 1);
    }

    // 9. Weapons
    if (jobId === 'warrior') {
      ctx.fillStyle = rightWeaponColor;
      ctx.fillRect(36, 12, 3, 16);
      ctx.fillStyle = '#475569';
      ctx.fillRect(34, 25, 7, 2);
      ctx.fillStyle = '#7c2d12';
      ctx.fillRect(37, 27, 1, 5);
    } else if (jobId === 'samurai') {
      ctx.strokeStyle = rightWeaponColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(35, 30);
      ctx.lineTo(44, 10);
      ctx.stroke();
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(34, 28, 4, 2);
    } else if (jobId === 'dwarf') {
      ctx.fillStyle = rightWeaponHandleColor;
      ctx.fillRect(36, 12, 2, 20);
      ctx.fillStyle = rightWeaponColor;
      ctx.fillRect(32, 14, 4, 6);
      ctx.fillRect(38, 14, 4, 6);
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(31, 15, 1, 4);
      ctx.fillRect(42, 15, 1, 4);
    } else if (jobId === 'mage') {
      ctx.fillStyle = rightWeaponHandleColor;
      ctx.fillRect(37, 12, 2, 20);
      ctx.fillStyle = rightWeaponColor;
      ctx.beginPath();
      ctx.arc(38, 10, 4, 0, Math.PI * 2);
      ctx.fill();
    } else if (jobId === 'warlock') {
      ctx.fillStyle = rightWeaponHandleColor;
      ctx.fillRect(37, 14, 2, 18);
      ctx.fillStyle = rightWeaponColor;
      ctx.fillRect(34, 8, 7, 6);
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(35, 9, 5, 4);
    } else if (jobId === 'cleric') {
      ctx.fillStyle = rightWeaponHandleColor;
      ctx.fillRect(37, 12, 2, 20);
      ctx.fillStyle = rightWeaponColor;
      ctx.fillRect(34, 14, 8, 2);
      ctx.fillRect(37, 11, 2, 8);
    } else if (jobId === 'thief') {
      ctx.fillStyle = rightWeaponColor;
      ctx.fillRect(37, 18, 2, 8);
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(36, 26, 4, 1);
      ctx.fillStyle = rightWeaponColor;
      ctx.fillRect(9, 18, 2, 8);
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(8, 26, 4, 1);
    } else if (jobId === 'dancer') {
      ctx.fillStyle = rightWeaponHandleColor;
      ctx.fillRect(37, 24, 2, 6);
      ctx.fillStyle = rightWeaponColor;
      ctx.beginPath();
      ctx.arc(38, 21, 6, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = '#f472b6';
      ctx.fillRect(35, 20, 6, 2);
    } else if (jobId === 'archer') {
      ctx.strokeStyle = rightWeaponColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(38, 22, 8, -Math.PI / 2, Math.PI / 2);
      ctx.stroke();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(38, 14);
      ctx.lineTo(38, 30);
      ctx.stroke();
    } else if (jobId === 'sage') {
      ctx.fillStyle = rightWeaponHandleColor;
      ctx.fillRect(33, 16, 10, 11);
      ctx.fillStyle = rightWeaponColor;
      ctx.fillRect(34, 17, 8, 9);
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(38, 21, 2, 2);
    }

    canvas.refresh();
  }

  private createMonsterTexture(key: string, bodyColor: string, accentColor: string) {
    const canvas = this.textures.createCanvas(key, this.tileSize, this.tileSize);
    const ctx = canvas.getContext();
    
    ctx.clearRect(0, 0, this.tileSize, this.tileSize);
    
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.arc(24, 28, 14, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillRect(10, 28, 28, 10);

    ctx.fillStyle = accentColor;
    ctx.fillRect(14, 10, 4, 6);
    ctx.fillRect(30, 10, 4, 6);
    
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(18, 22, 4, 0, Math.PI * 2);
    ctx.arc(30, 22, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#dc2626';
    ctx.fillRect(17, 21, 2, 2);
    ctx.fillRect(29, 21, 2, 2);

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(21, 29, 6, 2);
    ctx.fillRect(23, 31, 2, 1);
    
    canvas.refresh();
  }

  private createProceduralBossTexture(key: string, bossData: BossData) {
    const size = bossData.size; // 9 or 13
    // Create a larger, double-sized canvas for the boss so it looks massive and clear!
    const canvas = this.textures.createCanvas(key, 96, 96);
    const ctx = canvas.getContext();
    ctx.clearRect(0, 0, 96, 96);
    
    // Choose high-quality custom colors based on elemental attribute
    let colorPrimary = '#ef4444';
    let colorSecondary = '#f97316';
    let colorAccent = '#facc15';
    
    switch (bossData.element) {
      case 'Fire':
        colorPrimary = '#ef4444';
        colorSecondary = '#f97316';
        colorAccent = '#facc15';
        break;
      case 'Ice':
        colorPrimary = '#3b82f6';
        colorSecondary = '#60a5fa';
        colorAccent = '#93c5fd';
        break;
      case 'Lightning':
        colorPrimary = '#eab308';
        colorSecondary = '#facc15';
        colorAccent = '#ffffff';
        break;
      case 'Poison':
        colorPrimary = '#22c55e';
        colorSecondary = '#a855f7';
        colorAccent = '#c084fc';
        break;
      case 'Dark':
        colorPrimary = '#8b5cf6';
        colorSecondary = '#4c1d95';
        colorAccent = '#e9d5ff';
        break;
      case 'Earth':
        colorPrimary = '#78350f';
        colorSecondary = '#b45309';
        colorAccent = '#fbbf24';
        break;
    }
    
    // Seeded local simple LCG randomizer to keep the specific boss shape identical on redraws
    let seed = 0;
    for (let i = 0; i < bossData.id.length; i++) {
      seed = (seed << 5) - seed + bossData.id.charCodeAt(i);
      seed |= 0;
    }
    
    const random = () => {
      const x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
    };

    const cellSize = Math.floor(96 / size);
    const startX = Math.floor((96 - cellSize * size) / 2);
    const startY = Math.floor((96 - cellSize * size) / 2);
    
    const mid = Math.floor(size / 2);

    // Identify boss semantic archetype from name to dynamically alter silhouette design
    let style: 'dragon' | 'golem' | 'beast' | 'slime' = 'golem';
    const bName = bossData.name.toLowerCase();
    if (bName.includes('dragon') || bName.includes('phoenix') || bName.includes('tengu') || bName.includes('gazer')) {
      style = 'dragon';
    } else if (bName.includes('giant') || bName.includes('colossus') || bName.includes('overlord') || bName.includes('skeleton') || bName.includes('queen')) {
      style = 'golem';
    } else if (bName.includes('slime') || bName.includes('decay') || bName.includes('core') || bName.includes('phantom')) {
      style = 'slime';
    } else {
      style = 'beast';
    }
    
    // Render symmetrical pixel art monster grid!
    for (let r = 0; r < size; r++) {
      for (let c = 0; c <= mid; c++) {
        let fillType = 0; // 0: empty, 1: primary, 2: secondary, 3: accent
        
        if (style === 'slime') {
          // Circular slime or gelatinous body shape
          const dx = c - mid;
          const dy = r - mid;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if (dist <= mid * 0.95) {
            const val = random();
            fillType = val < 0.45 ? 1 : (val < 0.8 ? 2 : 3);
          }
        } else if (style === 'dragon') {
          // Dragon or winged beast style: sweepy wings on outer columns, spikes on head
          const val = random();
          if (c <= 1 && r >= Math.floor(size / 3) && r <= size - 3) {
            // Draw prominent wings
            if (val < 0.8) fillType = 3;
          } else if (r <= 2 && c >= 1 && c <= 3) {
            // Distinct head horns
            if (r === 0 && c === 1) fillType = 3;
            if (r === 1 && c >= 1 && c <= 2) fillType = 1;
            if (r === 2 && c >= 1 && c <= 3) fillType = 2;
          } else {
            // Core dragon body
            if (c > 1) {
              if (val < 0.45) fillType = 1;
              else if (val < 0.8) fillType = 2;
              else if (val < 0.95) fillType = 3;
            }
          }
        } else if (style === 'golem') {
          // Heavy armored / giant style: blocky shoulders, dense chest energy crystal
          const val = random();
          if (r >= 2 && r <= 4) {
            // Broad sturdy shoulders
            if (c >= 1) fillType = val < 0.6 ? 1 : 2;
          } else if (r >= 5 && r <= size - 2) {
            // Solid, heavy mechanical torso
            if (c >= 2) fillType = val < 0.55 ? 1 : 2;
          } else if (r <= 1) {
            // Symmetrical crown or heavy helmet
            if (c >= 2 && c <= mid) fillType = 3;
          }
          // Embedded energy core in the center of the chest
          if (r === mid && c === mid) {
            fillType = 3;
          }
        } else {
          // Beast / wolf style: fangs at the bottom rows, animal stance
          const val = random();
          if (r === size - 1 && (c === 1 || c === 2)) {
            // Sharp protruding claws or fangs
            fillType = 3;
          } else if (r >= 3 && r <= size - 2) {
            // Grounded quadruple-leg stance
            if (c >= 1) fillType = val < 0.55 ? 1 : 2;
          } else {
            if (c >= 2) fillType = val < 0.4 ? 1 : (val < 0.85 ? 2 : 3);
          }
        }
        
        // Ensure central columns are solid so it doesn't look disconnected
        if (c === mid && r > 1 && r < size - 2) {
          if (fillType === 0) fillType = 1;
        }
        
        if (fillType > 0) {
          const colors = ['', colorPrimary, colorSecondary, colorAccent];
          ctx.fillStyle = colors[fillType];
          
          // Draw cell and mirror it on the other half of the vertical mid-axis
          ctx.fillRect(startX + c * cellSize, startY + r * cellSize, cellSize, cellSize);
          ctx.fillRect(startX + (size - 1 - c) * cellSize, startY + r * cellSize, cellSize, cellSize);
          
          // Black pixel boundaries to make it pop like a high-end cartoon sprite
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(startX + c * cellSize, startY + r * cellSize, cellSize, cellSize);
          ctx.strokeRect(startX + (size - 1 - c) * cellSize, startY + r * cellSize, cellSize, cellSize);
        }
      }
    }
    
    // Customize eye styling based on archetype
    if (style === 'slime' && bName.includes('gazer')) {
      // Void Shadow Gazer (boss_13) gets a giant single vertical cyclops eye
      const eyeX = startX + mid * cellSize + cellSize / 2;
      const eyeY = startY + Math.floor(size / 2.5) * cellSize + cellSize / 2;
      const eyeRadius = cellSize * 1.5;
      
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(eyeX, eyeY, eyeRadius + 1.5, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(eyeX, eyeY, eyeRadius, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = colorPrimary;
      ctx.beginPath();
      ctx.arc(eyeX, eyeY, eyeRadius * 0.6, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(eyeX, eyeY, eyeRadius * 0.3, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(eyeX - 1, eyeY - 2, 3, 3);
    } else {
      // Standard two eyes with custom color offsets (Ice has white, Dark has yellow, etc.)
      let eyeColor = '#ff3b30'; // Red by default
      if (bossData.element === 'Ice') eyeColor = '#ffffff';
      if (bossData.element === 'Dark') eyeColor = '#fbbf24';
      if (bossData.element === 'Poison') eyeColor = '#a855f7';
      if (bossData.element === 'Lightning') eyeColor = '#00f2fe';

      ctx.fillStyle = eyeColor;
      const eyeRow = Math.max(1, Math.floor(size / 3.5));
      const eyeColLeft = Math.max(1, Math.floor(size / 4.5));
      const eyeColRight = size - 1 - eyeColLeft;
      
      ctx.fillRect(startX + eyeColLeft * cellSize + 2, startY + eyeRow * cellSize + 2, cellSize - 4, cellSize - 4);
      ctx.fillRect(startX + eyeColRight * cellSize + 2, startY + eyeRow * cellSize + 2, cellSize - 4, cellSize - 4);
      
      // Symmetrical white sparkling pupils
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(startX + eyeColLeft * cellSize + 4, startY + eyeRow * cellSize + 4, 3, 3);
      ctx.fillRect(startX + eyeColRight * cellSize + 4, startY + eyeRow * cellSize + 4, 3, 3);
    }
    
    canvas.refresh();
  }

  private bossTimerEvents: any[] = [];

  private startBossStageAnimations(element: string) {
    // Clear any previous animations to avoid overlapping loops
    this.bossTimerEvents.forEach(e => {
      try { e.destroy(); } catch (err) {}
    });
    this.bossTimerEvents = [];

    if (element === 'Fire') {
      const event = this.time.addEvent({
        delay: 1000,
        callback: () => {
          const rx = Math.floor(Math.random() * (this.cols - 2)) + 1;
          const ry = Math.floor(Math.random() * (this.rows - 2)) + 1;
          if (this.grid[ry][rx] === 0) {
            const px = rx * this.tileSize + this.tileSize / 2;
            const py = ry * this.tileSize + this.tileSize / 2;
            this.createFireExplosion(px, py);
          }
        },
        loop: true
      });
      this.bossTimerEvents.push(event);
    } 
    else if (element === 'Ice') {
      const event = this.time.addEvent({
        delay: 350,
        callback: () => {
          const px = Math.random() * (this.cols * this.tileSize);
          this.createIceFlake(px, -15);
        },
        loop: true
      });
      this.bossTimerEvents.push(event);
    } 
    else if (element === 'Lightning') {
      const event = this.time.addEvent({
        delay: 1800,
        callback: () => {
          this.cameras.main.flash(80, 240, 248, 255);
          const rx = Math.floor(Math.random() * (this.cols - 2)) + 1;
          const ry = Math.floor(Math.random() * (this.rows - 2)) + 1;
          const px = rx * this.tileSize + this.tileSize / 2;
          const py = ry * this.tileSize + this.tileSize / 2;
          this.createLightningBolt(px, py);
        },
        loop: true
      });
      this.bossTimerEvents.push(event);
    }
    else if (element === 'Poison') {
      const event = this.time.addEvent({
        delay: 450,
        callback: () => {
          const px = Math.random() * (this.cols * this.tileSize);
          this.createPoisonBubble(px, this.rows * this.tileSize + 15);
        },
        loop: true
      });
      this.bossTimerEvents.push(event);
    }
    else if (element === 'Dark') {
      const event = this.time.addEvent({
        delay: 500,
        callback: () => {
          const px = Math.random() * (this.cols * this.tileSize);
          const py = Math.random() * (this.rows * this.tileSize);
          this.createDarkParticle(px, py);
        },
        loop: true
      });
      this.bossTimerEvents.push(event);
    }
    else if (element === 'Earth') {
      const event = this.time.addEvent({
        delay: 2400,
        callback: () => {
          this.cameras.main.shake(250, 0.005);
          for (let i = 0; i < 4; i++) {
            const px = Math.random() * (this.cols * this.tileSize);
            this.createFallingPebble(px, -10);
          }
        },
        loop: true
      });
      this.bossTimerEvents.push(event);
    }
  }

  private createFireExplosion(x: number, y: number) {
    const circle = this.add.circle(x, y, 2, 0xef4444);
    this.tweens.add({
      targets: circle,
      radius: 20,
      alpha: 0,
      duration: 600,
      ease: 'Cubic.easeOut',
      onComplete: () => circle.destroy()
    });
    
    for (let i = 0; i < 6; i++) {
      const spark = this.add.circle(x, y, 2, 0xf97316);
      const angle = Math.random() * Math.PI * 2;
      const dist = 8 + Math.random() * 20;
      this.tweens.add({
        targets: spark,
        x: x + Math.cos(angle) * dist,
        y: y + Math.sin(angle) * dist,
        alpha: 0,
        scale: 0.1,
        duration: 350 + Math.random() * 250,
        onComplete: () => spark.destroy()
      });
    }
  }

  private createIceFlake(x: number, y: number) {
    const flake = this.add.star(x, y, 5, 2, 5, 0x93c5fd);
    flake.setAlpha(0.7);
    this.tweens.add({
      targets: flake,
      y: y + 520,
      x: x + (Math.random() * 80 - 40),
      angle: 270,
      duration: 2500 + Math.random() * 1500,
      onComplete: () => flake.destroy()
    });
  }

  private createLightningBolt(x: number, y: number) {
    const graphics = this.add.graphics();
    graphics.lineStyle(2.5, 0xfacc15, 1);
    graphics.beginPath();
    graphics.moveTo(x + (Math.random() * 16 - 8), 0);
    
    const midY1 = y * 0.35;
    const midY2 = y * 0.7;
    graphics.lineTo(x + 15, midY1);
    graphics.lineTo(x - 15, midY2);
    graphics.lineTo(x, y);
    graphics.strokePath();
    
    const ring = this.add.circle(x, y, 2, 0xffffff);
    this.tweens.add({
      targets: ring,
      radius: 16,
      alpha: 0,
      duration: 250,
      onComplete: () => ring.destroy()
    });

    this.tweens.add({
      targets: graphics,
      alpha: 0,
      duration: 180,
      hold: 30,
      onComplete: () => graphics.destroy()
    });
  }

  private createPoisonBubble(x: number, y: number) {
    const bubble = this.add.circle(x, y, 3 + Math.random() * 3, 0x22c55e, 0.45);
    bubble.setStrokeStyle(1, 0xa855f7);
    this.tweens.add({
      targets: bubble,
      y: -20,
      x: x + Math.sin(y / 15) * 12,
      duration: 3500 + Math.random() * 1500,
      onComplete: () => bubble.destroy()
    });
  }

  private createDarkParticle(x: number, y: number) {
    const particle = this.add.star(x, y, 4, 1.5, 4, 0x6b21a8);
    particle.setAlpha(0.65);
    this.tweens.add({
      targets: particle,
      scale: 1.4,
      alpha: 0,
      angle: 120,
      duration: 1200,
      onComplete: () => particle.destroy()
    });
  }

  private createFallingPebble(x: number, y: number) {
    const pebble = this.add.rectangle(x, y, 3, 3, 0x475569);
    this.tweens.add({
      targets: pebble,
      y: 520,
      angle: 180,
      duration: 1800 + Math.random() * 900,
      onComplete: () => pebble.destroy()
    });
  }

  private createChestTexture() {
    const canvas = this.textures.createCanvas('chest', this.tileSize, this.tileSize);
    const ctx = canvas.getContext();
    
    ctx.clearRect(0, 0, this.tileSize, this.tileSize);
    
    ctx.fillStyle = '#78350f';
    ctx.fillRect(8, 14, 32, 26);
    
    ctx.fillStyle = '#eab308';
    ctx.fillRect(12, 14, 4, 26);
    ctx.fillRect(32, 14, 4, 26);
    
    ctx.fillStyle = '#451a03';
    ctx.fillRect(8, 22, 32, 3);
    
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(21, 21, 6, 6);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(23, 23, 2, 3);
    
    canvas.refresh();
  }

  private createPortalTexture() {
    const canvas = this.textures.createCanvas('portal', this.tileSize, this.tileSize);
    const ctx = canvas.getContext();
    
    ctx.clearRect(0, 0, this.tileSize, this.tileSize);
    
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(24, 24, 18, 0, Math.PI * 2);
    ctx.stroke();
 
    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(24, 24, 12, 0, Math.PI * 2);
    ctx.stroke();
 
    ctx.fillStyle = '#6366f1';
    ctx.beginPath();
    ctx.arc(24, 24, 6, 0, Math.PI * 2);
    ctx.fill();
    
    canvas.refresh();
  }

  private createMerchantTexture() {
    const canvas = this.textures.createCanvas('merchant', this.tileSize, this.tileSize);
    const ctx = canvas.getContext();
    
    ctx.clearRect(0, 0, this.tileSize, this.tileSize);
    
    // Cozy purple/indigo robes
    ctx.fillStyle = '#6366f1';
    ctx.beginPath();
    ctx.moveTo(8, 44);
    ctx.lineTo(24, 12);
    ctx.lineTo(40, 44);
    ctx.closePath();
    ctx.fill();
    
    // Belt
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(14, 34, 20, 3);
    
    // Beard
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.moveTo(18, 24);
    ctx.lineTo(24, 40);
    ctx.lineTo(30, 24);
    ctx.closePath();
    ctx.fill();
    
    // Face
    ctx.fillStyle = '#fef3c7';
    ctx.fillRect(19, 16, 10, 8);
    
    // Wizard hat
    ctx.fillStyle = '#4f46e5';
    ctx.beginPath();
    ctx.moveTo(12, 16);
    ctx.lineTo(24, 0);
    ctx.lineTo(36, 16);
    ctx.closePath();
    ctx.fill();
    
    // Star on hat
    ctx.fillStyle = '#facc15';
    ctx.fillRect(23, 5, 3, 3);
    
    canvas.refresh();
  }

  private createCoinTexture() {
    const canvas = this.textures.createCanvas('gold_coin', 16, 16);
    const ctx = canvas.getContext();
    
    ctx.clearRect(0, 0, 16, 16);
    
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(8, 8, 7, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(6, 6, 4, 4);
    
    canvas.refresh();
  }

  private createProceduralMonsterTexture(key: string, shape: string, bodyColor: string, accentColor: string) {
    const canvas = this.textures.createCanvas(key, this.tileSize, this.tileSize);
    const ctx = canvas.getContext();
    ctx.clearRect(0, 0, this.tileSize, this.tileSize);

    if (shape === 'slime') {
      // Slime shape (wide dome, squishy bottom)
      ctx.fillStyle = bodyColor;
      ctx.beginPath();
      ctx.arc(24, 28, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(10, 28, 28, 10);

      ctx.fillStyle = accentColor;
      ctx.fillRect(14, 16, 4, 4);
      ctx.fillRect(30, 16, 4, 4);
    } 
    else if (shape === 'goblin') {
      // Goblin shape (pointy ears, smaller body)
      ctx.fillStyle = bodyColor;
      // Head
      ctx.beginPath();
      ctx.arc(24, 22, 11, 0, Math.PI * 2);
      ctx.fill();
      // Left ear
      ctx.beginPath();
      ctx.moveTo(14, 22);
      ctx.lineTo(4, 14);
      ctx.lineTo(14, 18);
      ctx.closePath();
      ctx.fill();
      // Right ear
      ctx.beginPath();
      ctx.moveTo(34, 22);
      ctx.lineTo(44, 14);
      ctx.lineTo(34, 18);
      ctx.closePath();
      ctx.fill();
      // Clothes
      ctx.fillStyle = accentColor;
      ctx.fillRect(16, 32, 16, 10);
    }
    else if (shape === 'beast') {
      // Horned head, heavy beast body
      ctx.fillStyle = bodyColor;
      ctx.fillRect(12, 18, 24, 22);
      // Horns
      ctx.fillStyle = accentColor;
      ctx.fillRect(10, 10, 6, 10);
      ctx.fillRect(32, 10, 6, 10);
      ctx.fillRect(12, 8, 2, 4);
      ctx.fillRect(34, 8, 2, 4);
    }
    else if (shape === 'ghost') {
      // Wispy floaty body
      ctx.fillStyle = bodyColor;
      ctx.beginPath();
      ctx.arc(24, 20, 12, Math.PI, 0);
      ctx.fill();
      ctx.fillRect(12, 20, 24, 16);
      // Wavy tail
      ctx.fillStyle = accentColor;
      ctx.fillRect(12, 36, 4, 6);
      ctx.fillRect(20, 36, 4, 4);
      ctx.fillRect(32, 36, 4, 6);
    }
    else { // golem
      // Blocky stone body
      ctx.fillStyle = bodyColor;
      ctx.fillRect(10, 14, 28, 28);
      // Runes
      ctx.fillStyle = accentColor;
      ctx.fillRect(14, 20, 20, 4);
      ctx.fillRect(22, 24, 4, 12);
    }

    // Glowing Retro Eyes
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(18, 22, 4, 0, Math.PI * 2);
    ctx.arc(30, 22, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#dc2626';
    ctx.fillRect(17, 21, 2, 2);
    ctx.fillRect(29, 21, 2, 2);

    // Mouth / Fangs for non-golems
    if (shape !== 'golem') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(21, 30, 6, 2);
      ctx.fillRect(21, 32, 2, 2);
      ctx.fillRect(25, 32, 2, 2);
    }

    canvas.refresh();
  }

  private createRockTexture() {
    const canvas = this.textures.createCanvas('rock', this.tileSize, this.tileSize);
    const ctx = canvas.getContext();
    ctx.clearRect(0, 0, this.tileSize, this.tileSize);
    ctx.fillStyle = '#64748b';
    ctx.beginPath();
    ctx.arc(24, 26, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(12, 26, 24, 12);
    
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(18, 18, 6, 4);
    ctx.fillRect(14, 24, 4, 4);
    ctx.fillStyle = '#475569';
    ctx.fillRect(26, 28, 6, 6);
    canvas.refresh();
  }

  private createSkeletonTexture() {
    const canvas = this.textures.createCanvas('skeleton', this.tileSize, this.tileSize);
    const ctx = canvas.getContext();
    ctx.clearRect(0, 0, this.tileSize, this.tileSize);
    
    ctx.fillStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.arc(24, 20, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(19, 24, 10, 8);
    
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(18, 17, 4, 4);
    ctx.fillRect(26, 17, 4, 4);
    
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(14, 34, 20, 3);
    ctx.fillRect(22, 30, 4, 10);
    ctx.fillRect(18, 38, 12, 3);
    canvas.refresh();
  }

  private createMoneyBagTexture() {
    const canvas = this.textures.createCanvas('money_bag', this.tileSize, this.tileSize);
    const ctx = canvas.getContext();
    ctx.clearRect(0, 0, this.tileSize, this.tileSize);
    
    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.arc(24, 28, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(16, 18, 16, 16);
    
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(16, 18, 16, 4);
    
    ctx.fillStyle = '#facc15';
    ctx.fillRect(22, 24, 4, 6);
    ctx.fillRect(20, 26, 8, 2);
    canvas.refresh();
  }

  private createCampfireTexture() {
    const canvas = this.textures.createCanvas('campfire', this.tileSize, this.tileSize);
    const ctx = canvas.getContext();
    ctx.clearRect(0, 0, this.tileSize, this.tileSize);
    
    ctx.fillStyle = '#78350f';
    ctx.fillRect(10, 34, 28, 6);
    ctx.fillRect(16, 30, 16, 10);
    
    ctx.fillStyle = '#ea580c';
    ctx.beginPath();
    ctx.moveTo(24, 6);
    ctx.lineTo(14, 28);
    ctx.lineTo(34, 28);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.moveTo(24, 14);
    ctx.lineTo(18, 28);
    ctx.lineTo(30, 28);
    ctx.closePath();
    ctx.fill();
    canvas.refresh();
  }

  private createElfTexture() {
    const canvas = this.textures.createCanvas('elf', this.tileSize, this.tileSize);
    const ctx = canvas.getContext();
    ctx.clearRect(0, 0, this.tileSize, this.tileSize);
    
    // Pink magical robes
    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    ctx.moveTo(12, 44);
    ctx.lineTo(24, 16);
    ctx.lineTo(36, 44);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(14, 30, 20, 6);
    
    // Face
    ctx.fillStyle = '#fef3c7';
    ctx.fillRect(19, 14, 10, 8);
    
    // Ears
    ctx.beginPath();
    ctx.moveTo(19, 18);
    ctx.lineTo(11, 14);
    ctx.lineTo(19, 21);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(29, 18);
    ctx.lineTo(37, 14);
    ctx.lineTo(29, 21);
    ctx.closePath();
    ctx.fill();
    
    // Blonde hair
    ctx.fillStyle = '#eab308';
    ctx.fillRect(19, 10, 10, 4);
    ctx.fillRect(16, 14, 3, 10);
    ctx.fillRect(29, 14, 3, 10);
    
    // Emerald Staff
    ctx.fillStyle = '#10b981';
    ctx.fillRect(34, 16, 3, 28);
    ctx.fillStyle = '#22d3ee';
    ctx.fillRect(33, 12, 5, 5);
    canvas.refresh();
  }

  private createBossAmbientEffects(bossData: BossData) {
    const el = bossData.element;
    const width = this.scale.width;
    const height = this.scale.height;

    // 1. FIRE EFFECT - Spawns random screen eruptions
    if (el === 'Fire') {
      this.time.addEvent({
        delay: 1500,
        callback: () => {
          if (!this.sys.isActive() || this.currentFloor % 5 !== 0) return;
          const rx = Phaser.Math.Between(50, width - 50);
          const ry = Phaser.Math.Between(50, height - 100);
          
          // Eruption circle flash
          const fireGraphics = this.add.graphics();
          fireGraphics.setDepth(99); // Draw on top of maze but behind UI overlays
          
          let radius = 10;
          const maxRadius = Phaser.Math.Between(60, 100);
          
          // Warp fire screen tint flash
          const tint = this.add.rectangle(width/2, height/2, width, height, 0xff5500, 0.15);
          tint.setDepth(98);
          this.tweens.add({
            targets: tint,
            alpha: 0,
            duration: 500,
            onComplete: () => tint.destroy()
          });

          this.tweens.addCounter({
            from: 10,
            to: maxRadius,
            duration: 400,
            ease: 'Cubic.easeOut',
            onUpdate: (tween: any) => {
              const val = tween.getValue();
              fireGraphics.clear();
              // Outer glow
              fireGraphics.fillStyle(0xef4444, 0.25 * (1 - val / maxRadius));
              fireGraphics.fillCircle(rx, ry, val + 15);
              // Main explosion ring
              fireGraphics.fillStyle(0xf97316, 0.5 * (1 - val / maxRadius));
              fireGraphics.fillCircle(rx, ry, val);
              // Core heat
              fireGraphics.fillStyle(0xfacc15, 0.8 * (1 - val / maxRadius));
              fireGraphics.fillCircle(rx, ry, val * 0.5);
            },
            onComplete: () => {
              fireGraphics.destroy();
            }
          });

          // Spawn debris sparks flying out
          for (let i = 0; i < 8; i++) {
            const spark = this.add.circle(rx, ry, Phaser.Math.Between(2, 4), 0xfacc15, 1);
            spark.setDepth(100);
            const angle = Phaser.Math.DegToRad(i * 45 + Phaser.Math.Between(-15, 15));
            const speed = Phaser.Math.Between(80, 150);
            this.tweens.add({
              targets: spark,
              x: rx + Math.cos(angle) * speed,
              y: ry + Math.sin(angle) * speed,
              alpha: 0,
              scale: 0.1,
              duration: Phaser.Math.Between(400, 800),
              ease: 'Sine.easeOut',
              onComplete: () => spark.destroy()
            });
          }
        },
        loop: true
      });
    }

    // 2. LIGHTNING EFFECT - Screenshake thunder bolt striking down
    else if (el === 'Lightning') {
      this.time.addEvent({
        delay: 1800,
        callback: () => {
          if (!this.sys.isActive() || this.currentFloor % 5 !== 0) return;
          const rx = Phaser.Math.Between(100, width - 100);
          
          // Fullscreen camera flash & shake
          this.cameras.main.shake(150, 0.015);
          
          const bolt = this.add.graphics();
          bolt.setDepth(99);
          bolt.lineStyle(4, 0xffffff, 1);
          
          // Build a jagged lightning path from top to bottom
          let curY = 0;
          let curX = rx;
          const points = [{ x: curX, y: curY }];
          
          while (curY < height - 50) {
            curY += Phaser.Math.Between(40, 80);
            curX += Phaser.Math.Between(-30, 30);
            points.push({ x: curX, y: curY });
          }
          
          // Draw core bolt and outer blue glow
          bolt.beginPath();
          bolt.moveTo(points[0].x, points[0].y);
          for (let i = 1; i < points.length; i++) {
            bolt.lineTo(points[i].x, points[i].y);
          }
          bolt.strokePath();

          // Draw neon cyan outer glow
          const glow = this.add.graphics();
          glow.setDepth(98);
          glow.lineStyle(10, 0x00ffff, 0.4);
          glow.beginPath();
          glow.moveTo(points[0].x, points[0].y);
          for (let i = 1; i < points.length; i++) {
            glow.lineTo(points[i].x, points[i].y);
          }
          glow.strokePath();

          // Overlay cyan flash filter
          const filter = this.add.rectangle(width/2, height/2, width, height, 0x00ffff, 0.3);
          filter.setDepth(100);

          // Destroy objects and clear flash
          this.time.delayedCall(80, () => {
            filter.destroy();
            this.tweens.add({
              targets: [bolt, glow],
              alpha: 0,
              duration: 150,
              onComplete: () => {
                bolt.destroy();
                glow.destroy();
              }
            });
          });
        },
        loop: true
      });
    }

    // 3. ICE EFFECT - Drifting snowflakes blizzard
    else if (el === 'Ice') {
      // Continuously spawn falling snowflake shapes
      this.time.addEvent({
        delay: 200,
        callback: () => {
          if (!this.sys.isActive() || this.currentFloor % 5 !== 0) return;
          const rx = Phaser.Math.Between(-50, width);
          const flake = this.add.text(rx, -20, '❄️', { fontSize: `${Phaser.Math.Between(12, 28)}px` });
          flake.setDepth(99);
          flake.setAlpha(Phaser.Math.FloatBetween(0.3, 0.85));
          
          this.tweens.add({
            targets: flake,
            x: rx + Phaser.Math.Between(50, 150),
            y: height + 20,
            angle: Phaser.Math.Between(90, 360),
            duration: Phaser.Math.Between(3000, 5000),
            onComplete: () => flake.destroy()
          });
        },
        loop: true
      });
    }

    // 4. POISON EFFECT - Bubbling poisonous toxic gas clouds
    else if (el === 'Poison') {
      this.time.addEvent({
        delay: 350,
        callback: () => {
          if (!this.sys.isActive() || this.currentFloor % 5 !== 0) return;
          const rx = Phaser.Math.Between(20, width - 20);
          const bubble = this.add.circle(rx, height + 20, Phaser.Math.Between(6, 18), 0x22c55e, 0.4);
          bubble.setDepth(99);
          
          this.tweens.add({
            targets: bubble,
            y: -20,
            x: rx + Phaser.Math.Between(-40, 40),
            scale: 1.5,
            alpha: 0.1,
            duration: Phaser.Math.Between(4000, 6000),
            ease: 'Sine.easeInOut',
            onComplete: () => bubble.destroy()
          });
        },
        loop: true
      });
    }

    // 5. DARK EFFECT - Drifting ghostly shadow orbs
    else if (el === 'Dark') {
      this.time.addEvent({
        delay: 500,
        callback: () => {
          if (!this.sys.isActive() || this.currentFloor % 5 !== 0) return;
          const rx = Phaser.Math.Between(50, width - 50);
          const ry = Phaser.Math.Between(50, height - 100);
          
          const darkOrb = this.add.circle(rx, ry, 2, 0xa855f7, 0.7);
          darkOrb.setDepth(99);
          
          this.tweens.add({
            targets: darkOrb,
            scale: Phaser.Math.Between(15, 30),
            alpha: 0,
            duration: Phaser.Math.Between(1500, 2500),
            ease: 'Power1',
            onComplete: () => darkOrb.destroy()
          });
        },
        loop: true
      });
    }

    // 6. EARTH EFFECT - Ambient screenshake rumbling
    else if (el === 'Earth') {
      this.time.addEvent({
        delay: 3500,
        callback: () => {
          if (!this.sys.isActive() || this.currentFloor % 5 !== 0) return;
          this.cameras.main.shake(250, 0.007);
          
          // Draw a small dust shockwave on the ground
          const dust = this.add.graphics();
          dust.setDepth(1); // Behind characters, directly on floor tiles
          const rx = Phaser.Math.Between(100, width - 100);
          const ry = Phaser.Math.Between(100, height - 100);
          
          this.tweens.addCounter({
            from: 10,
            to: 120,
            duration: 800,
            onUpdate: (tween: any) => {
              const val = tween.getValue();
              dust.clear();
              dust.lineStyle(3, 0xb45309, 0.4 * (1 - val / 120));
              dust.strokeCircle(rx, ry, val);
            },
            onComplete: () => dust.destroy()
          });
        },
        loop: true
      });
    }
  }

  private spawnPet(cell: any, petData: PetData, id?: string) {
    const px = cell.x * this.tileSize + this.tileSize / 2;
    const py = cell.y * this.tileSize + this.tileSize / 2;
    
    // Create a Container so we can stack multiple visual layers nicely
    const container = this.add.container(px, py);
    container.setData('id', id || `pet_${Date.now()}_${Math.floor(Math.random() * 100)}`);
    container.setData('gridX', cell.x);
    container.setData('gridY', cell.y);
    container.setData('type', 'pet'); // Essential for checkCollisions callback routing!
    container.setData('name', petData.name);
    container.setData('petDbId', petData.id);
    container.setData('petData', petData);
    
    // 1. Beautiful golden glowing ring behind the pet
    const glow = this.add.graphics();
    glow.fillStyle(0xfacc15, 0.25);
    glow.fillCircle(0, 0, 24);
    glow.lineStyle(3, 0xfacc15, 0.7);
    glow.strokeCircle(0, 0, 24);
    container.add(glow);
    
    this.tweens.add({
      targets: glow,
      scaleX: 1.3,
      scaleY: 1.3,
      alpha: 0.15,
      duration: 1000,
      yoyo: true,
      repeat: -1
    });
    
    // 2. Spinning gold star overhead
    const star = this.add.star(0, -22, 5, 4, 8, 0xfacc15);
    container.add(star);
    this.tweens.add({
      targets: star,
      angle: 360,
      duration: 2500,
      repeat: -1
    });
    
    // 3. Render the Pet Emoji
    const emojiText = this.add.text(0, 0, petData.emoji, {
      fontSize: '28px'
    }).setOrigin(0.5);
    container.add(emojiText);
    
    // Hover floating animation for the container
    this.tweens.add({
      targets: container,
      y: py - 6,
      duration: 800 + Math.random() * 300,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    
    // Sparkle effect loop
    this.time.addEvent({
      delay: 450,
      callback: () => {
        if (!this.sys.isActive() || !container.active || !container.scene) return;
        const spark = this.add.circle(
          px + Phaser.Math.Between(-18, 18),
          py + Phaser.Math.Between(-18, 18),
          Phaser.Math.Between(2.5, 4.5),
          0xfacc15,
          1
        );
        spark.setDepth(100);
        this.tweens.add({
          targets: spark,
          y: spark.y - 18,
          alpha: 0,
          scale: 0.1,
          duration: 700,
          onComplete: () => spark.destroy()
        });
      },
      loop: true
    });
    
    // Add to monstersGroup
    this.monstersGroup.add(container);
  }

  private safeCall(fn: any, ...args: any[]) {
    if (fn) {
      try {
        fn(...args);
      } catch (err) {
        console.error("Phaser GameBridge callback error:", err);
      }
    }
  }
}
