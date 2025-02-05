import defaultConfig from './rollup.default.config.js';
import betaConfig from './rollup.beta.config.js';

export default commandLineArgs => {
    if (commandLineArgs.configBeta === true) {
        return betaConfig;
    }
    return defaultConfig;
};
