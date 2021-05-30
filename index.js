// @ts-check
/// <reference path="types.d.ts" />

const compileLogger = require('./src/logger');
const compileRoute = require('./src/routes');

/**
 * Compile raw options
 * @template req,res
 * @param {RawOptions<req, res>} rawOptions
 * @returns {Options<req, res>}
 */
function compileOptions(rawOptions) {
  const port = rawOptions?.port ?? 3000;
  const logger = compileLogger(rawOptions?.logger);

  try {
    const route = compileRoute(
      // @ts-ignore
      rawOptions?.routes ??
        ((_, res) => {
          // @ts-ignore
          if (res.send) res.send('Ok');
        }),
      rawOptions?.initialRoute
    );

    // @ts-ignore
    return { logger, port, routes: typeof route.route === 'string' ? { [route.route]: route } : route };
  } catch (e) {
    logger.error(`[${e.lineNumber ?? '00'}:${e.columnNumber ?? '00'}]`, e.message, e.fileName ?? '');
    return { logger, port, routes: {} };
  }
}

/**
 * @param {Record<string, any>} app
 * @param {Route} route
 */
function ApplyRoutes(app, route) {
  if (route.routes) Object.entries(route.routes).forEach(([_, route]) => ApplyRoutes(app, route));

  const params = [
    route.path, //
    route.use ? route.use : route.resolver,
    route.use ? route.resolver : undefined,
  ];

  if (route.method === 'all') {
    if (app.all) app.all(...params);
    else {
      if (app.head) app.head(...params);
      if (app.get) app.get(...params);
      if (app.post) app.post(...params);
      if (app.put) app.put(...params);
      if (app.delete) app.delete(...params);
    }
  } else if (app[route.method]) {
    app[route.method](...params);
  }
}

/**
 * Initialize a js server
 * @template req, res
 * @param {Function} server a express initializer function -like
 * @param {RawOptions<req, res>} options options for the server app
 */
// @ts-ignore
module.exports = function initServer(server, options = {}) {
  const { logger, port, routes } = compileOptions(options);
  try {
    const app = server();

    if (Array.isArray(options.use)) options.use.forEach(middleware => app.use(middleware));
    else if (typeof options.use === 'function') app.use(options.use);

    // * routes attachment
    Object.entries(routes).forEach(([_, route]) => ApplyRoutes(app, route));

    logger.info('Routing: ', routes);

    // * start listening
    app.listen(port, () => logger.log(`Listening on ${port}`));
  } catch (error) {
    logger.error(error.message);
  }
};
