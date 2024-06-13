import { Box } from "as-container/assembly";
import { serializeString } from "../serialize/string";
import { serializeBool } from "../serialize/bool";
import { serializeBox } from "../serialize/box";
import { serializeInteger } from "../serialize/integer";
import { serializeFloat } from "../serialize/float";
import { serializeObject } from "../serialize/object";
import { serializeDate } from "../serialize/date";
import { serializeArray } from "../serialize/array";
import { serializeMap } from "../serialize/map";
import { deserializeBoolean } from "../deserialize/bool";
import { deserializeArray } from "../deserialize/array";
import { deserializeFloat } from "../deserialize/float";
import { deserializeBox } from "../deserialize/box";
import { deserializeObject } from "../deserialize/object";
import { deserializeMap } from "../deserialize/map";
import { deserializeDate } from "../deserialize/date";
import { nullWord } from "./chars";
import { deserializeInteger } from "../deserialize/integer";
import { deserializeString } from "../deserialize/string";

/**
 * JSON Encoder/Decoder for AssemblyScript
 */
export namespace JSON {
  /**
   * Stringifies valid JSON data.
   * ```js
   * JSON.stringify<T>(data)
   * ```
   * @param data T
   * @returns string
   */
  // @ts-ignore: Decorator
  @inline export function stringify<T>(data: T): string {
    if (isNullable<T>() && changetype<usize>(data) == <usize>0) {
      return nullWord;
      // @ts-ignore
    } else if (isString<T>()) {
      return serializeString(data as string);
    } else if (isBoolean<T>()) {
      return serializeBool(data as bool);
    } else if (data instanceof Box) {
      return serializeBox(data);
    } else if (isInteger<T>()) {
      // @ts-ignore
      return serializeInteger<T>(data);
    } else if (isFloat<T>(data)) {
      // @ts-ignore
      return serializeFloat<T>(data);
      // @ts-ignore: Function is generated by transform
    } else if (isDefined(data.__SERIALIZE())) {
      // @ts-ignore
      return serializeObject(data);
    } else if (data instanceof Date) {
      return serializeDate(data);
    } else if (data instanceof Array) {
      return serializeArray(data);
    } else if (data instanceof Map) {
      return serializeMap(data);
    } else {
      throw new Error(
        `Could not serialize data of type ${nameof<T>()}. Make sure to add the correct decorators to classes.`
      );
    }
  }
  /**
   * Parses valid JSON strings into their original format.
   * ```js
   * JSON.parse<T>(data)
   * ```
   * @param data string
   * @returns T
   */

  // @ts-ignore: Decorator
  @inline export function parse<T>(data: string, initializeDefaultValues: boolean = false): T {
    if (isString<T>()) {
      // @ts-ignore
      return deserializeString(data);
    } else if (isBoolean<T>()) {
      return deserializeBoolean(data) as T;
    } else if (isInteger<T>()) {
      return deserializeInteger<T>(data);
    } else if (isFloat<T>()) {
      return deserializeFloat<T>(data);
    } else if (isArray<T>()) {
      // @ts-ignore
      return deserializeArray<T>(data);
    }
    let type: nonnull<T> = changetype<nonnull<T>>(0);
    if (type instanceof Box) {
      return deserializeBox<T>(data);
    } else if (isNullable<T>() && data == nullWord) {
      // @ts-ignore
      return null;
      // @ts-ignore
    } else if (isDefined(type.__JSON_Set_Key)) {
      return deserializeObject<T>(data.trimStart(), initializeDefaultValues);
    } else if (type instanceof Map) {
      return deserializeMap<T>(data.trimStart());
    } else if (type instanceof Date) {
      // @ts-ignore
      return deserializeDate(data);
    } else {
      throw new Error(
        `Could not deserialize data ${data} to type ${nameof<T>()}. Make sure to add the correct decorators to classes.`
      );
    }
  }
}

// @ts-ignore: Decorator
@global @inline function __parseObjectValue<T>(data: string, initializeDefaultValues: boolean): T {
  // @ts-ignore
  if (isString<T>()) return data;
  return JSON.parse<T>(data, initializeDefaultValues);
}

// Dirty fix
// @ts-ignore: Decorator
@global @inline function __JSON_Stringify<T>(data: T): string {
  return JSON.stringify(data);
}