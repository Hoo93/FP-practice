// Callback 스타일

const { go } = require('./fp');

function add10(a, callback) {
  setTimeout(() => {
    callback(a + 10);
  }, 100);
}

// add10(5, (res) => {
//   console.log(res);
// });

// Promise 스타일
// Promise 스타일은 then을 이용해서 콜백지옥에서 벗어나는게 문제가 아니라
// 비동기 상황을 일급 값으로 다루는게 핵심 -> Callback 형식은 아무 값을 리턴하지 않음
// Promise는 값을 리턴함
function add20(a) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(a + 20);
    }, 100);
  });
}

// 일급의 활용
// go 함수는 동기 값이 들어와야 동기적 평가가 가능함
const go1 = (a, f) => f(a);
const add5 = (a) => a + 5;

const delay100 = (a) =>
  new Promise((resolve) => setTimeout(() => resolve(a), 100));

// console.log(go1(10, add5));
// 아래 코드는 동작하지 않음
// console.log(go1(Promise.resolve(10), add5));

// Promise를 이용한 비동기 처리
const go2 = (a, f) => (a instanceof Promise ? a.then(f) : f(a));

const r2 = go2(delay100(10), add5);
// console.log(r2);

// 함수 합성 관점에서 프로미스
// 모나드 : 함수 합성을 안전하게 하기 위한 도구
// 비동기 상황을 안전하게 합성하는 것이 프로미스

const g = (a) => a + 1;
const f = (a) => a * a;

console.log(f(g(1)));

// 모나드는 하나의 박스 => 배열 요소의 갯수가 몇 개인지에 따라 안전하게 합성하기 위한 도구
[1].map(g).map(f);
// 하지만 배열은 우리가 원하는 결과가 아님
// 그러므로 forEach를 사용해야함
// 모나드는 Array를 사용하는데 만약 아무 값을 넣지 않아도 에러가 발생하지 않음
// 즉 함수들을 안전하게 함성할 수 있음
// Array에 map을 이용해 합섳함

// Promise도 모나드
// Promise.resolve(1).then(g).then(f)

// 즉, 프로미스란, 비동기 상황을 안전하게 합성하기 위한 도구
// 어떤 값이 있냐 없냐에 따른 안전한 합성이 아닌 동기냐 비동기냐에 의한 안전한 합성을 의미
// 함수의 합성 시점을 안전하게 합성하기 위한 모나드

// Kleisli Composition
// 오류가 있을 수 있는 상황에서의 안전한 합성
// 만약 g또는 x에서 오류가 발생한 경우
// f(g(x)) = g(x) 를 만족시키는 합성을 Kleisli Composition이라고 함

let users = [
  { id: 1, name: 'aa' },
  { id: 2, name: 'bb' },
  { id: 3, name: 'cc' },
];

const find = (f, iter) => {
  for (const a of iter) {
    if (f(a)) return a;
  }
};

let getUserById = (id) => find((u) => u.id === id, users);

const f2 = ({ name }) => name;
const g2 = getUserById;
const fg = (id) => f2(g2(id));

console.log(fg(2));

// 하지만 실제 세계에서는 users 의 상태가 변경되어
// fg(2) = fg(2) 가 성립하지 않을 수 있음
// 이런 경우에는 Kleisli Composition을 사용해야함

const fg2 = (id) => Promise.resolve(id).then(g2).then(f2);

// users를 두 번 pop 하게 되면 fg2(2)는 오류가 발생함
// 이 때 fg2(2)의 값과 g(2)의 값은 다름
fg2(2).then(console.log);

// Kleisli Composition 적용
getUserById = (id) =>
  find((u) => u.id === id, users) || Promise.reject('없어요');

const g3 = getUserById;

const fg3 = (id) =>
  Promise.resolve(id)
    .then(g3)
    .then(f2)
    .catch((e) => e);

// 위의 코드처럼 만들면 fg3(10)의 값과 g3(10)의 값이 같음
// 즉, Kleisli Composition을 적용하면 안전하게 합성할 수 있음
fg3(2).then(console.log);

// Go pipe, reduce에서 비동기 제어
// go 함수는 reduce를 사용하기 때문에 reduce만 수정하면 비동기 제어가 가능함
// fp reduce부분 수정
go(
  1,
  (a) => a + 10,
  (a) => Promise.resolve(a + 100),
  (a) => a + 1000,
  (a) => a + 10000,
  console.log,
).catch((a) => console.log(a));
// 이렇게 catch 처리까지 하게 되면 kleisli composition이 적용된 것임

// Promise.then의 중요한 규칙
// 프로미스는 아무리 프로미스를 많이 사용하더라도 마지막 then에서 모든 값을 한 번에 가지고 온다.
Promise.resolve(Promise.resolve(1)).then((a) => console.log(a));

new Promise((resolve) => resolve(Promise.resolve(1))).then((a) =>
  console.log(a),
);
