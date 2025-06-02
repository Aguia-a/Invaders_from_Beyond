export class CutsceneOne extends Phaser.Scene {
  constructor() {
    super('CutsceneOne');
  }

  // Pré-carrega os assets necessários para a cena
  preload() {
    this.load.image('bg', 'assets/space2.png');
    this.load.image('captain', 'assets/kusko.chat.sprite.png');
  }

  create() {
    // Obtém a largura e altura da tela
    const width = this.scale.width;
    const height = this.scale.height;

    // Adiciona o background à cena
    this.background = this.add.tileSprite(width / 2, height / 2, width, height, 'bg');

    // Adiciona o sprite do capitão à cena
    const captain = this.add.image(width * 0.2, height * 0.75, 'captain');
    captain.setScale(Math.min(width / 1280, height / 720));

    // Define a mensagem do capitão
    const message =
      'Aopa, tudo bom? Bem-vindo à nossa base espacial. ' +
      'Você está pronto para escolher sua nave e começar sua missão?';

    // Cria a bolha de fala de forma responsiva
    const bubbleWidth = width * 0.6;
    const bubbleHeight = height * 0.25;
    const bubbleX = width * 0.35;
    const bubbleY = height * 0.4;

    // Cria a bolha da conversa
    const bubble = this.add.graphics();
    bubble.fillStyle(0xFFFFFF, 0.9); // Cor de fundo da bolha
    bubble.lineStyle(4, 0x00FF00, 1); // Cor da borda da bolha
    bubble.fillRoundedRect(340, 300, 800, 200, 20);
    bubble.strokeRoundedRect(340, 300, 800, 200, 20);

    // Define padding interno da bolha
    const paddingX = -110; // Ajuste para posicionamento próximo à borda esquerda
    const paddingY = 10;

    // Cria o objeto de texto dentro da bolha
    this.messageText = this.add.text(bubbleX + paddingX * 1.1, bubbleY + paddingY, '', {
      font: `${Math.floor(height / 36)}px Courier New`,
      fill: '#000000',
      wordWrap: {
        width: bubbleWidth - paddingX,
        useAdvancedWrap: true,
      },
    }).setOrigin(0, 0); // Alinha à esquerda e ao topo

    // Inicializa variáveis para o efeito typewriter
    this.currentMessage = message;
    this.currentIndex = 0;
    this.typeNextChar();

    // Inicia a próxima cena (SelectShip) quando ENTER for pressionado
    this.input.keyboard.once('keydown-ENTER', () => {
      // Ao trocar de cena, os eventos temporizados do Phaser serão cancelados
      this.scene.start('SelectShip');
    });
  }

  typeNextChar() {
    if (this.currentIndex < this.currentMessage.length) {
      // Atualiza o texto com o próximo caractere
      const currentText = this.currentMessage.substring(0, this.currentIndex + 1);
      // Verifica se o objeto de texto ainda existe e está ativo
      if (this.messageText && this.messageText.active) {
        this.messageText.setText(currentText);
      }
      this.currentIndex++;

      // Agenda a próxima chamada usando o temporizador do Phaser
      this.time.delayedCall(70, this.typeNextChar, [], this);
    }
  }

  update() {
    // Anima o background
    this.background.tilePositionY -= 2;
  }
}
