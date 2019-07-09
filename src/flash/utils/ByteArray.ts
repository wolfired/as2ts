import { Endian } from "./Endian"

export class ByteArray {
    public constructor(raw: DataView) {
        this._raw = raw;
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
        this._length = value;
    }

    public get position(): number {
        return this._position;
    }

    public set position(value: number) {
        this._position = value;
    }

    public get bytesAvailable(): number {
        return 0;
    }

    public clear(): void {
        this._length = 0;
        this._position = 0;
    }

    public readBoolean(): boolean {
        let value = this._raw.getUint8(this._position);
        this._position += 1;
        return 0 !== value
    }

    public readByte(): number {
        let value = this._raw.getInt8(this._position);
        this._position += 1;
        return value;
    }

    public readDouble(): number {
        let value = this._raw.getFloat64(this._position, this._endian);
        this._position += 8;
        return value;
    }

    public readFloat(): number {
        let value = this._raw.getFloat32(this._position, this._endian);
        this._position += 4;
        return value;
    }

    public readInt(): number {
        let value = this._raw.getInt32(this._position, this._endian);
        this._position += 4;
        return value;
    }

    public readShort(): number {
        let value = this._raw.getInt16(this._position, this._endian);
        this._position += 2;
        return value;
    }

    public readUnsignedByte(): number {
        let value = this._raw.getUint8(this._position);
        this._position += 1;
        return value;
    }

    public readUnsignedInt(): number {
        let value = this._raw.getUint32(this._position, this._endian);
        this._position += 4;
        return value;
    }

    public readUnsignedShort(): number {
        let value = this._raw.getUint16(this._position, this._endian);
        this._position += 2;
        return value;
    }

    public readUTF(): string {
        return this.readUTFBytes(this.readUnsignedShort());
    }

    public readUTFBytes(length: number): string {
        let str: string = this._utf8decoder.decode(new Uint8Array(this._raw.buffer, this._position, length));
        this._position += length;
        return str;
    }

    public writeBoolean(value: boolean): void {
        this._raw.setUint8(this._position, value ? 1 : 0);
        this._position += 1;
    }

    public writeByte(value: number): void {
        this._raw.setInt8(this._position, value ? 1 : 0);
        this._position += 1;
    }

    public writeDouble(value: number): void {
        this._raw.setFloat64(this._position, value, this._endian);
        this._position += 8;
    }

    public writeFloat(value: number): void {
        this._raw.setFloat32(this._position, value, this._endian);
        this._position += 4;
    }

    public writeInt(value: number): void {
        this._raw.setInt32(this._position, value, this._endian);
        this._position += 4;
    }

    public writeShort(value: number): void {
        this._raw.setInt16(this._position, value, this._endian);
        this._position += 2;
    }

    public writeUnsignedInt(value: number): void {
        this._raw.setUint32(this._position, value, this._endian);
        this._position += 4;
    }

    public writeUTF(value: string): void {
        let length = this.copyUTF(value);
        this.writeShort(length);
        this._position += length;
    }

    public writeUTFBytes(value: string): void {
        this._position += this.copyUTF(value);
    }

    private copyUTF(value: string): number {
        let bs = this._utf8encoder.encode(value);

        for (let i = 0; i < bs.length; ++i) {
            this._raw.setUint8(this._position + i, bs[i]);
        }

        return bs.length;
    }
}
