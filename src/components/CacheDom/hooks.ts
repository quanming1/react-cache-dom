import { DependencyList, useRef } from "react";
import { EffectCallback } from "react";
import { useEffect, useLayoutEffect } from "react";

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
