export class Start extends Phaser.Scene {

    constructor() {
        super('Start');
    }

    preload() {
        this.load.image('background', 'assets/space2.png');
        this.load.image('logo', 'assets/INVADERS FROM BEYOND.png');

        // A nave animada da tela inicial
        this.load.spritesheet('ship', 'assets/spaceship.png', { frameWidth: 176, frameHeight: 96 });
    }

    create() {
        // Fundo animado
        this.background = this.add.tileSprite(640, 360, 1280, 720, 'background');

        // Logo animado
        const logo = this.add.image(640, 200, 'logo').setScale(2);

        // Nave animada
        const ship = this.add.sprite(640, 360, 'ship');

        ship.anims.create({
            key: 'fly',
            frames: this.anims.generateFrameNumbers('ship', { start: 0, end: 2 }),
            frameRate: 15,
            repeat: -1
        });

        ship.play('fly');

        this.tweens.add({
            targets: logo,
            y: 400,
            duration: 1500,
            ease: 'Sine.inOut',
            yoyo: true,
            loop: -1
        });

        // Texto de instrução
        this.add.text(640, 600, 'Pressione ENTER para começar', {
            font: '28px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5);

        // Inicia a próxima cena (SelectShip) quando ENTER for pressionado
        this.input.keyboard.once('keydown-ENTER', () => {
            this.scene.start('SelectShip');
        });
    }

    update() {
        this.background.tilePositionY -= 2;
    }
}
