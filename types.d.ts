/**
 * Function to print information
 * @param msg message string to be printed
 */
type LogFunction = (...msg: any[]) => void;

/** Collection of functions to print information by levels */
interface Logger {
  info: LogFunction;
  log: LogFunction;
  warn: LogFunction;
  error: LogFunction;
}

/**
 * Numeric values:
 * - `0: error`
 * - `1: error and warn`
 * - `2: error, warn and log`
 * - `3: error, warn, log and info`
 */
type RawLogger = number | Partial<Logger>;

// ---------------------------------

interface Options<req = unknown, res = unknown> {
  /** Port to be listen */
  port: number;
  /** Logger helper */
  logger: Logger;
  /** Routes definition */
  routes: Record<string, Route<req, res>>;
}

interface RawOptions<req = unknown, res = unknown> {
  /** Port to be listen */
  port?: number;
  /** Initial route to be listen (`/` default) */
  initialRoute?: string;
  /** Routes definition */
  routes: ValidRawRoute<req, res>;
  /** Called before routes asignement */
  use: Resolver<req, res> | Resolver<req, res>[];
  /** Logger helper */
  logger: RawLogger;
}

// ---------------------------------
// ---------------------------------
// ---------------------------------

/** Resolve a route path request */
type Resolver<req = unknown, res = unknown> = (req: req, res: res, next: () => void) => void;

/**
 * Valid HTTP methods
 * @see https://developer.mozilla.org/es/docs/Web/HTTP/Methods
 */
type HTTPMethod = 'all' | 'head' | 'get' | 'post' | 'patch' | 'put' | 'delete' | 'connect' | 'options' | 'trace';

/** Valid HTTP path */
type HTTPPath = string;

/** Valid HTTP route */
type HTTPRoute = `:${HTTPMethod}:${HTTPPath}`;

/** Valid path for a internal route */
interface Path {
  /** Unique route identifier */
  route: HTTPRoute;
  /** HTTP method as `get`, `post`, `put` or `delete` */
  method: HTTPMethod;
  /** Complete route path */
  path: HTTPPath;
  /** End part of the route */
  localPath: string;
}

/** Valid route for internal use */
interface Route<req = unknown, res = unknown> extends Path {
  /** Route identifier */
  name?: string;
  /** Route middleware */
  use?: Resolver<req, res>;
  /** Route resolver */
  resolver: Resolver<req, res>;
  /** Child subroutes */
  routes?: Record<HTTPRoute, Route>;
}

// ---------------------------------
// ---------------------------------
// ---------------------------------

/** Valid Path */
type RawPath<M extends string = HTTPMethod> = `:${Lowercase<M> | Uppercase<M>}:${HTTPPath}`;

/** Valid Route */
type CompactRoute<req = unknown, res = unknown, M extends string = HTTPMethod> = [
  /** Route path */
  RawPath<M>,
  /**
   * Route middleware
   * Route resolver if the thrid param is not defined
   */
  Resolver<req, res>,
  /** Route resolver */
  Resolver<req, res>?
];

/** Valid Route */
type RawRoute<req = unknown, res = unknown, M extends string = HTTPMethod> = {
  /** Route identifier */
  name?: string;
  /** Route path */
  path?: RawPath<M>;
  /** Route middleware */
  use?: Resolver<req, res>;
  /** Route resolver */
  resolver: Resolver<req, res>;
  /** Child subroutes */
  routes?: RawRouteCollection<req, res, M>;
};

/** Valid Collection Routes */
type RawRouteCollection<req = unknown, res = unknown, M extends string = HTTPMethod> =
  | (CompactRoute<req, res, M> | RawRoute<req, res, M>)[]
  | Record<string, Resolver<req, res> | RawRoute<req, res, M>>;

/** Valid Route */
type ValidRawRoute<req = unknown, res = unknown, M extends string = HTTPMethod> = Resolver | RawRoute<M> | RawRouteCollection<req, res, M>;
