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
        this.shootCooldown = 2500; // Cooldown em ms configurado no construtor

        //Garante que cada inimigo comece a atirar em um momento diferente, para evitar eles atirar todos de uma vez
        this.lastShotTime = this.scene.time.now + Phaser.Math.Between(0, 2000);
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
    const currentTime = this.scene.time.now;

    // Só tenta atirar se não estiver em cooldown
    if (!this.lastShotTime || currentTime - this.lastShotTime > this.shootCooldown) {
        this.lastShotTime = currentTime; // Reinicia o cooldown aqui, independentemente do resultado

        const shouldShoot = Phaser.Math.Between(0, 100);
        if (shouldShoot < 50) {
            const attackRoll = Phaser.Math.Between(0, 100);

            switch (true) {
                case attackRoll < 100:
                    this.attack1(player); // 100% por enquanto
                    break;
                // Outros ataques podem ser adicionados aqui
            }
        }
        // Se não passou no shouldShoot, ele apenas não atira e entra em cooldown mesmo assim
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
