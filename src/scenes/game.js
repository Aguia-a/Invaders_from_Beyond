import Boss from './boss.js';
import { Player } from './player.js';

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

        this.player = new Player(this, 640, 660, selectedShip);

        this.inGameMusic = this.sound.add('bgSound', { loop: true, volume: 0.3 });
        this.inGameMusic.play();
        this.hitSound = this.sound.add("hitSound");
        this.hitSoundEnemy = this.sound.add("hitSoundEnemy", { volume: 3 });

        // Grupo dos inimigos normais
        this.normalEnemies = this.physics.add.group();

        this.enemyBullets = this.physics.add.group();

        this.level = 1;
        this.enemyDirection = 3;

        this.levelText = this.add.text(1120, 680, 'Nível: 1', { fontSize: '28px', fill: '#fff' });

        this.boss = null;

        this.createEnemiesForLevel(this.level);

        this.anims.create({
            key: 'explode',
            frames: this.anims.generateFrameNumbers('explosion', { start: 0, end: 15 }),
            frameRate: 20,
            hideOnComplete: true
        });

        this.physics.add.overlap(this.player.bullets, this.normalEnemies, this.destroyEnemy, null, this);
        this.physics.add.overlap(this.player.sprite, this.enemyBullets, this.hitPlayer, null, this);

        const graphics = this.make.graphics({ x: 0, y: 0, add: false });
        graphics.fillStyle(0xffff00, 1);
        graphics.fillRect(0, 0, 4, 16);
        graphics.generateTexture('bullet', 4, 16);
        graphics.destroy();
    }

    createEnemiesForLevel(level) {
        // Limpa inimigos normais
        this.normalEnemies.clear(true, true);

        // Criar boss no nível 1, por exemplo
        if (level === 1) {
            this.boss = new Boss(this, 640, 100);

            this.physics.add.overlap(this.boss, this.player.bullets, (boss, bullet) => {
                console.log('Tiro atingiu boss!');
                bullet.destroy();
                this.boss.takeDamage(10);  // chama o método direto do seu boss instanciado
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

                    const dx = this.player.sprite.x - enemy.x;
                    const dy = this.player.sprite.y - enemy.y;
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

        // Atualiza player (movimento + tiro)
        this.player.update(time);

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
        this.player.bullets.children.each(bullet => {
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

        if (enemy === this.boss) return; // impede que o boss seja tratado como inimigo normal

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

    hitPlayer(playerSprite, bulletOrEnemy) {
        bulletOrEnemy.destroy?.();

        const isDead = this.player.hit(this.hitSound);

        if (isDead) {
            this.add.text(640, 360, 'GAME OVER', {
                fontSize: '64px',
                fill: '#ff0000'
            }).setOrigin(0.5);
            this.scene.pause();
        }
    }
}
