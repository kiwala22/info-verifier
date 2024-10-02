/* eslint-disable @typescript-eslint/no-explicit-any */
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import transform from "lodash/transform";
import isEmpty from "lodash/isEmpty";
import isObject from "lodash/isObject";
import { IHashMapGeneric } from "@/types";


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function toDotNotation(obj: IHashMapGeneric<any>, prefix: string = "") {
  return transform(
    obj,
    (result, value, key) => {
      const fullKey = prefix ? `${prefix}.${key}` : key;

      if (isObject(value) && !isEmpty(value)) {
        // Recursively call for nested objects
        Object.assign(result, toDotNotation(value, fullKey));
      } else {
        result[fullKey] = value;
      }
    },
    {} as IHashMapGeneric<any>
  );
}
