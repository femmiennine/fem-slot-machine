import { Application } from 'pixi.js';
import { GameControllerSimple } from './core/GameControllerSimple';
import { GAME_CONFIG } from './config/GameConfig';

// Create a PixiJS application
async function init() {
    // Create the application
    const app = new Application();

    // Initialize the application
    await app.init({
        width: GAME_CONFIG.GAME_WIDTH,
        height: GAME_CONFIG.GAME_HEIGHT,
        backgroundColor: GAME_CONFIG.BACKGROUND_COLOR,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
    });

    // Add the canvas to the DOM
    const container = document.getElementById('game-container');
    if (container) {
        container.appendChild(app.canvas);
    }

    // Create and initialize game controller
    const gameController = new GameControllerSimple(app);
    await gameController.init();

    console.log('PIXI.js Slot Machine - Game Ready');
}

// Start the application
init().catch((error) => {
    console.error('Failed to initialize game:', error);
    const container = document.getElementById('game-container');
    if (container) {
        container.innerHTML = '<div style="color: red; padding: 20px;">Failed to load game. Check console for errors.</div>';
    }
});