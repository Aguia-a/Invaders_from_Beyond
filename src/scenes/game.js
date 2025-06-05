import Boss from './boss.js';
import { Player } from './player.js';
import { FirePlayer } from './fireplayer.js';
import { openPauseMenu } from './menuscene.js';
import { EnemyNormal } from './EnemyNormal.js';
import BossInterface, { createBossInterface } from './interface.js';


export class Game extends Phaser.Scene {
    constructor() {
        super({ key: 'Game' });
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
        this.load.image('bossClone', 'assets/boss.spaceship.png');
        this.load.image('bossProjectile', 'assets/bullet.png');
        this.load.image('orb', 'assets/simpleAttack.png');
        this.load.image('spikeProjectile', 'assets/bullet.png');
        this.load.image('wallProjectile', 'assets/wall-projectile.png');
    }

    create(data) {
        // ESC → abrir menu
        this.input.keyboard.on('keydown-ESC', () => {
            openPauseMenu(this);  // Passa essa cena como contexto
        });

        this.damageBossKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.H);

        const selectedShip = data.selectedShip || 'ship1';
        const { width, height } = this.scale;

        this.background02 = this.add.tileSprite(0, 0, width, height, 'background02')
            .setOrigin(0)
            .setScrollFactor(0)
            .setAlpha(0.5);

        this.player = new Player(this, 640, 660, selectedShip);

        this.firePlayer = new FirePlayer(this, this.player.sprite);

        this.game.inGameMusic = this.sound.add('bgSound', { loop: true, volume: 0.3 });
        this.game.inGameMusic.play();

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
    }

    createEnemiesForLevel(level) {
        this.normalEnemies.clear(true, true);

        if (level === 5) {
            this.boss = new Boss(this, this.scale.width / 2, this.scale.height / 2 - 100);
            this.checkCollisions();

            this.boss.on('damaged', (currentHealth) => {
                this.BossInterface.updateHealth(currentHealth, this.boss.maxHealth);
            });
        } else {
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
                    const enemy = new EnemyNormal(this, x, y);
                    this.normalEnemies.add(enemy);
                }
            }
            this.checkCollisions();
        }
    }

    update(time, delta) {
        this.normalEnemies.children.iterate(enemy => {
            if (enemy && enemy.active) {
                enemy.update(this.player.sprite);
            }
        });

        if (this.boss && this.boss.active) {
            this.boss.update(time, delta);
        }

        this.player.update(time);
        this.firePlayer.update(time);

        this.background02.tilePositionY -= 1;

        this.normalEnemies.children.iterate(enemy => {
            if (enemy && enemy.y > 660) {
                this.add.text(640, 360, 'GAME OVER', {
                    fontSize: '64px',
                    fill: '#ff0000'
                }).setOrigin(0.5);
                this.scene.pause();
            }
        });

        this.enemyBullets.children.each(bullet => {
            if (bullet && bullet.y > 800) bullet.destroy();
        }, this);

        if (Phaser.Input.Keyboard.JustDown(this.damageBossKey) && this.boss) {
            this.boss.takeDamage(10);
        }
    }

    destroyEnemy(bullet, enemy) {
        if (enemy === this.boss) return;

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

        this.boss.destroy();
        this.boss = null;

        this.level++;
        this.enemyDirection -= 1;
        this.levelText.setText('Nível: ' + this.level);
        this.createEnemiesForLevel(this.level);
    }

    hitPlayer(playerSprite, bulletOrEnemy) {
        bulletOrEnemy.destroy?.();
        this.player.takeDamage(this.hitSound);
    }

    checkCollisions() {
        if (this.boss && this.boss.bossProjectiles) {
            // Colisão: tiros do player atingem o boss
            this.physics.add.overlap(this.boss, this.firePlayer.bullets, (boss, bullet) => {
                bullet.destroy();
                boss.takeDamage(bullet.damage || 10);
            });

            // Colisão: tiros do boss atingem o player
            this.physics.add.overlap(this.player.sprite, this.boss.bossProjectiles, (playerSprite, bossProjectile) => {
                bossProjectile.destroy();
                this.player.takeDamage(this.hitSound);
            });
        }
        this.physics.add.overlap(this.firePlayer.bullets, this.normalEnemies, this.destroyEnemy, null, this);
        this.physics.add.overlap(this.player.sprite, this.enemyBullets, this.hitPlayer, null, this);
    }
}
