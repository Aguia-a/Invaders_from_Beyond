export class Player {
    constructor(scene, x, y, texture) {
        this.scene = scene;
        this.sprite = scene.physics.add.sprite(x, y, texture).setCollideWorldBounds(true).setScale(0.08);

        this.cursors = scene.input.keyboard.createCursorKeys();
        this.shootKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        this.bullets = scene.physics.add.group({ runChildUpdate: true });

        this.lastFired = 0;

        this.lives = 5;
        this.maxLives = 5;
        this.hearts = [];

        this.isInvincible = false;

        this.updateHearts();
    }

    update(time) {
        // Movimento do jogador
        if (this.cursors.left.isDown) {
            this.sprite.setVelocityX(-300);
        } else if (this.cursors.right.isDown) {
            this.sprite.setVelocityX(300);
        } else {
            this.sprite.setVelocityX(0);
        }

        // Atira
        if (Phaser.Input.Keyboard.JustDown(this.shootKey) && time > this.lastFired) {
            const bullet = this.bullets.create(this.sprite.x, this.sprite.y - 20, 'bullet')
                .setScale(2)
                .setDepth(1);
            bullet.setVelocityY(-500);
            this.lastFired = time + 300;
        }
    }

    updateHearts() {
        this.hearts.forEach(heart => heart.destroy());
        this.hearts = [];

        for (let i = 0; i < this.maxLives; i++) {
            const key = i < this.lives ? 'heartFull' : 'heartEmpty';
            const heart = this.scene.add.image(20 + i * 40, 700, key).setScale(0.05).setScrollFactor(0);
            this.hearts.push(heart);
        }
    }

    hit(hitSound) {
        if (this.isInvincible) return false;

        this.lives--;
        this.updateHearts();

        hitSound.play();

        if (this.lives <= 0) {
            return true; // player morreu
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
