import { StringObject } from './object';

test('string hash key', () => {
  const hello1 = new StringObject('Hello World');
  const hello2 = new StringObject('Hello World');
  const diff1 = new StringObject('My name is johnny');
  const diff2 = new StringObject('My name is johnny');

  expect(hello1.hashKey()).toEqual(hello2.hashKey());
  expect(diff1.hashKey()).toEqual(diff2.hashKey());
  expect(hello1.hashKey()).not.toEqual(diff1.hashKey());
});
