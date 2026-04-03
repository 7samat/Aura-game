import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, AuraColor, ATTRACT_RADIUS, ATTRACT_SPEED } from '../config';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { NPC } from '../entities/NPC';
import { Collectible } from '../entities/Collectible';
import { AuraSystem } from '../systems/AuraSystem';
import { AuraGate } from '../systems/AuraGate';
import { InputManager } from '../utils/InputManager';
import { TouchControls } from '../ui/TouchControls';
import { Companion } from '../entities/Companion';
import { loadLevel, LoadedLevel, EchoPlatform } from '../data/LevelLoader';
import { ParallaxLayer } from '../data/BackgroundBuilder';

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private companion!: Companion;
  private enemies: Enemy[] = [];
  private npcs: NPC[] = [];
  private collectibles: Collectible[] = [];
  private auraSystem!: AuraSystem;
  private inputManager!: InputManager;
  private auraGates: AuraGate[] = [];
  private echoPlatforms: EchoPlatform[] = [];
  private parallaxLayers: ParallaxLayer[] = [];
  private levelComplete_ = false;
  private levelData: unknown = null;
  private spawnPoint = { x: 80, y: 370 };
  private sparksCollected = 0;
  private totalSparks = 0;
  private startTime = 0;
  private levelDef: any = null;

  constructor() {
    super({ key: 'GameScene' });
  }

  init(data: { levelData: unknown }): void {
    this.levelData = data.levelData;
  }

  create(): void {
    this.levelComplete_ = false;
    this.sparksCollected = 0;
    this.startTime = this.time.now;

    const rawData = this.levelData;
    if (!rawData) {
      console.error('No level data available');
      return;
    }

    // Systems
    this.auraSystem = new AuraSystem(this);
    this.inputManager = new InputManager(this);

    // Forward aura events to game-level for UIScene
    this.events.on(AuraSystem.AURA_CHANGED, (state: any) => {
      this.game.events.emit(AuraSystem.AURA_CHANGED, state);
    });

    // Load level from data
    const level = loadLevel(this, rawData, this.auraSystem, this.inputManager);

    this.player = level.player;
    this.enemies = [...level.enemies];
    this.npcs = [...level.npcs];
    this.collectibles = [...level.collectibles];
    this.auraGates = [...level.auraGates];
    this.echoPlatforms = [...level.echoPlatforms];
    this.parallaxLayers = [...level.parallaxLayers];
    this.totalSparks = level.totalSparks;
    this.levelDef = level.def;
    this.spawnPoint = { x: level.def.playerSpawn.x, y: level.def.playerSpawn.y };

    // Sidekick companion — spawns slightly behind player
    this.companion = new Companion(this, this.spawnPoint.x - 60, this.spawnPoint.y);

    // Touch controls
    new TouchControls(this, this.inputManager);

    // --- Collisions ---
    this.physics.add.collider(this.player, level.platforms);
    this.physics.add.collider(this.companion, level.platforms);

    for (const npc of this.npcs) {
      this.physics.add.collider(npc, level.platforms);
      this.physics.add.collider(this.player, npc);
    }

    // Color zone overlaps
    for (const zone of level.colorZones) {
      this.physics.add.overlap(this.player, zone, () => {
        this.player.setInColorZone(zone.auraColor);
      });
    }

    // Aura gate collisions (gate physics body is a separate Rectangle)
    for (const gate of level.auraGates) {
      this.physics.add.collider(this.player, gate.physicsBody, () => {
        if (!this.auraSystem.hasColor(gate.requiredColor)) {
          gate.wobble();
        }
      });
    }

    // Enemy collisions
    for (const enemy of this.enemies) {
      this.physics.add.collider(enemy, level.platforms);
      this.physics.add.overlap(this.player, enemy, () => {
        this.handleEnemyCollision(enemy);
      });
    }

    // Collectible overlaps
    for (const collectible of this.collectibles) {
      this.physics.add.overlap(this.player, collectible, () => {
        this.handleCollectiblePickup(collectible);
      });
    }

    // End zone
    this.physics.add.overlap(this.player, level.endZone, () => {
      this.levelCompleted();
    });

    // Camera — smooth follow with deadzone for less jitter
    this.cameras.main.setBounds(0, 0, level.levelWidth, GAME_HEIGHT);
    this.cameras.main.startFollow(this.player, true, 0.06, 0.06);
    this.cameras.main.setDeadzone(80, 40); // player can move a bit before camera follows
    this.cameras.main.setFollowOffset(-60, 0); // look slightly ahead of player

    // Launch UI overlay with spark info
    this.scene.launch('UIScene', { totalSparks: this.totalSparks });

    // Spark collection event
    this.events.on('spark-collected', (data: { value: number }) => {
      this.sparksCollected += data.value;
      this.game.events.emit('spark-collected', {
        collected: this.sparksCollected,
        total: this.totalSparks,
      });
    });

    // Player death/respawn
    this.events.on('player-died', this.respawnPlayer, this);
  }

  update(): void {
    this.player.update();
    this.auraSystem.update();

    // Sidekick follows player
    if (this.companion?.active) {
      this.companion.follow(this.player.x, this.player.y);
    }

    // Parallax: update TileSprite positions based on camera scroll
    const camX = this.cameras.main.scrollX;
    for (const layer of this.parallaxLayers) {
      if (layer.isTileSprite) {
        (layer.obj as Phaser.GameObjects.TileSprite).tilePositionX = camX * layer.scrollFactor;
      } else {
        // For regular images, offset position relative to camera
        layer.obj.x = (layer.obj as any)._startX ?? layer.obj.x;
        if (!(layer.obj as any)._startX) (layer.obj as any)._startX = layer.obj.x;
        layer.obj.x = (layer.obj as any)._startX - camX * layer.scrollFactor;
      }
    }

    // Reset zone detection after player has read it
    this.player.setInColorZone(AuraColor.NONE);

    for (const enemy of this.enemies) {
      enemy.update();
    }

    for (const gate of this.auraGates) {
      gate.update();
    }

    // Yellow aura attract — pull nearby collectibles toward player
    if (this.auraSystem.getCurrentColor() === AuraColor.YELLOW) {
      this.updateAttract();
    }

    // Color Echo Platforms — enable/disable based on player's aura
    this.updateEchoPlatforms();

    // Hidden spark reveal
    for (const c of this.collectibles) {
      if (c.active) {
        c.revealIfNear(this.player.x, this.player.y);
      }
    }
  }

  private updateAttract(): void {
    for (const c of this.collectibles) {
      if (!c.active) continue;
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, c.x, c.y);
      if (dist < ATTRACT_RADIUS && dist > 5) {
        const angle = Phaser.Math.Angle.Between(c.x, c.y, this.player.x, this.player.y);
        const body = c.body as Phaser.Physics.Arcade.StaticBody;
        // Move static body by repositioning
        c.x += Math.cos(angle) * ATTRACT_SPEED * (1 / 60);
        c.y += Math.sin(angle) * ATTRACT_SPEED * (1 / 60);
        body.reset(c.x, c.y);
        c.syncGlow();
      }
    }
  }

  private updateEchoPlatforms(): void {
    const currentColor = this.auraSystem.getCurrentColor();

    for (const ep of this.echoPlatforms) {
      const shouldBeActive = currentColor === ep.echoColor;
      const body = ep.rect.body as Phaser.Physics.Arcade.StaticBody;
      const echoG = (ep.rect as any)._echoGraphics as Phaser.GameObjects.Graphics | undefined;

      if (shouldBeActive && !body.enable) {
        body.enable = true;
        if (echoG) echoG.setAlpha(1);
        this.tweens.add({
          targets: ep.hint,
          alpha: 0,
          duration: 200,
        });
      } else if (!shouldBeActive && body.enable) {
        body.enable = false;
        if (echoG) echoG.setAlpha(0.3);
        this.tweens.add({
          targets: ep.hint,
          alpha: 0.5,
          duration: 200,
        });
      }
    }
  }

  private handleCollectiblePickup(collectible: Collectible): void {
    if (!collectible.active) return;
    collectible.collect();
    this.collectibles = this.collectibles.filter(c => c !== collectible);
  }

  private handleEnemyCollision(enemy: Enemy): void {
    const playerBody = this.player.body as Phaser.Physics.Arcade.Body;

    if (playerBody.velocity.y > 0 && this.player.y < enemy.y - 10) {
      enemy.stomp();
      this.enemies = this.enemies.filter(e => e !== enemy);
      playerBody.setVelocityY(-250);

      // Game feel: screen shake on stomp
      this.cameras.main.shake(120, 0.008);

      // Play impact SFX if available
      if (this.textures.exists('sfx-impact')) {
        const sfx = this.add.sprite(enemy.x, enemy.y, 'sfx-impact');
        sfx.setScale(0.8);
        sfx.setBlendMode(Phaser.BlendModes.ADD);
        sfx.play('sfx-impact');
        sfx.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => sfx.destroy());
      }
    } else {
      this.player.die();
    }
  }

  private respawnPlayer(): void {
    // Fade to white overlay (Lea: gentle, not black)
    const flash = this.add.rectangle(
      this.cameras.main.scrollX + GAME_WIDTH / 2,
      GAME_HEIGHT / 2,
      GAME_WIDTH, GAME_HEIGHT,
      0xffffff, 0
    ).setScrollFactor(0).setDepth(1000);

    this.tweens.add({
      targets: flash,
      alpha: { from: 0, to: 0.6 },
      duration: 200,
      yoyo: true,
      hold: 100,
      onComplete: () => flash.destroy(),
    });

    this.player.setPosition(this.spawnPoint.x, this.spawnPoint.y);
    this.player.setAlpha(1);
    this.auraSystem.clear();
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0, 0);

    // Brief invulnerability flash
    this.tweens.add({
      targets: this.player,
      alpha: { from: 0.3, to: 1 },
      duration: 150,
      repeat: 4,
      yoyo: true,
    });
  }

  private levelCompleted(): void {
    if (this.levelComplete_) return;
    this.levelComplete_ = true;

    this.physics.pause();

    const timeMs = this.time.now - this.startTime;

    // Disable input on game scene so the overlay receives clicks
    this.input.enabled = false;

    // Launch level complete overlay and bring to top
    this.scene.launch('LevelCompleteScene', {
      sparksCollected: this.sparksCollected,
      totalSparks: this.totalSparks,
      timeMs,
      levelId: this.levelDef?.meta?.id ?? 'level-01',
      thresholds: this.levelDef?.meta?.sparkThresholds,
      nextLevelId: undefined,
    });
    this.scene.bringToTop('LevelCompleteScene');
  }
}
