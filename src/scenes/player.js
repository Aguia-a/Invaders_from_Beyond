export class Player {
    constructor(scene, x, y, texture) {
        this.scene = scene;
        this.sprite = scene.physics.add.sprite(x, y, texture)
            .setCollideWorldBounds(true)
            .setScale(0.08);

        this.sprite.body.setSize(100, 150); // Largura e altura da área de colisão
        this.sprite.body.setOffset(20, 30); // Deslocamento da hitbox dentro do sprite

        this.cursors = scene.input.keyboard.createCursorKeys();

        this.health = 5;
        this.maxHealth = 5;
        this.healthIcons = [];

        this.baseSpeed = 300;


        this.isInvincible = false;

        this.updateHealthIcons();
    }

    update(time) {
        this.handleNormalMovement();
}

    updateHealthIcons() {
        this.healthIcons.forEach(icon => icon.destroy());
        this.healthIcons = [];

        for (let i = 0; i < this.maxHealth; i++) {
            const key = i < this.health ? 'heartFull' : 'heartEmpty';
            const icon = this.scene.add.image(20 + i * 40, 700, key)
                .setScale(0.05)
                .setScrollFactor(0);
            this.healthIcons.push(icon);
        }
    }

    takeDamage(hitSound) {
        if (this.isInvincible) { console.log("Jogador está invencivel!") } else {
            ;
            console.log(`Jogador recebeu dano. Vida atual do jogador: ${this.health}`);

            this.health--;
            this.updateHealthIcons();

            hitSound.play();

            if (this.health <= 0) {
                this.die() // player morreu
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
        this.scene.add.text(640, 360, 'GAME OVER', {
            fontSize: '64px',
            fill: '#ff0000'
        }).setOrigin(0.5);
        this.scene.scene.pause();
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
