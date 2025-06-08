export class EnemyNormal extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'enemy');

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.scene = scene;

        this.setScale(0.8);
        this.setDepth(1);

        this.speed = 3;
        this.canShoot = true;
    }

    update(player) {
        this.move();
        this.tryToShoot(player);
    }

    // Função responsável apenas pelo movimento horizontal e ajuste vertical ao bater na borda
    move() {
        this.x += this.speed;

        if (this.x > 1200 || this.x < 80) {
            this.speed *= -1;
            this.y += 10;
        }
    }

    // Decide se irá atirar, e qual tipo de ataque chamar
    tryToShoot(player) {
        if (this.canShoot && Phaser.Math.Between(0, 1000) < 1) {
            this.attack1(player);
        }
    }

    // Ataque padrão: projétil em direção ao jogador
    attack1(player) {
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
