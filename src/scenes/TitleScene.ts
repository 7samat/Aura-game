import { GAME_WIDTH, GAME_HEIGHT } from '../config';
import { createButton } from '../ui/UIHelper';

export class TitleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TitleScene' });
  }

  create(): void {
    // Background — dark gradient
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0a0a2e, 0x0a0a2e, 0x1a1a4e, 0x1a1a4e);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Stars
    const stars = this.add.graphics();
    for (let i = 0; i < 50; i++) {
      stars.fillStyle(0xffffff, Math.random() * 0.5 + 0.2);
      stars.fillCircle(Math.random() * GAME_WIDTH, Math.random() * GAME_HEIGHT * 0.7, Math.random() * 1.5 + 0.5);
    }

    // City silhouette
    const city = this.add.graphics();
    city.fillStyle(0x1a1a5a, 0.5);
    for (let x = 0; x < GAME_WIDTH; x += 35 + Math.random() * 25) {
      const bw = 18 + Math.random() * 22;
      const bh = 30 + Math.random() * 60;
      city.fillRect(x, GAME_HEIGHT - bh - 40, bw, bh);
    }

    // Ground strip
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 20, GAME_WIDTH, 40, 0x2a2a5a);

    // "AURA" title
    const title = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT * 0.25, 'AURA', {
      fontSize: '64px',
      color: '#ffd94d',
      fontStyle: 'bold',
      stroke: '#4dc8ff',
      strokeThickness: 6,
    }).setOrigin(0.5);

    this.tweens.add({
      targets: title,
      scale: { from: 1, to: 1.05 },
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Subtitle
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT * 0.37, 'Soul vs. Machine', {
      fontSize: '14px',
      color: '#4dc8ff',
    }).setOrigin(0.5).setAlpha(0.6);

    // Characters at bottom
    if (this.textures.exists('player')) {
      const leftChar = this.add.sprite(120, GAME_HEIGHT - 60, 'player', 13);
      leftChar.setScale(0.45);
      this.tweens.add({
        targets: leftChar,
        y: leftChar.y - 4,
        duration: 1200,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }

    if (this.textures.exists('female') || this.textures.exists('npc')) {
      const rightKey = this.textures.exists('female') ? 'female' : 'npc';
      const rightChar = this.add.sprite(GAME_WIDTH - 120, GAME_HEIGHT - 60, rightKey, 13);
      rightChar.setScale(0.45);
      this.tweens.add({
        targets: rightChar,
        y: rightChar.y - 4,
        duration: 1400,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }

    // PLAY button — real Kenney rectangle button
    createButton({
      scene: this,
      x: GAME_WIDTH / 2,
      y: GAME_HEIGHT * 0.56,
      label: 'PLAY',
      style: 'rect-yellow',
      scale: 1.1,
      fontSize: '22px',
      onClick: () => this.scene.start('ProfileSelectScene'),
    });

    // Settings button — small square
    createButton({
      scene: this,
      x: GAME_WIDTH - 44,
      y: 36,
      icon: '\u2699',
      style: 'sq-blue',
      scale: 0.7,
      onClick: () => this.scene.launch('SettingsScene'),
    });
  }
}
