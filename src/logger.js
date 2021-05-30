// @ts-check

/**
 * Executes a log function based on conditions
 * @param {any[]} msg
 * @param {LogFunction} f
 * @param {boolean} cond
 * @returns {void}
 */
function conditionalLog(msg, f, cond = undefined) {
  if (f && cond !== false) f(...msg);
}

/**
 * Logger wrapper
 * @param {RawLogger} logger
 * @returns {Logger}
 */
module.exports = function compileLogger(logger = undefined) {
  if (typeof logger === 'number') {
    return {
      error: (...msg) => conditionalLog(msg, console.error, logger >= 0),
      warn: (...msg) => conditionalLog(msg, console.warn, logger > 0),
      log: (...msg) => conditionalLog(msg, console.log, logger > 1),
      info: (...msg) => conditionalLog(msg, console.info, logger > 2),
    };
  }

  return {
    error: (...msg) => conditionalLog(msg, logger?.error),
    warn: (...msg) => conditionalLog(msg, logger?.warn),
    log: (...msg) => conditionalLog(msg, logger?.log),
    info: (...msg) => conditionalLog(msg, logger?.info),
  };
};
