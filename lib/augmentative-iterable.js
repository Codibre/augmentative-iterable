'use strict';
const {
  getArrayOperator,
  getImmutable,
  getItOperator,
  getMutable,
  getStateProcessor,
  processActionResult,
  getAugmentIterable,
  resolver,
} = require('./augments-utils');
const {
  baseIterable,
  augments,
  YIELD,
  IGNORE,
  STOP,
} = require('./augments-types');

function resolveState(a, wrapper) {
  const length = a.length;
  wrapper.state = YIELD;
  let i = 0;
  while (i < length) {
    const ai = a[i];
    const actionResult = ai.action(wrapper.result);
    wrapper.type = ai.type;
    processActionResult(actionResult, wrapper);
    if (wrapper.state !== YIELD) {
      return wrapper;
    }
    i++;
  }
};

function augmentativeIterate() {
  const a = this[augments] || [];
  const base = this[baseIterable] || this;

  const operator = Array.isArray(base) ?
    getArrayOperator(base) :
    getItOperator(base[Symbol.iterator](), resolver);

  return {
    next: getStateProcessor(operator, resolveState, a),
    return: base.return ? base.return.bind(base) : undefined,
    throw: base.throw ? base.throw.bind(base) : undefined,
  };
}

function augmentativeForEach(
  action,
) {
  const it = augmentativeIterate.call(this);
  let next;
  while (!(next = it.next()).done) {
    action(next.value);
  }
  if (it.return) {
    it.return();
  }
}

function augmentativeToArray() {
  const result = [];

  augmentativeForEach.call(this, result.push.bind(result));

  return result;
}

const immutable = getImmutable(Symbol.iterator, augmentativeIterate);
const mutable = getMutable(Symbol.iterator, augmentativeIterate);

const filterIterable = getAugmentIterable(
  Symbol.iterator,
  augmentativeIterate,
  IGNORE,
);

const mapIterable = getAugmentIterable(
  Symbol.iterator,
  augmentativeIterate,
  YIELD,
);

const takeWhileIterable = getAugmentIterable(
  Symbol.iterator,
  augmentativeIterate,
  STOP,
);

const addFilter = getAugmentIterable(Symbol.iterator, augmentativeIterate, IGNORE);
const addMap = getAugmentIterable(Symbol.iterator, augmentativeIterate, YIELD);
const addTakeWhile = getAugmentIterable(Symbol.iterator, augmentativeIterate, STOP);

module.exports = {
  addFilter,
  addMap,
  addTakeWhile,
  augmentativeIterate,
  augmentativeForEach,
  augmentativeToArray,
  filterIterable,
  immutable,
  mapIterable,
  mutable,
  takeWhileIterable,
};
