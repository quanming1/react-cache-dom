import { LRUCache } from "./LRUCache";
import { useRef, useEffect, type DependencyList, useState } from "react";

/**
 * 合并两个LRUCache实例，生成一个新的LRUCache实例
 */
export function mergeLRUCaches<K extends string, V>(source1: LRUCache<K, V>, source2: LRUCache<K, V>): LRUCache<K, V> {
  const mergedCache = new LRUCache<K, V>(source1.capacity + source2.capacity);

  for (const key of source1.keys()) {
    mergedCache.set(key, source1.get(key)!);
  }

  for (const key of source2.keys()) {
    mergedCache.set(key, source2.get(key)!);
  }

  return mergedCache;
}

/**
 * 检查两个LRUCache实例是否相等
 */
export function isLRUCacheEqual<K extends string, V>(cache1: LRUCache<K, V>, cache2: LRUCache<K, V>): boolean {
  if (cache1.size !== cache2.size) {
    return false;
  }

  let isEqual = true;
  for (const key of cache1.keys()) {
    if (!cache2.has(key) || cache2.get(key) !== cache1.get(key)) {
      isEqual = false;
      break;
    }
  }

  return isEqual;
}

type CleanupFunction = (() => void) | undefined;
type ImmediateCallback = () => CleanupFunction | void;

// 检查两个依赖列表是否相等
export const areDepsEqual = (prevDeps: DependencyList | undefined, nextDeps: DependencyList | undefined): boolean => {
  if (prevDeps === nextDeps) return true;
  if (prevDeps?.length !== nextDeps?.length) return false;
  return prevDeps?.every((dep: any, i: number) => Object.is(dep, nextDeps?.[i])) ?? false;
};

export const useImmediate = (fn: ImmediateCallback, deps?: DependencyList, initExec = true): void => {
  const prevDepsRef = useRef<DependencyList>();
  const isInitialMount = useRef(initExec);
  const cleanupRef = useRef<CleanupFunction | null>(null);

  if (isInitialMount.current || !areDepsEqual(prevDepsRef.current, deps)) {
    if (typeof cleanupRef.current === "function") {
      cleanupRef.current();
      cleanupRef.current = null;
    }
    cleanupRef.current = fn() as CleanupFunction;

    prevDepsRef.current = [...(deps || [])];
    isInitialMount.current = false;
  }

  useEffect(() => {
    return () => {
      if (typeof cleanupRef.current === "function") {
        cleanupRef.current();
        cleanupRef.current = undefined;
      }
    };
  }, []);
};

// 防抖
export function debounce(fun: (...props: any[]) => any, delay = 200) {
  let timer: any = null;

  return function (...args: Parameters<typeof fun>) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fun(...args), delay);
  };
}

export function useUpdate() {
  const [, setState] = useState({});
  return () => setState({});
}
