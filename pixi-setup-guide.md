# PIXI.js v8 Setup Guide for Slot Machine Project

## Installation

### Option 1: Create New PIXI.js Project (Recommended)
```bash
npm create pixi.js@latest
```
- Select Vite + PixiJS template
- Requires Node.js v20.0 or higher
- Includes pre-configured build setup

### Option 2: Add to Existing Project
```bash
npm install pixi.js
```

For TypeScript support:
```bash
npm install --save-dev @types/pixi.js
```

## Basic Application Setup

### Creating the Application
```typescript
import { Application } from 'pixi.js';

// Create and initialize application
const app = new Application();

await app.init({
    background: '#1099bb',
    width: 800,
    height: 600,
    antialias: true,
    resolution: window.devicePixelRatio || 1,
});

// Add canvas to DOM
document.body.appendChild(app.canvas);
```

### Asset Loading
```typescript
import { Assets } from 'pixi.js';

// Preload all game assets
const assetManifest = {
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
        ]
    }]
};

await Assets.init({ manifest: assetManifest });
await Assets.loadBundle('game-assets');
```

## Core Concepts for Slot Machine

### Sprites
```typescript
import { Sprite } from 'pixi.js';

// Create sprite from loaded texture
const symbol = Sprite.from('sym1');
symbol.anchor.set(0.5); // Center anchor
symbol.x = 400;
symbol.y = 300;

// Add to stage
app.stage.addChild(symbol);
```

### Containers (For Reel Organization)
```typescript
import { Container } from 'pixi.js';

// Create container for reel symbols
const reelContainer = new Container();
reelContainer.x = 400; // Center position
reelContainer.y = 300;

// Add symbols to container
for (let i = 0; i < symbols.length; i++) {
    const symbol = Sprite.from(symbolTexture);
    symbol.y = i * SYMBOL_HEIGHT;
    reelContainer.addChild(symbol);
}

app.stage.addChild(reelContainer);
```

### Masking (For Visible Symbol Area)
```typescript
import { Graphics } from 'pixi.js';

// Create mask to show only 3 symbols
const mask = new Graphics();
mask.rect(0, 0, REEL_WIDTH, SYMBOL_HEIGHT * 3);
mask.fill({ color: 0xffffff });

reelContainer.mask = mask;
```

### Animation with Ticker
```typescript
// Add update loop
app.ticker.add((ticker) => {
    // Delta time for smooth animation
    const deltaTime = ticker.deltaTime;
    
    // Update reel position
    if (isSpinning) {
        reelContainer.y += velocity * deltaTime;
        
        // Wrap around logic
        if (reelContainer.y > MAX_Y) {
            reelContainer.y -= TOTAL_HEIGHT;
        }
    }
});
```

### Text Display
```typescript
import { Text, TextStyle } from 'pixi.js';

const style = new TextStyle({
    fontFamily: 'Arial',
    fontSize: 36,
    fontWeight: 'bold',
    fill: '#ffffff',
    dropShadow: true,
    dropShadowDistance: 2,
});

const balanceText = new Text({ text: 'Balance: $100', style });
balanceText.x = 50;
balanceText.y = 50;

app.stage.addChild(balanceText);
```

### Interactive Elements
```typescript
// Make spin button interactive
const spinButton = Sprite.from('spinButton');
spinButton.eventMode = 'static';
spinButton.cursor = 'pointer';

spinButton.on('pointerdown', onSpinClick);
spinButton.on('pointerover', () => spinButton.tint = 0xcccccc);
spinButton.on('pointerout', () => spinButton.tint = 0xffffff);
```

## TypeScript Configuration

### Recommended tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}
```

## Performance Optimization Tips

### Texture Atlases
```typescript
// Load texture atlas for better performance
const sheet = await Assets.load('assets/symbols.json');
const sym1Texture = sheet.textures['SYM1.png'];
```

### Object Pooling
```typescript
// Reuse sprites instead of creating new ones
const symbolPool: Sprite[] = [];

function getSymbolFromPool(texture: Texture): Sprite {
    const sprite = symbolPool.pop() || new Sprite();
    sprite.texture = texture;
    return sprite;
}

function returnToPool(sprite: Sprite): void {
    sprite.visible = false;
    symbolPool.push(sprite);
}
```

### Render Groups (For Complex Scenes)
```typescript
import { RenderGroup } from 'pixi.js';

// Group related display objects
const reelRenderGroup = new RenderGroup();
reelContainer.renderGroup = reelRenderGroup;
```

## Build Setup with Vite

### vite.config.js
```javascript
import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
  server: {
    port: 3000,
    open: true,
  },
});
```

### Package.json Scripts
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  }
}
```

## Important Notes for Slot Machine Development

1. **Async Pattern**: When using Vite, wrap your main code in an async function to avoid production build issues
2. **Resolution Handling**: Set resolution based on device pixel ratio for sharp graphics
3. **Memory Management**: Remove sprites from stage when not needed and destroy textures
4. **Event Handling**: Use PIXI's built-in event system for user interactions
5. **Animation Frame**: Use `app.ticker` for smooth, frame-independent animations

## Example Project Structure
```
slot-machine/
├── src/
│   ├── main.ts          # Entry point
│   ├── Game.ts          # Main game class
│   ├── Reel.ts          # Reel component
│   ├── UI.ts            # UI management
│   └── types.ts         # TypeScript types
├── assets/
│   ├── symbols/         # Symbol images
│   └── ui/              # UI elements
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.js
```