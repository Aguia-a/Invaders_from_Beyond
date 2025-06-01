import { Start } from './scenes/Start.js';
import { SelectShip } from './scenes/SelectShip.js';
import { Game } from './scenes/game.js';

const config = {
    type: Phaser.AUTO,
    title: 'Overlord Rising',
    parent: 'game-container',
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: '#000000',
    pixelArt: false,
    scene: [Start, SelectShip, Game],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 }, // sem gravidade
            debug: false
        }
    }
};

new Phaser.Game(config);
