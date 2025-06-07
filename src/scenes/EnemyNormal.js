export class EnemyNormal extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'enemy');

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setScale(0.8);
        this.setDepth(1);
        this.canShoot = true;
        this.speed = 3;

        this.scene = scene;
    }

    update(player) {
        // Movimento horizontal básico
        this.x += this.speed;

        // Inverter direção se atingir limites
        if (this.x > 1200 || this.x < 80) {
            this.speed *= -1;
            this.y += 10;
        }

        // Atirar aleatoriamente
        if (this.canShoot && Phaser.Math.Between(0, 1000) < 1) {
            const bullet = this.scene.enemyBullets.create(this.x, this.y + 20, 'enemyAttack')
                .setScale(0.5)
                .setDepth(1);

            const dx = player.x - this.x;
            const dy = player.y - this.y;
            const magnitude = Math.sqrt(dx * dx + dy * dy);
            const speed = 200;

            bullet.setVelocity((dx / magnitude) * speed, (dy / magnitude) * speed);
        }
    }
}
