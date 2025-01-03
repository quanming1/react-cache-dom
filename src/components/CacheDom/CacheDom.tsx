import React, {
  useLayoutEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
  useContext,
} from "react";
import { CacheContext } from "./context";
import { useUpdateLayoutEffect } from "./hooks";
import { createRoot } from "react-dom/client";

interface CacheDomProps {
  cacheKey: string;
  children: React.ReactNode;
  disabled?: boolean;
  deps?: React.DependencyList;
  /** 缓存命中时的回调 */
  onCacheHit?: () => void;
  /** 缓存未命中时的回调 */
  onCacheMiss?: () => void;
}

interface CacheDomRef {}

const PREFIX = "__cache-dom";
/**
 * 为缓存key添加前缀
 * @param key 缓存key
 * @returns 添加前缀后的key
 */
const withPrefix = (key: string) => `${PREFIX}-${key}`;

/**
 * 创建缓存容器DOM元素
 * @param cacheKey 缓存key
 * @param containerRef 容器ref
 * @returns 容器React元素
 */
const createContainer = (
  cacheKey: string,
  containerRef: React.RefObject<HTMLDivElement>
) => (
  <div
    className={withPrefix(cacheKey)}
    cache-dom-container="true"
    ref={containerRef}
  />
);

/**
 * CacheDom组件 - 用于缓存DOM节点
 * @param props.cacheKey - 缓存的唯一标识
 * @param props.children - 需要被缓存的子元素
 * @param props.disabled - 是否禁用缓存
 * @param props.deps - 依赖数组，当依赖变化时会重新渲染子元素
 * @param props.onCacheHit - 缓存命中时的回调
 * @param props.onCacheMiss - 缓存未命中时的回调
 * @param ref - 用于暴露clearCache方法的ref
 */
// @ts-ignore
const CacheDom = forwardRef<CacheDomRef, CacheDomProps>(function CacheDom(
  { cacheKey, children, disabled = false, deps = [], onCacheHit, onCacheMiss },
  ref
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const context = useContext(CacheContext);
  const { current } = useRef<React.ReactNode>(
    createContainer(cacheKey, containerRef)
  );

  if (!context) {
    throw new Error("CacheDom 必须在 CacheGroup 中使用");
  }

  const { domCache, rootCache } = context;

  useImperativeHandle(ref, () => ({}));

  // 处理DOM缓存的初始化和命中
  useLayoutEffect(() => {
    if (disabled || !containerRef.current) return;

    if (!domCache.has(cacheKey)) {
      domCache.set(cacheKey, containerRef.current);
      const root = createRoot(containerRef.current);
      rootCache.set(cacheKey, root);
      root.render(<>{children}</>);
      onCacheMiss?.();
    } else {
      containerRef.current.appendChild(domCache.get(cacheKey)!);
      onCacheHit?.();
    }
  }, [cacheKey, disabled]);

  // 当deps变化时更新已缓存的内容
  useUpdateLayoutEffect(() => {
    if (!containerRef.current || disabled) return;

    const root = rootCache.get(cacheKey);
    if (root && deps.length > 0) {
      root.render(<>{children}</>);
    }
  }, [...deps, cacheKey]);

  return current;
});

export { CacheDom };
export type { CacheDomRef, CacheDomProps };
