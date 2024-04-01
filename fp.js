
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

const reduce = (f,acc,iter) => {
    // iter가 없을 때는 acc가 iterable이라고 가정
    // acc를 이터레이터로 변환 후 첫번째 값을 꺼냄
    if (!iter) {
        iter = acc[Symbol.iterator]();
        acc = iter.next().value;
    }
    for (const a of iter) {
        acc = f(acc, a);
    }
    return acc
}

const go = (...args) => reduce((a, f) => f(a), args);

go(
    0,
    a=> a+1,
    a=> a+10,
    a => a+100,
    console.log
)

const isIterable = (a) => a && typeof a[Symbol.iterator];

const lazyFlatten = function *(iter) {
    for (const a of iter) {
        if (isIterable(a)) for (const b of a) yield b;
        else yield a;
    }
}

