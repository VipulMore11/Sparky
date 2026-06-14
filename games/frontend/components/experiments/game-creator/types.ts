// Game asset types
export type EventAction = {
    type: 'bounce' | 'fade' | 'rotate';
    duration: number;
    targetAssetId?: string; // For actions that target other assets
};

export type GameAssetEvents = {
    [key: string]: EventAction;
};

export type GameAsset = {
    id: string;
    type: string;
    emoji?: string;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    events?: GameAssetEvents;
};

// Game configuration types
export type GameConfig = {
    background: {
        color: string;
        image?: string;
    };
    assets: GameAsset[];
};

// Animation types
export type AnimationType = 'bounce' | 'fade' | 'rotate';