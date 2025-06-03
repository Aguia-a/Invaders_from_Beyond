export function openPauseMenu(currentScene) {
  console.log('[DEBUG] openPauseMenu foi chamado');
  currentScene.scene.pause();              // Pausa a cena atual (ex: GameScene)
  currentScene.scene.launch('menuscene');  // Inicia o menu por cima
}

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'menuscene' });
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
  }

  createButtons() {
    this.createBtnResume();
    this.createBtnAudioOff();
    this.createBtnRestart();
    this.createBtnTelaInicial();
  }

  // Função para criar textos estilizados de botão
  createButtonText(x, y, text) {
    const btnText = this.add.text(x, y, text, {
      fontSize: '35px',
      color: '#FFFFFF',
      fontFamily: 'Pixelify Sans',
      fontStyle: 'normal',
      align: 'center',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5);

    // Sombra para melhor legibilidade
    btnText.setShadow(2, 2, '#000000', 2, true, true);

    return btnText;
  }

  createBtnResume() {
    const btnWidth = 200;
    const btnHeight = 80;
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY - 100;

    const btn = this.add.image(centerX, centerY, 'btnResume').setInteractive();
    btn.setDisplaySize(btnWidth, btnHeight);

    btn.on('pointerover', () => btn.setTint(0xaaaaaa));
    btn.on('pointerout', () => btn.clearTint());

    btn.on('pointerdown', () => {
      this.scene.stop();
      this.scene.resume('Game');
    });

    this.createButtonText(centerX, centerY, 'Continuar');
  }

  createBtnAudioOff() {
    const btnWidth = 200;
    const btnHeight = 80;
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY + 100;

    const btn = this.add.image(centerX, centerY, 'btnAudioOff').setInteractive();
    btn.setDisplaySize(btnWidth, btnHeight);

    btn.on('pointerover', () => btn.setTint(0xaaaaaa));
    btn.on('pointerout', () => btn.clearTint());

    btn.on('pointerdown', () => {
      console.log('Botão áudio desligado clicado');
      if (this.sound.mute) {
        this.sound.setMute(false);
        console.log('Áudio ligado');
      } else {
        this.sound.setMute(true);
        console.log('Áudio desligado');
      }
    });

    this.createButtonText(centerX, centerY, 'Áudio');
  }

  createBtnRestart() {
    const btnWidth = 200;
    const btnHeight = 80;
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;

    const btn = this.add.image(centerX, centerY, 'btnRestart').setInteractive();
    btn.setDisplaySize(btnWidth, btnHeight);

    btn.on('pointerover', () => btn.setTint(0xaaaaaa));
    btn.on('pointerout', () => btn.clearTint());

    btn.on('pointerdown', () => {
      console.log('Botão reiniciar clicado');
      this.scene.stop('Game');
      this.scene.start('Game');
      this.scene.stop();
    });

    this.createButtonText(centerX, centerY, 'Reiniciar');
  }

  createBtnTelaInicial() {
    const btnWidth = 200;
    const btnHeight = 80;
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY + 200;

    const btn = this.add.image(centerX, centerY, 'btnTelaInicial').setInteractive();
    btn.setDisplaySize(btnWidth, btnHeight);

    btn.on('pointerover', () => btn.setTint(0xaaaaaa));
    btn.on('pointerout', () => btn.clearTint());

    btn.on('pointerdown', () => {
      console.log('Botão tela inicial clicado');
      this.scene.stop('Game');
      this.scene.start('Start');
      this.scene.stop();
    });

    this.createButtonText(centerX, centerY, 'Tela Inicial');
  }
}
