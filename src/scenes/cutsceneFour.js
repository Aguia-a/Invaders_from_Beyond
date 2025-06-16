export class CutsceneFour extends Phaser.Scene {
  constructor() {
    super('CutsceneFour');
  }

  // Pré-carrega os assets necessários para a cena
  preload() {
    this.load.image('background', 'assets/startWallpaper.png');
    this.load.image('stars', 'assets/purpleStars.png');
    this.load.image('captain', 'assets/kusko.chat.sprite.png');
  }

  create() {
    const som = this.sound.add('digitandoSom');
    som.play({ seek: 2, volume: 0.5 });

    // Para parar após 1 segundo:
    this.time.delayedCall(2500, () => {
      som.stop();
    });

    // Fundo tipo "cover"
    this.background = this.add.image(0, 0, 'background');
    this.scaleBackgroundToCover(this.background);

    // Configuração das estrelas
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

    // Configurações responsivas baseadas no tamanho da tela
    this.setupResponsiveLayout();

    // Inicializa variáveis para o efeito typewriter
    // Mensagem do capitão
    this.currentMessage =
      '[Comandante]\n' +
      'Ataque inimigo detectado\n' +
      'Hora de escolher uma nave e destruir os invasores.\n';

    this.currentIndex = 0;
    this.typeNextChar();

    // Inicia a próxima cena (dicas) quando ENTER for pressionado
    this.input.keyboard.once('keydown-ENTER', () => {
      som.stop();
      this.scene.start('TipsScene');
    });

    // Listener para redimensionamento da tela
    this.scale.on('resize', this.handleResize, this);
  }

  setupResponsiveLayout() {
    const width = this.scale.width;
    const height = this.scale.height;

    // Determina se é mobile, tablet ou desktop
    const isMobile = width < 768;
    const isTablet = width >= 768 && width < 1024;

    // Configurações do capitão - sempre na parte inferior
    let captainConfig = this.getCaptainConfig(width, height, isMobile, isTablet);

    // Remove capitão anterior se existir
    if (this.captain) {
      this.captain.destroy();
    }

    // Adiciona o sprite do capitão sempre na base da tela
    this.captain = this.add.image(captainConfig.x, captainConfig.y, 'captain');
    this.captain.setScale(captainConfig.scale);
    this.captain.setOrigin(0.5, 1); // Origem na base do sprite para ficar sempre no chão

    // Configurações da bolha - sempre à direita do personagem
    let bubbleConfig = this.getBubbleConfig(width, height, isMobile, isTablet, captainConfig);

    // Remove bolha anterior se existir
    if (this.bubble) {
      this.bubble.destroy();
    }
    if (this.messageText) {
      this.messageText.destroy();
    }

    // Cria a bolha da conversa (sem triângulo)
    this.bubble = this.add.graphics();
    this.bubble.fillStyle(0xFFFFFF, 0.95);
    this.bubble.lineStyle(bubbleConfig.borderWidth, 0x00FF00, 1);

    // Desenha apenas a bolha retangular com cantos arredondados
    this.bubble.fillRoundedRect(
      bubbleConfig.x,
      bubbleConfig.y,
      bubbleConfig.width,
      bubbleConfig.height,
      bubbleConfig.cornerRadius
    );
    this.bubble.strokeRoundedRect(
      bubbleConfig.x,
      bubbleConfig.y,
      bubbleConfig.width,
      bubbleConfig.height,
      bubbleConfig.cornerRadius
    );

    // Configurações do texto
    const textConfig = this.getTextConfig(width, height, isMobile, bubbleConfig);

    // Cria o objeto de texto dentro da bolha
    this.messageText = this.add.text(textConfig.x, textConfig.y, '', {
      font: `${textConfig.fontSize}px Arial, sans-serif`,
      fill: '#000000',
      lineSpacing: textConfig.lineSpacing,
      wordWrap: {
        width: textConfig.wrapWidth,
        useAdvancedWrap: true,
      },
    }).setOrigin(0, 0);
  }

  getCaptainConfig(width, height, isMobile, isTablet) {
    let config = {};

    if (isMobile) {
      // Mobile: personagem na esquerda, parte inferior
      config.x = width * 0.25;
      config.y = height; // Sempre na base da tela
      config.scale = Math.min(width / 800, height / 600) * 0.7;
    } else if (isTablet) {
      // Tablet: personagem na esquerda, parte inferior
      config.x = width * 0.2;
      config.y = height; // Sempre na base da tela
      config.scale = Math.min(width / 1000, height / 700) * 0.8;
    } else {
      // Desktop: personagem na esquerda, parte inferior
      config.x = width * 0.15;
      config.y = height; // Sempre na base da tela
      config.scale = Math.min(width / 1280, height / 720) * 0.9;
    }

    // Garante escala mínima e máxima
    config.scale = Math.max(0.3, Math.min(config.scale, 1.2));

    return config;
  }

  getBubbleConfig(width, height, isMobile, isTablet, captainConfig) {
    let config = {};

    // Calcula a largura disponível à direita do personagem
    const availableWidth = width - captainConfig.x - (captainConfig.x * 0.3);

    if (isMobile) {
      // Mobile: bolha com espaçamento adequado
      config.width = Math.min(availableWidth * 0.9, width * 0.65);
      config.height = height * 0.3;
      config.x = captainConfig.x + (captainConfig.x * 0.25); // Espaçamento ajustado
      config.y = height * 0.4;
      config.cornerRadius = 15;
      config.borderWidth = 3;
    } else if (isTablet) {
      // Tablet: bolha com espaçamento adequado
      config.width = Math.min(availableWidth * 0.85, width * 0.6);
      config.height = height * 0.25;
      config.x = captainConfig.x + (captainConfig.x * 0.35); // Espaçamento ajustado
      config.y = height * 0.35;
      config.cornerRadius = 18;
      config.borderWidth = 4;
    } else {
      // Desktop: bolha com espaçamento adequado
      config.width = Math.min(availableWidth * 0.8, width * 0.55);
      config.height = height * 0.22;
      config.x = captainConfig.x + (captainConfig.x * 0.45); // Espaçamento ajustado
      config.y = height * 0.3;
      config.cornerRadius = 20;
      config.borderWidth = 4;
    }

    // Garante dimensões mínimas e que não saia da tela
    config.width = Math.max(250, Math.min(config.width, width - config.x - 20));
    config.height = Math.max(100, config.height);

    // Ajusta posição Y para que a bolha não fique muito baixa
    config.y = Math.min(config.y, height - config.height - 50);

    return config;
  }

  getTextConfig(width, height, isMobile, bubbleConfig) {
    let config = {};

    // Padding interno da bolha
    const paddingX = isMobile ? 15 : 20;
    const paddingY = isMobile ? 15 : 20;

    config.x = bubbleConfig.x + paddingX;
    config.y = bubbleConfig.y + paddingY;
    config.wrapWidth = bubbleConfig.width - (paddingX * 2);

    // Tamanho da fonte baseado no tamanho da tela
    if (isMobile) {
      config.fontSize = Math.max(14, Math.floor(height / 45));
      config.lineSpacing = 4;
    } else {
      config.fontSize = Math.max(16, Math.floor(height / 40));
      config.lineSpacing = 6;
    }

    return config;
  }

  handleResize() {
    // Reconfigura o layout quando a tela é redimensionada
    this.setupResponsiveLayout();

    // Reinicia o efeito typewriter se necessário
    if (this.messageText) {
      this.currentIndex = 0;
      this.messageText.setText('');
      this.typeNextChar();
    }
  }

  typeNextChar() {
    if (this.currentIndex < this.currentMessage.length) {
      const currentText = this.currentMessage.substring(0, this.currentIndex + 1);
      if (this.messageText && this.messageText.active) {
        this.messageText.setText(currentText);
      }
      this.currentIndex++;
      this.time.delayedCall(25, this.typeNextChar, [], this);
    }
  }

  update() {
    if (this.stars) {
      this.stars.tilePositionY -= 0.2;
    }
  }

  scaleBackgroundToCover(bg) {
    const scaleX = this.scale.width / bg.width;
    const scaleY = this.scale.height / bg.height;
    const scale = Math.max(scaleX, scaleY);
    bg.setScale(scale).setOrigin(0.5).setPosition(this.scale.width / 2, this.scale.height / 2);
  }

  destroy() {
    // Limpa os listeners quando a cena é destruída
    this.scale.off('resize', this.handleResize, this);
    super.destroy();
  }
}