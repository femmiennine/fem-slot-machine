export const GAME_CONFIG = {
    // Game settings
    INITIAL_BALANCE: 100,
    BET_AMOUNT: 1,
    
    // Display settings
    GAME_WIDTH: 800,
    GAME_HEIGHT: 600,
    BACKGROUND_COLOR: 0x0a0a0a,
    
    // Reel settings
    VISIBLE_SYMBOLS: 1,
    SYMBOL_WIDTH: 100,
    SYMBOL_HEIGHT: 100,
    REEL_WIDTH: 50,
    
    // Animation settings
    SPIN_DURATION: 3000, // 3 seconds
    ACCELERATION_TIME: 500, // 0-500ms
    DECELERATION_TIME: 500, // 2500-3000ms
    MAX_VELOCITY: 30, // pixels per frame at 60fps
    MIN_SPIN_DISTANCE: 3, // Minimum symbols to scroll for quick stop
    
    // UI positions
    REEL_Y: 250, // Centered vertically for single row
    REEL_SPACING: 120, // Spacing between reels
    REEL_POSITIONS: [
        280, // Left reel X
        400, // Center reel X (center of 800px screen)
        520  // Right reel X
    ],
    BALANCE_X: 50,
    BALANCE_Y: 30,  // Top position
    WIN_X: 50,
    WIN_Y: 100,     // Below balance and win counter
    SPIN_BUTTON_X: 400,
    SPIN_BUTTON_Y: 550, // Near bottom of 600px screen
} as const;

export enum SymbolType {
    SYM1 = 'SYM1',
    SYM2 = 'SYM2',
    SYM3 = 'SYM3',
    SYM4 = 'SYM4',
    SYM5 = 'SYM5',
    SYM6 = 'SYM6',
}

// Reel configuration from PRD
export const REEL_SYMBOLS: SymbolType[] = [
    SymbolType.SYM1, SymbolType.SYM5, SymbolType.SYM1, SymbolType.SYM3, SymbolType.SYM4,
    SymbolType.SYM3, SymbolType.SYM2, SymbolType.SYM4, SymbolType.SYM3, SymbolType.SYM6,
    SymbolType.SYM3, SymbolType.SYM1, SymbolType.SYM6, SymbolType.SYM1, SymbolType.SYM2,
    SymbolType.SYM1, SymbolType.SYM2, SymbolType.SYM2, SymbolType.SYM2, SymbolType.SYM1,
    SymbolType.SYM2, SymbolType.SYM1, SymbolType.SYM4, SymbolType.SYM1, SymbolType.SYM3,
    SymbolType.SYM6, SymbolType.SYM1, SymbolType.SYM3, SymbolType.SYM2, SymbolType.SYM5,
    SymbolType.SYM3, SymbolType.SYM1, SymbolType.SYM2, SymbolType.SYM2, SymbolType.SYM2,
    SymbolType.SYM1, SymbolType.SYM4, SymbolType.SYM1, SymbolType.SYM4, SymbolType.SYM1,
    SymbolType.SYM3, SymbolType.SYM2, SymbolType.SYM4, SymbolType.SYM4, SymbolType.SYM5,
    SymbolType.SYM2, SymbolType.SYM3, SymbolType.SYM1, SymbolType.SYM1, SymbolType.SYM1,
    SymbolType.SYM4, SymbolType.SYM5, SymbolType.SYM2, SymbolType.SYM2, SymbolType.SYM2,
    SymbolType.SYM1, SymbolType.SYM5, SymbolType.SYM6, SymbolType.SYM1, SymbolType.SYM3,
    SymbolType.SYM4, SymbolType.SYM2, SymbolType.SYM5, SymbolType.SYM2, SymbolType.SYM1,
    SymbolType.SYM5, SymbolType.SYM1, SymbolType.SYM2, SymbolType.SYM1, SymbolType.SYM1,
    SymbolType.SYM1, SymbolType.SYM4, SymbolType.SYM4, SymbolType.SYM3, SymbolType.SYM3,
    SymbolType.SYM5, SymbolType.SYM5, SymbolType.SYM4, SymbolType.SYM2, SymbolType.SYM5,
    SymbolType.SYM2, SymbolType.SYM1, SymbolType.SYM3, SymbolType.SYM2, SymbolType.SYM3,
    SymbolType.SYM1, SymbolType.SYM4, SymbolType.SYM3, SymbolType.SYM4, SymbolType.SYM2,
    SymbolType.SYM3, SymbolType.SYM4, SymbolType.SYM1, SymbolType.SYM1, SymbolType.SYM1,
    SymbolType.SYM2, SymbolType.SYM6, SymbolType.SYM3, SymbolType.SYM2, SymbolType.SYM3,
    SymbolType.SYM1, SymbolType.SYM5,
];

// Asset manifest for PIXI.js loader
export const ASSET_MANIFEST = {
    bundles: [{
        name: 'game-assets',
        assets: [
            { alias: 'sym1', src: 'assets/symbols/SYM1.png' },
            { alias: 'sym2', src: 'assets/symbols/SYM2.png' },
            { alias: 'sym3', src: 'assets/symbols/SYM3.png' },
            { alias: 'sym4', src: 'assets/symbols/SYM4.png' },
            { alias: 'sym5', src: 'assets/symbols/SYM5.png' },
            { alias: 'sym6', src: 'assets/symbols/SYM6.png' },
            { alias: 'spinButton', src: 'assets/ui/spin_button.png' },
            { alias: 'spinButtonDisabled', src: 'assets/ui/spin_button_disabled.png' },
            { alias: 'background', src: 'assets/ui/background.png' },
            { alias: 'reelBackground', src: 'assets/ui/reel_background.png' },
        ]
    }]
};