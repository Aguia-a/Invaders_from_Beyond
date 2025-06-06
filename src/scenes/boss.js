import BossEffects from './bossEffects.js';
import fase1EfeitoMudanca from './bossEffects.js';

export default class Boss extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'boss');
        this.scene = scene;
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Grupo único de projéteis do boss
        this.bossProjectiles = this.scene.physics.add.group();

        this.initBossVariables();

        this.setScale(this.bossScale);
        this.setData('isBoss', true);
        this.setCollideWorldBounds(true);

        this.isFree = true;
    }

    initBossVariables() {
        // Configurações gerais do boss
        this.maxHealth = 125;
        this.health = this.maxHealth;

        this.baseSpeed = 5;
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

        // Configuração do ataque default do boss    
        this.DefaultAttack1Cooldown = 1500;
        this.DefaultAttack1LastUsed = 0;
        this.DefaultAttack1Velocity = 700;

        this.DefaultAttack2Cooldown = 3000;
        this.DefaultAttack2LastUsed = 0;
        this.DefaultAttack2Velocity = 400;

        // Configuração do ataque especial do boss fase 2 / fase 3
        this.specialAttackCooldown = 5000;
        this.lastSpecialAttackUsed = 0;

        // Configurações específicas para o clone do specialAttack2
        this.cloneDuration = 5000;   // em ms (5 segundos)
        this.cloneAlpha = 1;
        this.cloneDepth = 5;
        this.cloneOffsetX = 50;
        this.bossScale = 0.2;  // escala base do boss
        this.cloneScale = this.bossScale; // escala do clone (ajuste aqui se quiser)
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
        if (hpPercent > 0.80) {
            this.currentPhase = 1;
        } else if (hpPercent > 0.50) {
            this.currentPhase = 2;
        } else {
            this.currentPhase = 3;
        }
    }

    checkVerticalLimit(y, barreira, margem, verticalDirection, scene) {
        let newY = y;
        let newDirection = verticalDirection;

        if (newY < barreira) {
            if (newY < barreira - margem) {
                newDirection = 1;
                newY = barreira - margem;
            }
        }

        const limiteInferior = scene.player.sprite.y - 100;
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
            BossEffects.fase1EfeitoMudanca(this.scene, this);
            this.removeClone(true);
        }

        if (!this.isFree) {
            return; // se não está livre, não faz nada aqui (nem se move, nem atira)
        }
        this.updateMovement(this.currentPhase, this.checkVerticalLimit);

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
            BossEffects.fase2EfeitoMudanca(this.scene, this);
            this.removeClone(true);
        }

        if (!this.isFree) {
            return; // se não está livre, não faz nada aqui (nem se move, nem atira)
        }

        this.updateMovement(this.currentPhase, this.checkVerticalLimit);

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
                        this.specialAttack1();
                        this.SpecialAttack1LastUsed = time;
                        this.lastSpecialAttackUsed = time;
                        break;

                    case (specialRoll >= 15 && specialRoll < 50):
                        this.specialAttack2();
                        this.SpecialAttack2LastUsed = time;
                        this.lastSpecialAttackUsed = time;
                        break;

                    default:
                        this.handleDefaultAttacks(time);
                        break;
                }
            } else {
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
            BossEffects.fase3EfeitoMudanca(this.scene, this);
            this.removeClone(true);
        }

        if (!this.isFree) {
            return; // se não está livre, não faz nada aqui (nem se move, nem atira)
        }
        this.updateMovement(this.currentPhase, this.checkVerticalLimit);

        //DISPARO E CHANCE DO DISPARO
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
                    case (specialRoll < 30):
                        this.specialAttack1();
                        this.SpecialAttack1LastUsed = time;
                        this.lastSpecialAttackUsed = time;
                        break;

                    case (specialRoll >= 30 && specialRoll < 50):
                        this.specialAttack2(time);
                        this.SpecialAttack2LastUsed = time;
                        this.lastSpecialAttackUsed = time;
                        break;

                    case (specialRoll >= 50 && specialRoll < 90):
                        this.specialAttack3(time);
                        this.SpecialAttack3LastUsed = time;
                        this.lastSpecialAttackUsed = time;
                        break;

                    default:
                        this.handleDefaultAttacks(time);
                        break;
                }
            } else {
                this.handleDefaultAttacks(time);
            }
        }
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
        DefaultAttack1Object.setOrigin(0.5, 0.5);
        DefaultAttack1Object.setScale(0.3);
        DefaultAttack1Object.play('bossProjectileAnim')
        const velocity = this.DefaultAttack1Velocity; // salva valor local do velocity
        DefaultAttack1Object.damage = 5;

        // Inicialmente parado
        DefaultAttack1Object.speedX = 0;
        DefaultAttack1Object.speedY = 0;

        DefaultAttack1Object.body.setAllowGravity(false);
        DefaultAttack1Object.body.enable = true;
        DefaultAttack1Object.body.moves = true;
        DefaultAttack1Object.body.setVelocity(0, 0); // Começa parado

        this.bossProjectiles.add(DefaultAttack1Object);

        // Após um pequeno atraso, começa a cai

        this.scene.time.delayedCall(150, () => {
            if (DefaultAttack1Object && DefaultAttack1Object.body) {
                DefaultAttack1Object.speedY = velocity;
                DefaultAttack1Object.body.setVelocity(0, velocity);
            }
        });

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
        const interval = 300;            // Intervalo entre cada um (ms)
        const specialAttack1Velocity = 400;
        const screenWidth = this.scene.scale.width;

        for (let i = 0; i < projectileCount; i++) {
            this.scene.time.delayedCall(i * interval, () => {
                // ⚠️ Proteções contra cena destruída ou boss destruído
                if (!this.scene || !this.scene.sys || !this.scene.sys.isActive()) return;
                if (!this.active) return;

                const x = Phaser.Math.Between(0, screenWidth);
                const y = -32;

                const spike = this.scene.physics.add.sprite(x, y, 'bossProjectile');
                spike.play('bossProjectileAnim');
                
                spike.setVelocityY(specialAttack1Velocity);
                spike.body.setAllowGravity(false);
                spike.setScale(0.2);
                spike.damage = 15;
                spike.speedX = 0;
                spike.speedY = specialAttack1Velocity;

                this.bossProjectiles.add(spike);
            });
        }
    }

    specialAttack2(time) {
        const randomX = Phaser.Math.Between(100, 1200);
        const randomY = Phaser.Math.Between(80, 300);

        this.clone = this.scene.physics.add.sprite(randomX, randomY, 'bossClone');
        this.clone.setAlpha(0);
        this.clone.setDepth(this.cloneDepth);
        this.clone.setImmovable(true);
        this.clone.body.setAllowGravity(false);
        this.clone.setScale(this.cloneScale);

        this.clone.baseSpeed = this.baseSpeed;
        this.clone.direction = this.direction;
        this.clone.verticalTargets = this.verticalTargets;
        this.clone.targetY = Phaser.Utils.Array.GetRandom(this.verticalTargets);
        this.clone.waveOffset = 0;
        this.clone.verticalDirection = this.verticalDirection;
        this.clone.verticalBarreira = this.verticalBarreira;
        this.clone.verticalMargem = this.verticalMargem;

        this.clone.updateMovement = (fase) => {
            this.updateMovement.call(this.clone, fase, this.checkVerticalLimit);
        };

        this.cloneUpdateCallback = () => {
            if (this.clone && this.clone.active) {
                this.clone.updateMovement(this.currentPhase);
            }
        };
        this.scene.events.on('update', this.cloneUpdateCallback);

        this.cloneFadeInTween = this.scene.tweens.add({
            targets: this.clone,
            alpha: this.cloneAlpha,
            duration: 200,
            ease: 'Power1'
        });

        // Timer para remover clone automaticamente após cloneDuration
        this.cloneDelayedCall = this.scene.time.delayedCall(this.cloneDuration, () => {
            this.removeClone(); // Chama função de remoção ao final da duração
        });

        this.teleport(time);
    }


    specialAttack3(time) {
        const dashCount = 4;
        const dashDuration = 400;
        const pauseBetweenDashes = 200;
        const minDistanceX = 400;
        const avoidMargin = 200; // Mínima distância das posições anteriores

        this.isDashing = true;
        this.setVelocity(0, 0);
        this.scene.tweens.killTweensOf(this);

        let dashIndex = 0;
        const previousPositions = [];

        const doDash = () => {
            if (dashIndex >= dashCount) {
                this.isDashing = false;
                this.setVelocity(0, 0);
                return;
            }

            let newX;
            let tries = 0;
            do {
                newX = Phaser.Math.Between(100, 1200);
                tries++;

                // Rejeita se estiver muito perto de alguma posição anterior
            } while (
                (
                    Math.abs(newX - this.x) < minDistanceX ||
                    previousPositions.some(prev => Math.abs(newX - prev) < avoidMargin)
                ) && tries < 30
            );

            previousPositions.push(newX);
            if (previousPositions.length > 3) {
                previousPositions.shift();
            }

            this.scene.tweens.add({
                targets: this,
                x: newX,
                duration: dashDuration,
                ease: 'Power2',
                onStart: () => {
                },
                onComplete: () => {
                    this.launchWallProjectile();
                    dashIndex++;
                    this.scene.time.delayedCall(pauseBetweenDashes, doDash);
                }
            });
        };

        doDash();
    }

    takeDamage(amount) {
        if (this.isInvincible) return;

        this.health -= amount;
        this.health = Phaser.Math.Clamp(this.health, 0, this.maxHealth);

        console.log(`[Boss] HP: ${this.health}`);

        this.isInvincible = true;

        // Tween para piscar (ajuste a duração conforme quiser)
        this.scene.tweens.add({
            targets: this,
            alpha: 0,
            ease: 'Linear',
            duration: 100,
            yoyo: true,
            repeat: 0,
            onComplete: () => {
                this.isInvincible = false;
                this.setAlpha(1);
            }
        });

        // Emitir evento para atualizar a barra
        this.emit('damaged', this.health);

        if (this.health <= 0) {
            this.health = 0;
            this.cleanup();
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
    launchWallProjectile() {
        const projectile = this.scene.physics.add.sprite(this.x, this.y + 50, 'wallProjectile');
        projectile.setImmovable(true);
        projectile.setDepth(1);
        projectile.setScale(1, 1); // Escala inicial
        projectile.setOrigin(0.5, 0); // Cresce para baixo
        projectile.speedX = 0;
        projectile.speedY = 0;

        const screenBottom = this.scene.scale.height;
        const distanceToBottom = screenBottom - projectile.y;
        const originalHeight = projectile.height;

        const maxScaleY = distanceToBottom / originalHeight; // Escala necessária para atingir o fundo

        let growth = 1;

        // Crescimento simulando descida
        const growthInterval = this.scene.time.addEvent({
            delay: 50,
            callback: () => {
                if (growth < maxScaleY) {
                    growth += 0.1;
                    if (growth > maxScaleY) growth = maxScaleY; // Evita ultrapassar
                    projectile.setScale(1, growth);
                } else {
                    growthInterval.remove();

                    if (projectile.scene && projectile.scene.time) {
                        projectile.scene.time.delayedCall(1500, () => {
                            projectile.destroy();
                        });
                    } else {
                        projectile.destroy(); // Segurança caso a cena tenha sido destruída
                    }
                }
            },
            callbackScope: this,
            loop: true
        });

        this.bossProjectiles.add(projectile);
    }

    updateMovement(fase, checkVerticalLimit) {
        switch (fase) {
            case 1:
                {
                    const speed = this.baseSpeed;
                    this.x += this.direction * speed;

                    if (this.x < 100 || this.x > 1200) {
                        this.direction *= -1;
                    }

                    if (this.targetBaseY === undefined) this.targetBaseY = this.y;
                    if (this.currentBaseY === undefined) this.currentBaseY = this.y;
                    if (this.baseYTimer === undefined) this.baseYTimer = 0;

                    this.baseYTimer += this.scene.game.loop.delta;
                    if (this.baseYTimer > Phaser.Math.Between(2000, 4000)) {
                        this.targetBaseY = Phaser.Math.Between(100, 400);
                        this.baseYTimer = 0;
                    }

                    this.currentBaseY = Phaser.Math.Linear(this.currentBaseY, this.targetBaseY, 0.01);

                    this.waveOffset += 0.05;
                    const wave = Math.sin(this.waveOffset) * 10;

                    let { newY, newDirection } = checkVerticalLimit(
                        this.currentBaseY + wave,
                        this.verticalBarreira,
                        this.verticalMargem,
                        this.verticalDirection,
                        this.scene,
                    );

                    this.verticalDirection = newDirection;
                    this.y = newY;
                }
                break;

            case 2:
                {
                    const speed = this.baseSpeed + 1.5;
                    this.x += this.direction * speed;

                    if (this.x < 100 || this.x > 1200) {
                        this.direction *= -1;
                        this.targetY = Phaser.Utils.Array.GetRandom(this.verticalTargets);
                    }

                    this.waveOffset += 0.05;
                    const wave = Math.sin(this.waveOffset) * 10;
                    let targetYWithWave = this.y + (this.targetY - this.y) * 0.05 + wave * 0.1;

                    let { newY, newDirection } = checkVerticalLimit(
                        targetYWithWave,
                        this.verticalBarreira,
                        this.verticalMargem,
                        this.verticalDirection,
                        this.scene,
                    );

                    this.verticalDirection = newDirection;
                    this.y = newY;
                }
                break;

            case 3:
                {
                    if (!this.isDashing) {
                        const speed = this.baseSpeed + 3;
                        this.x += this.direction * speed;

                        if (this.x < 100) {
                            this.x = 100;
                            this.direction *= -1;
                        } else if (this.x > 1200) {
                            this.x = 1200;
                            this.direction *= -1;
                        }

                        this.waveOffset += 0.05;
                        const amplitude = 20;
                        const wave = Math.sin(this.waveOffset) * amplitude;
                        let newY = this.y + wave * 0.25;

                        let { newY: finalY, newDirection } = checkVerticalLimit(
                            newY,
                            this.verticalBarreira,
                            this.verticalMargem,
                            this.verticalDirection,
                            this.scene,
                        );

                        this.verticalDirection = newDirection;
                        this.y = finalY;
                    }
                }
                break;

            default:
                console.warn('Fase de movimento inválida:', fase);
        }
    }

    removeClone(force = false) {
        if (!this.clone) return;

        if (force) {
            // Força destruição imediata do clone
            if (this.cloneFadeInTween && this.cloneFadeInTween.isPlaying()) {
                this.cloneFadeInTween.stop();
            }

            if (this.cloneFadeOutTween && this.cloneFadeOutTween.isPlaying()) {
                this.cloneFadeOutTween.stop();
            }

            this.clone.destroy();
            this.clone = null;

            if (this.cloneUpdateCallback) {
                this.scene.events.off('update', this.cloneUpdateCallback);
                this.cloneUpdateCallback = null;
            }

            if (this.cloneDelayedCall && this.cloneDelayedCall.getProgress() < 1) {
                this.cloneDelayedCall.remove();
            }

        } else {
            // Destruição com fade-out (usada pelo timer normalmente)
            this.cloneFadeOutTween = this.scene.tweens.add({
                targets: this.clone,
                alpha: 0,
                duration: 200,
                ease: 'Power1',
                onComplete: () => {
                    if (this.clone) {
                        this.clone.destroy();
                        this.clone = null;
                    }

                    if (this.cloneUpdateCallback) {
                        this.scene.events.off('update', this.cloneUpdateCallback);
                        this.cloneUpdateCallback = null;
                    }

                }
            });

            if (this.cloneDelayedCall && this.cloneDelayedCall.getProgress() < 1) {
                this.cloneDelayedCall.remove(); // Cancela o timer original, já que está sendo destruído aqui
            }
        }
    }


    cleanup() {
        // Destrói todos os projéteis do boss
        if (this.bossProjectiles) {
            this.bossProjectiles.clear(true, true);
        }

        // Remove o listener update do clone, se existir
        if (this.cloneUpdateCallback) {
            this.scene.events.off('update', this.cloneUpdateCallback);
            this.cloneUpdateCallback = null;
        }

        // Destroi o clone, se existir
        if (this.clone) {
            this.clone.destroy();
            this.clone = null;
        }

        // Para todos os tweens associados ao boss
        this.scene.tweens.killTweensOf(this);

    }
}
