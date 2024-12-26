import { DependencyList, useContext, useRef } from "react";
import { EffectCallback } from "react";
import { useEffect, useLayoutEffect } from "react";
import { CacheContext } from "./context";
import { Noop } from "./context";

export function useUpdateEffect(effect: EffectCallback, deps: DependencyList) {
  const isMounted = useRef(false);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
    } else {
      return effect();
    }
  }, deps);
}

export function useUpdateLayoutEffect(
  effect: EffectCallback,
  deps: DependencyList
) {
  const isMounted = useRef(false);

  useLayoutEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
    } else {
      return effect();
    }
  }, deps);
}

/**
 * 组件激活时触发Hook
 * @param callback 激活时的回调函数
 */
export function useActivated(callback: Noop) {
  const context = useContext(CacheContext);
  if (!context) {
    console.warn("请在CacheGroup组件中使用useActivated");
    return;
  }

  useUpdateLayoutEffect(() => {
    callback();
  }, []);
}

/**
 * 组件失活时触发Hook
 * @param callback 失活时的回调函数
 */
export function useDeactivated(callback: Noop) {
  useLayoutEffect(() => {
    return () => {
      callback();
    };
  }, []);
}
