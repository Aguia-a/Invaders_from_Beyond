
// Cena de Game Over
export default class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'gameOverScene' });
    }

    create() {
        console.log("Moreuu")
        const { width, height } = this.cameras.main;

        // Overlay escuro ao fundo
        const overlay = this.add.image(width / 2, height / 2, 'gameOverBg')
            .setDisplaySize(width, height)
            .setScrollFactor(0)
            .setDepth(10)
            .setAlpha(0);

        // Texto "Game Over"
        const gameOverText = this.add.image(width / 2, height / 2, 'gameOverText')
            .setOrigin(0.5)
            .setDepth(11)
            .setScale(0.1)
            .setAlpha(0);

        // Texto "Press Any Key For Restart"
        const pressKeyText = this.add.text(width / 2, height / 2 + 70, 'Press Any Key For Restart', {
            font: '20px Pixelify',
            fill: '#FFFFFF'
        })
            .setOrigin(0.5)
            .setDepth(11)
            .setAlpha(0)

        // Animação de entrada (overlay)
        this.tweens.add({
            targets: overlay,
            alpha: 0.4,
            duration: 500,
            ease: 'Linear'
        });

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
