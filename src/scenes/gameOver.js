
// Cena de Game Over
export default class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'gameOverScene' });
    }

    preload() {
        this.load.audio('gameOverSound', 'assets/gameOverSound.mp3')
    }

    create() {
        const { width, height } = this.cameras.main;

        this.gameOverSound = this.sound.add('gameOverSound', {volume:0.3})
        this.gameOverSound.play()


        //Fundo Escuro
        this.add.rectangle(0, 0, width * 2, height * 2, 0x000000, 0.5)
            .setOrigin(0)
            .setDepth(10);

        // Texto "Game Over"
        const gameOverText = this.add.image(width / 2, height / 2, 'gameOverText')
            .setOrigin(0.5)
            .setDepth(11)
            .setScale(0.1)
            .setAlpha(0);

        // Texto "Press Any Key For Restart"
        const pressKeyText = this.add.text(width / 2, height / 2 + 70, 'Press Any Key For Restart', {
            font: '20px Pixelify sans',
            fill: '#FFFFFF'
        })
            .setOrigin(0.5)
            .setDepth(11)
            .setAlpha(0)

        // Animação de entrada dos textos
        // Tween apenas para o gameOverText (imagem)
        this.tweens.add({
            targets: gameOverText,
            alpha: 1,
            scale: 0.3,
            duration: 800,
            ease: 'Back.Out',
            delay: 200
        });

        // Tween apenas para o pressKeyText (texto), sem mexer na escala
        this.tweens.add({
            targets: pressKeyText,
            alpha: 1,
            duration: 800,
            ease: 'Back.Out',
            delay: 200,
            onComplete: () => {
                // Começa a piscar o texto
                this.tweens.add({
                    targets: pressKeyText,
                    alpha: { from: 1, to: 0 },
                    duration: 500,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });

                // Aceita reinício ao pressionar qualquer tecla
                this.input.keyboard.once('keydown', () => {
                    this.game.bgMusic.play()
                    this.game.inGameMusic.stop()
                    this.scene.stop("Game"); // Fecha GameOverScene
                    this.scene.start('SelectShip'); // Reinicia jogo
                });
            }
        });

    }
}
