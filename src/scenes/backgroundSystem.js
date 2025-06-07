export function setupBackgroundSystem(scene, scale) {
    // Cria o fundo
    createBackground(scene);

    // Gera os frames dos dois tipos de estrela
    generateStarTypeAFrames(scene);
    generateStarTypeBFrames(scene);

    // Cria e posiciona as estrelas na cena
    const stars = [];
    for (let i = 0; i < 50; i++) {
        const x = Phaser.Math.Between(0, scene.scale.width);
        const y = Phaser.Math.Between(0, scene.scale.height);
        const type = chooseStarType();
        const color = getRandomStarColor();  // Escolhe a cor aqui
        const star = createStar(scene, x, y, type, color); // Passa a cor para a criação da estrela
        stars.push(star);
    }

    // Armazena a lista no scene
    scene.stars = stars;
}

function createBackground(scene) {
    const { width, height } = scene.scale;

    // Fator de ampliação (10% a mais em cada direção)
    const marginFactor = 1.1;

    // Cria imagem de fundo principal com margem extra
    scene.background = scene.add.image(width / 2, height / 2, 'background02')
        .setDisplaySize(width * marginFactor, height * marginFactor)
        .setOrigin(0.5, 0.5)
        .setScrollFactor(0);
}

export function getRandomStarColor() {
    // Paleta de cores possíveis (hex)
    const colors = [
        0xffffff, // branco
        0xfff9c4, // amarelo claro
        0xfff176, // amarelo mais forte
        0x66ccff, // azul claro
        0x99ccff, // azul clarinho
        0xcc99ff, // lilás claro
        0xe0e0e0, // cinza claro (quase branco)
    ];

    // Retorna uma cor aleatória da paleta
    return Phaser.Utils.Array.GetRandom(colors);
}

// Escolhe aleatoriamente um tipo de estrela e o estilo (A ou B)
export function chooseStarType(probTable = [0.8, 0.2]) {
    const roll = Math.random(); // Número entre 0 e 1
    let cumulative = 0;
    let style = 0;

    for (let i = 0; i < probTable.length; i++) {
        cumulative += probTable[i];
        if (roll < cumulative) {
            style = i;
            break;
        }
    }

    const frame = Phaser.Math.Between(0, 3);

    let minScale, maxScale, minAlpha, maxAlpha;

    switch (style) {
        case 0: // Tipo A
            minScale = 0.3;
            maxScale = 0.7;
            minAlpha = 0.1;
            maxAlpha = 0.4;
            break;

        case 1: // Tipo B
            minScale = 1.2;
            maxScale = 2.3;
            minAlpha = 0.6;
            maxAlpha = 1.0;
            break;

        // Adicione mais cases conforme necessário
        default:
            minScale = 1.0;
            maxScale = 1.0;
            minAlpha = 1.0;
            maxAlpha = 1.0;
    }

    return { style, frame, minScale, maxScale, minAlpha, maxAlpha };
}


// Cria a estrela na posição x, y com estilo, frame e cor
export function createStar(scene, x, y, typeInfo, color = 0xffffff) {
    const { style, frame, minScale, maxScale, minAlpha, maxAlpha } = typeInfo;
    const textureKey = `star${style}_frame_${frame}`;
    const animKey = `starTwinkle${style}`;

    // Sorteia a escala
    const scale = Phaser.Math.FloatBetween(minScale, maxScale);

    // Normaliza a escala para um valor entre 0 e 1
    const normalizedScale = (scale - minScale) / (maxScale - minScale);

    // Interpola o alpha baseado na escala
    const alpha = minAlpha + normalizedScale * (maxAlpha - minAlpha);

    const star = scene.add.sprite(x, y, textureKey)
        .setScale(scale)
        .setAlpha(alpha)
        .setTint(color); // Aplica a cor da estrela

    star.play(animKey);
    return star;
}

// Gera os frames para estrelas tipo A (círculo cintilante)
export function generateStarTypeAFrames(scene) {
    const frameSize = 32;
    const center = frameSize / 2;

    for (let i = 0; i < 4; i++) {
        const rt = scene.make.graphics({ x: 0, y: 0, add: false });
        const alpha = 0.3 + 0.2 * i;
        rt.fillStyle(0xffffff, alpha);
        rt.fillCircle(center, center, 2 + i);
        rt.generateTexture(`star0_frame_${i}`, frameSize, frameSize);
        rt.destroy();
    }

    scene.anims.create({
        key: 'starTwinkle0',
        frames: [
            { key: 'star0_frame_0' },
            { key: 'star0_frame_1' },
            { key: 'star0_frame_2' },
            { key: 'star0_frame_3' },
            { key: 'star0_frame_2' },
            { key: 'star0_frame_1' },
        ],
        frameRate: 6,
        repeat: -1
    });
}

export function generateStarTypeBFrames(scene) {
    const frameSize = 32;
    const center = frameSize / 2;

    for (let i = 0; i < 4; i++) {
        const rt = scene.make.graphics({ x: 0, y: 0, add: false });
        const alpha = 0.3 + 0.2 * i;
        rt.fillStyle(0xffffff, alpha);

        const size = 5 + i;
        const thickness = 2;
        rt.fillRect(center - thickness / 2, center - size / 2, thickness, size);
        rt.fillRect(center - size / 2, center - thickness / 2, size, thickness);

        rt.generateTexture(`star1_frame_${i}`, frameSize, frameSize);
        rt.destroy();
    }

    scene.anims.create({
        key: 'starTwinkle1',
        frames: [
            { key: 'star1_frame_0' },
            { key: 'star1_frame_1' },
            { key: 'star1_frame_2' },
            { key: 'star1_frame_3' },
            { key: 'star1_frame_2' },
            { key: 'star1_frame_1' },
        ],
        frameRate: 6,
        repeat: -1
    });
}

// Função que gera estrelas evitando que fiquem muito próximas, agora com cor correta
export function generateStars(scene) {
    const starCount = 30;
    const minDistance = 40;
    const stars = [];
    const { width, height } = scene.scale;
    let attempts = 0;
    const maxAttempts = starCount * 10;

    while (stars.length < starCount && attempts < maxAttempts) {
        attempts++;
        const x = Phaser.Math.Between(0, width);
        const y = Phaser.Math.Between(0, height);

        let tooClose = false;
        for (const s of stars) {
            const dx = x - s.x;
            const dy = y - s.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < minDistance) {
                tooClose = true;
                break;
            }
        }

        if (tooClose) continue;

        const type = chooseStarType();
        const color = getRandomStarColor();
        const star = createStar(scene, x, y, type, color);  // Passa a cor aqui
        stars.push(star);
    }

    scene.stars = stars;
}

// Atualiza as estrelas para "caírem"
export function updateStarsFall(scene) {
    const { width, height } = scene.scale;

    if (!scene.stars) return;

    for (const star of scene.stars) {
        star.y += 0.05;

        if (star.y > height) {
            star.y = 0;
            star.x = Phaser.Math.Between(0, width);
        }
    }
}