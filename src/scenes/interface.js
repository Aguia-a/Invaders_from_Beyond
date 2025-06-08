export default class BossInterface {
    constructor(scene, x, y, width = 300, height = 20) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        this.healthBarBg = this.scene.add.rectangle(x, -50, width, height, 0x000000, 0).setOrigin(0.5, 0);
        this.healthBarFill = this.scene.add.rectangle(x, -48, width - 4, height - 4, 0xff0000).setOrigin(0.5, 0);

        this.healthBarBg.setDepth(10);
        this.healthBarFill.setDepth(11);

        this.nameText = null;

        this.setVisible(false);
    }

    setVisible(visible) {
        this.healthBarBg.setVisible(visible);
        this.healthBarFill.setVisible(visible);
        if (this.nameText) {
            this.nameText.setVisible(visible);
        }
    }

    updateHealth(currentHealth, maxHealth) {
        this.setVisible(true);
        const healthPercent = Phaser.Math.Clamp(currentHealth / maxHealth, 0, 1);
        const fillWidth = (this.width - 4) * healthPercent;
        this.healthBarFill.width = fillWidth;
    }

    destroy() {
        this.healthBarBg.destroy();
        this.healthBarFill.destroy();
        if (this.nameText) {
            this.nameText.destroy();
        }
    }

    playIntro(bossName, duracao, bossHealth, bossMaxHealth, onComplete) {
        const screenWidth = this.scene.scale.width;
        const screenHeight = this.scene.scale.height;

        this.setVisible(true);

        this.healthBarBg.y = -50;
        this.healthBarFill.y = -48;

        if (this.nameText) this.nameText.destroy();
        this.nameText = this.scene.add.text(screenWidth / 2, screenHeight / 2, bossName, {
            fontSize: '48px',
            fill: '#ff0000',
            fontFamily: 'Pixelify Sans',
            fontStyle: 'normal',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 0,
        }).setOrigin(0.5).setAlpha(0.1);

        // Tween para barra descer
        this.scene.tweens.add({
            targets: [this.healthBarBg, this.healthBarFill],
            y: 20,
            ease: 'Power1',
            duration: 1000,
            onUpdate: () => {
                this.healthBarFill.y = this.healthBarBg.y + 2;
            },
            onComplete: () => {
                // Tween do texto aparecer
                this.scene.tweens.add({
                    targets: this.nameText,
                    alpha: 1,
                    duration: duracao,
                    yoyo: true,
                    hold: 1500,
                    onComplete: () => {
                        this.nameText.destroy();
                        this.updateHealth(bossHealth, bossMaxHealth);
                        if (onComplete) onComplete();
                    }
                });
            }
        });
    }
}

export function createBossInterface(scene, boss) {
    const screenWidth = scene.scale.width;
    const bossInterface = new BossInterface(scene, screenWidth / 2, 20);
    bossInterface.updateHealth(boss.health, boss.maxHealth);

    boss.on('damaged', (currentHealth) => {
        bossInterface.updateHealth(currentHealth, boss.maxHealth);
    });

    return bossInterface;
}


