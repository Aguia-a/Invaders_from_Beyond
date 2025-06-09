export class CutsceneThree extends Phaser.Scene {
  constructor() {
    super('CutsceneThree');
  }

  // Pré-carrega os assets necessários para a cena
  preload() {
    this.load.image('background', 'assets/startWallpaper.png');
    this.load.image('stars', 'assets/purpleStars.png');
    this.load.image('overlord', 'assets/overlordShadow.png');
  }

  create() {
    const som = this.sound.add('digitandoSom');
    som.play({ seek: 2, volume: 0.5 });

    // Para parar após 1 segundo:
    this.time.delayedCall(3000, () => {
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
    // Mensagem do overlord
    this.currentMessage =
      '[Transmissão Invasora]\n' +
      '— Hostilidade confirmada.\n' +
      'Iniciando protocolo de ondas...\n' +
      'Observaremos sua agonia com...\n' +
      'interesse.\n';

    this.currentIndex = 0;
    this.typeNextChar();

    // Inicia a próxima cena (CutsceneFour) quando ENTER for pressionado
    this.input.keyboard.once('keydown-ENTER', () => {
      som.stop();
      this.scene.start('CutsceneFour');
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

    // Configurações do overlord - sempre na parte inferior direita
    let overlordConfig = this.getOverlordConfig(width, height, isMobile, isTablet);

    // Remove overlord anterior se existir
    if (this.overlord) {
      this.overlord.destroy();
    }

    // Adiciona o sprite do overlord sempre na base da tela à direita
    this.overlord = this.add.image(overlordConfig.x, overlordConfig.y, 'overlord');
    this.overlord.setScale(overlordConfig.scale);
    this.overlord.setOrigin(0.5, 1); // Origem na base do sprite para ficar sempre no chão

    // Configurações da bolha - sempre à esquerda do personagem
    let bubbleConfig = this.getBubbleConfig(width, height, isMobile, isTablet, overlordConfig);

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

  getOverlordConfig(width, height, isMobile, isTablet) {
    let config = {};

    if (isMobile) {
      // Mobile: personagem na direita
      config.x = width * 0.75;
      // Ajuste para sprite 500x500px
      config.scale = Math.min(width / 1000, height / 800) * 0.6;
      // Posiciona para que o topo fique na mesma altura que o captain original
      config.y = height - (500 * config.scale * 0.3); // Ajuste para manter o topo alinhado
    } else if (isTablet) {
      // Tablet: personagem na direita
      config.x = width * 0.8;
      // Ajuste para sprite 500x500px
      config.scale = Math.min(width / 1200, height / 900) * 0.7;
      // Posiciona para que o topo fique na mesma altura que o captain original
      config.y = height - (500 * config.scale * 0.25); // Ajuste para manter o topo alinhado
    } else {
      // Desktop: personagem na direita
      config.x = width * 0.85;
      // Ajuste para sprite 500x500px
      config.scale = Math.min(width / 1500, height / 1000) * 0.8;
      // Posiciona para que o topo fique na mesma altura que o captain original
      config.y = height - (500 * config.scale * 0.2); // Ajuste para manter o topo alinhado
    }

    // Garante escala mínima e máxima para o sprite 500x500px
    config.scale = Math.max(0.25, Math.min(config.scale, 1.0));

    return config;
  }

  getBubbleConfig(width, height, isMobile, isTablet, overlordConfig) {
    let config = {};

    if (isMobile) {
      // Mobile: bolha centralizada horizontalmente
      config.width = Math.min(width * 0.8, 400);
      config.height = height * 0.3;
      config.x = (width - config.width) / 2; // Centraliza horizontalmente
      config.y = height * 0.4;
      config.cornerRadius = 15;
      config.borderWidth = 3;
    } else if (isTablet) {
      // Tablet: bolha centralizada horizontalmente
      config.width = Math.min(width * 0.7, 500);
      config.height = height * 0.25;
      config.x = (width - config.width) / 2; // Centraliza horizontalmente
      config.y = height * 0.35;
      config.cornerRadius = 18;
      config.borderWidth = 4;
    } else {
      // Desktop: bolha centralizada horizontalmente
      config.width = Math.min(width * 0.6, 600);
      config.height = height * 0.22;
      config.x = (width - config.width) / 2; // Centraliza horizontalmente
      config.y = height * 0.3;
      config.cornerRadius = 20;
      config.borderWidth = 4;
    }

    // Garante dimensões mínimas
    config.width = Math.max(250, config.width);
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