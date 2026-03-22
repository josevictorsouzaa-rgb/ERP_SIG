function getTimestamp() {
    return new Date().toISOString();
}

const logger = {
    info: (msg) => {
        console.log(`[INFO] [${getTimestamp()}] - ${msg}`);
    },
    error: (msg, err) => {
        console.error(`[ERROR] [${getTimestamp()}] - ${msg}`, err || '');
    },
    warn: (msg) => {
        console.warn(`[WARN] [${getTimestamp()}] - ${msg}`);
    }
};

module.exports = logger;
