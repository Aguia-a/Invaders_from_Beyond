export default class Boss extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'boss');
        // Adiciona o boss à cena e ativa a física (já que isso é feito aqui, não repita na cena)
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setScale(0.2);
        this.setData('isBoss', true);
        this.setCollideWorldBounds(true);

        // Propriedades de vida
        this.maxHealth = 100;
        this.health = this.maxHealth;

        // Configurações de movimentação
        this.baseSpeed = 3;
        this.direction = 1;
        this.lastDynamicChange = 0;
    }

    update(time, delta) {
        const healthPercentage = this.health / this.maxHealth;
        const currentSpeed = this.baseSpeed + (1 - healthPercentage) * 4;
        this.x += this.direction * currentSpeed * (delta / 16);
        if (this.x > 1200 || this.x < 80) {
            this.direction *= -1;
            this.y += 10;
        }
        if (healthPercentage < 0.75) {
            const zigzagAmplitude = 5 * (1 - healthPercentage);
            this.x += Math.sin(time * 0.005) * zigzagAmplitude;
        }
        if (healthPercentage < 0.25 && time - this.lastDynamicChange > 500) {
            this.direction = Phaser.Math.Between(-currentSpeed, currentSpeed) >= 0 ? 1 : -1;
            this.lastDynamicChange = time;
        }
    }

   takeDamage(amount) {
        this.health -= amount;
        console.log(`[Boss] HP: ${this.health}`);

        if (this.health <= 0) {

            this.scene.destroyBoss();
        }
    }
}