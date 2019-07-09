import { ByteArray } from "./ByteArray";
import { expect } from "chai";
import "mocha";

describe('ByteArray class', () => {
    it('write and read uint', () => {
        let ba = new ByteArray(new DataView(new ArrayBuffer(16)));
        ba.writeUnsignedInt(0x87654321);
        ba.position = 0;
        expect(ba.readUnsignedByte()).to.equal(0x87);
        expect(ba.readUnsignedByte()).to.equal(0x65);
        expect(ba.readUnsignedByte()).to.equal(0x43);
        expect(ba.readUnsignedByte()).to.equal(0x21);
    });
});