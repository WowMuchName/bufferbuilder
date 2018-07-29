# BufferBuilder

[![Build Status](https://travis-ci.org/WowMuchName/bufferbuilder.svg?branch=master)](https://travis-ci.org/WowMuchName/bufferbuilder)
[![Test Coverage](https://api.codeclimate.com/v1/badges/132bd9777ac703a2db08/test_coverage)](https://codeclimate.com/github/WowMuchName/bufferbuilder/test_coverage)
[![Maintainability](https://api.codeclimate.com/v1/badges/132bd9777ac703a2db08/maintainability)](https://codeclimate.com/github/WowMuchName/bufferbuilder/maintainability)

Provides an efficient builder for Buffers and utility methods to interact with them.

```
npm i ts-bufferbuilder --save
```

## Merging buffers
Buffers and strings can be merged into a buffer using the *append* method.
It supports the same parameter-types as the buffer-constructor.

```ts
let bufferBuilder: BufferBuilder = new BufferBuilder();

bufferBuilder.append(new Buffer("Any Buffer"));
bufferBuilder.append("Any String");
bufferBuilder.append("Any Èncoding", "latin1");

let mergedBuffer: Buffer = bufferBuilder.getBuffer();
```

Note that this is more efficient than other implementations out there since it only combines the parts
into a single buffer when needed. After they are combined the parts are discarded. You can continue to append
after the parts are joined creating new parts.

## isBuffer
Utility method that detects buffers.

```js
// Detect buffers
assert.isTrue(BufferBuilder.isBuffer(new Buffer("")));

// ... and nothing else
assert.isTrue(!BufferBuilder.isBuffer({}));
assert.isTrue(!BufferBuilder.isBuffer(1));
assert.isTrue(!BufferBuilder.isBuffer("1"));
assert.isTrue(!BufferBuilder.isBuffer(undefined));
assert.isTrue(!BufferBuilder.isBuffer(null));
assert.isTrue(!BufferBuilder.isBuffer([]));
assert.isTrue(!BufferBuilder.isBuffer(() => {}));
```

## toReadable
Turn a buffer into a Readable-Stream
```js
BufferBuilder.toReadable(new Buffer("Hello World")).pipe(outputsteam);
```

Or

```js
new BufferBuilder().append("Hello World").toReadable().pipe(outputsteam);
```

## toWritable
Create a writable that stores written data into the BufferBuilder
```js
inputStream.pipe(BufferBuilder.toWritable());
```
Note that multiple writable-streams can be created for the same BufferBuilder.
Closing the writable has no effect on the BufferBuilder.

## receive
Reads all remaining data from an input stream.

```js
new BufferBuilder().receive(inputStream)
  .then(bufferBuilder => doSomething(bufferBuilder.getBuffer()))
  .catch((err) => console.error(`Reading-Error ${err}`));
```

