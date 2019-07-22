import { Endian } from "./Endian"

const POINTER_POSITION: number = 0x1;
const POINTER_LENGTH: number = 0x2;
const POINTER_CAPACITY: number = 0x4;

const BYTES_1: number = 0x1;
const BYTES_2: number = 0x2;
const BYTES_4: number = 0x4;
const BYTES_8: number = 0x8;

const utf8encoder: TextEncoder = new TextEncoder();
const utf8decoder: TextDecoder = new TextDecoder();

/**
 * 提供用于优化读取/写入以及处理二进制数据的方法和属性.
 */
export class ByteArray {
    public constructor() {
        this._raw = new DataView(new ArrayBuffer(0));
        this.endian = Endian.BIG_ENDIAN;
        this.position = 0;
        this.length = 0;
    }

    private _raw: DataView;

    private _endian: boolean = false;
    private _length: number = 0;
    private _position: number = 0;

    public get endian(): Endian {
        return this._endian ? Endian.LITTLE_ENDIAN : Endian.BIG_ENDIAN;
    }

    public set endian(endian: Endian) {
        this._endian = Endian.LITTLE_ENDIAN === endian;
    }

    public get length(): number {
        return this._length;
    }

    public set length(newLen: number) {
        if (this._length === newLen) {
            return;
        }

        if (this._length < newLen) {
            this.checkCapacity(newLen);
        }

        this._length = newLen;

        if (this._position > this._length) {
            this.position = this._length;
        }
    }

    public get position(): number {
        return this._position;
    }

    public set position(value: number) {
        if (this._position === value) {
            return;
        }

        this._position = value;
    }

    /**
     * ByteArray 的剩余可读取字节数
     */
    public get bytesAvailable(): number {
        if (this._length > this._position) {
            return this._length - this._position;
        }

        return 0;
    }

    /**
     * 清空 ByteArray 的数据
     */
    public clear(): void {
        this.position = 0;
        this.length = 0;
    }

    /**
     * 从字节流中读取布尔值.
     * 
     * 读取单个字节, 如果字节非零, 则返回 true, 否则返回 false.
     */
    public readBoolean(): boolean {
        this.checkLength(BYTES_1);

        let value = this._raw.getUint8(this._position);

        this.movePointer(BYTES_1, POINTER_POSITION);

        return 0 !== value;
    }

    /**
     * 从字节流中读取带符号的字节.
     * 
     * 返回值的范围是从 -128 到 127.
     */
    public readByte(): number {
        this.checkLength(BYTES_1);

        let value = this._raw.getInt8(this._position);

        this.movePointer(BYTES_1, POINTER_POSITION);

        return value;
    }

    /**
     * 从字节流中读取一个 IEEE 754 双精度(64 位)浮点数.
     */
    public readDouble(): number {
        this.checkLength(BYTES_8);

        let value = this._raw.getFloat64(this._position, this._endian);

        this.movePointer(BYTES_8, POINTER_POSITION);

        return value;
    }

    /**
     * 从字节流中读取一个 IEEE 754 单精度(32 位)浮点数.
     */
    public readFloat(): number {
        this.checkLength(BYTES_4);

        let value = this._raw.getFloat32(this._position, this._endian);

        this.movePointer(BYTES_4, POINTER_POSITION);

        return value;
    }

    /**
     * 从字节流中读取一个带符号的 32 位整数.
     * 
     * 返回值的范围是从 -2147483648 到 2147483647.
     */
    public readInt(): number {
        this.checkLength(BYTES_4);

        let value = this._raw.getInt32(this._position, this._endian);

        this.movePointer(BYTES_4, POINTER_POSITION);

        return value;
    }

    /**
     * 从字节流中读取一个带符号的 16 位整数.
     * 
     * 返回值的范围是从 -32768 到 32767.
     */
    public readShort(): number {
        this.checkLength(BYTES_2);

        let value = this._raw.getInt16(this._position, this._endian);

        this.movePointer(BYTES_2, POINTER_POSITION);

        return value;
    }

    /**
     * 从字节流中读取无符号的字节.
     * 
     * 返回值的范围是从 0 到 255.
     */
    public readUnsignedByte(): number {
        this.checkLength(BYTES_1);

        let value = this._raw.getUint8(this._position);

        this.movePointer(BYTES_1, POINTER_POSITION);

        return value;
    }

    /**
     * 从字节流中读取一个无符号的 32 位整数.
     * 
     * 返回值的范围是从 0 到 4294967295.
     */
    public readUnsignedInt(): number {
        this.checkLength(BYTES_4);

        let value = this._raw.getUint32(this._position, this._endian);

        this.movePointer(BYTES_4, POINTER_POSITION);

        return value;
    }

    /**
     * 从字节流中读取一个无符号的 16 位整数.
     * 
     * 返回值的范围是从 0 到 65535.
     */
    public readUnsignedShort(): number {
        this.checkLength(BYTES_2);

        let value = this._raw.getUint16(this._position, this._endian);

        this.movePointer(BYTES_2, POINTER_POSITION);

        return value;
    }

    /**
     * 从字节流中读取一个 UTF-8 字符串. 假定字符串的前缀是无符号的短整型(以字节表示长度).
     */
    public readUTF(): string {
        return this.readUTFBytes(this.readUnsignedShort());
    }

    /**
     * 从字节流中读取一个由 length 参数指定的 UTF-8 字节序列, 并返回一个字符串.
     * 
     * @param length 
     */
    public readUTFBytes(length: number): string {
        this.checkLength(length);

        let str: string = utf8decoder.decode(new Uint8Array(this._raw.buffer, this._position, length));

        this.movePointer(length, POINTER_POSITION);

        return str;
    }

    /**
     * 写入布尔值. 根据 value 参数写入单个字节. 如果为 true, 则写入 1, 如果为 false, 则写入 0.
     * 
     * @param value 
     */
    public writeBoolean(value: boolean): void {
        this.checkCapacity(this._position + BYTES_1);

        this._raw.setUint8(this._position, value ? 1 : 0);

        this.movePointer(BYTES_1, POINTER_POSITION | POINTER_LENGTH);
    }

    /**
     * 在字节流中写入一个字节.
     * 
     * 使用参数的低 8 位. 忽略高 24 位.
     * 
     * @param value 
     */
    public writeByte(value: number): void {
        this.checkCapacity(this._position + BYTES_1);

        this._raw.setInt8(this._position, value);

        this.movePointer(BYTES_1, POINTER_POSITION | POINTER_LENGTH);
    }

    /**
     * 在字节流中写入一个 IEEE 754 双精度（64 位）浮点数.
     * 
     * @param value 
     */
    public writeDouble(value: number): void {
        this.checkCapacity(this._position + BYTES_8);

        this._raw.setFloat64(this._position, value, this._endian);

        this.movePointer(BYTES_8, POINTER_POSITION | POINTER_LENGTH);
    }

    /**
     * 在字节流中写入一个 IEEE 754 单精度(32 位)浮点数.
     * 
     * @param value 
     */
    public writeFloat(value: number): void {
        this.checkCapacity(this._position + BYTES_4);

        this._raw.setFloat32(this._position, value, this._endian);

        this.movePointer(BYTES_4, POINTER_POSITION | POINTER_LENGTH);
    }

    /**
     * 在字节流中写入一个带符号的 32 位整数.
     * 
     * @param value 
     */
    public writeInt(value: number): void {
        this.checkCapacity(this._position + BYTES_4);

        this._raw.setInt32(this._position, value, this._endian);

        this.movePointer(BYTES_4, POINTER_POSITION | POINTER_LENGTH);
    }

    /**
     * 在字节流中写入一个 16 位整数. 使用参数的低 16 位. 忽略高 16 位.
     * 
     * @param value 
     */
    public writeShort(value: number): void {
        this.checkCapacity(this._position + BYTES_2);

        this._raw.setInt16(this._position, value, this._endian);

        this.movePointer(BYTES_2, POINTER_POSITION | POINTER_LENGTH);
    }

    /**
     * 在字节流中写入一个无符号的 32 位整数.
     * 
     * @param value 
     */
    public writeUnsignedInt(value: number): void {
        this.checkCapacity(this._position + BYTES_4);

        this._raw.setUint32(this._position, value, this._endian);

        this.movePointer(BYTES_4, POINTER_POSITION | POINTER_LENGTH);
    }

    /**
     * 将 UTF-8 字符串写入字节流. 先写入以字节表示的 UTF-8 字符串长度(作为 16 位整数), 然后写入表示字符串字符的字节.
     * 
     * @param value 
     */
    public writeUTF(value: string): void {
        let bs = utf8encoder.encode(value);

        this.writeShort(bs.length);

        this.checkCapacity(this._position + bs.length);

        copy(new Uint8Array(this._raw.buffer, this._position), bs);

        this.movePointer(bs.length, POINTER_POSITION | POINTER_LENGTH);
    }

    /**
     * 将 UTF-8 字符串写入字节流. 类似于 writeUTF() 方法，但 writeUTFBytes() 不使用 16 位长度的词为字符串添加前缀.
     * 
     * @param value 
     */
    public writeUTFBytes(value: string): void {
        let bs = utf8encoder.encode(value);

        this.checkCapacity(this._position + bs.length);

        copy(new Uint8Array(this._raw.buffer, this._position), bs);

        this.movePointer(bs.length, POINTER_POSITION | POINTER_LENGTH);
    }

    private checkLength(needBytes: number): void {
        if (this.bytesAvailable < needBytes) {
            throw "EOFError";
        }

        return;
    }

    private checkCapacity(newCap: number): void {
        let oldCap = this._raw.byteLength;

        if (0 === oldCap) {
            this._raw = new DataView(new ArrayBuffer(newCap));
        } else {
            while (oldCap < newCap) {
                oldCap += oldCap;
            }

            let src = new Uint8Array(this._raw.buffer, 0, this._length);
            let dst = new Uint8Array((this._raw = new DataView(new ArrayBuffer(oldCap))).buffer);
            
            copy(dst, src);
        }
    }

    private movePointer(moveBytes: number, pointerType: number): void {
        let newPos = this._position + moveBytes;

        if (0 !== (POINTER_POSITION & pointerType)) {
            this._position = newPos;
        }

        if (0 !== (POINTER_LENGTH & pointerType) && this._length < newPos) {
            this._length = newPos;
        }
    }
}

function copy(dst: Uint8Array, src: Uint8Array): number {
    let length: number = Math.min(dst.byteLength, src.byteLength);

    for (let i = 0; i < length; ++i) {
        dst[i] = src[i];
    }

    return length;
}
