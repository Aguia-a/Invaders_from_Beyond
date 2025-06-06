export class Game extends Phaser.Scene {
    constructor() {
        super('Game');
    }

    preload() {
        this.load.image('background', 'assets/space2.png');
        this.load.image('ship1', 'assets/yellow.spaceship.png');
        this.load.image('ship2', 'assets/blue.spaceship.png');
        this.load.image('ship3', 'assets/red.spaceship.png');
        this.load.image('enemy', 'assets/alien.spaceship.png');
        this.load.image('boss', 'assets/boss.spaceship.png');
        this.load.image('heartFull', 'assets/player.full.heart.png');
        this.load.image('heartEmpty', 'assets/player.empty.heart.png');
        this.load.image('bossHeartFull', 'assets/boss.full.heart.png');
        this.load.image('bossHeartEmpty', 'assets/boss.empty.heart.png');

        this.load.spritesheet('explosion', 'assets/explosion.png', {
            frameWidth: 64,
            frameHeight: 64
        });
    }

    create(data) {
        const selectedShip = data.selectedShip || 'ship1';

        this.background = this.add.tileSprite(640, 360, 1280, 720, 'background').setDepth(0);

        this.player = this.physics.add.sprite(640, 660, selectedShip).setCollideWorldBounds(true).setScale(0.12);

        this.cursors = this.input.keyboard.createCursorKeys();
        this.shootKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        this.enemies = this.physics.add.group();
        this.bullets = this.physics.add.group({ runChildUpdate: true });
        this.enemyBullets = this.physics.add.group();

        this.level = 1;
        this.enemyDirection = 3; // VELOCIDADE INICIAL
        this.lastFired = 0;
        this.bossLives = 0;

        this.lives = 5;
        this.maxLives = 5;
        this.hearts = [];

        this.levelText = this.add.text(1120, 680, 'Nível: 1', { fontSize: '28px', fill: '#fff' });

        this.bossLivesLabel = this.add.text(640, 16, 'BOSS LIVES', {
            fontSize: '28px',
            fill: '#ff0000'
        }).setOrigin(0.5);
        this.bossHearts = [];

        this.isInvincible = false;

        this.createEnemiesForLevel(this.level);
        this.updateHearts();

        this.anims.create({
            key: 'explode',
            frames: this.anims.generateFrameNumbers('explosion', { start: 0, end: 7 }),
            frameRate: 14,
            hideOnComplete: true
        });

        this.physics.add.overlap(this.bullets, this.enemies, this.destroyEnemy, null, this);
        this.physics.add.overlap(this.player, this.enemyBullets, this.hitPlayer, null, this);

        const graphics = this.make.graphics({ x: 0, y: 0, add: false });
        graphics.fillStyle(0xffff00, 1);
        graphics.fillRect(0, 0, 4, 16);
        graphics.generateTexture('bullet', 4, 16);
        graphics.destroy();

        const redGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        redGraphics.fillStyle(0xff0000, 1);
        redGraphics.fillRect(0, 0, 4, 16);
        redGraphics.generateTexture('enemyBullet', 4, 16);
        redGraphics.destroy();
    }

    updateHearts() {
        this.hearts.forEach(heart => heart.destroy());
        this.hearts = [];

        for (let i = 0; i < this.maxLives; i++) {
            const key = i < this.lives ? 'heartFull' : 'heartEmpty';
            const heart = this.add.image(20 + i * 40, 700, key).setScale(0.05).setScrollFactor(0);
            this.hearts.push(heart);
        }
    }

    updateBossHearts() {
        this.bossHearts.forEach(h => h.destroy());
        this.bossHearts = [];

        const startX = 640 - ((this.bossLives - 1) * 20);
        for (let i = 0; i < this.bossMaxLives; i++) {
            const key = i < this.bossLives ? 'bossHeartFull' : 'bossHeartEmpty';
            const heart = this.add.image(startX + i * 40, 60, key).setScale(0.05);
            this.bossHearts.push(heart);
        }
    }

    createEnemiesForLevel(level) {
        this.enemies.clear(true, true);
        this.bossHearts.forEach(h => h.destroy());
        this.bossHearts = [];

        if (level % 5 === 0) {
            const boss = this.enemies.create(640, 100, 'boss').setScale(0.2);
            boss.setData('isBoss', true);
            this.bossLives = 2 + ((level / 5 - 1) * 2);
            this.bossMaxLives = this.bossLives;
            this.updateBossHearts();

            this.time.addEvent({
                delay: 2000,
                callback: () => {
                    if (boss.active) this.shootBoss(boss, -100);
                },
                loop: true
            });

            this.time.addEvent({
                delay: 3500,
                callback: () => {
                    if (boss.active) this.shootBoss(boss, 100);
                },
                loop: true
            });

        } else {
            this.bossLives = 0;
            this.bossHearts.forEach(h => h.destroy());
            this.bossHearts = [];

            let numEnemies;
            const pattern = (level - 1) % 5;
            if (pattern === 0) numEnemies = 3;
            else if (pattern === 1) numEnemies = 6;
            else if (pattern === 2) numEnemies = 10;
            else numEnemies = 15;

            const rows = Math.ceil((Math.sqrt(8 * numEnemies + 1) - 1) / 2);
            const startY = 80;

            for (let row = 0; row < rows; row++) {
                const enemiesInRow = row + 1;
                const y = startY + (rows - 1 - row) * 80;
                const startX = 640 - (enemiesInRow - 1) * 50;

                for (let i = 0; i < enemiesInRow; i++) {
                    const x = startX + i * 100;
                    const enemy = this.enemies.create(x, y, 'enemy').setScale(0.1);
                    enemy.canShoot = true;
                }
            }
        }
    }

    shootBoss(boss, offsetX) {
        const bullet = this.enemyBullets.create(boss.x + offsetX, boss.y + 50, 'enemyBullet')
            .setScale(2)
            .setDepth(1);
        bullet.setVelocityY(300);
    }

    update(time) {
        this.enemies.children.iterate(enemy => {
            if (enemy && enemy.active) {
                enemy.x += this.enemyDirection;
                if (enemy.x > 1200 || enemy.x < 80) {
                    this.enemyDirection *= -1;
                    this.enemies.children.iterate(e => {
                        if (e && e.active) e.y += 10;
                    });
                }

                if (!enemy.getData('isBoss') && enemy.canShoot && Phaser.Math.Between(0, 1000) < 1) {
                    const enemyBullet = this.enemyBullets.create(enemy.x, enemy.y + 20, 'enemyBullet')
                        .setScale(2)
                        .setDepth(1);
                    enemyBullet.setVelocityY(200);
                }
            }
        });

        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-300);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(300);
        } else {
            this.player.setVelocityX(0);
        }

        if (Phaser.Input.Keyboard.JustDown(this.shootKey) && time > this.lastFired) {
            const bullet = this.bullets.create(this.player.x, this.player.y - 20, 'bullet')
                .setScale(2)
                .setDepth(1);
            bullet.setVelocityY(-500);
            this.lastFired = time + 300;
        }

        this.background.tilePositionY -= 2;

        this.enemies.children.iterate(enemy => {
            if (enemy && enemy.y > 660) {
                this.add.text(640, 360, 'GAME OVER', {
                    fontSize: '64px',
                    fill: '#ff0000'
                }).setOrigin(0.5);
                this.scene.pause();
            }
        });

        this.bullets.children.each(bullet => {
            if (bullet && bullet.y < -50) bullet.destroy();
        }, this);

        this.enemyBullets.children.each(bullet => {
            if (bullet && bullet.y > 800) bullet.destroy();
        }, this);
    }

    destroyEnemy(bullet, enemy) {
        bullet.destroy();

        if (enemy.getData('isBoss')) {
            this.bossLives--;
            this.updateBossHearts();
            if (this.bossLives <= 0) {
                enemy.disableBody(true, true);
                const explosion = this.add.sprite(enemy.x, enemy.y, 'explosion').setScale(2);
                explosion.play('explode');

                // Recompensa: ganha vida só após boss
                if (this.lives < this.maxLives) this.lives++;
                this.updateHearts();
            } else return;
        } else {
            enemy.disableBody(true, true);
            enemy.canShoot = false;
            const explosion = this.add.sprite(enemy.x, enemy.y, 'explosion').setScale(1);
            explosion.play('explode');
        }

        if (this.enemies.countActive() === 0) {
            this.level++;
            this.enemyDirection -= 1; //  Aumenta a Velocidade a Cada Nível
            this.levelText.setText('Nível: ' + this.level);
            this.createEnemiesForLevel(this.level);
        }
    }

    hitPlayer(player, bullet) {
        bullet.destroy();

        if (this.isInvincible) return;

        this.lives--;
        this.updateHearts();

        if (this.lives <= 0) {
            this.add.text(640, 360, 'GAME OVER', {
                fontSize: '64px',
                fill: '#ff0000'
            }).setOrigin(0.5);
            this.scene.pause();
            return;
        }

        this.isInvincible = true;

        this.tweens.add({
            targets: this.player,
            alpha: 0,
            ease: 'Linear',
            duration: 100,
            yoyo: true,
            repeat: 9
        });

        this.time.delayedCall(1000, () => {
            this.isInvincible = false;
            this.player.setAlpha(1);
        });
    }
}
