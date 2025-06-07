import { Start } from './scenes/start.js';
import { SelectShip } from './scenes/selectship.js';
import { Game } from './scenes/game.js';
import { CutsceneOne } from './scenes/cutsceneOne.js';
import GameOverScene from './scenes/gameOver.js';
import MenuScene from './scenes/menuscene.js';


const config = {
    type: Phaser.AUTO,
    title: 'Overlord Rising',
    parent: 'game-container',
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: '#000000',
    pixelArt: true,
    scene: [Start, CutsceneOne, SelectShip, Game, MenuScene, GameOverScene],
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
