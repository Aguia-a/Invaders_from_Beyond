export default class Boss extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'boss');

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setScale(0.2);
        this.setData('isBoss', true);
        this.setCollideWorldBounds(true);

        this.direction = 3;
    }

    update() {
        this.x += this.direction;

        if (this.x > 1200 || this.x < 80) {
            this.direction *= -1;
            this.y += 10;
        }
    }
}
