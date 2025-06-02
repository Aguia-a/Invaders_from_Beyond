export default class Boss extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'boss');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Grupo único de projéteis do boss
        this.bossProjectiles = this.scene.physics.add.group();

        this.setScale(0.2);
        this.setData('isBoss', true);
        this.setCollideWorldBounds(true);

        this.maxHealth = 100;
        this.health = this.maxHealth;

        this.baseSpeed = 3;
        this.direction = 1;

        this.currentPhase = 1;

        this.waveOffset = 0;
        this.verticalTargets = [100, 200, 300];
        this.targetY = this.y;

        this.lastTeleport = 0;
        this.teleportCooldown = 2000;

        this.verticalDirection = 1;
        this.verticalBarreira = 50;
        this.verticalMargem = 30;

        // Cooldowns dos ataques
        this.phase1AttackCooldown = 1500;
        this.phase1LastAttackTime = 0;

        this.phase3Attack1Cooldown = 3000;
        this.phase3Attack1LastUsed = 0;
    }

    update(time, delta) {
        this.updatePhase();

        switch (this.currentPhase) {
            case 1:
                this.fase1(time, delta);
                break;
            case 2:
                this.fase2(time, delta);
                break;
            case 3:
                this.fase3(time, delta);
                break;
        }

        // Atualizar projéteis: destruir se saírem da tela
        this.updateBossProjectiles();
    }

    updatePhase() {
        const hpPercent = this.health / this.maxHealth;
        if (hpPercent > 0.75) {
            this.currentPhase = 1;
        } else if (hpPercent > 0.25) {
            this.currentPhase = 2;
        } else {
            this.currentPhase = 3;
        }
    }

    checkVerticalLimit(y, barreira, margem, verticalDirection) {
        let newY = y;
        let newDirection = verticalDirection;

        if (newY < barreira) {
            if (newY < barreira - margem) {
                newDirection = 1;
                newY = barreira - margem;
            }
        }

        const limiteInferior = this.scene.player.sprite.y - 100;
        if (newY > limiteInferior) {
            newDirection = -1;
            newY = limiteInferior;
        }

        return { newY, newDirection };
    }

    fase1(time, delta) {
        if (!this.fase1Iniciada) {
            console.log("O boss entrou na fase 1");
            this.fase1Iniciada = true;
        }

        const speed = this.baseSpeed;
        this.x += this.direction * speed;

        if (this.x < 100 || this.x > 1200) {
            this.direction *= -1;
        }

        this.waveOffset += 0.05;
        const wave = Math.sin(this.waveOffset) * 10;

        let { newY, newDirection } = this.checkVerticalLimit(100 + wave, this.verticalBarreira, this.verticalMargem, this.verticalDirection);
        this.verticalDirection = newDirection;
        this.y = newY;

        if (time - this.phase1LastAttackTime > this.phase1AttackCooldown) {
        this.phase1Attack();
        this.phase1LastAttackTime = time;
    }
    }

    fase2(time, delta) {
        if (!this.fase2Iniciada) {
            console.log("O boss entrou na fase 2");
            this.fase2Iniciada = true;
        }

        const speed = this.baseSpeed + 1.5;
        this.x += this.direction * speed;

        if (this.x < 100 || this.x > 1200) {
            this.direction *= -1;
            this.targetY = Phaser.Utils.Array.GetRandom(this.verticalTargets);
        }

        this.waveOffset += 0.05;
        const wave = Math.sin(this.waveOffset) * 10;

        let targetYWithWave = this.y + (this.targetY - this.y) * 0.05 + wave * 0.1;

        let { newY, newDirection } = this.checkVerticalLimit(targetYWithWave, this.verticalBarreira, this.verticalMargem, this.verticalDirection);
        this.verticalDirection = newDirection;
        this.y = newY;
    }

    fase3(time, delta) {
        if (!this.fase3Iniciada) {
            console.log("O boss entrou na fase 3");
            this.fase3Iniciada = true;
            this.waveOffset = 0;
            this.verticalDirection = 1;
        }

        const speed = this.baseSpeed + 3;
        this.x += this.direction * speed;

        if (this.x < 100) {
            this.x = 100;
            this.direction *= -1;
        } else if (this.x > 1200) {
            this.x = 1200;
            this.direction *= -1;
        }

        if (time - this.lastTeleport > this.teleportCooldown) {
            if (Phaser.Math.Between(0, 100) < 30) {
                this.teleport(time);
            }
            this.lastTeleport = time;
        }

        this.waveOffset += 0.05;

        const amplitude = 20;
        const wave = Math.sin(this.waveOffset) * amplitude;

        let newY = this.y + wave * 0.25;

        let result = this.checkVerticalLimit(newY, this.verticalBarreira, this.verticalMargem, this.verticalDirection);
        this.verticalDirection = result.newDirection;
        this.y = result.newY;

        if (time - this.phase3Attack1LastUsed > this.phase3Attack1Cooldown) {
            this.phase3Attack1();
            this.phase3Attack1LastUsed = time;
        }
    }

    updateBossProjectiles() {
    this.bossProjectiles.children.iterate(proj => {
        if (!proj || !proj.active) return;

        // Mantém a velocidade constante usando as propriedades definidas no ataque
        proj.body.setVelocity(proj.speedX, proj.speedY);

        // Debug para checar se está sendo mantida
        console.log(`[DEBUG] Projectile velocity at update: ${proj.body.velocity.x}, ${proj.body.velocity.y}`);

        const outOfBounds = proj.x < -50 || proj.x > this.scene.scale.width + 50 ||
                            proj.y < -50 || proj.y > this.scene.scale.height + 50;

        if (outOfBounds) {
            proj.destroy();
        }
    });
}

    phase1Attack() {
    const projectile = this.scene.physics.add.sprite(this.x, this.y + 10, 'bossProjectile');
    projectile.setScale(0.1);
    projectile.damage = 5;

    // Define a velocidade desejada aqui (pode manipular livremente)
    projectile.speedX = 0;
    projectile.speedY = 150;

    projectile.body.setAllowGravity(false);
    projectile.body.enable = true;
    projectile.body.moves = true;

    // Setar a velocidade inicial também, para não ficar parado antes do update
    projectile.body.setVelocity(projectile.speedX, projectile.speedY);

    this.bossProjectiles.add(projectile);
}

phase3Attack1() {
    if (!this.scene.player || !this.scene.player.sprite) return;

    const playerX = this.scene.player.sprite.x;
    const playerY = this.scene.player.sprite.y;
    const offsets = [-20, 0, 20];

    offsets.forEach(offsetX => {
        const orb = this.scene.physics.add.sprite(this.x + offsetX, this.y, 'orb');
        orb.setScale(0.05);
        orb.damage = 10;

        const dirX = playerX - orb.x;
        const dirY = playerY - orb.y;
        const length = Math.sqrt(dirX * dirX + dirY * dirY) || 1;

        const normalizedX = dirX / length;
        const normalizedY = dirY / length;

        orb.speedX = normalizedX * 300;
        orb.speedY = normalizedY * 300;

        orb.body.setAllowGravity(false);
        orb.body.enable = true;
        orb.body.moves = true;

        orb.body.setVelocity(orb.speedX, orb.speedY);

        this.bossProjectiles.add(orb);
    });
}

    takeDamage(amount) {
        this.health -= amount;
        console.log(`[Boss] HP: ${this.health}`);
        if (this.health <= 0) {
            this.health = 0;
            this.scene.destroyBoss();
        }
    }

    teleport(time) {
        this.lastTeleport = time;

        this.scene.tweens.add({
            targets: this,
            alpha: 0,
            duration: 200,
            ease: 'Power1',
            onComplete: () => {
                this.x = Phaser.Math.Between(100, 1200);
                this.y = Phaser.Math.Between(80, 300);

                this.scene.tweens.add({
                    targets: this,
                    alpha: 1,
                    duration: 200,
                    ease: 'Power1'
                });
            }
        });
    }
}
