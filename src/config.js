/**
 * @fileoverview configurations for Epsagon library
 */
const consts = require('./consts.js');

// User-defined HTTP minimum status code to be treated as an error.
module.exports.HTTP_ERR_CODE = parseInt(process.env.EPSAGON_HTTP_ERR_CODE, 10) || 400;

/**
 * process each ignored key to make `studentId` ignore `student_id` as well
 * @param {string} key the key to process
 * @returns {string} key after process
 */
module.exports.processIgnoredKey = function processIgnoredKey(key) {
    return key
        .toLowerCase()
        .replace('-', '')
        .replace('_', '')
        .replace(/\s/g, '');
};

/**
 * configuration singleton. preconfigured with default values.
 */
const config = {
    token: process.env.EPSAGON_TOKEN || '',
    appName: process.env.EPSAGON_APP_NAME || 'Application',
    metadataOnly: (process.env.EPSAGON_METADATA || '').toUpperCase() === 'TRUE',
    useSSL: (process.env.EPSAGON_SSL || 'TRUE').toUpperCase() === 'TRUE',
    traceCollectorURL: consts.TRACE_COLLECTOR_URL,
    isEpsagonDisabled: (process.env.DISABLE_EPSAGON || '').toUpperCase() === 'TRUE',
    urlPatternsToIgnore: [],
    internalSampleRate: 1,
    sendOnlyErrors: (process.env.EPSAGON_SEND_TRACE_ON_ERROR || '').toUpperCase() === 'TRUE',
    /**
     * get isEpsagonPatchDisabled
     * @return {boolean} True if DISABLE_EPSAGON or DISABLE_EPSAGON_PATCH are set to TRUE, false
     *     otherwise
     */
    get isEpsagonPatchDisabled() {
        return this.isEpsagonDisabled || (process.env.DISABLE_EPSAGON_PATCH || '').toUpperCase() === 'TRUE';
    },

    /**
     * @return {Number} the current sample rate
     */
    get sampleRate() {
        return this.internalSampleRate;
    },

    /**
     * updates the sampling rate, if input is valid
     * @param {String | Number} newRate The new rate to use
     */
    set sampleRate(newRate) {
        const newParsedRate = parseFloat(newRate);
        if (!Number.isNaN(newParsedRate)) {
            this.internalSampleRate = newParsedRate;
        }
    },
};

if (process.env.EPSAGON_SAMPLE_RATE) {
    config.sampleRate = process.env.EPSAGON_SAMPLE_RATE;
}
if (process.env.EPSAGON_URLS_TO_IGNORE) {
    config.urlPatternsToIgnore = process.env.EPSAGON_URLS_TO_IGNORE.split(',');
}

if (process.env.EPSAGON_IGNORED_KEYS) {
    config.ignoredKeys = process.env.EPSAGON_IGNORED_KEYS.split(',');
}

if ((process.env.EPSAGON_SSL || 'TRUE').toUpperCase() === 'FALSE') {
    config.traceCollectorURL = config.traceCollectorURL.replace('https:', 'http:');
}
if ((process.env.EPSAGON_SSL || 'TRUE').toUpperCase() === 'TRUE') {
    config.traceCollectorURL = config.traceCollectorURL.replace('http:', 'https:');
}

/**
 * @returns {object} The config object
 */
module.exports.getConfig = function getConfig() {
    return config;
};


/**
 * Initializes the configuration
 * @param {object} configData user's configuration
 */
module.exports.setConfig = function setConfig(configData) {
    if (configData === undefined) return;

    if (configData.token) {
        config.token = configData.token;
    }

    if (configData.appName) {
        config.appName = configData.appName;
    }

    if (configData.metadataOnly !== undefined && configData.metadataOnly != null) {
        config.metadataOnly = configData.metadataOnly;
    }

    // Set custom URL if defined
    if (configData.traceCollectorURL) {
        config.traceCollectorURL = configData.traceCollectorURL;
    }

    // Use SSL
    if (configData.useSSL === false) {
        config.traceCollectorURL = config.traceCollectorURL.replace('https:', 'http:');
        config.useSSL = configData.useSSL;
    }
    if (configData.useSSL) {
        config.traceCollectorURL = config.traceCollectorURL.replace('http:', 'https:');
        config.useSSL = configData.useSSL;
    }

    // User-defined URL blacklist.
    if (configData.urlPatternsToIgnore) {
        config.urlPatternsToIgnore = configData.urlPatternsToIgnore;
    }

    // Send traces only on errors.
    if (configData.sendOnlyErrors) {
        config.sendOnlyErrors = configData.sendOnlyErrors;
    }

    // User-defined HTTP minimum status code to be treated as an error.
    if (configData.httpErrorStatusCode) {
        module.exports.HTTP_ERR_CODE = configData.httpErrorStatusCode;
    }

    if (configData.ignoredKeys) {
        config.ignoredKeys = configData.ignoredKeys;
    }

    if (configData.sampleRate !== null && config.sampleRate !== undefined) {
        config.sampleRate = configData.sampleRate;
    }
};
