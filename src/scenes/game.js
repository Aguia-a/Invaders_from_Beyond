import Boss from './boss.js';

export class Game extends Phaser.Scene {
    constructor() {
        super('Game');
    }

    preload() {
        this.load.image('background02', 'assets/purpleStars.png');
        this.load.image('ship1', 'assets/yellow.spaceship.png');
        this.load.image('ship2', 'assets/blue.spaceship.png');
        this.load.image('ship3', 'assets/red.spaceship.png');
        this.load.image('enemy', 'assets/alien.spaceship.png');
        this.load.image('boss', 'assets/boss.spaceship.png');
        this.load.image('heartFull', 'assets/player.full.heart.png');
        this.load.image('heartEmpty', 'assets/player.empty.heart.png');
        this.load.audio('bgSound', 'assets/inGameSong.mp3');
        this.load.audio('hitSound', 'assets/impactSound01.mp3');
        this.load.audio('hitSoundEnemy', 'assets/impactSound02.mp3');
        this.load.image('enemyAttack', 'assets/simpleAttack.png');

        this.load.spritesheet('explosion', 'assets/explosionEnemy.png', {
            frameWidth: 128,
            frameHeight: 128
        });
    }

    create(data) {

        this.damageBossKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.H);


        const selectedShip = data.selectedShip || 'ship1';
        const { width, height } = this.scale;

        this.background02 = this.add.tileSprite(0, 0, width, height, 'background02')
            .setOrigin(0)
            .setScrollFactor(0)
            .setAlpha(0.5);

        this.player = this.physics.add.sprite(640, 660, selectedShip).setCollideWorldBounds(true).setScale(0.08);

        this.inGameMusic = this.sound.add('bgSound', { loop: true, volume: 0.3 });
        this.inGameMusic.play();
        this.hitSound = this.sound.add("hitSound");
        this.hitSoundEnemy = this.sound.add("hitSoundEnemy", { volume: 3 });

        this.cursors = this.input.keyboard.createCursorKeys();
        this.shootKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // Grupo dos inimigos normais
        this.normalEnemies = this.physics.add.group();

        this.bullets = this.physics.add.group({ runChildUpdate: true });
        this.enemyBullets = this.physics.add.group();

        this.level = 1;
        this.enemyDirection = 3;
        this.lastFired = 0;

        this.lives = 5;
        this.maxLives = 5;
        this.hearts = [];

        this.levelText = this.add.text(1120, 680, 'Nível: 1', { fontSize: '28px', fill: '#fff' });
        this.isInvincible = false;

        this.boss = null;

        this.createEnemiesForLevel(this.level);
        this.updateHearts();

        this.anims.create({
            key: 'explode',
            frames: this.anims.generateFrameNumbers('explosion', { start: 0, end: 15 }),
            frameRate: 20,
            hideOnComplete: true
        });

        this.physics.add.overlap(this.bullets, this.normalEnemies, this.destroyEnemy, null, this);
        this.physics.add.overlap(this.player, this.enemyBullets, this.hitPlayer, null, this);

        const graphics = this.make.graphics({ x: 0, y: 0, add: false });
        graphics.fillStyle(0xffff00, 1);
        graphics.fillRect(0, 0, 4, 16);
        graphics.generateTexture('bullet', 4, 16);
        graphics.destroy();
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

    createEnemiesForLevel(level) {
        // Limpa inimigos normais
        this.normalEnemies.clear(true, true);

        // Criar boss no nível 5, por exemplo
        if (level === 1) {
        this.boss = new Boss(this, 640, 100);
        console.log('boss existe?', this.boss);
        console.log('Boss active?', this.boss.active);
        console.log('Boss visible?', this.boss.visible);

        this.physics.add.overlap(this.bullets, this.boss, (bullet, boss) => {
        console.log('Tiro atingiu boss!');
        bullet.disableBody(true, true)
        bullet.destroy();
        this.boss.takeDamage(10);  // chama o método direto do seu boss instanciado
        console.log('boss existe?', this.boss);
        console.log('Boss active?', this.boss.active);
        console.log('Boss visible?', this.boss.visible);
        });
        } else {
            // Criar inimigos normais para outros níveis
            let numEnemies;
            const pattern = (level - 1) % 5;
            if (pattern === 0) numEnemies = 0;
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
                    const enemy = this.normalEnemies.create(x, y, 'enemy').setScale(0.08);
                    enemy.canShoot = true;
                }
            }
        }
    }

    update(time, delta) {
        // Atualiza inimigos normais
        this.normalEnemies.children.iterate(enemy => {
            if (enemy && enemy.active) {
                enemy.x += this.enemyDirection;
                if (enemy.x > 1200 || enemy.x < 80) {
                    this.enemyDirection *= -1;
                    this.normalEnemies.children.iterate(e => {
                        if (e && e.active) e.y += 10;
                    });
                }

                if (enemy.canShoot && Phaser.Math.Between(0, 1000) < 1) {
                    const bullet = this.enemyBullets.create(enemy.x, enemy.y + 20, 'enemyAttack')
                        .setScale(0.05)
                        .setDepth(1);

                    const dx = this.player.x - enemy.x;
                    const dy = this.player.y - enemy.y;
                    const magnitude = Math.sqrt(dx * dx + dy * dy);
                    const speed = 200;

                    bullet.setVelocity((dx / magnitude) * speed, (dy / magnitude) * speed);
                }
            }
        });

        // Atualiza boss (se existir e ativo)
        if (this.boss && this.boss.active) {
            this.boss.update(time, delta);
        }

        // Movimento do jogador
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-300);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(300);
        } else {
            this.player.setVelocityX(0);
        }

        // Atira
        if (Phaser.Input.Keyboard.JustDown(this.shootKey) && time > this.lastFired) {
            const bullet = this.bullets.create(this.player.x, this.player.y - 20, 'bullet')
                .setScale(2)
                .setDepth(1);
            bullet.setVelocityY(-500);
            this.lastFired = time + 300;
        }

        this.background02.tilePositionY -= 1;

        // Game Over se inimigos normais alcançarem o player (y > 660)
        this.normalEnemies.children.iterate(enemy => {
            if (enemy && enemy.y > 660) {
                this.add.text(640, 360, 'GAME OVER', {
                    fontSize: '64px',
                    fill: '#ff0000'
                }).setOrigin(0.5);
                this.scene.pause();
            }
        });

        // Remove balas fora da tela
        this.bullets.children.each(bullet => {
            if (bullet && bullet.y < -50) bullet.destroy();
        }, this);

        this.enemyBullets.children.each(bullet => {
            if (bullet && bullet.y > 800) bullet.destroy();
        }, this);

        if (Phaser.Input.Keyboard.JustDown(this.damageBossKey) && this.boss) {
        console.log('Tecla H pressionada - Boss vai tomar 10 de dano');
        this.boss.takeDamage(10);
    }
    }

    destroyEnemy(bullet, enemy) {
        console.log('[DEBUG] destroyEnemy chamado para', enemy.texture?.key);
        console.log('[DEBUG] É o boss?', enemy === this.boss);

        if (enemy === this.boss) return; // <-- impede que o boss seja tratado como inimigo normal

        bullet.destroy();
        this.hitSoundEnemy.play();

        enemy.disableBody(true, true);
        enemy.canShoot = false;
        const explosion = this.add.sprite(enemy.x, enemy.y, 'explosion')
            .setScale(0.6)
            .setOrigin(0.5)
            .setDepth(10);
        explosion.play('explode');
        explosion.on('animationcomplete', () => explosion.destroy());

        // Se acabou os inimigos normais
        if (this.normalEnemies.countActive() === 0) {
            this.level++;
            this.enemyDirection -= 1;
            this.levelText.setText('Nível: ' + this.level);
            this.createEnemiesForLevel(this.level);
        }
    }

    destroyBoss() {
        if (!this.boss) return;

        this.hitSoundEnemy.play();

        const explosion = this.add.sprite(this.boss.x, this.boss.y, 'explosion')
            .setScale(1)
            .setOrigin(0.5)
            .setDepth(10);
        explosion.play('explode');
        explosion.on('animationcomplete', () => explosion.destroy());

        this.boss.destroy(); // remove da cena
        this.boss = null;

        // Avança pro próximo nível
        this.level++;
        this.enemyDirection -= 1;
        this.levelText.setText('Nível: ' + this.level);
        this.createEnemiesForLevel(this.level);
    }


    hitPlayer(player, bulletOrEnemy) {
        bulletOrEnemy.destroy?.();

        this.hitSound.play();

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
            repeat: 9,
            onComplete: () => {
                this.isInvincible = false;
                this.player.setAlpha(1);
            }
        });
    }
}
