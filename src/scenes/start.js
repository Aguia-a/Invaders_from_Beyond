export class Start extends Phaser.Scene {
    constructor() {
        super('Start');
    }

    preload() {
        this.load.image('background', 'assets/startWallpaper.png');
        this.load.image('astronaut', 'assets/astronautaStart.png');
        this.load.image('stars', 'assets/purpleStars.png'); // imagem das estrelas
        this.load.image('textLogo', 'assets/textLogo.png');  // Carrega o logo do texto
        this.load.audio('bgMusic', 'assets/backgroundSongStart.mp3');  // Carregar música
        this.load.audio('transitionEfect02', 'assets/transition02.mp3');  // Carregar música
    }

    create() {
        // Fundo tipo "cover"
        this.background = this.add.image(0, 0, 'background');
        this.scaleBackgroundToCover(this.background);

        const centerX = this.scale.width / 2;
        const centerY = this.scale.height / 2;

        this.game.bgMusic = this.sound.add('bgMusic', { loop: true, volume: 0.5 });
        this.game.bgMusic.play();

        this.stars = this.add.tileSprite(0, 0, this.scale.width, this.scale.height, 'stars')
            .setOrigin(0)
            .setScrollFactor(0)
            .setBlendMode(Phaser.BlendModes.ADD)
            .setAlpha(1);

        // Tween para opacidade pulsante das estrelas
        this.tweens.add({
            targets: this.stars,
            alpha: { from: 0.5, to: 1 },
            duration: 2000,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });

        const textLogo = this.add.image(centerX, centerY - 165, 'textLogo').setOrigin(0.5);
        textLogo.setScale(700 / textLogo.width)

        const astronaut = this.add.image(centerX, centerY + 30, 'astronaut').setOrigin(0.5);
        astronaut.setScale(450 / astronaut.width);

        this.tweens.add({
            targets: astronaut,
            y: centerY + 10,
            duration: 2000,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });

        const pressText = this.add.text(centerX, this.scale.height - 90, 'PRESS ENTER KEY FOR START', {
            fontFamily: 'Pixelify Sans',
            fontSize: '24px',
            color: '#ffffff',
            shadow: {
                offsetX: 1,
                offsetY: 1,
                color: '#000000',
                blur: 1,
                fill: true
            }
        }).setOrigin(0.5);

        this.tweens.add({
            targets: pressText,
            alpha: 0.4,
            duration: 2000,
            ease: 'Linear',
            yoyo: true,
            repeat: -1
        });

    this.input.keyboard.once('keydown-ENTER', () => {
        this.effect02 = this.sound.add('transitionEfect02');
        this.effect02.play();

        // Cria uma tela preta por cima
        const fadeRect = this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000)
            .setOrigin(0)
            .setAlpha(0)
            .setDepth(100); // acima de tudo

        // Todos os elementos principais (para animar)
        const elements = [this.background, this.stars, textLogo, astronaut, pressText];

        // Diminui todos os elementos e os esmaece
        this.tweens.add({
            targets: elements,
            scale: 0.7,
            alpha: 0,
            duration: 1000,
            ease: 'Power2',
        });

        // Escurece a tela ao mesmo tempo
        this.tweens.add({
            targets: fadeRect,
            alpha: 1,
            duration: 1000,
            ease: 'Quad.easeInOut',
            onComplete: () => {
                this.scene.start('CutsceneOne');
            }
        });
});

        this.scale.on('resize', () => {
            this.scaleBackgroundToCover(this.background);
            this.stars.setSize(this.scale.width, this.scale.height);
        });
    }

   update() {
    if (this.stars) {
        this.stars.tilePositionY -= 0.2;  // animação para baixo (estrelas caindo)
    }
}

    scaleBackgroundToCover(bg) {
        const scaleX = this.scale.width / bg.width;
        const scaleY = this.scale.height / bg.height;
        const scale = Math.max(scaleX, scaleY);
        bg.setScale(scale).setOrigin(0.5).setPosition(this.scale.width / 2, this.scale.height / 2);
    }
}
