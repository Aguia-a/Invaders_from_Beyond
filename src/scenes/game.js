import Boss from './boss.js';
import { Player } from './player.js';
import { FirePlayer } from './fireplayer.js';
import { pauseSistem } from './menuscene.js';
import { EnemyNormal } from './EnemyNormal.js';
import BossInterface, { createBossInterface } from './interface.js';
import { setupBackgroundSystem } from './backgroundSystem.js';
import {
    chooseStarType,
    generateStarTypeAFrames,
    generateStarTypeBFrames,
    generateStars,
    createStar,
    updateStarsFall
} from './backgroundSystem.js';


export class Game extends Phaser.Scene {
    constructor() {
        super({ key: 'Game' });
    }

    preload() {
        this.load.image('background02', 'assets/background03.png');
        this.load.image('gameOverBg', 'assets/background02.png');
        this.load.image('ship1', 'assets/yellow.spaceship.png');
        this.load.image('ship2', 'assets/blue.spaceship.png');
        this.load.image('ship3', 'assets/red.spaceship.png');
        this.load.image('enemy', 'assets/alien.spaceship.png');
        this.load.image('boss', 'assets/boss.spaceship.png');
        this.load.image('heartFull', 'assets/player.full.heart.png');
        this.load.image('heartEmpty', 'assets/player.empty.heart.png');
        this.load.image('enemyAttack', 'assets/simpleAttack.png');
        this.load.image('bossClone', 'assets/boss.spaceship.png');
        this.load.image('orb', 'assets/simpleAttack.png');
        this.load.image('wallProjectile', 'assets/wall-projectile.png');
        this.load.image('flash', 'assets/flash_particle.png');
        this.load.image('gameOverText', 'assets/gameOverText.png');

        this.load.audio('bgSound', 'assets/inGameSong.mp3');
        this.load.audio('hitSound', 'assets/impactSound01.mp3');
        this.load.audio('hitSoundEnemy', 'assets/impactSound02.mp3');
        this.load.audio('bossRoar', 'assets/bossRoar.mp3')
        this.load.audio('bossMainRoar', 'assets/bossMainRoar.mp3')
        this.load.audio('shootBoss', 'assets/shootBoss.mp3')
        this.load.audio('shootBoss02', 'assets/shootBoss02.mp3')
        this.load.audio('bossTeleport', 'assets/bossTeleport.mp3')
        this.load.audio('boss_hit', 'assets/boss_hit.mp3');



        this.load.spritesheet('bossProjectile', 'assets/specialProjectile.png', {
            frameWidth: 169,
            frameHeight: 396
        });

        this.load.spritesheet('explosion', 'assets/explosionEnemy.png', {
            frameWidth: 220,
            frameHeight: 195
        });
    }

    create(data) {
        // ESC → abrir menu
        this.input.keyboard.on('keydown-ESC', () => {
            pauseSistem(this, 'menuscene');  // Passa essa cena como contexto
        });

        this.damageBossKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.H);

        const selectedShip = data.selectedShip || 'ship1';
        const { width, height } = this.scale;

        setupBackgroundSystem(this);

        this.player = new Player(this, 640, 620, selectedShip);

        this.firePlayer = new FirePlayer(this, this.player.sprite);

        this.game.inGameMusic = this.sound.add('bgSound', { loop: true, volume: 0.3 });
        this.game.inGameMusic.play();

        this.hitSound = this.sound.add("hitSound");
        this.hitSoundEnemy = this.sound.add("hitSoundEnemy", { volume: 3 });

        this.bossRoar = this.sound.add('bossRoar', { volume: 0.9 })
        this.bossMainRoar = this.sound.add('bossMainRoar')
        this.shootBoss = this.sound.add('shootBoss', { volume: 0.8 })
        this.shootBoss02 = this.sound.add('shootBoss02', { volume: 0.8 })
        this.bossTeleport = this.sound.add('bossTeleport',  { volume: 1.5 })
        

        this.normalEnemies = this.physics.add.group();
        this.enemyBullets = this.physics.add.group();

        this.level = 1;
        this.enemyDirection = 3;

        this.levelText = this.add.text(0, 0, 'Nível: 1', {
            fontSize: '28px',
            fill: '#fff'
        }).setScrollFactor(0);

        this.updateLevelTextPosition();

        this.scale.on('resize', this.updateLevelTextPosition, this);

        this.boss = null;

        this.createEnemiesForLevel(this.level);

        this.anims.create({
            key: 'explode',
            frames: this.anims.generateFrameNumbers('explosion', { start: 0, end: 15 }),
            frameRate: 20,
            hideOnComplete: true
        });

        this.anims.create({
            key: 'bossProjectileAnim',
            frames: this.anims.generateFrameNumbers('bossProjectile', { start: 0, end: 7 }),
            frameRate: 10,
            repeat: -1
        });
    }

    createEnemiesForLevel(level) {
    //Se o level for 11, chama o DemoEnd
    if (level === 11) {
        pauseSistem(this, 'demoEnd');
        return;  // Sai da função para não criar inimigos
    }

    this.normalEnemies.clear(true, true);
    //Cria o boss na fase 10, se não for a fase 10 cria os inimigos padrões, e define o formato e a quantidade.
    if (level === 10) {
    this.boss = new Boss(this, this.scale.width / 2, this.scale.height / 2 - 100);
    this.checkCollisions();

    this.boss.on('damaged', (currentHealth) => {
        this.BossInterface.updateHealth(currentHealth, this.boss.maxHealth);
    });

} else {
    const baseEnemies = 5;
    const incrementPerLevel = 2;
    const numEnemies = baseEnemies + (level - 1) * incrementPerLevel;

    const columns = 5; // máx. de inimigos por linha
    const spacingX = 100;
    const spacingY = 80;
    const startY = 80;

    const centerX = this.scale.width / 2;
    const rows = Math.ceil(numEnemies / columns);

    let created = 0;

    for (let row = 0; row < rows; row++) {
        const remainingEnemies = numEnemies - created;
        const enemiesThisRow = Math.min(columns, remainingEnemies);

        const totalWidth = (enemiesThisRow - 1) * spacingX;
        const offsetX = centerX - totalWidth / 2;
        const y = startY + row * spacingY;

        for (let col = 0; col < enemiesThisRow; col++) {
            const x = offsetX + col * spacingX;

            const enemy = new EnemyNormal(this, x, y);
            this.normalEnemies.add(enemy);

            created++;
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

        updateStarsFall(this, this.stars);



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
            .setScale(0.4)
            .setOrigin(0.5, 0.5)
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
            this.physics.add.overlap(this.boss, this.firePlayer.bullets, (boss, bullet) => {
                bullet.destroy();
                boss.takeDamage(bullet.damage || 10);
            });

            this.physics.add.overlap(this.player.sprite, this.boss.bossProjectiles, (playerSprite, bossProjectile) => {
                bossProjectile.destroy();
                this.player.takeDamage(this.hitSound);
            });
        }

        this.physics.add.overlap(this.firePlayer.bullets, this.normalEnemies, this.destroyEnemy, null, this);
        this.physics.add.overlap(this.player.sprite, this.enemyBullets, this.hitPlayer, null, this);
    }

    updateLevelTextPosition() {
        const screenWidth = this.scale.width;
        const screenHeight = this.scale.height;

        const marginRight = screenWidth * 0.10; // 10% da largura da tela pela direita
        const marginBottom = screenHeight * 0.08; // 5% da altura de baixo

        // Define x considerando a largura do texto para alinhar à direita com margem
        this.levelText.x = screenWidth - marginRight - this.levelText.width;
        this.levelText.y = screenHeight - marginBottom - this.levelText.height;
    }
}
