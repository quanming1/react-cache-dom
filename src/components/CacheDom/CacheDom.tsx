/* eslint-disable react/no-unknown-property */
import React, { useRef, useContext, useEffect, ComponentType, useLayoutEffect } from "react";
import { createRoot } from "react-dom/client";

import { CacheContext } from "./context";
import { RootMap } from "./prerender";
import { areDepsEqual, debounce, useUpdate } from "./helper";
const PREFIX = "__cache-dom";
const withPrefix = (key: string): string => `${PREFIX}-${key}`;
export const _FlushCallbacks = new Map<string, (deps: any) => void>();

interface CacheDomProps<T = Record<string, unknown>> {
  cacheKey: string; // 缓存key
  key: string; // 组件key
  Component: ComponentType<T>; // 组件
  disabled?: boolean; // 是否禁用缓存
  props?: T; // 依赖
  onCacheHit?: () => void; // 缓存命中回调
  onCacheMiss?: () => void; // 缓存未命中回调
  containerClassName?: string; // 容器类名
  containerStyle?: React.CSSProperties; // 容器样式
}

/**
 * 创建缓存容器
 */
const createContainer = (
  cacheKey: string,
  containerRef: React.RefObject<HTMLDivElement>,
  containerClassName?: string,
  containerStyle?: React.CSSProperties
): React.ReactNode => {
  return (
    <div className={`${withPrefix(cacheKey)} ${containerClassName || ""}`} cache-dom-container="true" ref={containerRef} style={containerStyle} />
  );
};

export function CacheDomWrapper<T = Record<string, unknown>>({
  Component,
  cacheKey,
  initProps,
}: {
  Component: ComponentType<T>;
  cacheKey: string;
  initProps: T;
}): React.ReactElement {
  const update = useUpdate();
  const depsRef = useRef<T>(initProps as T);

  useEffect(() => {
    _FlushCallbacks.set(
      cacheKey,
      debounce((deps: T) => {
        if (areDepsEqual(Object.values(depsRef.current as any), Object.values(deps as any))) return;
        depsRef.current = { ...deps };
        update();
      }, 50)
    );

    return () => {
      _FlushCallbacks.delete(cacheKey);
    };
  }, [cacheKey]);

  return <Component {...(depsRef.current as any)} />;
}

/**
 * CacheDom组件
 */
function CacheDom<T = Record<string, unknown>>({
  cacheKey,
  Component,
  disabled = false,
  props = {} as T,
  onCacheHit,
  onCacheMiss,
  containerClassName,
  containerStyle,
}: CacheDomProps<T>): JSX.Element {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const context = useContext(CacheContext);
  const eleContainer = useRef<React.ReactNode>(createContainer(cacheKey, containerRef, containerClassName, containerStyle));

  if (!context) {
    throw new Error("CacheDom 必须在 CacheGroup 中使用");
  }
  const { domCache, rootCache } = context;

  useLayoutEffect(() => {
    if (disabled || !containerRef.current) return;

    if (!domCache.has(cacheKey) && !RootMap.has(cacheKey)) {
      domCache.set(cacheKey, containerRef.current);
      const root = createRoot(containerRef.current);
      rootCache.set(cacheKey, root);
      root.render(<CacheDomWrapper<T> initProps={props} cacheKey={cacheKey} Component={Component} />);
      onCacheMiss?.();
    } else {
      const cachedElement = domCache.get(cacheKey) || RootMap.get(cacheKey)?.container;
      if (containerRef.current !== cachedElement) {
        containerRef.current.appendChild(cachedElement as Node);
      }
      onCacheHit?.();
    }
  }, [disabled]);

  useLayoutEffect(() => {
    _FlushCallbacks.get(cacheKey)?.(props);
  }, Object.values(props || {}));

  return disabled ? <Component {...(props as any)} /> : (eleContainer.current as any);
}

export { CacheDom };
export type { CacheDomProps };
