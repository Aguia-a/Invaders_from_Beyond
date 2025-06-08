export function pauseSistem(currentScene, newScene) {
  currentScene.scene.pause(); // Pausa a cena atual (ex: GameScene)
  currentScene.scene.launch(`${newScene}`); // Inicia o menu por cima
}

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'menuscene' });

    this.selectedIndex = 0;
    this.menuButtons = [];
  }

  preload() {
    this.load.image('menuBackground', 'assets/menu-bg.png');
    this.load.image('btnResume', 'assets/btnResume.png');
    this.load.image('btnAudioOff', 'assets/btnAudioOnOff.png');
    this.load.image('btnRestart', 'assets/btnRestart.png');
    this.load.image('btnTelaInicial', 'assets/btnTelaInicial.png');
  }

  create() {
    this.createButtons();
    this.input.keyboard.on('keydown', this.handleKeyInput, this);
  }

  createButtons() {
    const centerX = this.cameras.main.centerX;
    const startY = this.cameras.main.centerY - 150; // posição inicial
    const spacing = 100;

    this.menuButtons = [
      this.createButton(centerX, startY + 0 * spacing, 'btnResume', 'Continuar', () => {
        this.resumeGame();
      }),
      this.createButton(centerX, startY + 1 * spacing, 'btnRestart', 'Reiniciar', () => {
        this.game.inGameMusic.stop();
        this.scene.stop('Game');
        this.scene.start('Game');
        this.scene.stop();
      }),
      this.createButton(centerX, startY + 2 * spacing, 'btnAudioOff', 'Áudio', () => {
        if (this.sound.mute) {
          this.sound.setMute(false);
          console.log('Áudio ligado');
        } else {
          this.sound.setMute(true);
          console.log('Áudio desligado');
        }
      }),
      this.createButton(centerX, startY + 3 * spacing, 'btnTelaInicial', 'Tela Inicial', () => {
        this.game.inGameMusic.stop();
        this.scene.stop('Game');
        this.scene.start('Start');
        this.scene.stop();
      }),
    ];

    this.highlightSelected();
  }

  createButtonText(x, y, text) {
    const btnText = this.add.text(x, y, text, {
      fontSize: '35px',
      color: '#FFFFFF',
      fontFamily: 'Pixelify Sans',
      fontStyle: 'normal',
      align: 'center',
      stroke: '#000000',
      strokeThickness: 0,
    }).setOrigin(0.5);

    btnText.setShadow(2, 2, '#000000', 2, true, true);
    return btnText;
  }

  createButton(x, y, texture, label, callback) {
    const btn = this.add.image(x, y, texture)
      .setInteractive()
      .setDisplaySize(210, 90)
      .setScale(0.6); // menor por padrão

    btn.on('pointerover', () => btn.setTint(0xaaaaaa));
    btn.on('pointerout', () => btn.clearTint());
    btn.on('pointerdown', callback);

    const text = this.createButtonText(x, y, label);
    text.setScale(0.6); // mesmo tamanho do botão inicialmente

    btn.label = text;
    return btn;
  }

  highlightSelected() {
    this.menuButtons.forEach((btn, index) => {
      const scale = (index === this.selectedIndex) ? 0.8 : 0.6;
      btn.setScale(scale);
      btn.label.setScale(scale);
    });
  }

  resumeGame() {
    this.scene.stop();
    this.scene.resume('Game');
  }

  handleKeyInput(event) {
    if (event.code === 'ArrowDown') {
      this.selectedIndex = (this.selectedIndex + 1) % this.menuButtons.length;
      this.highlightSelected();
    } else if (event.code === 'ArrowUp') {
      this.selectedIndex = (this.selectedIndex - 1 + this.menuButtons.length) % this.menuButtons.length;
      this.highlightSelected();
    } else if (event.code === 'Enter') {
      const selectedBtn = this.menuButtons[this.selectedIndex];
      selectedBtn.emit('pointerdown');
    } else if (event.code === 'Escape') {
      this.resumeGame(); // ESC também continua o jogo
    }
  }
}
