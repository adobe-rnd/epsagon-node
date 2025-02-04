const shimmer = require('shimmer');
const tryRequire = require('../try_require');

/**
 * finds all the instances of a module in the NODE_PATH
 * @param {String} id the id of the module to load
 * @return {Array} an array of all the module instances in the PATH
 */
module.exports.getModules = function getModules(id) {
    const modules = [];
    const searchPathes = require.resolve.paths(id);
    if (process.env.EPSAGON_ADD_NODE_PATH) {
        searchPathes.push(...process.env.EPSAGON_ADD_NODE_PATH.split(':'));
    }
    searchPathes.forEach((path) => {
        const module = tryRequire(`${path}/${id}`);
        if (module) {
            modules.push(module);
        }
    });
    return modules;
};

/**
 * Patches all instances of a module
 * @param {String} id The module id
 * @param {String} methodName the method name
 * @param {Function} wrapper The wrapper function
 * @param {Function} memberExtractor Extracts the wrapped member from the module
 */
module.exports.patchModule = function patchModule(
    id,
    methodName,
    wrapper,
    memberExtractor = (mod => mod)
) {
    const modules = module.exports.getModules(id);
    modules.forEach((module) => {
        shimmer.wrap(
            memberExtractor(module),
            methodName,
            wrapper
        );
    });
};
