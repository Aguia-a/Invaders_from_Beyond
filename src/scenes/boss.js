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

        //CONFIGURAÇÃO DO ATAQUE DEFAULT DO BOSS    
        this.DefaultAttack1Cooldown = 1500;
        this.DefaultAttack1LastUsed = 0;
        this.DefaultAttack1Velocity = 700;

        this.DefaultAttack2Cooldown = 3000;
        this.DefaultAttack2LastUsed = 0;
        this.DefaultAttack2Velocity = 400;
        //CONFIGURAÇÃO DO ATAQUE ESPECIAL DO BOSS FASE 2 / FASE 3
        this.specialAttackCooldown = 5000;
        this.lastSpecialAttackUsed = 0;
        //CONFIGURAÇÃO DO ATAQUE ESPECIAL DO BOSS FASE 3
    }

    // Função para verificar cooldown
    canUseAttack(cooldown, lastUsed, currentTime) {
        return (currentTime - lastUsed) > cooldown;
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

    handleDefaultAttacks(time) {
        const bossX = this.x;
        const playerX = this.scene.player?.sprite?.x ?? 0;

        const horizontalDist = Math.abs(bossX - playerX);
        const chance = Phaser.Math.Clamp(100 - (horizontalDist / 2.5), 0, 100);

        const roll = Phaser.Math.Between(0, 100);

        //console.log(`[Boss Attack Roll] Distância: ${horizontalDist.toFixed(1)} | Chance: ${chance.toFixed(1)}% | Sorteio: ${roll}`);

        if (roll <= chance) {
            this.DefaultAttack1();
            this.DefaultAttack1LastUsed = time;
        } else {
            this.DefaultAttack2();
            this.DefaultAttack2LastUsed = time;
        }
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

        //DISPARO
        if (
            this.canUseAttack(this.DefaultAttack1Cooldown, this.DefaultAttack1LastUsed, time) &&
            this.canUseAttack(this.DefaultAttack2Cooldown, this.DefaultAttack2LastUsed, time)
        ) {
            this.handleDefaultAttacks(time);
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

        //DISPARO

        if (
            this.canUseAttack(this.DefaultAttack1Cooldown, this.DefaultAttack1LastUsed, time) &&
            this.canUseAttack(this.DefaultAttack2Cooldown, this.DefaultAttack2LastUsed, time)
        ) {
            // Sorteio pra ataques especiais
            const specialRoll = Phaser.Math.Between(0, 100);

            // Verifica se passou o cooldown do special attack
            const canUseSpecial = (time - (this.lastSpecialAttackUsed ?? 0)) >= (this.specialAttackCooldown ?? 0);

            if (canUseSpecial) {
                switch (true) {
                    case (specialRoll < 15):
                        console.log('Usando specialAttack1');
                        this.specialAttack1();
                        this.SpecialAttack1LastUsed = time;
                        this.lastSpecialAttackUsed = time;
                        break;

                    case (specialRoll >= 15 && specialRoll < 90):
                        console.log('Usando specialAttack2');
                        this.specialAttack2();
                        this.SpecialAttack2LastUsed = time;
                        this.lastSpecialAttackUsed = time;
                        break;

                    default:
                        this.handleDefaultAttacks(time);
                        break;
                }
            } else {
                console.log(`[Cooldown] Especial ainda em espera | canUseSpecial: ${canUseSpecial}`);
                this.handleDefaultAttacks(time);
            }
        }
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

        //DISPARO E CHANCE DO DISPARO

    }

    updateBossProjectiles() {
        this.bossProjectiles.children.iterate(proj => {
            if (!proj || !proj.active) return;

            // Mantém a velocidade constante usando as propriedades definidas no ataque
            proj.body.setVelocity(proj.speedX, proj.speedY);

            const outOfBounds = proj.x < -50 || proj.x > this.scene.scale.width + 50 ||
                proj.y < -50 || proj.y > this.scene.scale.height + 50;

            if (outOfBounds) {
                proj.destroy();
            }
        });
    }

    DefaultAttack1() {

        const DefaultAttack1Object = this.scene.physics.add.sprite(this.x, this.y + 10, 'bossProjectile');
        DefaultAttack1Object.setScale(0.4);
        DefaultAttack1Object.damage = 5;

        // Define a velocidade desejada aqui (pode manipular livremente)
        DefaultAttack1Object.speedX = 0;
        DefaultAttack1Object.speedY = this.DefaultAttack1Velocity;

        DefaultAttack1Object.body.setAllowGravity(false);
        DefaultAttack1Object.body.enable = true;
        DefaultAttack1Object.body.moves = true;

        // Setar a velocidade inicial também, para não ficar parado antes do update
        DefaultAttack1Object.body.setVelocity(DefaultAttack1Object.speedX, DefaultAttack1Object.speedY);

        this.bossProjectiles.add(DefaultAttack1Object);
    }

    DefaultAttack2() {
        if (!this.scene.player || !this.scene.player.sprite) return;

        const playerX = this.scene.player.sprite.x;
        const playerY = this.scene.player.sprite.y;
        const offsets = [-120, 0, 120];

        offsets.forEach(offsetX => {
            const orb = this.scene.physics.add.sprite(this.x + offsetX, this.y, 'orb');
            orb.setScale(0.05);
            orb.damage = 10;

            const dirX = playerX - orb.x;
            const dirY = playerY - orb.y;
            const length = Math.sqrt(dirX * dirX + dirY * dirY) || 1;

            const normalizedX = dirX / length;
            const normalizedY = dirY / length;

            orb.speedX = normalizedX * this.DefaultAttack2Velocity;
            orb.speedY = normalizedY * this.DefaultAttack2Velocity;

            orb.body.setAllowGravity(false);
            orb.body.enable = true;
            orb.body.moves = true;

            orb.body.setVelocity(orb.speedX, orb.speedY);

            this.bossProjectiles.add(orb);
        });
    }

    specialAttack1() {
        const projectileCount = 20;      // Total de projéteis
        const interval = 200;            // Intervalo entre cada um (ms)
        const specialAttack1Velocity = 300;
        const screenWidth = this.scene.scale.width;

        for (let i = 0; i < projectileCount; i++) {
            this.scene.time.delayedCall(i * interval, () => {
                const x = Phaser.Math.Between(0, screenWidth); // Posição aleatória no topo
                const y = -32; // Começa fora da tela

                const spike = this.scene.physics.add.sprite(x, y, 'spikeProjectile');
                spike.setVelocityY(specialAttack1Velocity); // Velocidade de queda vertical
                spike.body.setAllowGravity(false);
                spike.setScale(0.2);
                // ⚠️ Propriedades obrigatórias para tratamento como projétil:
                spike.damage = 15;                     // Dano que ele causa
                spike.isBossProjectile = true;         // Identificação como projétil do boss
                spike.speedX = 0;                      // Movimento apenas vertical
                spike.speedY = specialAttack1Velocity;

                // Adiciona ao grupo de projéteis
                this.bossProjectiles.add(spike);
            });
        }

        console.log('🧷 specialAttack1: Projéteis verticais criados e tratados como projéteis do boss');
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
