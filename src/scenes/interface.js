export default class BossHealthBar {
    constructor(scene, x, y, width = 300, height = 20) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        // Container para a barra (opcional)
        this.barBackground = this.scene.add.rectangle(x, y, width, height, 0x000000).setOrigin(0, 0);
        this.barFill = this.scene.add.rectangle(x + 2, y + 2, width - 4, height - 4, 0xff0000).setOrigin(0, 0);

        // Por padrão, escondemos até o boss aparecer
        this.setVisible(false);
    }

    setVisible(visible) {
        this.barBackground.setVisible(visible);
        this.barFill.setVisible(visible);
    }

    updateHealth(currentHealth, maxHealth) {
        this.setVisible(true);
        const healthPercent = Phaser.Math.Clamp(currentHealth / maxHealth, 0, 1);
        const fillWidth = (this.width - 4) * healthPercent;

        // Atualiza o tamanho da barra preenchida
        this.barFill.width = fillWidth;
    }

    destroy() {
        this.barBackground.destroy();
        this.barFill.destroy();
    }
}