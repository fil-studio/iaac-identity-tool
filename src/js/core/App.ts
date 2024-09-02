import { Timer } from '@fils/ani';
import { Controller, SettingsChangedListener } from './Controller';
import { IS_DEV_MODE } from './Globals';

import Stats from 'three/examples/jsm/libs/stats.module.js';
import { CropView } from '../gfx/CropView';
import { ExportView } from '../gfx/ExportView';
import { Visual, VisualListener, VisualSettings } from '../gfx/Visual';
import { getVisualURL, initDragAndDrop } from './FileTypes';
import { Texture } from 'three';
import { Knot } from '../components/ui/ThresholdController';

export class App implements VisualListener, SettingsChangedListener  {
	clock:Timer;
	controller:Controller;

	cropView:CropView;
	exportView:ExportView;

	constructor() {
		this.clock = new Timer(false);
		console.log('Hello World! ^_^', IS_DEV_MODE);

		// this.layer = new SceneLayer(this.gl);

		initDragAndDrop(document.querySelector('.canvas'), document.querySelector('.dropzone'), (url:string, isVideo:boolean=false) => {
			// this.layer.loadVisual(url, isVideo);
			this.updateVisual(url, isVideo);
		});
		
		this.controller = new Controller();
		this.controller.addListener(this);

		this.cropView = new CropView(document.querySelector('.visual-crop-base'));
		this.exportView = new ExportView(document.querySelector('.visual'));

		Visual.addListener(this);
		Visual.updateElement('assets/test/test-image.jpg', false, () =>{
			this.onVisualChanged();
		});

		this.start();

		this.exportView.enabled = true;
	}

	start() {
		const stats = new Stats();
		stats.showPanel(1);
		// document.body.appendChild(stats.dom);

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
		this.controller.videoCtrl.updateVideoProgress();
	}

	onColorsChanged(values: string[]) {
		// console.log(values);
		this.exportView.engine.setColors(values);
		this.exportView.render();
	}

	onPatternsChanged(values: Texture[]) {
		this.exportView.engine.patterns = values;
		this.exportView.render();
	}

	onTilesChanged(value: number) {
		this.exportView.engine.tiles = value;
		this.exportView.render();
	}

	onThresholdsChanged(value: Knot[]) {
		this.exportView.engine.thresholds = value;
		this.exportView.render();
	}

	onVisualSelected(file: File) {
		getVisualURL(file, (url:string, isVideo:boolean=false) => {
			// this.layer.loadVisual(url, isVideo);
			this.updateVisual(url, isVideo);
		})

		// const input = document.querySelector('input#input_file') as HTMLInputElement;
		// input.value = file.name;
	}

	updateVisual(url:string, isVideo:boolean=false) {
		Visual.updateElement(url, isVideo, () => {
			this.onVisualChanged();
		});
		this.controller.exportCtrl.video = isVideo;
	}

	protected onVisualChanged() {
		const isVideo = Visual.video;
		this.controller.videoCtrl.video = isVideo ? Visual.element as HTMLVideoElement : null;
		const iv = document.querySelector('p.inputs-feedback');
		iv.textContent = `Original size: ${Visual.originalSize.width}x${Visual.originalSize.height}`

		const w =  document.querySelector('input#width') as HTMLInputElement;
		const h =  document.querySelector('input#height') as HTMLInputElement;

		w.value = `${Visual.crop.width}`;
		h.value = `${Visual.crop.height}`;

		const view = document.querySelector('.gl').querySelector('.view');
		if(Visual.video) {
			view.classList.add('video');
		} else {
			view.classList.remove('video');
		}

		const label = document.querySelector('button.crop_btn').querySelector('span.label');
		label.textContent = `${Visual.crop.width}x${Visual.crop.height}`;
	}

	onCropViewChanged(value: boolean) {
		this.cropView.enabled = value;
		this.exportView.enabled = !value;
	}

}