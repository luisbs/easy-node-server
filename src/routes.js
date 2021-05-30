/**
 * Joins route paths to a single path
 * @param  {...string} paths collection of route paths to be join
 * @returns {Path} Unique route path
 * @throws `TypeError` 'compilePath' params must be strings
 */
function compilePath(...paths) {
  /** @type {Path} */
  const res = { route: ':get:/', method: 'get', path: '/', localPath: '' };

  for (const path of paths) {
    if (typeof path !== 'string') throw new TypeError(`'compilePath' params must be strings`);

    // @ts-ignore
    res.method =
      /^\:[a-z]+\:/i
        .exec(path)?.[0]
        .replace(/\:/g, '')
        /**/
        .toLowerCase() ?? res.method;

    const localPath = path.replace(/^\:[a-z]+\:/i, '');
    res.localPath = localPath.split('/').pop();

    res.path = RegExp(`^${res.path}`, 'i').test(localPath)
      ? localPath //
      : `${res.path.replace(/\/*$/, '')}/${localPath.replace(/^\/*/, '')}`;

    // @ts-ignore
    res.route = `:${res.method}:${res.path}`;
  }

  return res;
}

/**
 * Compile routes to secure data structure
 * @param {ValidRawRoute} rawRoute routes definition
 * @param {string} prefix path prefix
 * @param {string} identifier object index
 * @returns {Route|Record<string,Route>} Route for internal use
 * @throws `TypeError` '\<param\>' param must be a \<type\>. Current: (\<type\>)
 */
function compileRoute(rawRoute, prefix = '/', identifier = undefined) {
  if (typeof prefix !== 'string') throw new TypeError(`'prefix' param must be a string. Current: (${typeof prefix})`);

  const path = compilePath(prefix);

  // * Resolver
  if (typeof rawRoute === 'function') return { ...path, resolver: rawRoute };

  // * (CompactRoute | RawRoute)[]
  if (Array.isArray(rawRoute)) {
    /** @type {Record<string, Route>} */
    const routes = {};

    for (let i = 0; i < rawRoute.length; i++) {
      const raw = rawRoute[i];

      // * CompactRoute
      if (Array.isArray(raw)) {
        if (typeof raw[0] !== 'string' || typeof raw[1] !== 'function')
          throw new TypeError(`'rawRoute[${i}]' param should be of type 'CompactRoute'. Current: ${raw.toString()}`);

        const path1 = compilePath(path.path, raw[0]);
        if (!raw[2]) routes[path1.route] = { ...path1, resolver: raw[1] };
        else routes[path1.route] = { ...path1, use: raw[1], resolver: raw[2] };
        break;
      }

      // * RawRoute
      /** @type {Route} */
      // @ts-ignore
      const route = compileRoute(raw, path.path);
      routes[route.route] = route;
    }
    return routes;
  }

  // * RawRoute | Record<string, Resolver | RawRoute>
  if (typeof rawRoute === 'object') {
    // * RawRoute
    // @ts-ignore
    if (typeof rawRoute.resolver === 'function') {
      /** @type {RawRoute} */
      // @ts-ignore
      const raw = rawRoute;

      const path1 = compilePath(path.path, raw.path ?? identifier ?? '/');

      /** @type {Route} */
      const route = { ...path1, resolver: raw.resolver };

      if (typeof raw.use === 'function') route.use = raw.use;
      if (typeof raw.name === 'string') route.name = raw.name;
      if (typeof raw.routes === 'object') route.routes = compileRoute(raw.routes, path1.path);
      return route;
    }

    // * Record<string, Resolver | RawRoute>
    /** @type {Record<string, Route>} */
    const routes = {};

    for (const key in rawRoute) {
      /** @type {Route} */
      // @ts-ignore
      const route = compileRoute(rawRoute[key], path.path, key);
      routes[route.route] = route;
    }

    return routes;
  }

  throw new TypeError(`'rawRoute' param should be of type 'ValidRawRoute'. Current: ${String(rawRoute)}`);
}

module.exports = compileRoute;
module.exports.compilePath = compilePath;
