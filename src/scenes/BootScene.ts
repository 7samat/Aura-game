import Phaser from 'phaser';
import { SPRITES, NPC_SPRITE, UI_SPRITES, TILE_SPRITES, ITEM_SPRITES, BG_SPRITES, SFX_SHEETS } from '../data/AssetManifest';

/**
 * BootScene — loads all shared assets upfront, then goes to TitleScene.
 * Level-specific assets (JSON, enemies) are loaded in PreloadScene.
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    // Handle load errors gracefully — don't crash the game
    this.load.on('loaderror', (file: any) => {
      console.warn(`Failed to load asset: ${file.key} (${file.url})`);
    });

    // Character spritesheets
    for (const sprite of Object.values(SPRITES)) {
      this.load.spritesheet(sprite.key, sprite.path, {
        frameWidth: sprite.frameWidth,
        frameHeight: sprite.frameHeight,
      });
    }

    // NPC spritesheet
    if (!this.textures.exists(NPC_SPRITE.key)) {
      this.load.spritesheet(NPC_SPRITE.key, NPC_SPRITE.path, {
        frameWidth: NPC_SPRITE.frameWidth,
        frameHeight: NPC_SPRITE.frameHeight,
      });
    }

    // UI assets
    for (const sprite of UI_SPRITES) {
      this.load.image(sprite.key, sprite.path);
    }

    // Tile assets
    for (const sprite of TILE_SPRITES) {
      this.load.image(sprite.key, sprite.path);
    }

    // Collectible item sprites
    for (const sprite of ITEM_SPRITES) {
      this.load.image(sprite.key, sprite.path);
    }

    // Background elements
    for (const sprite of BG_SPRITES) {
      this.load.image(sprite.key, sprite.path);
    }

    // SFX spritesheets
    for (const sfx of SFX_SHEETS) {
      this.load.spritesheet(sfx.key, sfx.path, {
        frameWidth: sfx.frameWidth,
        frameHeight: sfx.frameHeight,
      });
    }
  }

  create(): void {
    // Register SFX animations
    for (const sfx of SFX_SHEETS) {
      if (this.anims.exists(sfx.key)) continue;
      this.anims.create({
        key: sfx.key,
        frames: this.anims.generateFrameNumbers(sfx.key, { start: 0, end: sfx.frameCount - 1 }),
        frameRate: 24,
        repeat: 0,
      });
    }

    this.scene.start('TitleScene');
  }
}
