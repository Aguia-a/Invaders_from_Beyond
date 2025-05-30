export class SelectShip extends Phaser.Scene {
    constructor() {
        super('SelectShip');
    }

    preload() {
        this.load.image('bg', 'assets/space2.png');
        this.load.image('ship1', 'assets/yellow.spaceship.png');
        this.load.image('ship2', 'assets/blue.spaceship.png');
        this.load.image('ship3', 'assets/red.spaceship.png');
    }

    create() {
        this.background = this.add.tileSprite(640, 360, 1280, 720, 'bg');

        this.add.text(640, 100, 'Escolha sua Nave', {
            font: '36px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5);

        const ships = ['ship1', 'ship2', 'ship3'];

        ships.forEach((key, index) => {
            const x = 320 + index * 320;
            const sprite = this.add.image(x, 400, key).setInteractive().setScale(0.3);

            sprite.on('pointerover', () => sprite.setScale(0.5));
            sprite.on('pointerout', () => sprite.setScale(0.3));

            sprite.on('pointerdown', () => {
                this.scene.start('Game', { selectedShip: key });
            });
        });

        this.add.text(640, 640, 'Clique em uma nave para jogar', {
            font: '24px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5);
    }

    update() {
        this.background.tilePositionY -= 2; // ou += 2 para mais velocidade
    }

    
}
