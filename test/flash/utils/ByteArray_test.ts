import { ByteArray } from "../../../src/flash/utils/ByteArray";
import { expect } from "chai";
import "mocha";
import { Endian } from "../../../src/flash/utils/Endian";

describe("test ByteArray class", () => {
    it("test new", () => {
        let ba = new ByteArray();

        expect(ba.endian).to.equal(Endian.BIG_ENDIAN);
        expect(ba.position).to.equal(0);
        expect(ba.length).to.equal(0);
    });

    it("test set length", () => {
        let ba = new ByteArray();

        ba.length = 4;

        expect(ba.length).to.equal(4);

        ba.length = 8;

        expect(ba.length).to.equal(8);

        ba.length = 13;

        expect(ba.length).to.equal(13);

        ba.length = 16;

        expect(ba.length).to.equal(16);
    });

    it("test bytesAvailable", () => {
        let ba = new ByteArray();

        ba.length = 4;

        expect(ba.bytesAvailable).to.equal(4);

        ba.position = 2

        expect(ba.bytesAvailable).to.equal(2);

        ba.position = 4;

        expect(ba.bytesAvailable).to.equal(0);
    });

    it("test clear", () => {
        let ba = new ByteArray();

        ba.length = 4;
        ba.position = 4;

        ba.clear();

        expect(ba.length).to.equal(0);

        expect(ba.position).to.equal(0);
    });

    it("test write and read bool", () => {
        let ba = new ByteArray();

        ba.writeBoolean(true);

        ba.position = 0;

        expect(ba.readBoolean()).to.equal(true);
    });

    it("write and read i8/i16/i32", () => {
        let ba = new ByteArray();
        ba.writeByte(-1);
        ba.writeShort(-1);
        ba.writeInt(-1);
        ba.position = 0;

        expect(ba.readByte()).to.equal(-1);
        expect(ba.readShort()).to.equal(-1);
        expect(ba.readInt()).to.equal(-1);
    });

    it("write and read u8/u16/u32", () => {
        let ba = new ByteArray();
        ba.writeByte(1);
        ba.writeShort(1);
        ba.writeUnsignedInt(1);
        ba.position = 0;

        expect(ba.readUnsignedByte()).to.equal(1);
        expect(ba.readUnsignedShort()).to.equal(1);
        expect(ba.readUnsignedInt()).to.equal(1);
    });

    it("write and read f32/f64", () => {
        let ba = new ByteArray();
        ba.writeDouble(3.14);
        ba.writeDouble(9.8);
        ba.position = 0;

        expect(ba.readDouble()).to.equal(3.14);
        expect(ba.readDouble()).to.equal(9.8);
    });

    it("write and read string", () => {
        let ba = new ByteArray();
        ba.writeUTF("你好，我叫DayDayUp。");
        ba.writeUTF("你好，我是新来的犀利哥。");
        ba.position = 0;

        expect(ba.readUTF()).to.equal("你好，我叫DayDayUp。");
        expect(ba.readUTF()).to.equal("你好，我是新来的犀利哥。");
    });
});
