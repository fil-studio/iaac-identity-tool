import { Timer } from '@fils/ani';
import { ThreeDOMLayer } from '@fils/gl-dom';
import { SceneLayer } from '../gfx/SceneLayer';
import { FancyButton } from '../components/FancyButton';

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
		this.gl.renderer.setClearColor(0xEAEAEA, 1);

		console.log('Hello World! ^_^');

		const fancy_buttons = document.querySelectorAll('button.fancy');
		for(const btn of fancy_buttons) {
			const f = new FancyButton(btn as HTMLElement);
		}

		this.layer = new SceneLayer(this.gl);

		this.start();
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