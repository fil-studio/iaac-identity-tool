import { Timer } from '@fils/ani';
import { ThreeDOMLayer } from '@fils/gl-dom';
import { UI } from '@fils/ui';
import { uiFilebrowser } from '@fils/ui-icons';
import { SceneLayer } from '../gfx/SceneLayer';

export class App  {
	gl:ThreeDOMLayer;
	layer:SceneLayer;
	clock:Timer;

	constructor() {
		this.clock = new Timer(false);
		this.gl = new ThreeDOMLayer(document.querySelector('.gl'), {
			antialias: true,
			alpha: false
		});
		this.gl.renderer.setClearColor(0xececec, 1);

		this.layer = new SceneLayer(this.gl);

		this.initUI();

		this.start();
	}

	initUI() {
		const gui = new UI({
			title: 'Input',
			icon: uiFilebrowser,
			parentElement: document.querySelector('.menu')
		})
	}

	start() {
		const animate = () => {
			requestAnimationFrame(animate);
			this.update();
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