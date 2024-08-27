import { Timer } from '@fils/ani';
import { ThreeDOMLayer } from '@fils/gl-dom';
import { SceneLayer } from '../gfx/SceneLayer';
import { IS_DEV_MODE } from './Globals';
import { Controller } from './Controller';

import Stats from 'three/examples/jsm/libs/stats.module.js';
import { initDragAndDrop } from './FileTypes';

export class App  {
	gl:ThreeDOMLayer;
	layer:SceneLayer;
	clock:Timer;
	controller:Controller;

	constructor() {
		this.clock = new Timer(false);
		this.gl = new ThreeDOMLayer(document.querySelector('.gl'), {
			antialias: true,
			alpha: false
		});
		this.gl.renderer.setClearColor(0xEAEAEA, 1);

		console.log('Hello World! ^_^', IS_DEV_MODE);

		this.layer = new SceneLayer(this.gl);

		initDragAndDrop(document.querySelector('.canvas'), (url:string, isVideo:boolean=false) => {
			this.layer.loadVisual(url, isVideo);
		});
		
		// this.controller = new Controller();

		this.start();
	}

	start() {
		const stats = new Stats();
		stats.showPanel(1);
		document.body.appendChild(stats.dom);

		const animate = () => {
			requestAnimationFrame(animate);
			stats.begin();
			this.update();
			stats.end();
		}

		requestAnimationFrame(animate);

		this.clock.start();
	}

	update() {
		if(!this.clock.running || this.clock.paused) return;
		this.clock.tick();
		const t = this.clock.currentTime;
		const dt = this.clock.currentDelta;
		this.layer.update(t, dt);
		this.layer.render();
	}

}