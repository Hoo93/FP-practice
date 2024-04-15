const range = (start, end, step) => {
  // 객체를 리턴
  return {
    // 객체는 [Symbol.iterator]를 성분으로 가짐
    // [Symbol.iterator] : 함수
    [Symbol.iterator]: () => {
      let current = start;
      return {
        next: () => {
          if ((step > 0 && current < end) || (step < 0 && current >= end)) {
            const result = { value: current, done: false };
            current += step;
            return result;
          } else {
            return { value: undefined, done: true };
          }
        },
      };
    },
  };
};

const curry =
  (f) =>
  (a, ..._) =>
    _.length ? f(a, ..._) : (..._) => f(a, ..._);

const reduce = curry((f, acc, iter) => {
  // iter가 없을 때는 acc가 iterable이라고 가정
  // acc를 이터레이터로 변환 후 첫번째 값을 꺼냄
  if (!iter) {
    iter = acc[Symbol.iterator]();
    acc = iter.next().value;
  } else {
    iter = iter[Symbol.iterator]();
  }
  let cur;

  let go1 = (a, f) => (a instanceof Promise ? a.then(f) : f(a));
  // go1 함수를 적용하면 처음에 프로미스가 덜어오는 것도 처리 가능
  return go1(acc, function recur(acc) {
    while (!(cur = iter.next()).done) {
      const a = cur.value;
      acc = f(acc, a);
      // 비동기 처리
      // 이렇게 하는 이유가 중요
      // 중간에 비동기 처리가 한 번만 있다고 치면 나머지는 비동기 처리가 아닌 동기 처리를 해야함
      // 그래서 프로미스 인 경우에만 다시 acc.then(recur)를 호출
      if (acc instanceof Promise) return acc.then(recur);
    }
    return acc;
  });
});

const add = (a, b) => a + b;

// 인자를 받아서 하나의 값으로 축약하는 함수
// 처음 인자를 받아서 다음 인자인 함수에 적용해 값을 만들고 그 결과를 다음 함수에 전달

const go = (...args) => reduce((a, f) => f(a), args);

// go(
//     0,
//     a=> a+1,
//     a=> a+10,
//     a => a+100,
//     console.log
// )

const isIterable = (a) => a && typeof a[Symbol.iterator];

const lazyFlatten = function* (iter) {
  for (const a of iter) {
    if (isIterable(a)) for (const b of a) yield b;
    else yield a;
  }
};

module.exports = {
  range,
  reduce,
  add,
  go,
  isIterable,
  lazyFlatten,
};
