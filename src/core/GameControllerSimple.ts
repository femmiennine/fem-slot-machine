import { Application, Assets, Graphics, Container, FillGradient } from 'pixi.js';
import { GAME_CONFIG, ASSET_MANIFEST, SymbolType } from '../config/GameConfig';
import { ReelSimple } from './ReelSimple';
import { UIManager } from '../ui/UIManager';

interface Tween {
    object: any;
    property: string;
    propertyBeginValue: number;
    target: number;
    time: number;
    start: number;
    easing: (t: number) => number;
    change?: (tween: Tween) => void;
    complete?: (tween: Tween) => void;
}

export class GameControllerSimple {
    private app: Application;
    private reels: ReelSimple[] = [];
    private uiManager: UIManager | null = null;
    private balance: number = GAME_CONFIG.INITIAL_BALANCE;
    private running: boolean = false;
    private tweening: Tween[] = [];
    private reelContainer: Container;
    private startPositions: number[] = [];
    private spinCount: number = 0;

    constructor(app: Application) {
        console.log('GameControllerSimple constructor called - THIS SHOULD ONLY HAPPEN ONCE!');
        this.app = app;
        this.reelContainer = new Container();
    }

    async init(): Promise<void> {
        try {
            // Initialize assets
            await Assets.init({ manifest: ASSET_MANIFEST });
            const bundle = await Assets.loadBundle('game-assets');
            console.log('Assets loaded:', Object.keys(bundle));

            // Create gradient background
            const bgGradient = new Graphics();
            const gradient = new FillGradient(0, 0, 0, GAME_CONFIG.GAME_HEIGHT);
            gradient.addColorStop(0, 0x1a0f00);  // Dark brown
            gradient.addColorStop(0.5, 0x2d1810); // Medium brown
            gradient.addColorStop(1, 0x1a0f00);  // Dark brown
            bgGradient.rect(0, 0, GAME_CONFIG.GAME_WIDTH, GAME_CONFIG.GAME_HEIGHT);
            bgGradient.fill(gradient);
            this.app.stage.addChild(bgGradient);

            // Create reel container
            this.app.stage.addChild(this.reelContainer);

            // Create 3 reels
            for (let i = 0; i < 3; i++) {
                const reel = new ReelSimple(this.app, i);
                reel.init();
                this.reels.push(reel);
                this.reelContainer.addChild(reel.getContainer());
            }
            
            // Add a frame around the slot machine
            const gridFrame = new Graphics();
            const frameWidth = (GAME_CONFIG.REEL_POSITIONS[2] - GAME_CONFIG.REEL_POSITIONS[0]) + GAME_CONFIG.SYMBOL_WIDTH + 60;
            const frameHeight = GAME_CONFIG.SYMBOL_HEIGHT + 60;
            const frameX = GAME_CONFIG.REEL_POSITIONS[0] - GAME_CONFIG.SYMBOL_WIDTH/2 - 30;
            const frameY = GAME_CONFIG.REEL_Y - GAME_CONFIG.SYMBOL_HEIGHT/2 - 30;
            
            gridFrame.rect(frameX, frameY, frameWidth, frameHeight);
            gridFrame.stroke({ width: 3, color: 0x444444 });
            this.app.stage.addChild(gridFrame);

            // Initialize UI
            this.uiManager = new UIManager(this.app);
            this.uiManager.updateBalance(this.balance);
            this.uiManager.updateWinAmount(0);
            
            // Set up spin button
            this.uiManager.onSpinClick(() => {
                if (this.running) {
                    this.stopPlay();
                } else {
                    this.startPlay();
                }
            });
            
            this.updateSpinButtonState();

            // Set up ticker for tweening
            this.app.ticker.add(this.updateTweens, this);
        } catch (error) {
            console.error('Failed to load assets:', error);
            throw error;
        }
    }

    private stopPlay(): void {
        if (!this.running) return;
        
        console.log('Manual stop requested...');
        
        // Stop all tweens immediately
        this.tweening = [];
        
        // Ensure symbols have moved enough to exit screen
        for (let i = 0; i < this.reels.length; i++) {
            const reel = this.reels[i];
            const currentPos = reel.position;
            const startPos = this.startPositions[i];
            const distanceTraveled = currentPos - startPos;
            
            // Ensure the old symbol has completely exited
            let stopPos: number;
            const minDistance = 1; // At least 1 symbol must exit for single-symbol display
            
            if (distanceTraveled < minDistance) {
                // Force the old symbol to exit completely
                stopPos = Math.ceil(startPos + minDistance);
            } else {
                // Already moved enough, stop at next whole position
                stopPos = Math.ceil(currentPos);
            }
            
            // Quick tween to final position with fast settle
            this.tweenTo(
                reel,
                'position',
                stopPos,
                200 + i * 50, // Faster staggered stop
                this.backout(0.3),
                undefined,
                i === this.reels.length - 1 ? () => this.reelsComplete() : undefined
            );
        }
    }

    private startPlay(): void {
        if (this.running || this.balance < GAME_CONFIG.BET_AMOUNT) return;
        
        this.spinCount++;
        console.log(`\n=== SPIN #${this.spinCount} ===`);
        console.log(`Starting spin... Current balance: $${this.balance}`);
        console.log(`Win counter visible: ${this.uiManager?.getWinCounterVisibility()}`);
        this.running = true;
        
        // Deduct bet
        this.balance -= GAME_CONFIG.BET_AMOUNT;
        console.log(`Balance after bet deduction: $${this.balance}`);
        this.uiManager?.updateBalance(this.balance);
        // Don't clear the win amount - keep showing the last win
        this.updateSpinButtonState();
        
        // Update button to show it's spinning
        this.uiManager?.setSpinButtonSpinning(true);

        // Save starting positions
        this.startPositions = this.reels.map(reel => reel.position);

        // Start spinning each reel
        for (let i = 0; i < this.reels.length; i++) {
            const reel = this.reels[i];
            const extra = Math.floor(Math.random() * 3);
            const currentPos = reel.position;
            const target = currentPos + 10 + i * 5 + extra;
            const time = 2500 + i * 600 + extra * 600;
            
            console.log(`Reel ${i}: current=${currentPos}, target=${target}, time=${time}ms`);

            this.tweenTo(
                reel, 
                'position', 
                target, 
                time, 
                this.backout(0.5),
                undefined,
                i === this.reels.length - 1 ? () => this.reelsComplete() : undefined
            );
        }
    }

    private reelsComplete(): void {
        console.log(`Reels complete for spin #${this.spinCount}!`);
        console.log(`Balance before win calculation: $${this.balance}`);
        this.running = false;
        
        // Reset button appearance
        this.uiManager?.setSpinButtonSpinning(false);
        
        // Wait a frame to ensure reels have settled
        setTimeout(() => {
            console.log('\n=== CHECKING FOR WINS ===');
            // Check for wins
            const middleSymbols = this.reels.map((reel, index) => {
                const symbol = reel.getMiddleSymbol();
                console.log(`Reel ${index} final symbol: ${symbol}`);
                return symbol;
            });
            
            console.log('Final symbols:', middleSymbols);
            console.log('Final symbols stringified:', JSON.stringify(middleSymbols));
            
            if (middleSymbols.some(s => !s)) {
                console.error('ERROR: Some symbols are undefined!');
            }
            
            this.checkForWins(middleSymbols);
        }, 100);
    }
    
    private checkForWins(middleSymbols: SymbolType[]): void {
        // Validate all symbols exist
        if (middleSymbols.length !== 3) {
            console.error(`ERROR: Expected 3 symbols, got ${middleSymbols.length}`);
            return;
        }
        
        // Check for any invalid symbols
        const validSymbols = middleSymbols.filter(symbol => {
            if (!symbol || typeof symbol !== 'string') {
                console.error(`Invalid symbol detected: ${symbol}`);
                return false;
            }
            return true;
        });
        
        if (validSymbols.length !== 3) {
            console.error('ERROR: Not all symbols are valid, aborting win check');
            return;
        }
        
        // Count matches
        const symbolCounts: Record<string, number> = {};
        validSymbols.forEach((symbol) => {
            symbolCounts[symbol] = (symbolCounts[symbol] || 0) + 1;
        });
        
        console.log('Valid symbols:', validSymbols);
        console.log('Symbol counts:', JSON.stringify(symbolCounts));
        
        // Find wins
        let winAmount = 0;
        let winningSymbol = null;
        
        // Only check for wins with valid symbol counts
        for (const [symbol, count] of Object.entries(symbolCounts)) {
            console.log(`Checking symbol: "${symbol}" with count: ${count}`);
            
            // Extra validation
            if (!symbol || symbol === 'undefined' || symbol === 'null' || symbol === '') {
                console.error(`Invalid symbol in win check: "${symbol}" with count ${count}`);
                continue;
            }
            
            // Only count as win if we have exactly 2 or 3 matching
            if (count === 2 && validSymbols.filter(s => s === symbol).length === 2) {
                winAmount = GAME_CONFIG.BET_AMOUNT * 2;
                winningSymbol = symbol;
                console.log(`*** WIN! Found 2 matching ${symbol} - Win amount: $${winAmount} ***`);
                break; // Only one win per spin
            } else if (count === 3 && validSymbols.filter(s => s === symbol).length === 3) {
                winAmount = GAME_CONFIG.BET_AMOUNT * 3;
                winningSymbol = symbol;
                console.log(`*** JACKPOT! Found 3 matching ${symbol} - Win amount: $${winAmount} ***`);
                break; // Only one win per spin
            }
        }
        
        if (winAmount > 0) {
            console.log(`\n🎰 WIN DETECTED! 🎰`);
            console.log(`Win amount: $${winAmount}`);
            console.log(`Balance before win: $${this.balance}`);
            
            this.balance += winAmount;
            
            console.log(`Balance after win: $${this.balance}`);
            console.log(`Updating UI...`);
            
            if (this.uiManager) {
                this.uiManager.updateBalance(this.balance);
                this.uiManager.updateWinAmount(winAmount);
                console.log('UI updated successfully');
            } else {
                console.error('ERROR: UIManager is null!');
            }
            
            // Show win message based on match count
            let winMessage = '';
            if (symbolCounts[winningSymbol!] === 3) {
                winMessage = '🎉 JACKPOT! 🎉';
            } else if (symbolCounts[winningSymbol!] === 2) {
                winMessage = 'Nice Win!';
            }
            
            // Get symbol name for message
            const symbolNames: Record<string, string> = {
                'SYM1': 'Silver Star',
                'SYM2': 'Gold Circle',
                'SYM3': 'Black Triangle',
                'SYM4': 'Blue Square',
                'SYM5': 'Red Diamond',
                'SYM6': 'Yellow Hexagon'
            };
            
            const symbolName = symbolNames[winningSymbol!] || winningSymbol;
            const fullMessage = `${winMessage}\n${symbolCounts[winningSymbol!]} ${symbolName}!`;
            
            this.uiManager?.showWinMessage(fullMessage);
            console.log(`Win! ${winningSymbol} x${symbolCounts[winningSymbol!]} = $${winAmount}`);
        }
        
        this.updateSpinButtonState();
        
        // Ensure win counter stays visible after checking wins
        this.uiManager?.ensureWinCounterVisible();
        console.log('=== End of checkForWins ===');
        
        // Double-check win counter visibility after a short delay
        setTimeout(() => {
            this.uiManager?.ensureWinCounterVisible();
        }, 500);
    }

    private updateSpinButtonState(): void {
        const canSpin = this.balance >= GAME_CONFIG.BET_AMOUNT && !this.running;
        this.uiManager?.setSpinButtonEnabled(canSpin);
    }

    private tweenTo(
        object: any, 
        property: string, 
        target: number, 
        time: number, 
        easing: (t: number) => number,
        onchange?: (tween: Tween) => void,
        oncomplete?: (tween: Tween) => void
    ): Tween {
        const tween: Tween = {
            object,
            property,
            propertyBeginValue: object[property],
            target,
            easing,
            time,
            change: onchange,
            complete: oncomplete,
            start: Date.now(),
        };

        this.tweening.push(tween);
        return tween;
    }

    private updateTweens(): void {
        const now = Date.now();
        const remove: Tween[] = [];

        for (let i = 0; i < this.tweening.length; i++) {
            const t = this.tweening[i];
            const phase = Math.min(1, (now - t.start) / t.time);

            t.object[t.property] = this.lerp(t.propertyBeginValue, t.target, t.easing(phase));
            
            if (t.change) t.change(t);
            
            if (phase === 1) {
                t.object[t.property] = t.target;
                if (t.complete) t.complete(t);
                remove.push(t);
            }
        }
        
        for (let i = 0; i < remove.length; i++) {
            this.tweening.splice(this.tweening.indexOf(remove[i]), 1);
        }
    }

    private lerp(a1: number, a2: number, t: number): number {
        return a1 * (1 - t) + a2 * t;
    }

    private backout(amount: number): (t: number) => number {
        return (t: number) => (--t * t * ((amount + 1) * t + amount) + 1);
    }
}