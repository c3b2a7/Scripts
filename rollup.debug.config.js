import json from '@rollup/plugin-json';
import commonjs from "@rollup/plugin-commonjs";

export default [
	{
		input: 'src/CrackingApps/get_jd_cookie.beta.js',
		output: {
			file: 'js/CrackingApps/get_jd_cookie.beta.js',
			//format: 'es',
			banner: '/* README: https://github.com/c3b2a7/scripts */',
		},
		plugins: [json(), commonjs()]
	},
];
