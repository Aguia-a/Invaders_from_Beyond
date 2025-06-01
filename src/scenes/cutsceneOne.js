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
        // Adiciona o background a cena
        this.background = this.add.tileSprite(640, 360, 1280, 720, 'bg');
        //Adiciona o sprite do capitão a cena
        const captain = this.add.image(200, 500, 'captain');

        //Armazena a primeira fala do capitão
        const message =
            'Aopa, tudo bom? Bem-vindo à nossa base espacial. ' +
            'Você está pronto para escolher sua nave e começar sua missão?';

        // Cria a bolha da conversa
        const bubble = this.add.graphics();
        bubble.fillStyle(0xFFFFFF, 0.9); // Cor da bolha da conversa
        bubble.lineStyle(4, 0x00FF00, 1); // Cor da borda da bolha
        bubble.fillRoundedRect(340, 300, 800, 200, 20); // Bolha da conversa
        bubble.strokeRoundedRect(340, 300, 800, 200, 20); // Borda da bolha

        // Cria o texto a ser digitado
        this.messageText = this.add.text(740, 400, '', {
            font: '40px Courier New',
            fill: '#000000',
            align: 'center',
            wordWrap: { width: 780, useAdvancedWrap: true }
        }).setOrigin(0.5);

        // Começa a digitar a mensagem
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

            console.log('Typed:', currentText);

            // Programa o próximo caractere
            setTimeout(() => this.typeNextChar(), 70); // O timeout a velocidade de digitação
        } else {
            // Confirmar se terminou
            // console.log('Terminou de digitar'); // Apenas para debug - Remover os primeiros "//" para ativar
        }
    }

    update() {
        this.background.tilePositionY -= 2;
    }
}