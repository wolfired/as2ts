import { ByteArray } from "../../../src/flash/utils/ByteArray";
import { expect } from "chai";
import "mocha";

describe("ByteArray class", () => {
    it("make a ByteArray", () => {
        let ba = new ByteArray();
        expect(ba.position).to.equal(0);
        expect(ba.length).to.equal(0);
        expect(ba.bytesAvailable).to.equal(0);

        ba.length = 2;
        expect(ba.position).to.equal(0);
        expect(ba.length).to.equal(2);
        expect(ba.bytesAvailable).to.equal(2);

        ba.position = 4;
        expect(ba.position).to.equal(4);
        expect(ba.length).to.equal(2);
        expect(ba.bytesAvailable).to.equal(0);

        ba.length = 9;
        expect(ba.position).to.equal(4);
        expect(ba.length).to.equal(9);
        expect(ba.bytesAvailable).to.equal(5);
    });

    it("write and read bool", () => {
        let ba = new ByteArray();

        ba.length = 1;
        expect(ba.length).to.equal(1);
        expect(ba.readBoolean()).to.equal(false);

        ba.position = 3;

        ba.writeBoolean(true);
        ba.writeBoolean(false);
        ba.writeByte(0);
        ba.writeByte(1);
        ba.position = 0;

        expect(ba.readBoolean()).to.equal(false);
        expect(ba.readBoolean()).to.equal(false);
        expect(ba.readBoolean()).to.equal(false);
        expect(ba.readBoolean()).to.equal(true);
        expect(ba.readBoolean()).to.equal(false);
        expect(ba.readBoolean()).to.equal(false);
        expect(ba.readBoolean()).to.equal(true);

        // expect(() => ba.readBoolean()).to.throw("EOFError");
    });

    it("write and read i8/i16/i32", () => {
        let ba = new ByteArray(new DataView(new ArrayBuffer(0)));
        ba.writeByte(-1);
        ba.writeShort(-1);
        ba.writeInt(-1);
        ba.position = 0;

        expect(ba.readByte()).to.equal(-1);
        expect(ba.readShort()).to.equal(-1);
        expect(ba.readInt()).to.equal(-1);
    });

    it("write and read u8/u16/u32", () => {
        let ba = new ByteArray(new DataView(new ArrayBuffer(0)));
        ba.writeByte(1);
        ba.writeShort(1);
        ba.writeUnsignedInt(1);
        ba.position = 0;

        expect(ba.readUnsignedByte()).to.equal(1);
        expect(ba.readUnsignedShort()).to.equal(1);
        expect(ba.readUnsignedInt()).to.equal(1);
    });

    it("write and read f32/f64", () => {
        let ba = new ByteArray(new DataView(new ArrayBuffer(0)));
        ba.writeDouble(3.14);
        ba.writeDouble(9.8);
        ba.position = 0;

        expect(ba.readDouble()).to.equal(3.14);
        expect(ba.readDouble()).to.equal(9.8);
    });

    it("write and read string", () => {
        let ba = new ByteArray(new DataView(new ArrayBuffer(0)));
        ba.writeUTF("你好吗？");
        ba.position = 0;

        expect(ba.readUTF()).to.equal("你好吗？");
    });
});
