/// <reference path="./index.d.ts" />
import { bs } from "../modules/as-bs";

import { serializeString } from "./serialize/simple/string";
import { serializeArray } from "./serialize/simple/array";
import { serializeMap } from "./serialize/simple/map";
import { deserializeBoolean } from "./deserialize/simple/bool";
import { deserializeArray } from "./deserialize/simple/array";
import { deserializeFloat } from "./deserialize/simple/float";
import { deserializeObject } from "./deserialize/simple/object";
import { deserializeMap } from "./deserialize/simple/map";
import { deserializeDate } from "./deserialize/simple/date";
import { deserializeInteger } from "./deserialize/simple/integer";
import { deserializeString } from "./deserialize/simple/string";
import { serializeArbitrary } from "./serialize/simple/arbitrary";

import { Sink } from "./custom/sink";
import { NULL_WORD, QUOTE } from "./custom/chars";
import { dtoa_buffered, itoa_buffered } from "util/number";
import { serializeBool } from "./serialize/simple/bool";
import { serializeInteger } from "./serialize/simple/integer";
import { serializeFloat } from "./serialize/simple/float";
import { serializeObject } from "./serialize/simple/object";
import { ptrToStr } from "./util/ptrToStr";
import { bytes } from "./util";

export type Raw = string;

/**
 * Offset of the 'storage' property in the JSON.Value class.
 */
// @ts-ignore: Decorator valid here
@inline const STORAGE = offsetof<JSON.Value>("storage");

/**
 * JSON Encoder/Decoder for AssemblyScript
 */
export namespace JSON {
  /**
   * Serializes valid JSON data
   * ```js
   * JSON.stringify<T>(data)
   * ```
   * @param data T
   * @returns string
   */
  export function stringify<T>(data: T, out: string | null = null): string {
    if (isBoolean<T>()) {
      if (out) {
        if (<bool>data == true) {
          out = changetype<string>(__renew(changetype<usize>(out), 8));
          store<u64>(changetype<usize>(out), 28429475166421108);
        } else {
          out = changetype<string>(__renew(changetype<usize>(out), 10));
          store<u64>(changetype<usize>(out), 32370086184550502);
          store<u16>(changetype<usize>(out), 101, 8);
        }
        return out;
      }
      return data ? "true" : "false";
    } else if (isInteger<T>() && nameof<T>() == "usize" && data == 0) {
      if (out) {
        out = changetype<string>(__renew(changetype<usize>(out), 8));
        store<u64>(changetype<usize>(out), 30399761348886638);
        return out;
      }
      return NULL_WORD;
    } else if (isInteger<T>(data)) {
      if (out) {
        out = changetype<string>(__renew(changetype<usize>(out), sizeof<T>() << 3));

        // @ts-ignore
        const bytes = itoa_buffered(changetype<usize>(out), data) << 1;
        return (out = changetype<string>(__renew(changetype<usize>(out), bytes)));
      }
      return data.toString();
    } else if (isFloat<T>(data)) {
      if (out) {
        out = changetype<string>(__renew(changetype<usize>(out), 64));

        // @ts-ignore
        const bytes = dtoa_buffered(changetype<usize>(out), data) << 1;
        return (out = changetype<string>(__renew(changetype<usize>(out), bytes)));
      }
      return data.toString();
      // @ts-ignore: Function is generated by transform
    } else if (isNullable<T>() && changetype<usize>(data) == <usize>0) {
      if (out) {
        out = changetype<string>(__renew(changetype<usize>(out), 8));
        store<u64>(changetype<usize>(out), 30399761348886638);
        return out;
      }
      return NULL_WORD;
      // @ts-ignore
    } else if (isString<nonnull<T>>()) {
      if (out) {
        out = changetype<string>(__renew(changetype<usize>(out), bytes(data) + 4));
        // const oldSize = bs.byteLength;
        const oldBuf = bs.buffer;
        const newSize = bytes(data) + 4;
        const newBuf = __new(newSize, idof<string>());
        bs.setBuffer(newBuf);
        serializeString(changetype<string>(data));
        bs.setBuffer(oldBuf);
        return changetype<string>(newBuf);
      }
      serializeString(changetype<string>(data));
      return bs.out<string>();
      // @ts-ignore: Supplied by transform
    } else if (isDefined(data.__SERIALIZE) && isDefined(data.__ALLOCATE)) {
      // @ts-ignore
      data.__ALLOCATE();
      // @ts-ignore
      data.__SERIALIZE(changetype<usize>(data));
      return bs.out<string>();
      // @ts-ignore: Supplied by transform
    } else if (data instanceof Date) {
      out = out ? changetype<string>(__renew(changetype<usize>(out), 52)) : changetype<string>(__new(52, idof<string>()));

      store<u16>(changetype<usize>(out), QUOTE);
      memory.copy(changetype<usize>(out) + 2, changetype<usize>(data.toISOString()), 48);
      store<u16>(changetype<usize>(out), 50);
      return out;
    } else if (data instanceof Array) {
      // @ts-ignore
      serializeArray(changetype<nonnull<T>>(data));
      return bs.out<string>();
    } else if (data instanceof Map) {
      // @ts-ignore
      serializeMap(changetype<nonnull<T>>(data));
      return bs.out<string>();
    } else if (data instanceof JSON.Value) {
      serializeArbitrary(data);
      return bs.out<string>();
    } else if (data instanceof JSON.Box) {
      return JSON.stringify(data.value);
    } else {
      ERROR(`Could not serialize data of type ${nameof<T>()}. Make sure to add the correct decorators to classes.`);
    }
  }

  /**
   * Parses valid JSON strings into their original format
   * ```js
   * JSON.parse<T>(data)
   * ```
   * @param data string
   * @returns T
   */
  export function parse<T>(data: string): T {
    const dataSize = bytes(data);
    const dataPtr = changetype<usize>(data);
    if (isBoolean<T>()) {
      return deserializeBoolean(dataPtr, dataPtr + dataSize) as T;
    } else if (isInteger<T>()) {
      return deserializeInteger<T>(dataPtr, dataPtr + dataSize);
    } else if (isFloat<T>()) {
      return deserializeFloat<T>(dataPtr, dataPtr + dataSize);
    } else if (isNullable<T>() && data.length == 4 && data == "null") {
      // @ts-ignore
      return null;
    } else if (isString<T>()) {
      // @ts-ignore
      return deserializeString(dataPtr, dataPtr + dataSize, __new(dataSize - 4, idof<string>()));
    } else if (isArray<T>()) {
      // @ts-ignore
      return deserializeArray<nonnull<T>>(dataPtr, dataPtr + dataSize, changetype<usize>(instantiate<T>()));
    }
    let type: nonnull<T> = changetype<nonnull<T>>(0);
    // @ts-ignore: Defined by transform
    if (isDefined(type.__DESERIALIZE) && isDefined(type.__INITIALIZE)) {
      const out = __new(offsetof<nonnull<T>>(), idof<nonnull<T>>());
      // @ts-ignore
      changetype<nonnull<T>>(out).__INITIALIZE();
      // @ts-ignore
      return deserializeObject<nonnull<T>>(dataPtr, dataPtr + dataSize, out);
    } else if (type instanceof Map) {
      // @ts-ignore
      return deserializeMap<nonnull<T>>(dataPtr, dataPtr + dataSize);
    } else if (type instanceof Date) {
      // @ts-ignore
      return deserializeDate(dataPtr, dataPtr + dataSize);
    } else if (type instanceof JSON.Box) {
      // @ts-ignore
      return new JSON.Box(JSON.parse<indexof<T>>(data));
    } else {
      ERROR(`Could not deserialize data ${data} to type ${nameof<T>()}. Make sure to add the correct decorators to classes.`);
    }
  }

  /**
   * Enum representing the different types supported by JSON.
   */
  export enum Types {
    Raw = 0,
    U8 = 1,
    U16 = 2,
    U32 = 3,
    U64 = 4,
    F32 = 5,
    F64 = 6,
    Bool = 7,
    String = 8,
    Object = 9,
    Array = 10,
    Struct = 11,
  }

  export type Raw = string;

  export class Value {
    static METHODS: Map<u32, u32> = new Map<u32, u32>();
    public type: i32;

    // @ts-ignore
    private storage: u64;

    private constructor() {
      unreachable();
    }

    /**
     * Creates an JSON.Value instance from a given value.
     * @param value - The value to be encapsulated.
     * @returns An instance of JSON.Value.
     */
    @inline static from<T>(value: T): JSON.Value {
      if (value instanceof JSON.Value) {
        return value;
      }
      const out = changetype<JSON.Value>(__new(offsetof<JSON.Value>(), idof<JSON.Value>()));
      out.set<T>(value);
      return out;
    }

    /**
     * Sets the value of the JSON.Value instance.
     * @param value - The value to be set.
     */
    @inline set<T>(value: T): void {
      if (isBoolean<T>()) {
        this.type = JSON.Types.Bool;
        store<T>(changetype<usize>(this), value, STORAGE);
      } else if (value instanceof u8 || value instanceof i8) {
        this.type = JSON.Types.U8;
        store<T>(changetype<usize>(this), value, STORAGE);
      } else if (value instanceof u16 || value instanceof i16) {
        this.type = JSON.Types.U16;
        store<T>(changetype<usize>(this), value, STORAGE);
      } else if (value instanceof u32 || value instanceof i32) {
        this.type = JSON.Types.U32;
        store<T>(changetype<usize>(this), value, STORAGE);
      } else if (value instanceof u64 || value instanceof i64) {
        this.type = JSON.Types.U64;
        store<T>(changetype<usize>(this), value, STORAGE);
      } else if (value instanceof f32) {
        this.type = JSON.Types.F64;
        store<T>(changetype<usize>(this), value, STORAGE);
      } else if (value instanceof f64) {
        this.type = JSON.Types.F64;
        store<T>(changetype<usize>(this), value, STORAGE);
      } else if (isString<T>()) {
        this.type = JSON.Types.String;
        store<T>(changetype<usize>(this), value, STORAGE);
      } else if (value instanceof Map) {
        if (idof<T>() !== idof<Map<string, JSON.Value>>()) {
          abort("Maps must be of type Map<string, JSON.Value>!");
        }
        this.type = JSON.Types.Struct;
        store<T>(changetype<usize>(this), value, STORAGE);
        // @ts-ignore
      } else if (isDefined(value.__SERIALIZE)) {
        this.type = idof<T>() + JSON.Types.Struct;
        // @ts-ignore
        if (!JSON.Value.METHODS.has(idof<T>())) JSON.Value.METHODS.set(idof<T>(), value.__SERIALIZE.index);
        // @ts-ignore
        store<T>(changetype<usize>(this), value, STORAGE);
        // @ts-ignore
      } else if (isArray<T>() && idof<valueof<T>>() == idof<JSON.Value>()) {
        // @ts-ignore: T satisfies constraints of any[]
        this.type = JSON.Types.Array;
        store<T>(changetype<usize>(this), value, STORAGE);
      }
    }

    /**
     * Gets the value of the JSON.Value instance.
     * @returns The encapsulated value.
     */
    @inline get<T>(): T {
      return load<T>(changetype<usize>(this), STORAGE);
    }

    /**
     * Converts the JSON.Value to a string representation.
     * @returns The string representation of the JSON.Value.
     */
    toString(): string {
      switch (this.type) {
        case JSON.Types.U8:
          return this.get<u8>().toString();
        case JSON.Types.U16:
          return this.get<u16>().toString();
        case JSON.Types.U32:
          return this.get<u32>().toString();
        case JSON.Types.U64:
          return this.get<u64>().toString();
        case JSON.Types.String:
          return '"' + this.get<string>() + '"';
        case JSON.Types.Bool:
          return this.get<boolean>() ? "true" : "false";
        case JSON.Types.Array: {
          const arr = this.get<JSON.Value[]>();
          if (!arr.length) return "[]";
          const out = Sink.fromStringLiteral("[");
          const end = arr.length - 1;
          for (let i = 0; i < end; i++) {
            const element = unchecked(arr[i]);
            out.write(element.toString());
            out.write(",");
          }

          const element = unchecked(arr[end]);
          out.write(element.toString());

          out.write("]");
          return out.toString();
        }
        default: {
          const fn = JSON.Value.METHODS.get(this.type - JSON.Types.Struct);
          const value = this.get<usize>();
          return call_indirect<string>(fn, 0, value);
        }
      }
    }
  }

  /**
   * Box for primitive types
   */
  export class Box<T> {
    constructor(public value: T) { }
    /**
     * Creates a reference to a primitive type
     * This means that it can create a nullable primitive
     * ```js
     * JSON.stringify<Box<i32> | null>(null);
     * // null
     * ```
     * @param from T
     * @returns Box<T>
     */
    @inline static from<T>(value: T): Box<T> {
      return new Box(value);
    }
  }

  export function __serialize<T>(src: T): void {
    if (isBoolean<T>()) {
      serializeBool(src as bool);
    } else if (isInteger<T>() && nameof<T>() == "usize" && src == 0) {
      bs.ensureSize(8);
      store<u64>(bs.offset, 30399761348886638);
      bs.offset += 8;
    } else if (isInteger<T>()) {
      // @ts-ignore
      serializeInteger<T>(src);
    } else if (isFloat<T>(src)) {
      // @ts-ignore
      serializeFloat<T>(src);
      // @ts-ignore: Function is generated by transform
    } else if (isNullable<T>() && changetype<usize>(src) == <usize>0) {
      bs.ensureSize(8);
      store<u64>(bs.offset, 30399761348886638);
      bs.offset += 8;
    } else if (isString<nonnull<T>>()) {
      serializeString(src as string);
      // @ts-ignore: Supplied by transform
    } else if (isDefined(src.__SERIALIZE)) {
      // @ts-ignore
      serializeObject(changetype<nonnull<T>>(src));
    } else if (src instanceof Date) {
      // @ts-ignore
      serializeDate(changetype<nonnull<T>>(src));
    } else if (src instanceof Array) {
      // @ts-ignore
      serializeArray(changetype<nonnull<T>>(src));
    } else if (src instanceof Map) {
      // @ts-ignore
      serializeMap(changetype<nonnull<T>>(src));
    } else if (src instanceof JSON.Value) {
      serializeArbitrary(src);
    } else if (src instanceof JSON.Box) {
      __serialize(src.value);
    } else {
      ERROR(`Could not serialize provided data. Make sure to add the correct decorators to classes.`);
    }
  }
  export function __deserialize<T>(srcStart: usize, srcEnd: usize, dst: usize = 0): T {
    if (isBoolean<T>()) {
      // @ts-ignore: type
      return deserializeBoolean(srcStart, srcEnd);
    } else if (isInteger<T>()) {
      return deserializeInteger<T>(srcStart, srcEnd);
    } else if (isFloat<T>()) {
      return deserializeFloat<T>(srcStart, srcEnd);
    } else if (isString<T>()) {
      // @ts-ignore: type
      return deserializeString(srcStart, srcEnd, dst);
    } else if (isArray<T>()) {
      // @ts-ignore
      return deserializeArray<T>(srcStart, srcEnd, dst);
    } else {
      let type: nonnull<T> = changetype<nonnull<T>>(0);
      // @ts-ignore: declared by transform
      if (isDefined(type.__DESERIALIZE)) {
        return deserializeObject<T>(srcStart, srcEnd, dst);
      } else if (type instanceof Map) {
        // @ts-ignore: type
        return deserializeMap<T>(srcStart, srcEnd, dst);
      } else if (type instanceof Date) {
        // @ts-ignore: type
        return deserializeDate(srcStart, srcEnd);
      }
    }
    throw new Error(`Could not deserialize data '${ptrToStr(srcStart, srcEnd).slice(0, 100)}' to type. Make sure to add the correct decorators to classes.`);
  }
}
