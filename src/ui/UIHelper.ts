import Phaser from 'phaser';
/**
 * Shared UI helpers for creating consistent Kenney-styled buttons across all scenes.
 */

export interface ButtonConfig {
  scene: Phaser.Scene;
  x: number;
  y: number;
  label?: string;
  icon?: string;      // text icon like arrows
  style: 'rect-blue' | 'rect-yellow' | 'rect-green' | 'rect-grey' | 'sq-blue' | 'sq-yellow' | 'round-blue' | 'round-yellow';
  scale?: number;
  fontSize?: string;
  onClick: () => void;
}

const TEXTURE_MAP: Record<string, string> = {
  'rect-blue': 'btn-rect-blue',
  'rect-yellow': 'btn-rect-yellow',
  'rect-green': 'btn-rect-green',
  'rect-grey': 'btn-rect-grey',
  'sq-blue': 'btn-sq-blue',
  'sq-yellow': 'btn-sq-yellow',
  'round-blue': 'btn-round-blue',
  'round-yellow': 'btn-round-yellow',
};

export function createButton(config: ButtonConfig): Phaser.GameObjects.Container {
  const { scene, x, y, label, icon, style, onClick } = config;
  const scale = config.scale ?? 1;
  const texKey = TEXTURE_MAP[style];
  const hasTexture = texKey && scene.textures.exists(texKey);

  const container = scene.add.container(x, y);

  if (hasTexture) {
    // Real Kenney button sprite
    const btn = scene.add.image(0, 0, texKey);
    btn.setScale(scale);
    btn.setInteractive({ useHandCursor: true });
    container.add(btn);

    // Label text on top of button
    if (label) {
      const isRect = style.startsWith('rect');
      const fontSize = config.fontSize ?? (isRect ? '18px' : '14px');
      const text = scene.add.text(0, -2, label, {
        fontSize,
        color: '#ffffff',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 1,
      }).setOrigin(0.5);
      container.add(text);
    }

    if (icon) {
      const iconText = scene.add.text(0, -1, icon, {
        fontSize: config.fontSize ?? '18px',
        color: '#ffffff',
        fontStyle: 'bold',
      }).setOrigin(0.5);
      container.add(iconText);
    }

    // Interaction
    btn.on('pointerdown', () => {
      btn.setScale(scale * 0.92);
      scene.time.delayedCall(100, () => {
        btn.setScale(scale);
        onClick();
      });
    });

    btn.on('pointerover', () => {
      btn.setScale(scale * 1.05);
    });

    btn.on('pointerout', () => {
      btn.setScale(scale);
    });
  } else {
    // Fallback — draw a rectangle
    const isRect = style.startsWith('rect');
    const w = isRect ? 160 : 50;
    const h = isRect ? 48 : 50;
    const color = style.includes('yellow') ? 0xffd94d : style.includes('green') ? 0x44cc44 : 0x4dc8ff;

    const bg = scene.add.rectangle(0, 0, w * scale, h * scale, 0x2a2a5a, 0.9);
    bg.setStrokeStyle(2, color, 0.8);
    bg.setInteractive({ useHandCursor: true });
    container.add(bg);

    if (label) {
      const text = scene.add.text(0, 0, label, {
        fontSize: config.fontSize ?? '16px',
        color: `#${color.toString(16).padStart(6, '0')}`,
        fontStyle: 'bold',
      }).setOrigin(0.5);
      container.add(text);
    }

    bg.on('pointerdown', onClick);
  }

  return container;
}

/** Create a back button (arrow + "Back" text) */
export function createBackButton(scene: Phaser.Scene, x: number, y: number, onClick: () => void): Phaser.GameObjects.Container {
  const container = scene.add.container(x, y);

  if (scene.textures.exists('arrow-left')) {
    const arrow = scene.add.image(0, 0, 'arrow-left');
    arrow.setScale(1.2);
    arrow.setInteractive({ useHandCursor: true });
    container.add(arrow);

    const text = scene.add.text(22, 0, 'Back', {
      fontSize: '14px',
      color: '#4dc8ff',
      fontStyle: 'bold',
    }).setOrigin(0, 0.5);
    container.add(text);

    arrow.on('pointerdown', onClick);
    text.setInteractive({ useHandCursor: true });
    text.on('pointerdown', onClick);
  } else {
    const text = scene.add.text(0, 0, '\u25C0 Back', {
      fontSize: '16px',
      color: '#4dc8ff',
    }).setInteractive({ useHandCursor: true });
    text.on('pointerdown', onClick);
    container.add(text);
  }

  return container;
}

/** Create a card/panel background */
export function createPanel(scene: Phaser.Scene, x: number, y: number, w: number, h: number, borderColor: number = 0x4dc8ff): Phaser.GameObjects.Rectangle {
  const panel = scene.add.rectangle(x, y, w, h, 0x1a1a3a, 0.9);
  panel.setStrokeStyle(2, borderColor, 0.6);
  return panel;
}
