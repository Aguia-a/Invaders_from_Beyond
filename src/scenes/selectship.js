export class SelectShip extends Phaser.Scene {
    constructor() {
        super('SelectShip');
    }

    preload() {
        this.load.image('background', 'assets/background02');
        this.load.image('bg', 'assets/purpleStars.png');
        this.load.image('ship1', 'assets/yellow.spaceship.png');
        this.load.image('ship2', 'assets/red.spaceship.png');
        this.load.image('ship3', 'assets/blue.spaceship.png');
        this.load.image('shipBox', 'assets/shipBox.png');
        this.load.image('shipBoxSelected', 'assets/shipBoxSelected.png');
        this.load.image('titleText', 'assets/textEscolhaSuaNave.png');
        this.load.audio("transitionSound", 'assets/transition01.mp3');
    }

    create() {
        const centerX = this.scale.width / 2;
        const centerY = this.scale.height / 2;

        this.transitionSound = this.sound.add("transitionSound")

        this.background = this.add.image(centerX, centerY, 'background')
            .setOrigin(0.5)
            .setDepth(-2);
        this.scaleBackgroundToCover(this.background);

        this.stars = this.add.tileSprite(0, 0, this.scale.width, this.scale.height, 'bg')
            .setOrigin(0)
            .setScrollFactor(0)
            .setBlendMode(Phaser.BlendModes.ADD)
            .setAlpha(1);

        this.tweens.add({
            targets: this.stars,
            alpha: { from: 0.5, to: 1 },
            duration: 2000,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });

        this.add.image(centerX, 150, 'titleText').setOrigin(0.5).setScale(0.5);

        const ships = ['ship1', 'ship2', 'ship3'];
        this.selectedShipIndex = 1; // inicia no centro
        this.shipBoxes = [];

        ships.forEach((key, index) => {
            const x = centerX - 320 + index * 320;
            const isSelected = index === this.selectedShipIndex;
            const boxKey = isSelected ? 'shipBoxSelected' : 'shipBox';

            const box = this.add.image(x, centerY, boxKey).setOrigin(0.5).setScale(isSelected ? 0.35 : 0.3);
            const ship = this.add.image(x, centerY, key)
                .setOrigin(0.5)
                .setScale(isSelected ? 0.25 : 0.2)
                .setInteractive({ useHandCursor: true });

            this.shipBoxes.push({ box, ship });

            ship.on('pointerover', () => this.hoverShip(index));
            ship.on('pointerout', () => this.unhoverShip(index));
            ship.on('pointerdown', () => this.selectShip(index));
        });

        this.instructionText = this.add.text(centerX, 580, 'Selecione uma nave para continuar', {
            fontFamily: 'Futura Display',
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Atalhos de teclado
        this.cursors = this.input.keyboard.createCursorKeys();
        this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

        const fadeRect = this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000)
            .setOrigin(0)
            .setAlpha(1)
            .setDepth(100); // acima de tudo no início

        // Todos os elementos da tela (caixas e naves incluídas)
        const elements = [
            this.background,
            this.stars,
            ...this.shipBoxes.map(obj => [obj.box, obj.ship]).flat(),
            this.instructionText
        ];

        // Aparecem com efeito de escala e opacidade
        elements.forEach(el => {
            el.setScale(el.scale * 0.7); // começa menor
            el.setAlpha(0);              // começa invisível
        });

        this.tweens.add({
            targets: elements,
            scale: '*=1.43', // volta ao original (0.7 * 1.43 ≈ 1)
            alpha: 1,
            duration: 1000,
            ease: 'Power2'
        });

        // Some com a tela preta
        this.tweens.add({
            targets: fadeRect,
            alpha: 0,
            duration: 1000,
            ease: 'Quad.easeInOut'
        });
    }

    hoverShip(index) {
        this.shipBoxes.forEach((entry, i) => {
            const isSelected = i === index;
            entry.box.setTexture(isSelected ? 'shipBoxSelected' : 'shipBox');
            entry.box.setScale(isSelected ? 0.35 : 0.3);
            entry.ship.setScale(isSelected ? 0.25 : 0.2);
        });
        this.selectedShipIndex = index;
    }

    unhoverShip(index) {
        if (index !== this.selectedShipIndex) {
            this.shipBoxes[index].box.setTexture('shipBox');
            this.shipBoxes[index].box.setScale(0.3);
            this.shipBoxes[index].ship.setScale(0.2);
        }
    }

    selectShip(index) {
        this.selectedShipIndex = index;
        this.hoverShip(index); // atualiza o visual
        this.time.delayedCall(50, () => {
            this.game.bgMusic.stop()
            this.transitionSound.play()
            this.scene.start('Game', { selectedShip: ['ship1', 'ship2', 'ship3'][index] });
        });
    }

    update() {
        this.stars.tilePositionY -= 0.2;

        // Navegação por teclado
        if (Phaser.Input.Keyboard.JustDown(this.cursors.left)) {
            this.selectedShipIndex = (this.selectedShipIndex + 2) % 3; // vai para esquerda
            this.hoverShip(this.selectedShipIndex);
        }
        if (Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
            this.selectedShipIndex = (this.selectedShipIndex + 1) % 3; // vai para direita
            this.hoverShip(this.selectedShipIndex);
        }

        // Seleção com Enter
        if (Phaser.Input.Keyboard.JustDown(this.enterKey)) {
            this.selectShip(this.selectedShipIndex);
        }
    }

    scaleBackgroundToCover(image) {
        const scaleX = this.scale.width / image.width;
        const scaleY = this.scale.height / image.height;
        const scale = Math.max(scaleX, scaleY);
        image.setScale(scale).setScrollFactor(0);
    }
}
