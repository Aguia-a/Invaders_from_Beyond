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
        const type = chooseStarType(scene);
        const star = createStar(scene, x, y, type);
        stars.push(star);
    }

    // Armazena a lista no scene
    scene.stars = stars;
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
    const style = Phaser.Math.Between(0, 1); // 0 ou 1
    const frame = Phaser.Math.Between(0, 3); // 0 a 3
    return { style, frame };
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


// Cria a estrela na posição x, y com estilo e frame
export function createStar(scene, x, y, typeInfo) {
    const { style, frame } = typeInfo;
    const textureKey = `star${style}_frame_${frame}`;
    const animKey = `starTwinkle${style}`;

    const star = scene.add.sprite(x, y, textureKey)
        .setScale(Phaser.Math.FloatBetween(0.5, 3))
        .setAlpha(Phaser.Math.FloatBetween(0.5, 1));

    star.play(animKey);
    return star;
}

// Atualiza as estrelas para "caírem"
export function updateStarsFall(scene) {
    const { width, height } = scene.scale;

    if (!scene.stars) return;

    for (const star of scene.stars) {
        star.y += 0.4;

        if (star.y > height) {
            star.y = 0;
            star.x = Phaser.Math.Between(0, width);
        }
    }
}

export function generateStars(scene) {
    const starCount = 70;
    const minDistance = 20;
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

        const type = chooseStarType(); // tipo = { style, frame }
        const star = createStar(scene, x, y, type);
        stars.push(star);
    }

    scene.stars = stars;
}

