export default class Boss extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'boss');

    // Configurações iniciais do sprite e física
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setScale(0.2);
    this.setData('isBoss', true);
    this.setCollideWorldBounds(true);

    // Propriedades de vida
    this.maxHealth = 100;
    this.health = this.maxHealth;

    // Configurações de movimentação
    this.baseSpeed = 3;                // Velocidade base do movimento horizontal
    this.direction = 1;                // 1: movimento para a direita, -1: para a esquerda
    this.lastDynamicChange = 0;        // Timer para mudanças dinâmicas quando a vida estiver baixa
  }

  /**
   * Atualiza a posição e o padrão de movimentação do boss.
   * @param {number} time - O tempo atual (ms).
   * @param {number} delta - A variação de tempo desde a última atualização (ms).
   */
  update(time, delta) {
    // Calcula a porcentagem de vida restante (0 a 1)
    const healthPercentage = this.health / this.maxHealth;
    
    // Ajusta a velocidade: quanto menor a vida, maior a velocidade
    const currentSpeed = this.baseSpeed + (1 - healthPercentage) * 4;

    // Movimento horizontal básico
    this.x += this.direction * currentSpeed * (delta / 16);

    // Verifica os limites horizontais e, se atingidos, inverte a direção e desce um pouco
    if (this.x > 1200 || this.x < 80) {
      this.direction *= -1;
      this.y += 10;
    }

    // Movimento em zigue-zague se a vida estiver abaixo de 75%
    if (healthPercentage < 0.75) {
      // O efeito de zigue-zague aumenta conforme a saúde diminui
      const zigzagAmplitude = 5 * (1 - healthPercentage);
      // Utilizando uma função seno para criar a oscilação
      this.x += Math.sin(time * 0.005) * zigzagAmplitude;
    }

    // Movimento dinâmico adicional em situação crítica (vida abaixo de 25%)
    if (healthPercentage < 0.25 && time - this.lastDynamicChange > 500) {
      // Altera a direção de forma imprevisível para aumentar a dificuldade
      // Utilizamos Phaser.Math.Between para gerar uma direção aleatória
      this.direction = Phaser.Math.Between(-currentSpeed, currentSpeed) >= 0 ? 1 : -1;
      this.lastDynamicChange = time;
    }
  }
}