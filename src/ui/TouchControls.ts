import Phaser from 'phaser';
import { TOUCH_BUTTON_SIZE, TOUCH_BUTTON_PADDING, TOUCH_BUTTON_ALPHA, TOUCH_BUTTON_ALPHA_ACTIVE } from '../config';
import { InputManager } from '../utils/InputManager';

type ButtonName = 'left' | 'right' | 'jump' | 'action';

interface ButtonZone {
  name: ButtonName;
  rect: { x: number; y: number; w: number; h: number };
  visual: Phaser.GameObjects.Image | Phaser.GameObjects.Arc;
  icon?: Phaser.GameObjects.Image | Phaser.GameObjects.Text;
}

/**
 * Touch controls using raw DOM touch events — bypasses Phaser's input system
 * entirely for rock-solid mobile responsiveness.
 *
 * Tracks touches by Touch.identifier to handle multi-touch correctly.
 * Hit-tests with simple rectangle math — no Phaser interactive objects.
 */
export class TouchControls {
  private scene: Phaser.Scene;
  private inputManager: InputManager;
  private canvas: HTMLCanvasElement;
  private buttons: ButtonZone[] = [];
  private activeTouches: Map<number, ButtonName | null> = new Map();
  private isTouchDevice: boolean;
  private scaleX = 1;
  private scaleY = 1;
  private offsetX = 0;
  private offsetY = 0;

  // Bound handlers for cleanup
  private onTouchStart: (e: TouchEvent) => void;
  private onTouchMove: (e: TouchEvent) => void;
  private onTouchEnd: (e: TouchEvent) => void;

  constructor(scene: Phaser.Scene, inputManager: InputManager) {
    this.scene = scene;
    this.inputManager = inputManager;
    this.canvas = scene.game.canvas;
    this.isTouchDevice = scene.sys.game.device.input.touch;

    // Bind handlers
    this.onTouchStart = this.handleTouchStart.bind(this);
    this.onTouchMove = this.handleTouchMove.bind(this);
    this.onTouchEnd = this.handleTouchEnd.bind(this);

    if (this.isTouchDevice) {
      this.computeCanvasScale();
      this.createButtons();
      this.attachListeners();
    }
  }

  private computeCanvasScale(): void {
    const rect = this.canvas.getBoundingClientRect();
    const gameW = this.scene.scale.width;
    const gameH = this.scene.scale.height;
    this.scaleX = gameW / rect.width;
    this.scaleY = gameH / rect.height;
    this.offsetX = rect.left;
    this.offsetY = rect.top;
  }

  /** Convert a DOM touch coordinate to game-world coordinate */
  private toGameCoords(clientX: number, clientY: number): { gx: number; gy: number } {
    const rect = this.canvas.getBoundingClientRect();
    return {
      gx: (clientX - rect.left) * (this.scene.scale.width / rect.width),
      gy: (clientY - rect.top) * (this.scene.scale.height / rect.height),
    };
  }

  private createButtons(): void {
    const { width, height } = this.scene.scale;
    const size = TOUCH_BUTTON_SIZE;
    const pad = TOUCH_BUTTON_PADDING;
    const bottomY = height - size / 2 - pad - 10; // pushed down a bit more

    const hasSprites = this.scene.textures.exists('btn-sq-blue');

    // Left — bottom-left
    const leftX = pad + size / 2;
    this.addButton('left', leftX, bottomY, size, hasSprites, 'arrow-left', '\u25C0', false);

    // Right — next to left
    const rightX = pad + size * 1.5 + pad;
    this.addButton('right', rightX, bottomY, size, hasSprites, 'arrow-right', '\u25B6', false);

    // Jump — top-right area
    const jumpX = width - pad - size * 1.5 - pad;
    const jumpY = bottomY - size - pad * 2;
    this.addButton('jump', jumpX, jumpY, size, hasSprites, 'arrow-up', '\u25B2', false);

    // Action — bottom-right
    const actionX = width - pad - size / 2;
    this.addButton('action', actionX, bottomY, size, hasSprites, null, '\u2726', true);
  }

  private addButton(
    name: ButtonName,
    x: number,
    y: number,
    size: number,
    hasSprites: boolean,
    arrowKey: string | null,
    fallbackLabel: string,
    isAction: boolean,
  ): void {
    let visual: Phaser.GameObjects.Image | Phaser.GameObjects.Arc;
    let icon: Phaser.GameObjects.Image | Phaser.GameObjects.Text | undefined;

    if (hasSprites) {
      const btnKey = isAction ? 'btn-sq-yellow' : 'btn-sq-blue';
      visual = this.scene.add.image(x, y, btnKey);
      visual.setScale(size / 64);
      visual.setAlpha(TOUCH_BUTTON_ALPHA);
      visual.setDepth(1000);
      visual.setScrollFactor(0);

      if (arrowKey && this.scene.textures.exists(arrowKey)) {
        icon = this.scene.add.image(x, y - 1, arrowKey);
        icon.setScale((size * 0.4) / 32);
        icon.setDepth(1001);
        icon.setScrollFactor(0);
      } else {
        icon = this.scene.add.text(x, y - 1, fallbackLabel, {
          fontSize: `${size * 0.35}px`,
          color: '#ffffff',
          fontStyle: 'bold',
        }).setOrigin(0.5).setDepth(1001).setScrollFactor(0);
      }
    } else {
      visual = this.scene.add.circle(x, y, size / 2, 0xffffff, TOUCH_BUTTON_ALPHA);
      (visual as Phaser.GameObjects.Arc).setStrokeStyle(2, 0xffffff, 0.6);
      visual.setDepth(1000);
      visual.setScrollFactor(0);

      icon = this.scene.add.text(x, y, fallbackLabel, {
        fontSize: `${size * 0.4}px`,
        color: '#ffffff',
        fontStyle: 'bold',
      }).setOrigin(0.5).setDepth(1001).setScrollFactor(0);
    }

    // NOTE: No setInteractive() — we handle input via raw DOM events
    this.buttons.push({
      name,
      rect: { x: x - size / 2, y: y - size / 2, w: size, h: size },
      visual,
      icon,
    });
  }

  private attachListeners(): void {
    this.canvas.addEventListener('touchstart', this.onTouchStart, { passive: false });
    this.canvas.addEventListener('touchmove', this.onTouchMove, { passive: false });
    this.canvas.addEventListener('touchend', this.onTouchEnd, { passive: false });
    this.canvas.addEventListener('touchcancel', this.onTouchEnd, { passive: false });
  }

  private handleTouchStart(e: TouchEvent): void {
    e.preventDefault(); // prevent scroll/zoom
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      const { gx, gy } = this.toGameCoords(touch.clientX, touch.clientY);
      const btn = this.hitTest(gx, gy);

      this.activeTouches.set(touch.identifier, btn?.name ?? null);

      if (btn) {
        this.inputManager.setTouch(btn.name, true);
        this.setButtonVisual(btn, true);
      }
    }
  }

  private handleTouchMove(e: TouchEvent): void {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      const { gx, gy } = this.toGameCoords(touch.clientX, touch.clientY);
      const newBtn = this.hitTest(gx, gy);
      const oldBtnName = this.activeTouches.get(touch.identifier);

      // Finger slid from one button to another (or off a button)
      if (oldBtnName !== (newBtn?.name ?? null)) {
        // Release old button
        if (oldBtnName) {
          this.inputManager.setTouch(oldBtnName, false);
          const oldBtn = this.buttons.find(b => b.name === oldBtnName);
          if (oldBtn) this.setButtonVisual(oldBtn, false);
        }
        // Press new button
        if (newBtn) {
          this.inputManager.setTouch(newBtn.name, true);
          this.setButtonVisual(newBtn, true);
        }
        this.activeTouches.set(touch.identifier, newBtn?.name ?? null);
      }
    }
  }

  private handleTouchEnd(e: TouchEvent): void {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      const btnName = this.activeTouches.get(touch.identifier);

      if (btnName) {
        this.inputManager.setTouch(btnName, false);
        const btn = this.buttons.find(b => b.name === btnName);
        if (btn) this.setButtonVisual(btn, false);
      }
      this.activeTouches.delete(touch.identifier);
    }
  }

  private hitTest(gx: number, gy: number): ButtonZone | null {
    for (const btn of this.buttons) {
      const r = btn.rect;
      if (gx >= r.x && gx <= r.x + r.w && gy >= r.y && gy <= r.y + r.h) {
        return btn;
      }
    }
    return null;
  }

  private setButtonVisual(btn: ButtonZone, pressed: boolean): void {
    const alpha = pressed ? TOUCH_BUTTON_ALPHA_ACTIVE : TOUCH_BUTTON_ALPHA;
    const scale = btn.visual instanceof Phaser.GameObjects.Image
      ? (TOUCH_BUTTON_SIZE / 64) * (pressed ? 0.92 : 1)
      : 1;

    btn.visual.setAlpha(alpha);
    if (btn.visual instanceof Phaser.GameObjects.Image) {
      btn.visual.setScale(scale);
    }
  }

  destroy(): void {
    this.canvas.removeEventListener('touchstart', this.onTouchStart);
    this.canvas.removeEventListener('touchmove', this.onTouchMove);
    this.canvas.removeEventListener('touchend', this.onTouchEnd);
    this.canvas.removeEventListener('touchcancel', this.onTouchEnd);
    this.activeTouches.clear();
  }
}
