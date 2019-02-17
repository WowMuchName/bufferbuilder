import { Readable, Writable } from "stream";

export type CollectableData = string | Buffer;

export class BufferBuilder {
    public static defaultEncoding = "utf8";

    /**
     * Turns the supplied <code>data</code> into a buffer. If the data
     * already is a buffer, it is returned.
     *
     * @param data to convert to a buffer
     * @param encoding to use if <code>data</code> is a string
     * @returns a buffer
     */
    public static toBuffer(data: CollectableData, encoding?: string): Buffer {
        if (BufferBuilder.isBuffer(data)) {
            return data as Buffer;
        }
        if (typeof encoding === "string") {
            return Buffer.from(data.toString(), encoding);
        }
        return Buffer.from(data.toString());
    }

    /**
     * Turns the supplied <code>Buffer</code> into a readable
     * @param buffer to turn into a readable
     */
    public static toReadable(buffer: Buffer): Readable {
        let pushed = false;
        return new Readable({
            read(size) {
                if (!pushed) {
                    this.push(buffer);
                    pushed = true;
                } else {
                    this.push(null);
                }
            },
        });
    }

    /**
     * Checks if the supplied <code>data</code> is a buffer.
     *
     * @param data to check
     */
    public static isBuffer(data: any) {
        return !!data && !!data.constructor.prototype && data.constructor.prototype === Buffer.prototype;
    }

    public encoding: string = BufferBuilder.defaultEncoding;
    private buffer: Buffer = Buffer.alloc(0);
    private partsToAppend: Buffer[] = [];

    /**
     * Create an empty buffer-builder
     *
     * @param encoding to use if not specified. Defaults to utf8
     */
    public constructor(encoding?: string) {
        this.encoding = encoding || BufferBuilder.defaultEncoding;
    }

    /**
     * Append data to the buffer.
     *
     * @param data to append
     * @param encoding to use if <code>data</code> is a string
     */
    public append(data: CollectableData, encoding?: string): BufferBuilder {
        this.partsToAppend.push(BufferBuilder.toBuffer(data, encoding));
        return this;
    }

    /**
     * Read all content from the <code>readable</code>.
     * @param readable to read data from
     * @returns a promise that is resolved when all data has been read or rejected if the reader encounters an error
     */
    public receive(readable: Readable): Promise<BufferBuilder> {
        const writable: Writable = this.toWritable();
        return new Promise((res, rej) => {
            writable.on("finish", () => {
                res(this);
            });
            readable.on("error", (err) => {
                rej(err);
            });
            readable.pipe(writable, {
                end: true,
            });
        });
    }

    /**
     * Creates a buffer of all appended parts.
     */
    public toBuffer(): Buffer {
        if (this.partsToAppend.length !== 0) {
            let size = this.buffer.length;
            for (const part of this.partsToAppend) {
                size += part.length;
            }
            const oldBuffer = this.buffer;
            this.buffer = Buffer.alloc(size);
            oldBuffer.copy(this.buffer, 0);
            let ptr = oldBuffer.length;
            for (const part of this.partsToAppend) {
                part.copy(this.buffer, ptr);
                ptr += part.length;
            }
            this.partsToAppend = [];
        }
        return this.buffer;
    }

    /**
     * Create a Readable form the <b>current</b> contents of this BufferBuilder.
     */
    public toReadable(): Readable {
        return BufferBuilder.toReadable(this.toBuffer());
    }

    /**
     * Create a Writable from this BufferBuilder.
     */
    public toWritable(): Writable {
        return new Writable({
            write: (chunk, encoding, callback) => {
                this.append(chunk, encoding);
                callback();
            },
        });
    }

    /**
     * Gets the buffer as a string
     * @param encoding to use
     * @param start offset of the string
     * @param end offset of the string
     */
    public toString(encoding?: string, start?: number, end?: number): string {
        return this.toBuffer().toString(encoding, start, end);
    }
}
