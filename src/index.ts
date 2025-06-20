// 导出主要组件
export { CacheDom } from "./components/CacheDom/CacheDom";
export { CacheGroup } from "./components/CacheDom/CacheGroup";
export { CacheDomWrapper } from "./components/CacheDom/CacheDom";

// 导出类型定义
export type { CacheDomProps } from "./components/CacheDom/CacheDom";
export type { CacheGroupProps, CacheGroupRef } from "./components/CacheDom/CacheGroup";
export type { CacheContextValue } from "./components/CacheDom/context";

// 导出工具类
export { LRUCache } from "./components/CacheDom/LRUCache";

// 导出预渲染相关
export { CacheDomHelper, RootMap } from "./components/CacheDom/prerender";

// 导出缓存相关工具函数
export { cache, clearCache } from "./components/CacheDom/cache";

// 导出上下文
export { CacheContext } from "./components/CacheDom/context";

// 导出工具函数
export { mergeLRUCaches, isLRUCacheEqual, areDepsEqual, useImmediate } from "./components/CacheDom/helper";
