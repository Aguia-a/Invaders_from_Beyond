export default class DemoEnd extends Phaser.Scene {
    constructor() {
        super({ key: 'demoEnd' });
    }

    preload() {
        this.load.audio('demoEndSound', 'assets/gameOverSound.mp3'); 
    }

    createButtonText(x, y, text, fontSize = '40px', color = '#FFFFFF', strokeThickness = 0) {
        const btnText = this.add.text(x, y, text, {
            fontSize: fontSize,
            color: color,
            fontFamily: 'Pixelify Sans',
            fontStyle: 'normal',
            align: 'center',
            stroke: '#000000',
            strokeThickness: strokeThickness,
        }).setOrigin(0.5);

        btnText.setShadow(2, 2, '#000000', 2, true, true);
        return btnText;
    }

    create() {
        const { width, height } = this.cameras.main;

        this.demoEndSound = this.sound.add('demoEndSound');
        this.demoEndSound.play();

        // Fundo escuro semi-transparente
        this.add.rectangle(0, 0, width * 2, height * 2, 0x000000, 0.5)
            .setOrigin(0)
            .setDepth(10);

        // Texto principal: Demo Acabou! com controle de variáveis
        const demoEndText = this.createButtonText(width / 2, height / 2 - 20, 'Demo Acabou!', '40px', '#FFFFFF', 0);
        demoEndText.setDepth(11).setAlpha(0);

        // Texto secundário: Obrigado por jogar! com controle de variáveis
        const thanksText = this.createButtonText(width / 2, height / 2 + 40, 'Obrigado por jogar!', '24px', '#FFFFFF', 0);
        thanksText.setDepth(11).setAlpha(0);

        // Tween para mostrar o texto principal
        this.tweens.add({
            targets: demoEndText,
            alpha: 1,
            duration: 800,
            ease: 'Back.Out',
            delay: 200
        });

        // Tween para mostrar o texto secundário após o primeiro aparecer
        this.tweens.add({
            targets: thanksText,
            alpha: 1,
            duration: 800,
            ease: 'Back.Out',
            delay: 1000,
            onComplete: () => {
                // Piscar o texto "Obrigado por jogar!"
                this.tweens.add({
                    targets: thanksText,
                    alpha: { from: 1, to: 0 },
                    duration: 500,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });

                // Aceitar reinício da demo ao pressionar qualquer tecla
                this.input.keyboard.once('keydown', () => {
                    this.game.inGameMusic.stop();
                    this.scene.stop('Game');
                    this.scene.start('Start'); // Volta para tela de seleção ou início da demo
                });
            }
        });
    }
}