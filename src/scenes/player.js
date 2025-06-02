   export class Player {
    constructor(scene, x, y, texture) {
        this.scene = scene;
        this.sprite = scene.physics.add.sprite(x, y, texture)
            .setCollideWorldBounds(true)
            .setScale(0.08);

        this.cursors = scene.input.keyboard.createCursorKeys();

        this.health = 5;
        this.maxHealth = 5;
        this.healthIcons = [];

        this.isInvincible = false;

        this.updateHealthIcons();
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

        // Tiro removido aqui, para ficar só movimento
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
        if (this.isInvincible) return false;

        this.health--;
        this.updateHealthIcons();

        hitSound.play();

        if (this.health <= 0) {
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
