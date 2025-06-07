export function setupBackgroundSystem(scene, scale) {
    // Controla todo o sistema de fundo
    createBackground(scene);
}

function createBackground(scene) {
    const { width, height } = scene.scale;

    // Cria imagem de fundo principal
    scene.background = scene.add.image(width / 2, height / 2, 'background02')
        .setDisplaySize(width, height)
        .setOrigin(0.5, 0.5)
        .setScrollFactor(0);
}

// Escolhe aleatoriamente um tipo de estrela e o estilo (A ou B)
export function chooseStarType() {
    const style = Phaser.Math.Between(0, 1) === 0 ? 'A' : 'B';
    const frame = Phaser.Math.Between(0, 3);
    return { style, frame };
}

// Gera os frames para estrelas tipo A (círculo cintilante)
export function generateStarTypeAFrames(scene) {
    const frameSize = 32;

    for (let i = 0; i < 4; i++) {
        const rt = scene.make.graphics({ x: 0, y: 0, add: false });
        const alpha = 0.3 + i * 0.2;
        const center = frameSize / 2;
        rt.fillStyle(0xffffff, alpha);
        rt.fillCircle(center, center, 3 + i);
        rt.generateTexture(`starA_frame_${i}`, frameSize, frameSize);
        rt.destroy();
    }

    scene.anims.create({
        key: 'starTwinkleA',
        frames: [
            { key: 'starA_frame_0' },
            { key: 'starA_frame_1' },
            { key: 'starA_frame_2' },
            { key: 'starA_frame_3' },
            { key: 'starA_frame_2' },
            { key: 'starA_frame_1' },
        ],
        frameRate: 6,
        repeat: -1
    });
}

// Gera os frames para estrelas tipo B (estrela pontuda)
export function generateStarTypeBFrames(scene) {
    const frameSize = 32;

    for (let i = 0; i < 4; i++) {
        const rt = scene.make.graphics({ x: 0, y: 0, add: false });
        const alpha = 0.3 + i * 0.2;
        const center = frameSize / 2;
        const points = 5;
        const outerRadius = 6 + i;
        const innerRadius = 3 + i * 0.5;
        const step = Math.PI / points;

        rt.fillStyle(0xffffff, alpha);
        rt.beginPath();
        for (let j = 0; j < 2 * points; j++) {
            const r = j % 2 === 0 ? outerRadius : innerRadius;
            const px = center + Math.cos(j * step - Math.PI / 2) * r;
            const py = center + Math.sin(j * step - Math.PI / 2) * r;
            if (j === 0) rt.moveTo(px, py);
            else rt.lineTo(px, py);
        }
        rt.closePath();
        rt.fillPath();

        rt.generateTexture(`starB_frame_${i}`, frameSize, frameSize);
        rt.destroy();
    }

    scene.anims.create({
        key: 'starTwinkleB',
        frames: [
            { key: 'starB_frame_0' },
            { key: 'starB_frame_1' },
            { key: 'starB_frame_2' },
            { key: 'starB_frame_3' },
            { key: 'starB_frame_2' },
            { key: 'starB_frame_1' },
        ],
        frameRate: 6,
        repeat: -1
    });
}

// Cria a estrela na posição x, y com estilo e frame
export function createStar(scene, x, y, typeInfo) {
    const { style, frame } = typeInfo;
    const textureKey = `star${style}_frame_${frame}`;
    const animKey = `starTwinkle${style}`;

    const star = scene.add.sprite(x, y, textureKey)
        .setScale(Phaser.Math.FloatBetween(0.5, 1.2))
        .setAlpha(Phaser.Math.FloatBetween(0.5, 1));

    star.play(animKey);

    return star;
}

// Atualiza as estrelas para "caírem"
export function updateStarsFall(scene) {
    const { width, height } = scene.scale;

    if (!scene.stars) return;

    scene.stars.forEach(star => {
        star.y += 0.5;
        if (star.y > height) {
            star.y = 0;
            star.x = Phaser.Math.Between(0, width);
        }
    });
}

// Função que atualiza a queda das estrelas e reposiciona quando saem da tela
/*export function updateStarsFall(scene, starsArray) {
    if (!starsArray) return;

    const { width, height } = scene.scale;

    starsArray.forEach(star => {
        star.y += 0.5; // velocidade constante, pode ajustar

        if (star.y > height) {
            star.y = 0;
            star.x = Phaser.Math.Between(0, width);
        }
    });
}*/
