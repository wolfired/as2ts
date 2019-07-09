import { Endian } from "./Endian"

enum Mode {
    Read,
    Write,
}

export class ByteArray {
    private static BYTES_1: number = 1;
    private static BYTES_2: number = 2;
    private static BYTES_4: number = 4;
    private static BYTES_8: number = 8;

    public constructor(raw?: DataView) {
        this._raw = void 0 === raw ? new DataView(new ArrayBuffer(0)) : raw;
        this._endian = false;
        this._length = 0;
        this._position = 0;

        this._utf8decoder = new TextDecoder();
        this._utf8encoder = new TextEncoder();
    }

    private _raw: DataView;

    private _endian: boolean;
    private _length: number;
    private _position: number;

    private _utf8decoder: TextDecoder;
    private _utf8encoder: TextEncoder;

    public get endian(): Endian {
        return this._endian ? Endian.LITTLE_ENDIAN : Endian.BIG_ENDIAN;
    }

    public set endian(value: Endian) {
        this._endian = Endian.LITTLE_ENDIAN === value;
    }

    public get length(): number {
        return this._length;
    }

    public set length(value: number) {
        if (this._length === value) {
            return;
        }

        if (this._length < value) {
            this.need(value - this._length, Mode.Write);
        }

        this._length = value;

        if (this._position > this._length) {
            this._position = this._length;
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

    public get bytesAvailable(): number {
        return Math.max(0, this._length - this._position);
    }

    public clear(): void {
        this._length = 0;
        this._position = 0;
    }

    public readBoolean(): boolean {
        this.need(ByteArray.BYTES_1, Mode.Read);

        let value = this._raw.getUint8(this._position);

        this.move(ByteArray.BYTES_1, Mode.Read);

        return 0 !== value
    }

    public readByte(): number {
        this.need(ByteArray.BYTES_1, Mode.Read);

        let value = this._raw.getInt8(this._position);

        this.move(ByteArray.BYTES_1, Mode.Read);

        return value;
    }

    public readBytes(dst: ByteArray, offset: number, length: number = 0): void {
    }

    public readDouble(): number {
        this.need(ByteArray.BYTES_8, Mode.Read);

        let value = this._raw.getFloat64(this._position, this._endian);

        this.move(ByteArray.BYTES_8, Mode.Read);

        return value;
    }

    public readFloat(): number {
        this.need(ByteArray.BYTES_4, Mode.Read);

        let value = this._raw.getFloat32(this._position, this._endian);

        this.move(ByteArray.BYTES_4, Mode.Read);

        return value;
    }

    public readInt(): number {
        this.need(ByteArray.BYTES_4, Mode.Read);

        let value = this._raw.getInt32(this._position, this._endian);

        this.move(ByteArray.BYTES_4, Mode.Read);

        return value;
    }

    public readShort(): number {
        this.need(ByteArray.BYTES_2, Mode.Read);

        let value = this._raw.getInt16(this._position, this._endian);

        this.move(ByteArray.BYTES_2, Mode.Read);

        return value;
    }

    public readUnsignedByte(): number {
        this.need(ByteArray.BYTES_1, Mode.Read);

        let value = this._raw.getUint8(this._position);

        this.move(ByteArray.BYTES_1, Mode.Read);

        return value;
    }

    public readUnsignedInt(): number {
        this.need(ByteArray.BYTES_4, Mode.Read);

        let value = this._raw.getUint32(this._position, this._endian);

        this.move(ByteArray.BYTES_4, Mode.Read);

        return value;
    }

    public readUnsignedShort(): number {
        this.need(ByteArray.BYTES_2, Mode.Read);

        let value = this._raw.getUint16(this._position, this._endian);

        this.move(ByteArray.BYTES_2, Mode.Read);

        return value;
    }

    public readUTF(): string {
        return this.readUTFBytes(this.readUnsignedShort());
    }

    public readUTFBytes(length: number): string {
        this.need(length, Mode.Read);

        let str: string = this._utf8decoder.decode(new Uint8Array(this._raw.buffer, this._position, length));

        this.move(length, Mode.Read);

        return str;
    }

    public writeBoolean(value: boolean): void {
        this.need(ByteArray.BYTES_1, Mode.Write);

        this._raw.setUint8(this._position, value ? 1 : 0);

        this.move(ByteArray.BYTES_1);
    }

    public writeByte(value: number): void {
        this.need(ByteArray.BYTES_1, Mode.Write);

        this._raw.setInt8(this._position, value);

        this.move(ByteArray.BYTES_1);
    }

    public writeDouble(value: number): void {
        this.need(ByteArray.BYTES_8, Mode.Write);

        this._raw.setFloat64(this._position, value, this._endian);

        this.move(ByteArray.BYTES_8);
    }

    public writeFloat(value: number): void {
        this.need(ByteArray.BYTES_4, Mode.Write);

        this._raw.setFloat32(this._position, value, this._endian);

        this.move(ByteArray.BYTES_4);
    }

    public writeInt(value: number): void {
        this.need(ByteArray.BYTES_4, Mode.Write);

        this._raw.setInt32(this._position, value, this._endian);

        this.move(ByteArray.BYTES_4);
    }

    public writeShort(value: number): void {
        this.need(ByteArray.BYTES_2, Mode.Write);

        this._raw.setInt16(this._position, value, this._endian);

        this.move(ByteArray.BYTES_2);
    }

    public writeUnsignedInt(value: number): void {
        this.need(ByteArray.BYTES_4, Mode.Write);

        this._raw.setUint32(this._position, value, this._endian);

        this.move(ByteArray.BYTES_4);
    }

    public writeUTF(value: string): void {
        let bs = this._utf8encoder.encode(value);

        this.writeShort(bs.length);

        this.need(bs.length, Mode.Write);

        this.byte2byte(bs, new Uint8Array(this._raw.buffer, this._position));

        this.move(bs.length);
    }

    public writeUTFBytes(value: string): void {
        let bs = this._utf8encoder.encode(value);

        this.need(bs.length, Mode.Write);

        this.byte2byte(bs, new Uint8Array(this._raw.buffer, this._position));

        this.move(bs.length);
    }

    private need(bytes: number, mode: Mode = Mode.Write): void {
        if (Mode.Read == mode && bytes > this.bytesAvailable) {
            throw "EOFError";
        }

        if (Mode.Write == mode && (0 === this._raw.byteLength || (bytes += (this._position > this._length ? (this._position - this._length) : 0)) > this._raw.byteLength - this._length)) {
            let byteLength: number = 0 === this._raw.byteLength ? bytes + bytes : this._raw.byteLength + this._raw.byteLength;

            while (bytes > byteLength) {
                byteLength += byteLength;
            }

            this.byte2byte(new Uint8Array(this._raw.buffer), new Uint8Array((this._raw = new DataView(new ArrayBuffer(byteLength))).buffer));
        }
    }

    private move(bytes: number, mode: Mode = Mode.Write): void {
        this._position += bytes;

        if (Mode.Write == mode && this._length < this._position) {
            this._length = this._position;
        }
    }

    private byte2byte(src: Uint8Array, dst: Uint8Array): number {
        let length: number = Math.min(src.length, dst.length);

        for (let i = 0; i < length; ++i) {
            dst[i] = src[i];
        }

        return length;
    }
}
