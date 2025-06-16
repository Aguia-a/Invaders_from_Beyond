export class TipsScene extends Phaser.Scene {
    constructor() {
        super('TipsScene');
    }

    preload() {
        this.load.image('background', 'assets/startWallpaper.png');
        this.load.image('stars', 'assets/purpleStars.png');
    }

    create() {
        const { width, height } = this.scale;

        // Fundo preenchendo a tela
        this.background = this.add.image(width / 2, height / 2, 'background');
        this.background.setDisplaySize(width, height);

        // Estrelas animadas
        this.stars = this.add.tileSprite(0, 0, width, height, 'stars')
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

        // Título
        this.add.text(width / 2, 100, 'Dicas de Como Jogar', {
            fontFamily: 'Pixelify Sans',
            fontSize: '40px',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);

        // Texto com dicas com espaçamento maior
        const tipsText = `
- Use as setas ('<' , '>') para mover a nave.

- Pressione ESPAÇO para atirar.

- Desvie dos tiros inimigos!

- Derrote todos os inimigos para passar de fase.

- Cuidado com o BOSS, ele é mais forte e possui 3 fases!

- Pressione a tecla 'esc' ou selecione o botão no canto
  superior esquerdo para visulizar as opções do MENU.
        `;

        this.add.text(width / 2, 180, tipsText, {
            fontFamily: 'Pixelify Sans',
            fontSize: '32px',
            color: '#ffffff',
            wordWrap: { width: width * 0.8 },
            align: 'left',
            lineSpacing: 15
        }).setOrigin(0.5, 0);

        // Texto de continuar
        this.add.text(width / 2, height - 80, '[Clique para continuar]', {
            fontFamily: 'Pixelify Sans',
            fontSize: '24px',
            color: '#aaaaaa'
        }).setOrigin(0.5);

        // Avança para SelectShip ao clicar
        this.input.once('pointerdown', () => {
            this.scene.start('SelectShip');
        });
    }
}
