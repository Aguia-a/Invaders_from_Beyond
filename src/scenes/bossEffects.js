import BossInterface, { createBossInterface } from './interface.js';

export default class BossEffects {

    static efeitoFlashMudancaDeFase(scene, boss, quantidade, expansao) {
        const emitter = scene.add.particles(0, 0, 'flash', {
            x: boss.x,
            y: boss.y,
            speed: { min: 600, max: 1000 },
            angle: { min: 0, max: 360 },
            scale: { start: 1, end: 0 },
            alpha: { start: 1, end: 0 },
            lifespan: expansao,
            quantity: quantidade,
            blendMode: 'ADD',
            tint: 0xff0000
        });

        // Destruir automaticamente após o efeito
        scene.time.delayedCall(2000, () => {
            if (emitter) {
                emitter.stop();

                if (emitter.manager) {
                    emitter.manager.destroy();
                }
            }
        });
    }

    static efeitoTremor(scene, intensidade, duracao, delay) {
        if (scene.cameras && scene.cameras.main) {
            if (delay > 0) {
                setTimeout(() => {
                    scene.cameras.main.shake(duracao, intensidade);
                }, delay);
            } else {
                scene.cameras.main.shake(duracao, intensidade);
            }
        }
    }

    // Efeito de transição para a fase 1
    static fase1EfeitoMudanca(scene, boss) {
        const sincronia = 2000;
        // Trava o boss no começo do efeito
        boss.isFree = false;
        boss.setActive(false); // opcional, para garantir que não está ativo ainda
        boss.isInvincible = true;

        // Cria a interface do boss
        const screenWidth = scene.scale.width;
        scene.BossInterface = new BossInterface(scene, screenWidth / 2, 20);

        // Roda a introdução do boss
        scene.BossInterface.playIntro("OVERLORD", sincronia, boss.health, boss.maxHealth, () => {
            // Ativa o boss quando a intro acabar
            boss.setActive(true);
            boss.isFree = true; // libera o boss para agir
            boss.isInvincible = false;
        });

        // Faz o tremor para dar efeito dramático (pode ser ajustado)
        this.efeitoTremor(scene, 0.01, sincronia / 2, 100);
    }

    // Efeito visual ao mudar para a Fase 2 do boss
    static fase2EfeitoMudanca(scene, boss) {
        const sincronia = 2000;
        // Trava o boss
        boss.isFree = false;
        boss.setActive(false); // opcional, desativa visualmente ou logicamente se necessário
        boss.isInvincible = true;

        // Duração personalizada (em milissegundos)
        const tempoParaLiberar = 2000; // por exemplo, 2 segundos

        // Após o tempo definido, libera o boss
        scene.time.delayedCall(tempoParaLiberar, () => {
            boss.setActive(true);
            boss.isFree = true;
            boss.isInvincible = false;

        });
        this.efeitoFlashMudancaDeFase(scene, boss, 25, 2000);
        this.efeitoTremor(scene, 0.01, sincronia / 2, 100);
    }

    // Efeito visual ao mudar para a Fase 3 do boss
    static fase3EfeitoMudanca(scene, boss) {
        const sincronia = 2000;
        // Trava o boss
        boss.isFree = false;
        boss.setActive(false); // opcional, desativa visualmente ou logicamente se necessário
        boss.isInvincible = true;


        // Duração personalizada (em milissegundos)
        const tempoParaLiberar = 2000; // por exemplo, 2 segundos

        // Após o tempo definido, libera o boss
        scene.time.delayedCall(tempoParaLiberar, () => {
            boss.setActive(true);
            boss.isFree = true;
            boss.isInvincible = false;

        });
        this.efeitoFlashMudancaDeFase(scene, boss, 100, 2000);
        this.efeitoTremor(scene, 0.01, sincronia / 2, 100);
    }
}