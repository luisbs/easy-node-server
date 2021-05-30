/// <reference path="../types.d.ts" />

/**
 * Test of the typescript types
 * just the ended with 1 should rise and error
 */

const testPath: RawPath = ':get:a';
const testPath1: RawPath = ':ge:a';

// ? Tipo principal para ser probado
type TT<M extends string = HTTPMethod> = ValidRawRoute<M>;

// * Resolver
const testFunctionRoute: TT = () => {};

// * RawRoute<M>
const testObjectRoute: TT = { path: ':get:', resolver: () => {} };
const testObjectRoute1: TT = { path: ':ge:', resolver: () => {} };
const testObjectRoute2: TT<string> = { path: ':ge:', resolver: () => {} };

// * (CompactRoute<M> | InternalRawRoute<M>)[]
const testCollectionRoute: TT = [
  [':get:', () => {}],
  { path: ':post:', resolver: () => {} },
  //
];
const testCollectionRoute1: TT = [
  [':ge:', () => {}],
  { path: ':pos:', resolver: () => {} },
  //
];
const testCollectionRoute2: TT<string> = [
  [':ge:', () => {}],
  { path: ':pos:', resolver: () => {} },
  //
];

// * Record<string, Resolver | SimpleRoute<M>>
const testRawRouteObject: TT = {
  home: { path: ':get:', resolver: () => {} },
  about: { resolver: () => {} },
  ':post:info': () => {},
};
const testRawRouteObject1: TT = {
  home: { path: ':ge:', resolver: () => {} },
  about: { resolver: () => {} },
  ':post:info': () => {},
};
const testRawRouteObject2: TT<string> = {
  home: { path: ':ge:', resolver: () => {} },
  about: { resolver: () => {} },
  ':post:info': () => {},
};
