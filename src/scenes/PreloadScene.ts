import { GAME_WIDTH, GAME_HEIGHT } from '../config';
import { SPRITES, ENEMY_SPRITES, NPC_SPRITE, PLAYER_ANIMS, NPC_ANIMS, AnimationDef } from '../data/AssetManifest';

const DEFAULT_LEVEL = 'level-01';

/**
 * PreloadScene — loads level-specific assets (level JSON, enemy sprites).
 * Character tilesheets are already loaded by BootScene.
 */
export class PreloadScene extends Phaser.Scene {
  private levelId: string = DEFAULT_LEVEL;

  constructor() {
    super({ key: 'PreloadScene' });
  }

  init(data: { levelId?: string }): void {
    this.levelId = data.levelId ?? DEFAULT_LEVEL;
  }

  preload(): void {
    // Loading bar
    const barW = GAME_WIDTH * 0.5;
    const barH = 16;
    const barY = GAME_HEIGHT / 2;

    this.add.rectangle(GAME_WIDTH / 2, barY, barW, barH, 0x222244);
    const fill = this.add.rectangle(GAME_WIDTH / 2 - barW / 2 + 2, barY, 0, barH - 4, 0x4dc8ff);
    fill.setOrigin(0, 0.5);

    this.load.on('progress', (value: number) => {
      fill.width = (barW - 4) * value;
    });

    // Level data
    if (!this.cache.json.has(this.levelId)) {
      this.load.json(this.levelId, `levels/${this.levelId}.json`);
    }

    // Enemy sprites (if not already loaded)
    for (const sprite of ENEMY_SPRITES) {
      if (!this.textures.exists(sprite.key)) {
        this.load.image(sprite.key, sprite.path);
      }
    }
  }

  create(): void {
    // Generate placeholder textures if character sheets failed to load
    this.generatePlaceholders();

    // Register animations
    this.registerAnimations();

    // Start game
    const levelData = this.cache.json.get(this.levelId);
    this.scene.start('GameScene', { levelData });
  }

  private generatePlaceholders(): void {
    // Only generate if real sprites aren't loaded
    if (!this.textures.exists('player')) {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0x44ccff, 1);
      g.fillRoundedRect(4, 8, 24, 24, 4);
      g.fillStyle(0x66ddff, 1);
      g.fillCircle(16, 6, 7);
      g.fillStyle(0xffffff, 1);
      g.fillCircle(13, 5, 2);
      g.fillCircle(19, 5, 2);
      g.generateTexture('player', 32, 32);
      g.destroy();
    }

    if (!this.textures.exists('enemy-idle') && !this.textures.exists('enemy')) {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0xff4444, 1);
      g.fillRect(4, 4, 24, 20);
      g.fillStyle(0xffff00, 1);
      g.fillCircle(11, 12, 3);
      g.fillCircle(21, 12, 3);
      g.generateTexture('enemy', 32, 32);
      g.destroy();
    }

    if (!this.textures.exists('npc')) {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0x44ff88, 1);
      g.fillRoundedRect(3, 8, 26, 22, 6);
      g.fillStyle(0x66ffaa, 1);
      g.fillCircle(16, 7, 7);
      g.fillStyle(0xffffff, 1);
      g.fillCircle(13, 6, 2.5);
      g.fillCircle(19, 6, 2.5);
      g.generateTexture('npc', 32, 32);
      g.destroy();
    }
  }

  private registerAnimations(): void {
    // Register player animations for ALL character tilesheets (player, female, adventurer)
    // so any character can be selected and animations work
    const characterKeys = ['player', 'female', 'adventurer', 'npc'];

    for (const charKey of characterKeys) {
      if (!this.textures.exists(charKey)) continue;

      // Determine which animation defs to use
      const animDefs = charKey === 'npc' ? NPC_ANIMS : PLAYER_ANIMS;

      for (const anim of animDefs) {
        // Create animation with the character key as prefix: "female-idle", "player-run", etc.
        const animKey = anim.key.replace(anim.spriteKey, charKey);
        if (this.anims.exists(animKey)) continue;

        this.anims.create({
          key: animKey,
          frames: anim.frames.map(f => ({ key: charKey, frame: f })),
          frameRate: anim.frameRate,
          repeat: anim.repeat,
        });
      }
    }
  }
}
