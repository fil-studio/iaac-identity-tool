import { Timer } from '@fils/ani';
import { ThreeDOMLayer } from '@fils/gl-dom';
import { SceneLayer } from '../gfx/SceneLayer';
import { IS_DEV_MODE } from './Globals';
import { Controller } from './Controller';

import Stats from 'three/examples/jsm/libs/stats.module.js';
import { initDragAndDrop } from './FileTypes';
import { Visual, VisualListener, VisualSettings } from '../gfx/Visual';
import { CropView } from '../gfx/CropView';

export class App implements VisualListener  {
	gl:ThreeDOMLayer;
	layer:SceneLayer;
	clock:Timer;
	controller:Controller;

	cropView:CropView;

	constructor() {
		this.clock = new Timer(false);
		/* this.gl = new ThreeDOMLayer(document.querySelector('.gl'), {
			antialias: true,
			alpha: false
		});
		this.gl.renderer.setClearColor(0xEAEAEA, 1); */

		console.log('Hello World! ^_^', IS_DEV_MODE);

		// this.layer = new SceneLayer(this.gl);

		initDragAndDrop(document.querySelector('.canvas'), (url:string, isVideo:boolean=false) => {
			// this.layer.loadVisual(url, isVideo);
			Visual.updateElement(url, isVideo);
		});
		
		this.controller = new Controller();

		this.cropView = new CropView(document.querySelector('.visual-crop-base'));

		Visual.addListener(this);
		Visual.updateElement('assets/test/test-image.jpg');

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
		Visual.tick();
		// this.layer.update(t, dt);
		// this.layer.render();
	}

	onVisualLoaded(vis: VisualSettings) {
		this.cropView.visualUpdated(vis);
	}

	onTextureUpdate() {
		this.cropView.render();
	}

}