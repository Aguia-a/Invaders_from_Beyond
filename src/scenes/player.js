import { pauseSistem } from './menuscene.js';

export class Player {
    constructor(scene, x, y, texture) {
        this.scene = scene;
        this.sprite = scene.physics.add.sprite(x, y, texture)
            .setCollideWorldBounds(true)
            .setScale(0.08);

        this.sprite.body.setSize(200, 250);
        this.sprite.body.setOffset((1023 - 200) / 2, (1016 - 250) / 2);  // (411.5, 383)

        this.cursors = scene.input.keyboard.createCursorKeys();

        this.health = 5;
        this.maxHealth = 5;
        this.healthIcons = [];

        this.baseSpeed = 300;

        this.isInvincible = false;

        this.heartSpacing = 40;  // espaço entre corações
        this.heartScale = 0.05;

        this.updateHealthIcons();

        // Ajusta posição dos corações ao redimensionar a tela
        this.scene.scale.on('resize', this.updateHealthIconPositions, this);
    }

    update(time) {
        this.handleNormalMovement();
    }

    updateHealthIcons() {
        // Remove ícones antigos
        this.healthIcons.forEach(icon => icon.destroy());
        this.healthIcons = [];

        for (let i = 0; i < this.maxHealth; i++) {
            const key = i < this.health ? 'heartFull' : 'heartEmpty';
            const icon = this.scene.add.image(0, 0, key)
                .setScale(this.heartScale)
                .setScrollFactor(0); // fixo na tela

            this.healthIcons.push(icon);
        }

        this.updateHealthIconPositions();
    }

    updateHealthIconPositions() {
        const screenWidth = this.scene.scale.width;
        const screenHeight = this.scene.scale.height;

        const marginX = screenWidth * 0.08;  // 10% da largura
        const marginBottom = screenHeight * 0.08; // 5% da altura

        this.healthIcons.forEach((icon, i) => {
            icon.x = marginX + i * this.heartSpacing;
            icon.y = screenHeight - marginBottom;
        });
    }

    takeDamage(hitSound) {
        if (this.isInvincible) { 
            console.log("Jogador está invencível!"); 
        } else {
            console.log(`Jogador recebeu dano. Vida atual do jogador: ${this.health}`);

            this.health--;
            this.updateHealthIcons();

            hitSound.play();

            if (this.health <= 0) {
                this.die(); // player morreu
            }

            this.isInvincible = true;

            this.scene.tweens.add({
                targets: this.sprite,
                alpha: 0,
                ease: 'Linear',
                duration: 100,
                yoyo: true,
                repeat: 9,
                onComplete: () => {
                    this.isInvincible = false;
                    this.sprite.setAlpha(1);
                }
            });

            return false;
        }
    }

    die() {
        pauseSistem(this.scene, 'gameOverScene');
    }

    handleNormalMovement() {
        if (this.cursors.left.isDown) {
            this.sprite.setVelocityX(-this.baseSpeed);
        } else if (this.cursors.right.isDown) {
            this.sprite.setVelocityX(this.baseSpeed);
        } else {
            this.sprite.setVelocityX(0);
        }
    }
}
