const { reduce, add, range } = require('./fp'); // 함수가 정의된 경로를 수정하세요.
const { describe,expect,it } = require('jest');

describe('reduce function', () => {
    it('iterable을 순회하며 값을 축약한다.', () => {
        const sum = reduce(add, 0, range(1, 10, 1));
        expect(sum).toBe(45);
    });

    it('초기값이 주어지지 않은 경우 iterable객체의 첫 번째 값을 초기값으로 사용한다.', () => {
        const sum = reduce(add, [1,2,3,4,5]);
        expect(sum).toBe(15);
    });
});
