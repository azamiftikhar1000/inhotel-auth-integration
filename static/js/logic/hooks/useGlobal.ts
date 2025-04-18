"use client";

import { useSnapshot } from "valtio";
import { proxy } from "valtio";
import { subscribeKey } from "valtio/utils";
import { devtools } from "valtio/utils";

interface GlobalState {
  colormode: {
    selected: 'dark' | 'light';
  };
}

const globalState = proxy<GlobalState>({
  colormode: {
    selected: 'dark',
  },
});

// For debugging purposes
const NOTUSABLE = devtools(globalState, "new.global.state");

type Path<T> = T extends object
  ? {
      [K in keyof T]: `${K & string}` | `${K & string}.${Path<T[K]>}`;
    }[keyof T]
  : never;

type PathValue<T, P extends string> = P extends `${infer K}.${infer Rest}`
  ? K extends keyof T
    ? Rest extends Path<T[K]>
      ? PathValue<T[K], Rest>
      : never
    : never
  : P extends keyof T
  ? T[P]
  : never;

function get<T extends object, P extends Path<T>>(
  obj: T,
  path: P
): PathValue<T, P> {
  const keys = path.split(".");
  let result: any = obj;
  
  for (const key of keys) {
    result = result[key];
  }
  
  return result;
}

function useGlobal<T>(path: string[]): [T, (value: T) => void] {
  const fullPath = path.join(".");
  const snapshot = useSnapshot(globalState);
  
  const setValue = (value: T) => {
    let current: any = globalState;
    
    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]];
    }
    
    current[path[path.length - 1]] = value;
  };
  
  // @ts-ignore
  return [get(snapshot, fullPath), setValue];
}

export default useGlobal;
