import { Timer } from '@fils/ani';
import { ThreeDOMLayer } from '@fils/gl-dom';
import { SceneLayer } from '../gfx/SceneLayer';
import { IS_DEV_MODE } from './Globals';
import { Controller } from './Controller';

import Stats from 'three/examples/jsm/libs/stats.module.js';
import { initDragAndDrop } from './FileTypes';
import { Visual, VisualListener, VisualSettings } from '../gfx/Visual';
import { CropView } from '../gfx/CropView';
import { ExportView } from '../gfx/ExportView';

export class App implements VisualListener  {
	clock:Timer;
	controller:Controller;

	cropView:CropView;
	exportView:ExportView;

	constructor() {
		this.clock = new Timer(false);
		console.log('Hello World! ^_^', IS_DEV_MODE);

		// this.layer = new SceneLayer(this.gl);

		initDragAndDrop(document.querySelector('.canvas'), (url:string, isVideo:boolean=false) => {
			// this.layer.loadVisual(url, isVideo);
			Visual.updateElement(url, isVideo);
		});
		
		this.controller = new Controller();

		this.cropView = new CropView(document.querySelector('.visual-crop-base'));
		this.exportView = new ExportView(document.querySelector('.visual'));

		Visual.addListener(this);
		Visual.updateElement('assets/test/test-image.jpg');

		this.start();

		this.exportView.enabled = true;
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
		this.exportView.visualUpdated(vis, true);
	}

	onTextureUpdate() {
		this.cropView.render();
		this.exportView.crop.onFrameUpdate();
	}

}