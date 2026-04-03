import { TOUCH_BUTTON_SIZE, TOUCH_BUTTON_PADDING, TOUCH_BUTTON_ALPHA, TOUCH_BUTTON_ALPHA_ACTIVE } from '../config';
import { InputManager } from '../utils/InputManager';

export class TouchControls {
  private scene: Phaser.Scene;
  private inputManager: InputManager;
  private buttons: Phaser.GameObjects.Container;
  private actionButton: Phaser.GameObjects.Image | Phaser.GameObjects.Arc | null = null;
  private isTouchDevice: boolean;

  constructor(scene: Phaser.Scene, inputManager: InputManager) {
    this.scene = scene;
    this.inputManager = inputManager;
    this.isTouchDevice = scene.sys.game.device.input.touch;

    this.buttons = scene.add.container(0, 0);
    this.buttons.setDepth(1000);
    this.buttons.setScrollFactor(0);

    if (this.isTouchDevice) {
      this.createButtons();
    }
  }

  pulseAction(): void {
    if (!this.actionButton) return;
    this.scene.tweens.add({
      targets: this.actionButton,
      scale: { from: 1, to: 1.15 },
      duration: 400,
      yoyo: true,
      ease: 'Sine.easeInOut',
    });
  }

  private createButtons(): void {
    const { width, height } = this.scene.scale;
    const size = TOUCH_BUTTON_SIZE;
    const pad = TOUCH_BUTTON_PADDING;
    const bottomY = height - size / 2 - pad;

    // Use Kenney button sprites if available
    const hasSprites = this.scene.textures.exists('btn-sq-blue');

    // Left side: Left and Right
    this.createButton('left', pad + size / 2, bottomY, 'arrow-left', '\u25C0', hasSprites);
    this.createButton('right', pad + size * 1.5 + pad, bottomY, 'arrow-right', '\u25B6', hasSprites);

    // Right side: Jump (top) and Action (bottom)
    const jumpX = width - pad - size * 1.5 - pad;
    const jumpY = bottomY - size - pad * 2;
    this.createButton('jump', jumpX, jumpY, 'arrow-up', '\u25B2', hasSprites);
    this.createButton('action', width - pad - size / 2, bottomY, null, '\u2726', hasSprites, true);
  }

  private createButton(
    name: 'left' | 'right' | 'jump' | 'action',
    x: number,
    y: number,
    arrowKey: string | null,
    fallbackLabel: string,
    hasSprites: boolean,
    isAction: boolean = false,
  ): void {
    const size = TOUCH_BUTTON_SIZE;

    if (hasSprites) {
      // Real Kenney button sprite
      const btnKey = isAction ? 'btn-sq-yellow' : 'btn-sq-blue';
      const bg = this.scene.add.image(x, y, btnKey);
      bg.setScale(size / 64); // scale 64x64 to our button size
      bg.setAlpha(TOUCH_BUTTON_ALPHA);
      bg.setInteractive({ useHandCursor: false });

      // Arrow icon on top (if we have arrow sprites)
      if (arrowKey && this.scene.textures.exists(arrowKey)) {
        const arrow = this.scene.add.image(x, y - 1, arrowKey);
        arrow.setScale((size * 0.4) / 32); // scale 32x32 arrow to fit
        this.buttons.add(arrow);
      } else {
        // Text fallback for action button
        const text = this.scene.add.text(x, y - 1, fallbackLabel, {
          fontSize: `${size * 0.35}px`,
          color: '#ffffff',
          fontStyle: 'bold',
        }).setOrigin(0.5);
        this.buttons.add(text);
      }

      bg.on('pointerdown', () => {
        this.inputManager.setTouch(name, true);
        bg.setAlpha(TOUCH_BUTTON_ALPHA_ACTIVE);
        bg.setScale(size / 64 * 0.92);
      });

      const release = () => {
        this.inputManager.setTouch(name, false);
        bg.setAlpha(TOUCH_BUTTON_ALPHA);
        bg.setScale(size / 64);
      };

      bg.on('pointerup', release);
      bg.on('pointerout', release);

      this.buttons.add(bg);
      if (isAction) this.actionButton = bg;
    } else {
      // Fallback — plain circles
      const bg = this.scene.add.circle(x, y, size / 2, 0xffffff, TOUCH_BUTTON_ALPHA);
      bg.setStrokeStyle(2, 0xffffff, 0.6);
      bg.setInteractive({ useHandCursor: false });

      const text = this.scene.add.text(x, y, fallbackLabel, {
        fontSize: `${size * 0.4}px`,
        color: '#ffffff',
        fontStyle: 'bold',
      }).setOrigin(0.5).setAlpha(0.7);

      bg.on('pointerdown', () => {
        this.inputManager.setTouch(name, true);
        bg.setFillStyle(0xffffff, TOUCH_BUTTON_ALPHA_ACTIVE);
      });

      const release = () => {
        this.inputManager.setTouch(name, false);
        bg.setFillStyle(0xffffff, TOUCH_BUTTON_ALPHA);
      };

      bg.on('pointerup', release);
      bg.on('pointerout', release);

      this.buttons.add([bg, text]);
      if (isAction) this.actionButton = bg;
    }
  }
}
