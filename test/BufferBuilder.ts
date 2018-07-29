import {
    assert,
} from "chai";
import { BufferBuilder } from "../lib";
import { Writable, Readable } from "stream";

describe("BufferBuilder", function () {
    describe("#isBuffer", () => {
        it("should detect buffers", () => {
            assert.isTrue(BufferBuilder.isBuffer(new Buffer("")));
        });
        it("shouldn't detect non buffers", () => {
            assert.isTrue(!BufferBuilder.isBuffer({}));
            assert.isTrue(!BufferBuilder.isBuffer(1));
            assert.isTrue(!BufferBuilder.isBuffer("1"));
            assert.isTrue(!BufferBuilder.isBuffer(undefined));
            assert.isTrue(!BufferBuilder.isBuffer(null));
            assert.isTrue(!BufferBuilder.isBuffer([]));
            assert.isTrue(!BufferBuilder.isBuffer(() => {}));
        });
    });
    describe("#append", () => {
        it("should append strings", () => {
            let bb: BufferBuilder = new BufferBuilder();
            bb.append("Hello").append(" ").append("World");
            assert.equal(bb.toString(), "Hello World");
        });
        it("should append buffers", () => {
            let bb: BufferBuilder = new BufferBuilder();
            bb.append(new Buffer("Hello")).append(" ").append(new Buffer("World"));
            assert.equal(bb.toBuffer().toString(), "Hello World");
            bb.append(new Buffer(" ")).append("Goodbye ").append(new Buffer("World"));
            assert.equal(bb.toBuffer().toString(), "Hello World Goodbye World");
            assert.equal(bb.toBuffer().toString(), "Hello World Goodbye World");
        });
        it("should append with none default encoding", () => {
            let bb: BufferBuilder = new BufferBuilder();
            bb.append(new Buffer("ÄÜÖ", "utf8").toString("latin1"), "latin1");
            assert.equal(bb.toString("utf8"), "ÄÜÖ");
        });
    });
    describe("#asWritable", () => {
        it("should append strings", (c) => {
            let bb: BufferBuilder = new BufferBuilder();
            let writable: Writable = bb.toWritable();
            writable.write("Hello", () => {
                writable.write(" ", () => {
                    writable.end("World", () => {
                        c();
                    });
                });
            });
        });
    });
    describe("#toReadble", () => {
        it("should read", (done) => {
            let src: BufferBuilder = new BufferBuilder();
            let dst: BufferBuilder = new BufferBuilder();
            src.append("Hello").append(" ").append("World");
            let writable: Writable = dst.toWritable();

            writable.on("finish", () => {
                assert.equal(dst.toString(), "Hello World");
                done();
            });
            src.toReadable().pipe(writable, {
                end: true,
            });
        });
    });
    describe("#receive", () => {
        it("should receive", (done) => {
            let src: BufferBuilder = new BufferBuilder();
            let dst: BufferBuilder = new BufferBuilder();
            src.append("Hello").append(" ").append("World");
            dst.receive(src.toReadable()).then(dst => {
                assert.equal(dst.toString(), "Hello World");
                done();
            });
        });
        it("should handle errors", (done) => {
            let dst: BufferBuilder = new BufferBuilder();
            dst.receive(new Readable({
                read() {
                    this.emit("error", "Something");
                }
            })).catch(error => {
                assert.equal(error, "Something");
                done();
            });
        });
    });
});
