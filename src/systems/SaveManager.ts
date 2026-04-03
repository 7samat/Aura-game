export interface LevelStat {
  trophy: 'empty' | 'half' | 'full' | 'sparkling';
  sparksCollected: number;
  bestTime: number;
}

export interface GameSettings {
  musicOn: boolean;
  sfxOn: boolean;
  colorblindMode: boolean;
}

export interface ProfileSlot {
  id: string;
  animalIcon: 'fox' | 'bear' | 'robot';
  color: string;              // hex background color for the slot
  characterKey: string;       // 'player' | 'female' | 'adventurer'
  unlockedLevels: string[];
  levelStats: Record<string, LevelStat>;
  settings: GameSettings;
  createdAt: number;
}

const SLOT_IDS = ['A', 'B', 'C'] as const;
const STORAGE_PREFIX = 'aura_profile_';
const ACTIVE_SLOT_KEY = 'aura_active_slot';

const DEFAULT_SETTINGS: GameSettings = {
  musicOn: true,
  sfxOn: true,
  colorblindMode: false,
};

const ANIMAL_ICONS: Array<'fox' | 'bear' | 'robot'> = ['fox', 'bear', 'robot'];
const SLOT_COLORS = ['#ff6b6b', '#4dc8ff', '#ffd94d'];

export class SaveManager {
  private static instance: SaveManager;
  private activeSlotId: string | null = null;

  static getInstance(): SaveManager {
    if (!SaveManager.instance) {
      SaveManager.instance = new SaveManager();
    }
    return SaveManager.instance;
  }

  /** Get all slot IDs */
  getSlotIds(): readonly string[] {
    return SLOT_IDS;
  }

  /** Load a profile from a slot. Returns null if empty. */
  loadProfile(slotId: string): ProfileSlot | null {
    try {
      const raw = localStorage.getItem(STORAGE_PREFIX + slotId);
      if (!raw) return null;
      return JSON.parse(raw) as ProfileSlot;
    } catch {
      return null;
    }
  }

  /** Save a profile to a slot */
  saveProfile(profile: ProfileSlot): void {
    try {
      localStorage.setItem(STORAGE_PREFIX + profile.id, JSON.stringify(profile));
    } catch {
      console.warn('Failed to save profile — localStorage may be unavailable');
    }
  }

  /** Create a new profile in a slot */
  createProfile(slotId: string, characterKey: string): ProfileSlot {
    const slotIndex = SLOT_IDS.indexOf(slotId as any);
    const profile: ProfileSlot = {
      id: slotId,
      animalIcon: ANIMAL_ICONS[slotIndex >= 0 ? slotIndex : 0],
      color: SLOT_COLORS[slotIndex >= 0 ? slotIndex : 0],
      characterKey,
      unlockedLevels: ['level-01'],
      levelStats: {},
      settings: { ...DEFAULT_SETTINGS },
      createdAt: Date.now(),
    };
    this.saveProfile(profile);
    this.setActiveSlot(slotId);
    return profile;
  }

  /** Delete a profile */
  deleteProfile(slotId: string): void {
    try {
      localStorage.removeItem(STORAGE_PREFIX + slotId);
      if (this.activeSlotId === slotId) {
        this.activeSlotId = null;
        localStorage.removeItem(ACTIVE_SLOT_KEY);
      }
    } catch {
      // Ignore
    }
  }

  /** Set the active slot */
  setActiveSlot(slotId: string): void {
    this.activeSlotId = slotId;
    try {
      localStorage.setItem(ACTIVE_SLOT_KEY, slotId);
    } catch {
      // Ignore
    }
  }

  /** Get the active slot ID */
  getActiveSlotId(): string | null {
    if (this.activeSlotId) return this.activeSlotId;
    try {
      this.activeSlotId = localStorage.getItem(ACTIVE_SLOT_KEY);
    } catch {
      this.activeSlotId = null;
    }
    return this.activeSlotId;
  }

  /** Get the active profile */
  getActiveProfile(): ProfileSlot | null {
    const slotId = this.getActiveSlotId();
    if (!slotId) return null;
    return this.loadProfile(slotId);
  }

  /** Record level completion */
  completeLevel(levelId: string, sparksCollected: number, totalSparks: number, timeMs: number, trophy: LevelStat['trophy']): void {
    const profile = this.getActiveProfile();
    if (!profile) return;

    const existing = profile.levelStats[levelId];
    const stat: LevelStat = {
      trophy: betterTrophy(existing?.trophy ?? 'empty', trophy),
      sparksCollected: Math.max(existing?.sparksCollected ?? 0, sparksCollected),
      bestTime: existing?.bestTime ? Math.min(existing.bestTime, timeMs) : timeMs,
    };
    profile.levelStats[levelId] = stat;

    // Unlock next level if not already
    // Simple: unlock level-0N+1
    const num = parseInt(levelId.replace('level-', ''), 10);
    if (!isNaN(num)) {
      const nextId = `level-${String(num + 1).padStart(2, '0')}`;
      if (!profile.unlockedLevels.includes(nextId)) {
        profile.unlockedLevels.push(nextId);
      }
    }

    this.saveProfile(profile);
  }

  /** Update settings */
  updateSettings(settings: Partial<GameSettings>): void {
    const profile = this.getActiveProfile();
    if (!profile) return;
    profile.settings = { ...profile.settings, ...settings };
    this.saveProfile(profile);
  }
}

const TROPHY_ORDER: LevelStat['trophy'][] = ['empty', 'half', 'full', 'sparkling'];

function betterTrophy(a: LevelStat['trophy'], b: LevelStat['trophy']): LevelStat['trophy'] {
  return TROPHY_ORDER.indexOf(a) >= TROPHY_ORDER.indexOf(b) ? a : b;
}
