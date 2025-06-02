export class CutsceneOne extends Phaser.Scene {
    constructor() {
        super('CutsceneOne');
    }

    //Precarrega os assets necessários para cena
    preload() {
        this.load.image('bg', 'assets/space2.png');
        this.load.image('captain', 'assets/kusko.chat.sprite.png');
    }

    create() {
        // Obtém a largura e altura da tela
        const width = this.scale.width;
        const height = this.scale.height;

        // Adiciona o background a cena
        this.background = this.add.tileSprite(width / 2, height / 2, width, height, 'bg');

        //Adiciona o sprite do capitão a cena
        const captain = this.add.image(width * 0.2, height * 0.75, 'captain');
        captain.setScale(Math.min(width / 1280, height / 720));

        //Armazena a primeira fala do capitão
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
        bubble.fillStyle(0xFFFFFF, 0.9); // Cor da bolha da conversa
        bubble.lineStyle(4, 0x00FF00, 1); // Cor da borda da bolha
        bubble.fillRoundedRect(340, 300, 800, 200, 20); // Bolha da conversa
        bubble.strokeRoundedRect(340, 300, 800, 200, 20); // Borda da bolha

        // Define padding da bolha
        const paddingX = -110; // Mais próximo da borda esquerda
        const paddingY = 10;

        // Cria o texto mais à esquerda dentro da bolha
        this.messageText = this.add.text(bubbleX + paddingX*1.1, bubbleY + paddingY, '', {
        font: `${Math.floor(height / 36)}px Courier New`,
        fill: '#000000',
        wordWrap: {
        width: bubbleWidth - paddingX * 1,
        useAdvancedWrap: true
        }
        }).setOrigin(0, 0); // Alinha à esquerda e ao topo


        // Começa a digitar a mensagem
        this.messageText.setOrigin(0, 0); // Top-left
        this.currentMessage = message;
        this.currentIndex = 0;
        this.typeNextChar();

        // Inicia a próxima cena (SelectShip) quando ENTER for pressionado
        this.input.keyboard.once('keydown-ENTER', () => {
            this.scene.start('SelectShip');
        });
    }

    typeNextChar() {
       if (this.currentIndex < this.currentMessage.length) {
            const currentText = this.currentMessage.substring(0, this.currentIndex + 1);
            this.messageText.setText(currentText);
            this.currentIndex++;

            setTimeout(() => this.typeNextChar(), 70);
        }
    }

    update() {
        this.background.tilePositionY -= 2;
    }
}