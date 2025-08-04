import { Application, Container, Sprite, BlurFilter, Texture, Graphics } from 'pixi.js';
import { GAME_CONFIG, REEL_SYMBOLS, SymbolType } from '../config/GameConfig';

export class ReelSimple {
    private app: Application;
    private container: Container;
    private symbolContainer: Container;
    private symbols: Sprite[] = [];
    private _position: number = 0;
    private previousPosition: number = 0;
    private blur: BlurFilter;
    
    constructor(app: Application, public reelIndex: number) {
        this.app = app;
        this.container = new Container();
        this.symbolContainer = new Container();
        this.blur = new BlurFilter();
        this.blur.blurX = 0;
        this.blur.blurY = 0;
        this.container.filters = [this.blur];
    }

    init(): void {
        // Position the reel
        this.container.x = GAME_CONFIG.REEL_POSITIONS[this.reelIndex];
        this.container.y = GAME_CONFIG.REEL_Y;
        
        // Add reel background for single symbol display
        const reelBg = new Graphics();
        reelBg.rect(-GAME_CONFIG.SYMBOL_WIDTH / 2 - 15, -GAME_CONFIG.SYMBOL_HEIGHT / 2 - 15, 
                    GAME_CONFIG.SYMBOL_WIDTH + 30, GAME_CONFIG.SYMBOL_HEIGHT + 30);
        reelBg.fill({ color: 0x000000 });
        reelBg.stroke({ width: 3, color: 0x333333 });
        this.container.addChild(reelBg);
        
        // Add symbol container to main container
        this.container.addChild(this.symbolContainer);
        
        // Create a mask to show only 1 symbol
        const mask = new Graphics();
        mask.rect(-GAME_CONFIG.SYMBOL_WIDTH / 2, -GAME_CONFIG.SYMBOL_HEIGHT / 2, 
                  GAME_CONFIG.SYMBOL_WIDTH, GAME_CONFIG.SYMBOL_HEIGHT);
        mask.fill({ color: 0xffffff });
        this.symbolContainer.mask = mask;
        this.container.addChild(mask);
        
        // Create 5 symbols (2 extra for smooth scrolling)
        for (let i = 0; i < 5; i++) {
            const symbolIndex = Math.floor(Math.random() * REEL_SYMBOLS.length);
            const symbolType = REEL_SYMBOLS[symbolIndex];
            const texture = Texture.from(this.getTextureAlias(symbolType));
            
            const symbol = new Sprite(texture);
            symbol.anchor.set(0.5);
            
            // Store the symbol type as user data
            (symbol as any).symbolType = symbolType;
            
            // Scale to fit
            const scale = Math.min(
                GAME_CONFIG.SYMBOL_WIDTH / symbol.texture.width,
                GAME_CONFIG.SYMBOL_HEIGHT / symbol.texture.height
            );
            symbol.scale.set(scale);
            
            // Position vertically for single symbol display
            symbol.y = (i - 1) * GAME_CONFIG.SYMBOL_HEIGHT;
            symbol.x = 0;
            
            this.symbols.push(symbol);
            this.symbolContainer.addChild(symbol);
        }
        
        // Start at position 0 for alignment
        this._position = 0;
        
        // Update initial positions to ensure alignment
        this.update();
        
        // Don't add to stage here - let GameController handle it
        this.app.ticker.add(this.update, this);
    }
    
    getContainer(): Container {
        return this.container;
    }

    private update(): void {
        // Update blur based on speed
        this.blur.blurY = (this._position - this.previousPosition) * 8;
        this.previousPosition = this._position;
        
        // Update symbol positions
        for (let i = 0; i < this.symbols.length; i++) {
            const symbol = this.symbols[i];
            
            // Simple position calculation - each symbol moves based on reel position
            const symbolPos = ((this._position + i) % this.symbols.length);
            symbol.y = (symbolPos - 1) * GAME_CONFIG.SYMBOL_HEIGHT;
            
            // Wrap symbols that go off the top back to the bottom
            if (symbol.y < -GAME_CONFIG.SYMBOL_HEIGHT * 1.5) {
                symbol.y += this.symbols.length * GAME_CONFIG.SYMBOL_HEIGHT;
                
                // Give it a new texture from the REEL_SYMBOLS array
                const newSymbolIndex = Math.floor(Math.random() * REEL_SYMBOLS.length);
                const symbolType = REEL_SYMBOLS[newSymbolIndex];
                symbol.texture = Texture.from(this.getTextureAlias(symbolType));
                
                // Store the symbol type
                (symbol as any).symbolType = symbolType;
                
                // Rescale
                const scale = Math.min(
                    GAME_CONFIG.SYMBOL_WIDTH / symbol.texture.width,
                    GAME_CONFIG.SYMBOL_HEIGHT / symbol.texture.height
                );
                symbol.scale.set(scale);
            }
        }
    }

    get position(): number {
        return this._position;
    }

    set position(value: number) {
        this._position = value;
    }

    getMiddleSymbol(): SymbolType {
        // Find which symbol is currently in the middle (visible) position
        // The middle position is at y = 0
        
        let closestSymbol: Sprite | null = null;
        let closestDistance = Infinity;
        
        // Find the symbol closest to y = 0 (the visible position)
        for (let i = 0; i < this.symbols.length; i++) {
            const symbol = this.symbols[i];
            const distance = Math.abs(symbol.y);
            
            if (distance < closestDistance) {
                closestDistance = distance;
                closestSymbol = symbol;
            }
        }
        
        if (!closestSymbol) {
            console.error(`ERROR: Could not find visible symbol!`);
            return SymbolType.SYM1; // Fallback
        }
        
        // Get the symbol type from the sprite's user data
        const symbolType = (closestSymbol as any).symbolType;
        
        console.log(`Reel ${this.reelIndex}: position=${this._position.toFixed(2)}, distance=${closestDistance.toFixed(2)}, symbol=${symbolType}`);
        
        if (!symbolType) {
            console.error(`ERROR: Symbol type not found on sprite!`);
            return SymbolType.SYM1; // Fallback
        }
        
        return symbolType;
    }

    private getTextureAlias(symbolType: SymbolType): string {
        const aliasMap: Record<SymbolType, string> = {
            [SymbolType.SYM1]: 'sym1',
            [SymbolType.SYM2]: 'sym2',
            [SymbolType.SYM3]: 'sym3',
            [SymbolType.SYM4]: 'sym4',
            [SymbolType.SYM5]: 'sym5',
            [SymbolType.SYM6]: 'sym6',
        };
        return aliasMap[symbolType];
    }

    destroy(): void {
        this.app.ticker.remove(this.update, this);
        this.container.destroy({ children: true });
    }
}