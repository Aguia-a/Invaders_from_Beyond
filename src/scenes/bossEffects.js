import BossInterface, { createBossInterface } from './interface.js';

export default class BossEffects {

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
        // Trava o boss no começo do efeito
        boss.isFree = false;
        boss.setActive(false); // opcional, para garantir que não está ativo ainda
        boss.isInvincible = true;

        // Cria a interface do boss
        const screenWidth = scene.scale.width;
        scene.BossInterface = new BossInterface(scene, screenWidth / 2, 20);

        // Roda a introdução do boss
        scene.BossInterface.playIntro("OVERLORD", 1100 , boss.health, boss.maxHealth, () => {
            // Ativa o boss quando a intro acabar
            boss.setActive(true);
            boss.isFree = true; // libera o boss para agir
            boss.isInvincible = false;
        });

        // Faz o tremor para dar efeito dramático (pode ser ajustado)
        this.efeitoTremor(scene, 0.01, 1000, 100);
    }

    // Efeito visual ao mudar para a Fase 2 do boss
    static fase2EfeitoMudanca(scene, boss) {
        // lógica será adicionada depois
    }

    // Efeito visual ao mudar para a Fase 3 do boss
    static fase3EfeitoMudanca(scene, boss) {
        // lógica será adicionada depois
    }
}