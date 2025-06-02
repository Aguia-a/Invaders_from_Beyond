export class FirePlayer {
    constructor(scene, playerSprite, damage = 10) {
        this.scene = scene;
        this.playerSprite = playerSprite;

        this.damage = damage;  // variável de dano da bala

        // Criar o grupo de balas do jogador
        this.bullets = this.scene.physics.add.group();

        // Controlar taxa de tiro (cooldown)
        this.lastFired = 0;
        this.fireRate = 500; // milissegundos entre tiros

        // Criar a tecla de disparo
        this.fireKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // Criar textura da bala (um retângulo amarelo)
        const graphics = this.scene.make.graphics({ x: 0, y: 0, add: false });
        graphics.fillStyle(0xffff00, 1);
        graphics.fillRect(0, 0, 4, 16);
        graphics.generateTexture('bullet', 4, 16);
        graphics.destroy();
    }

    update(time) {
        // Checa se o jogador apertou espaço e se já pode atirar (cooldown)
        if (this.fireKey.isDown && time > this.lastFired + this.fireRate) {
            this.fireBullet();
            this.lastFired = time;
        }

        // Move as balas para cima
        this.bullets.children.each(bullet => {
            if (bullet.active) {
                bullet.y -= 10;
                // Remove bala se sair da tela
                if (bullet.y < 0) {
                    bullet.destroy();
                }
            }
        });
    }

    fireBullet() {
        // Cria a bala na posição do jogador (acima do sprite)
        const bullet = this.bullets.create(this.playerSprite.x, this.playerSprite.y - 30, 'bullet');
        bullet.setScale(1);
        bullet.setDepth(1);
        bullet.setVelocityY(-300);

        // Atribuir o dano da bala para poder usar em colisões
        bullet.damage = this.damage;
    }
}
