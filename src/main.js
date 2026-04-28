import { Store } from './core/state.js';
import { Validator } from './core/validator.js';
import { ExerciseEngine } from './core/engine.js';
import { Renderer } from './ui/renderer.js';
import { AppController } from './ui/events.js';

document.addEventListener('DOMContentLoaded', () => {
    // APP_DATA est global (provenant de data.js)
    const store = new Store();
    const validator = new Validator();
    const engine = new ExerciseEngine(APP_DATA, store);
    const renderer = new Renderer(APP_DATA, store);
    const app = new AppController(store, engine, validator, renderer, APP_DATA);

    window.app = app; // Pour les appels onclick du HTML
    app.init();

    console.log("ConjuMaster Modular Loaded");
});
