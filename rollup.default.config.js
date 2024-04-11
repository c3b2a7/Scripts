import json from '@rollup/plugin-json';
import commonjs from "@rollup/plugin-commonjs";
import terser from '@rollup/plugin-terser';

export default [
	{
		input: 'src/CrackingApps/get_jd_cookie.js',
		output: {
			file: 'js/CrackingApps/get_jd_cookie.js',
			format: 'es',
			banner: '/* README: https://github.com/c3b2a7/scripts */',
		},
		plugins: [json(), commonjs(), terser()]
	},
	{
		input: 'src/CrackingApps/cleanclip.js',
		output: {
			file: 'js/CrackingApps/cleanclip.js',
			format: 'es',
			banner: '/* README: https://github.com/c3b2a7/scripts */',
		},
		plugins: [json(), commonjs(), terser()]
	},
	{
		input: 'src/CrackingApps/paddle_act.js',
		output: {
			file: 'js/CrackingApps/paddle_act.js',
			format: 'es',
			banner: '/* README: https://github.com/c3b2a7/scripts */',
		},
		plugins: [json(), commonjs(), terser()]
	},
];
