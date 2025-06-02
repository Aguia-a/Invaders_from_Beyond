import Boss from './boss.js';
import { Player } from './player.js';
import { FirePlayer } from './fireplayer.js';
let inGameMusicInstance = null;


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
        this.load.image('bossHeartFull', 'assets/boss.full.heart.png');
        this.load.image('bossHeartEmpty', 'assets/boss.empty.heart.png');
        this.load.image('enemyAttack', 'assets/simpleAttack.png');
        this.load.audio('bgSound', 'assets/inGameSong.mp3');
        this.load.audio('hitSound', 'assets/impactSound01.mp3');
        this.load.audio('hitSoundEnemy', 'assets/impactSound02.mp3');
        this.load.spritesheet('explosion', 'assets/explosionEnemy.png', {
            frameWidth: 128,
            frameHeight: 128
        });
      
        this.load.image('bossProjectile', 'assets/bullet.png');
        this.load.image('orb', 'assets/simpleAttack.png');
        this.load.image('btnResume', 'assets/btnResume.png');
        this.load.image('btnRestart', 'assets/btnRestart.png');
        this.load.image('btnTelaInicial', 'assets/btnTelaInicial.png');
        this.load.image('btnAudioOnOff', 'assets/btnAudioOnOff.png');
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

        this.firePlayer = new FirePlayer(this, this.player.sprite);

        if (!inGameMusicInstance) {
            inGameMusicInstance = this.sound.add('bgSound', { loop: true, volume: 0.3 });
            inGameMusicInstance.play();
        }

        this.hitSound = this.sound.add("hitSound");
        this.hitSoundEnemy = this.sound.add("hitSoundEnemy", { volume: 3 });

        // Grupo dos inimigos normais
        this.normalEnemies = this.physics.add.group();

        this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

        this.enemies = this.physics.add.group();
        this.bullets = this.physics.add.group({ runChildUpdate: true });

        this.enemyBullets = this.physics.add.group();

        this.level = 1;
        this.enemyDirection = 3;

        this.boss = null;

        this.lastFired = 0;
        this.bossLives = 0;
        this.lives = 5;
        this.maxLives = 5;
        this.hearts = [];
        this.levelText = this.add.text(1120, 680, 'Nível: 1', { fontSize: '28px', fill: '#fff' });
        this.bossHearts = [];
        this.isInvincible = false;
        this.isGamePaused = false;

        this.createEnemiesForLevel(this.level);
        this.updateHearts(); 
        
        this.menuButton = this.add.text(20, 20, '☰', {
            fontSize: '32px',
            fill: '#fff',
            backgroundColor: '#000',
            padding: { x: 10, y: 5 }
        })
        .setInteractive()
        .setScrollFactor(0)
        .setDepth(100);

        this.menuButton.on('pointerdown', () => {
            this.togglePauseMenu();
        });

        this.pauseMenu = this.add.container(this.cameras.main.centerX, this.cameras.main.centerY);
        const bg = this.add.rectangle(0, 0, 300, 300, 0x000000, 0.7).setStrokeStyle(2, 0xffffff);

        const resumeBtn = this.add.image(0, -120, 'btnResume').setInteractive().setScale(0.5);
        resumeBtn.on('pointerdown', () => {
            this.togglePauseMenu(false);
            if (this.inGameMusicInstance && !this.inGameMusicInstance.isPlaying) {
                this.inGameMusicInstance.play();
            }
        });

        const restartBtn = this.add.image(0, -40, 'btnRestart').setInteractive().setScale(0.5);
        restartBtn.on('pointerdown', () => {
            this.scene.restart();
        });

       const backToStartBtn = this.add.image(0, 40, 'btnTelaInicial').setInteractive().setScale(0.5);
        backToStartBtn.on('pointerdown', () => {
            // Parando a música global quando voltar à tela inicial
            if (inGameMusicInstance) {
                inGameMusicInstance.stop();
                inGameMusicInstance = null;  // Reinicia a instância para evitar problemas
            }
            this.scene.stop();
            this.scene.start('Start');
        });

        const muteBtn = this.add.image(0, 120, 'btnAudioOnOff').setInteractive().setScale(0.5);
        muteBtn.on('pointerdown', () => {
            this.soundMuted = !this.soundMuted;
            this.sound.mute = this.soundMuted;
        });

        this.pauseMenu.add([bg, resumeBtn, restartBtn, backToStartBtn, muteBtn]);
        this.pauseMenu.setVisible(false);

        let lastPressTime = 0;
        const debounceTime = 300; 

        // // Pausar e retomar com ESC
        // // Definindo a tecla ESC para alternar a pausa
        this.input.keyboard.on('keydown-ESC', (event) => {
            const currentTime = game.getTime();
            
            if (currentTime - lastPressTime < debounceTime) {
                return; // Ignora a tecla se for pressionada rapidamente
            }
            
            lastPressTime = currentTime;

            if (this.isGamePaused) {
                this.togglePauseMenu(false); // Retoma o jogo
            } else {
                this.togglePauseMenu(); // Pausa o jogo
            }
        });

        // Armazena o estado de som
        this.soundMuted = false;

        this.anims.create({
            key: 'explode',
            frames: this.anims.generateFrameNumbers('explosion', { start: 0, end: 15 }),
            frameRate: 20,
            hideOnComplete: true
        });

        this.physics.add.overlap(this.bullets, this.enemies, this.destroyEnemy, null, this);
        this.physics.add.overlap(this.player, this.enemyBullets, this.hitPlayer, null, this);

        const graphics = this.make.graphics({ x: 0, y: 0, add: false });
        graphics.fillStyle(0xffff00, 1);
        graphics.fillRect(0, 0, 4, 16);
        graphics.generateTexture('bullet', 4, 16);
        graphics.destroy();

        // Array com os botões do menu na ordem
        this.buttons = [resumeBtn, restartBtn, backToStartBtn, muteBtn];
        this.selectedButton = 0;
        

        this.updateButtonSelection = () => {
            this.buttons.forEach((btn, index) => {
                if (index === this.selectedButton) {
                    btn.setTint(0xffff00); // Amarelo para botão selecionado
                } else {
                    btn.clearTint(); // Remove cor
                }
            });
        };

        this.updateButtonSelection(); // Destaque inicial
        this.input.keyboard.on('keydown-UP', () => {
            if (this.isGamePaused) {
                this.selectedButton = (this.selectedButton - 1 + this.buttons.length) % this.buttons.length;
                this.updateButtonSelection();
            }
        });

        this.input.keyboard.on('keydown-DOWN', () => {
            if (this.isGamePaused) {
                this.selectedButton = (this.selectedButton + 1) % this.buttons.length;
                this.updateButtonSelection();
            }
        });

        this.input.keyboard.on('keydown-ENTER', () => {
            if (this.isGamePaused) {
                // Simula clique no botão selecionado
                this.buttons[this.selectedButton].emit('pointerdown');
            }
        });


        
    }

    togglePauseMenu(forceClose = undefined) {
        const shouldShowMenu = forceClose === undefined ? !this.pauseMenu.visible : forceClose;

        this.pauseMenu.setVisible(shouldShowMenu);
        this.isGamePaused = shouldShowMenu;

        if (shouldShowMenu) {
            this.physics.pause();  // Pausa o jogo
            console.log('Jogo pausado');
        } else {
            this.physics.resume();  // Retoma o jogo
            console.log('Jogo retomado');
        }
    }


    update(time) {

        if (this.isGamePaused) {
            // Ainda permite ESC funcionar enquanto o jogo está pausado
            if (Phaser.Input.Keyboard.JustDown(this.escKey)) {
                this.togglePauseMenu(false); // Fecha o menu
                if (inGameMusicInstance && !inGameMusicInstance.isPlaying) {
                    inGameMusicInstance.play();
                }
            }
            return;
        }

        if (Phaser.Input.Keyboard.JustDown(this.escKey)) {
            this.togglePauseMenu(); // Alterna entre abrir/fechar
            if (!this.pauseMenu.visible && inGameMusicInstance && !inGameMusicInstance.isPlaying) {
                inGameMusicInstance.play(); // Retoma a música se estava pausada
            }
        }

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

        this.background02.tilePositionY -= 1;

        this.enemies.children.iterate(enemy => {
            if (enemy && enemy.y > 660) {
                this.add.text(640, 360, 'GAME OVER', {
                    fontSize: '64px',
                    fill: '#ff0000'
                }).setOrigin(0.5);
                this.isGamePaused = true;
            }
        });

        this.bullets.children.each(bullet => {
            if (bullet && bullet.y < -50) bullet.destroy();
        }, this);

        this.enemyBullets.children.each(bullet => {
            if (bullet && bullet.y > 800) bullet.destroy();
        }, this);
    }

    updateHearts() {
        this.hearts.forEach(heart => heart.destroy());
        this.hearts = [];
        for (let i = 0; i < this.maxLives; i++) {
            const key = i < this.lives ? 'heartFull' : 'heartEmpty';
            const heart = this.add.image(20 + i * 40, 700, key).setScale(0.05).setScrollFactor(0);
            this.hearts.push(heart);
        }
      
        // Colisão tiros inimigos contra player
        this.physics.add.overlap(this.player.sprite, this.enemyBullets, this.hitPlayer, null, this);
    }

    createEnemiesForLevel(level) {
        this.normalEnemies.clear(true, true);

        if (level === 5) {
            this.boss = new Boss(this, 640, 100);

            // Colisões do boss configuradas no create, ou você pode chamar checkCollisions aqui para garantir
            this.checkCollisions();
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
                    const enemy = this.normalEnemies.create(x, y, 'enemy').setScale(0.08);
                    enemy.canShoot = true;
                }
            }
        }
    }

    update(time, delta) {
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
    }
}
