import json from '@rollup/plugin-json';
import commonjs from "@rollup/plugin-commonjs";
import terser from '@rollup/plugin-terser';

export default [
    {
        input: 'src/utils/get_jd_cookie.js',
        output: {
            file: 'dist/utils/get_jd_cookie.js',
            format: 'es',
            banner: '/* README: https://github.com/c3b2a7/scripts */',
        },
        plugins: [json(), commonjs(), terser()]
    },
    {
        input: 'src/cracks/cleanclip.js',
        output: {
            file: 'dist/cracks/cleanclip.js',
            format: 'es',
            banner: '/* README: https://github.com/c3b2a7/scripts */',
        },
        plugins: [json(), commonjs(), terser()]
    },
    {
        input: 'src/cracks/paddle_act.js',
        output: {
            file: 'dist/cracks/paddle_act.js',
            format: 'es',
            banner: '/* README: https://github.com/c3b2a7/scripts */',
        },
        plugins: [json(), commonjs(), terser()]
    },
    {
        input: 'src/cracks/shottr.js',
        output: {
            file: 'dist/cracks/shottr.js',
            format: 'es',
            banner: '/* README: https://github.com/c3b2a7/scripts */',
        },
        plugins: [json(), commonjs(), terser()]
    },
];
