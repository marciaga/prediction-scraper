import test from 'ava';

// test examples
test('Five Thirty Eight', t => {
    t.pass();
});

test('Five Thirty Eight Async', async t => {
    const bar = Promise.resolve('bar');

    t.is(await bar, 'bar');
});
