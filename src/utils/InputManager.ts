export interface InputState {
  left: boolean;
  right: boolean;
  jump: boolean;
  action: boolean;
  actionHeld: boolean;
  actionHoldDuration: number;
}

export class InputManager {
  private scene: Phaser.Scene;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys | null = null;
  private wasd: { W: Phaser.Input.Keyboard.Key; A: Phaser.Input.Keyboard.Key; S: Phaser.Input.Keyboard.Key; D: Phaser.Input.Keyboard.Key } | null = null;
  private spaceKey: Phaser.Input.Keyboard.Key | null = null;
  private actionKey: Phaser.Input.Keyboard.Key | null = null;

  // Touch state (set by TouchControls)
  private touchLeft = false;
  private touchRight = false;
  private touchJump = false;
  private touchAction = false;
  private touchActionStart = 0;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.setupKeyboard();
  }

  private setupKeyboard(): void {
    const kb = this.scene.input.keyboard;
    if (!kb) {
      console.warn('Keyboard plugin not available — using touch only');
      return;
    }

    this.cursors = kb.createCursorKeys();
    this.wasd = {
      W: kb.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: kb.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: kb.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: kb.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };
    this.spaceKey = kb.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.actionKey = kb.addKey(Phaser.Input.Keyboard.KeyCodes.E);
  }

  // Called by TouchControls
  setTouch(button: 'left' | 'right' | 'jump' | 'action', pressed: boolean): void {
    switch (button) {
      case 'left': this.touchLeft = pressed; break;
      case 'right': this.touchRight = pressed; break;
      case 'jump': this.touchJump = pressed; break;
      case 'action':
        if (pressed && !this.touchAction) {
          this.touchActionStart = this.scene.time.now;
        }
        this.touchAction = pressed;
        break;
    }
  }

  getState(): InputState {
    const kbLeft = this.cursors?.left?.isDown || this.wasd?.A?.isDown || false;
    const kbRight = this.cursors?.right?.isDown || this.wasd?.D?.isDown || false;
    const kbJump = this.cursors?.up?.isDown || this.wasd?.W?.isDown || this.spaceKey?.isDown || false;
    const kbAction = this.actionKey?.isDown || false;

    const actionDown = kbAction || this.touchAction;
    const holdDuration = kbAction
      ? (this.actionKey?.getDuration?.() ?? 0)
      : (this.touchAction ? this.scene.time.now - this.touchActionStart : 0);

    return {
      left: kbLeft || this.touchLeft,
      right: kbRight || this.touchRight,
      jump: kbJump || this.touchJump,
      action: actionDown,
      actionHeld: actionDown,
      actionHoldDuration: actionDown ? holdDuration : 0,
    };
  }
}
