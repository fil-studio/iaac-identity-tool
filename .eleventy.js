const fs = require('fs');

const esbuild = require('esbuild');
const alias = require('esbuild-plugin-alias');
const chokidar = require('chokidar');
const isProduction = process.env.ELEVENTY_ENV === 'production';
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");

const sass = require('sass');
const autoprefixer = require('autoprefixer');
const postcss = require('postcss');
const CleanCSS = require('clean-css');

// const urlFor = require('./utils/imageUrl');
const OUT_BUNDLE = './public/bundle';
try {
	fs.mkdirSync(OUT_BUNDLE, { recursive: true });
} catch (e) { }

const buildJS = () => {
	esbuild.build({
		entryPoints: ['src/js/main.js'],
		bundle: true,
		minify: isProduction,
		sourcemap: false,
		define: {
			DEV_MODE: `${!isProduction}`
		},
		loader: { '.glsl': 'text', '.vert': 'text', '.frag': 'text', '.css': 'text' },
		outfile: `${OUT_BUNDLE}/main.js`,
		plugins: [
			alias({
				'three': __dirname + '/node_modules/three/build/three.module.js',
				// '@fils/ui': __dirname + '/node_modules/@fils/ui/lib/main.js',
				// '@fils/ui-icons': __dirname + '/node_modules/@fils/ui-icons/lib/main.js',
			})
		]
	});
}

const buildCSS = () => {
	const result = sass.compile('./src/styles/main.scss');
	const css = result.css.toString();
	postcss([autoprefixer])
		.process(css, {
			from: 'src/styles/main.scss',
			to: `${OUT_BUNDLE}/main.css`,
		})
		.then((result) => {
			const finalCSS = !isProduction ? result.css : new CleanCSS({}).minify(result.css).styles;
			fs.writeFile(`${OUT_BUNDLE}/main.css`, finalCSS, (err) => {
				if (err) console.log(err);
			});
		})
}

if(!isProduction) {

	const build = () => {
		buildJS();
		buildCSS();
	}

	chokidar.watch('src/').on('change', (eventType, file) => {
		console.log(`Updated JS [${eventType}]`);
		build();
	});
}

buildJS();
buildCSS();

module.exports = function (eleventyConfig) {
	eleventyConfig.addPlugin(syntaxHighlight);

	eleventyConfig.setUseGitIgnore(false);

	eleventyConfig.setServerOptions({
		module: "@11ty/eleventy-server-browsersync",
		ghostMode: false,
		middleware: [
			(req, res, next) => {
				if (req.url.endsWith('.fil')) {
					res.setHeader('Content-Type', 'application/json');
					res.setHeader('Content-Encoding', 'gzip');
				}
				next();
			},
		],
	});

	eleventyConfig.addWatchTarget(`./src/**/*`);

	eleventyConfig.setWatchJavaScriptDependencies(false);
	eleventyConfig.addPassthroughCopy({"src/assets": "assets"});

	return {
		dir: {
			data: '../../../data',
			input: 'src/site/pages',
			includes: '../partials',
			layouts: '../base',
			output: 'public'
		},
		templateFormats: ['html', 'njk', 'md'],
		htmlTemplateEngine: 'njk',
	}
}
