import { Application, Text, TextStyle, Sprite, Container } from 'pixi.js';
import { GAME_CONFIG } from '../config/GameConfig';

export class UIManager {
    private app: Application;
    private container: Container;
    
    private balanceText: Text;
    private winMessageText: Text;
    private spinButton: Sprite;
    private spinButtonDisabled: Sprite;
    
    private onSpinClickCallback: (() => void) | null = null;
    private isSpinButtonEnabled: boolean = true;
    private winCount: number = 0;

    constructor(app: Application) {
        console.log('UIManager constructor called');
        this.app = app;
        this.container = new Container();
        this.container.sortableChildren = true; // Enable z-index sorting
        
        // Add a unique ID to track this container
        (this.container as any).uid = Math.random().toString(36).substr(2, 9);
        
        // Create text styles
        const balanceStyle = new TextStyle({
            fontFamily: 'Arial',
            fontSize: 32,
            fontWeight: 'bold',
            fill: '#ffffff',
            dropShadow: {
                color: '#000000',
                distance: 2,
                blur: 2
            }
        });
        
        const winMessageStyle = new TextStyle({
            fontFamily: 'Arial',
            fontSize: 48,
            fontWeight: 'bold',
            fill: '#ff6600',
            stroke: {
                color: '#ffffff',
                width: 4
            },
            dropShadow: {
                color: '#000000',
                distance: 3,
                blur: 4
            },
            align: 'center'
        });
        
        // Create balance text
        this.balanceText = new Text({
            text: 'Balance: $0',
            style: balanceStyle
        });
        this.balanceText.x = GAME_CONFIG.BALANCE_X;
        this.balanceText.y = GAME_CONFIG.BALANCE_Y;
        
        // Create win message text (centered)
        this.winMessageText = new Text({
            text: '',
            style: winMessageStyle
        });
        this.winMessageText.anchor.set(0.5);
        this.winMessageText.x = GAME_CONFIG.GAME_WIDTH / 2;
        this.winMessageText.y = 100; // Well above the reels
        this.winMessageText.visible = false;
        
        // Create win counter text - make it part of the balance text to ensure it never disappears
        this.updateWinCounter();
        
        // Create spin buttons
        this.spinButton = Sprite.from('spinButton');
        this.spinButtonDisabled = Sprite.from('spinButtonDisabled');
        
        // Set up spin button
        this.setupSpinButton();
        
        // Add all UI elements to container
        this.container.addChild(this.balanceText);
        this.container.addChild(this.winMessageText);
        this.container.addChild(this.spinButton);
        this.container.addChild(this.spinButtonDisabled);
        
        // Add container to stage
        this.app.stage.addChild(this.container);
    }

    private setupSpinButton(): void {
        // Position both buttons
        const buttonX = GAME_CONFIG.SPIN_BUTTON_X;
        const buttonY = GAME_CONFIG.SPIN_BUTTON_Y;
        
        // Configure enabled button
        this.spinButton.anchor.set(0.5);
        this.spinButton.x = buttonX;
        this.spinButton.y = buttonY;
        this.spinButton.eventMode = 'static';
        this.spinButton.cursor = 'pointer';
        
        // Configure disabled button
        this.spinButtonDisabled.anchor.set(0.5);
        this.spinButtonDisabled.x = buttonX;
        this.spinButtonDisabled.y = buttonY;
        this.spinButtonDisabled.visible = false;
        
        // Scale buttons to reasonable size
        const buttonScale = 0.5;
        this.spinButton.scale.set(buttonScale);
        this.spinButtonDisabled.scale.set(buttonScale);
        
        // Add interactivity
        this.spinButton.on('pointerdown', this.handleSpinClick, this);
        this.spinButton.on('pointerover', this.handleSpinHover, this);
        this.spinButton.on('pointerout', this.handleSpinOut, this);
    }

    private handleSpinClick(): void {
        if (this.isSpinButtonEnabled && this.onSpinClickCallback) {
            // Animate button press
            this.animateButtonPress();
            this.onSpinClickCallback();
        }
    }

    private handleSpinHover(): void {
        if (this.isSpinButtonEnabled) {
            // Animate button hover
            this.animateButtonHover(true);
        }
    }

    private handleSpinOut(): void {
        // Animate button hover out
        this.animateButtonHover(false);
    }
    
    private animateButtonPress(): void {
        const originalScale = this.spinButton.scale.x;
        const pressScale = originalScale * 0.9;
        
        // Quick press animation
        this.spinButton.scale.set(pressScale);
        
        setTimeout(() => {
            this.spinButton.scale.set(originalScale);
        }, 100);
    }
    
    private animateButtonHover(isHovering: boolean): void {
        if (!this.isSpinButtonEnabled) return;
        
        const targetTint = isHovering ? 0xcccccc : 0xffffff;
        this.spinButton.tint = targetTint;
    }

    updateBalance(balance: number): void {
        console.log(`UIManager: Updating balance to $${balance}`);
        this.balanceText.text = `Balance: $${balance}\nWins: ${this.winCount}`;
    }

    updateWinAmount(amount: number): void {
        console.log(`UIManager: Updating win amount to $${amount}`);
        if (amount > 0) {
            this.incrementWinCounter();
        }
    }
    
    incrementWinCounter(): void {
        this.winCount++;
        console.log(`Incrementing win counter from ${this.winCount - 1} to ${this.winCount}`);
        
        // Update the balance text to include the win count
        this.updateWinCounter();
    }
    
    updateWinCounter(): void {
        // Update balance text to show both balance and wins
        const currentBalance = this.balanceText.text.match(/\$(\d+)/)?.[1] || '0';
        this.balanceText.text = `Balance: $${currentBalance}\nWins: ${this.winCount}`;
    }

    showWinMessage(message: string, duration: number = 2000): void {
        this.winMessageText.text = message;
        this.winMessageText.visible = true;
        this.winMessageText.alpha = 0;
        this.winMessageText.scale.set(0.5);
        
        // Animate in
        let elapsed = 0;
        const animateIn = () => {
            elapsed += this.app.ticker.deltaMS;
            const progress = Math.min(elapsed / 300, 1);
            
            this.winMessageText.alpha = progress;
            this.winMessageText.scale.set(0.5 + progress * 0.5);
            
            if (progress >= 1) {
                this.app.ticker.remove(animateIn);
                
                // Wait then fade out
                setTimeout(() => {
                    let fadeElapsed = 0;
                    const fadeOut = () => {
                        fadeElapsed += this.app.ticker.deltaMS;
                        const fadeProgress = Math.min(fadeElapsed / 300, 1);
                        
                        this.winMessageText.alpha = 1 - fadeProgress;
                        
                        if (fadeProgress >= 1) {
                            this.app.ticker.remove(fadeOut);
                            this.winMessageText.visible = false;
                        }
                    };
                    this.app.ticker.add(fadeOut);
                }, duration);
            }
        };
        
        this.app.ticker.add(animateIn);
    }


    setSpinButtonEnabled(enabled: boolean): void {
        this.isSpinButtonEnabled = enabled;
        
        if (enabled) {
            this.spinButton.visible = true;
            this.spinButtonDisabled.visible = false;
            this.spinButton.tint = 0xffffff; // Reset tint
        } else {
            this.spinButton.visible = false;
            this.spinButtonDisabled.visible = true;
        }
    }
    
    setSpinButtonSpinning(isSpinning: boolean): void {
        // Change button appearance when spinning
        if (isSpinning) {
            this.spinButton.tint = 0xff6666; // Red tint for stop
        } else {
            this.spinButton.tint = 0xffffff; // Normal tint
        }
    }

    onSpinClick(callback: () => void): void {
        this.onSpinClickCallback = callback;
    }
    
    getWinCounterVisibility(): boolean {
        return true; // Win counter is now part of balance text, always visible
    }
    
    ensureWinCounterVisible(): void {
        // Win counter is now part of balance text, no need to do anything
        console.log('Win counter is part of balance text, always visible');
    }

    destroy(): void {
        console.log('UIManager destroy called - this should not happen during normal gameplay!');
        this.spinButton.off('pointerdown', this.handleSpinClick, this);
        this.spinButton.off('pointerover', this.handleSpinHover, this);
        this.spinButton.off('pointerout', this.handleSpinOut, this);
        
        // Destroy container with all children
        this.container.destroy({ children: true });
    }
}