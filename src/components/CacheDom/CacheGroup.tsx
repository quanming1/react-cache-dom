import React, {
  useEffect,
  useMemo,
  forwardRef,
  useImperativeHandle,
} from "react";
import { CacheContext } from "./context";
import type { Root } from "react-dom/client";
import { LRUCache } from "./LRUCache";

interface CacheGroupProps {
  children: React.ReactNode;
  groupId: string;
  capacity?: number;
}

interface CacheGroupRef {
  /** 清除缓存
   * @param key 可选的缓存key，如果不传则清除所有缓存
   * @param config 配置项，可选的卸载根节点
   */
  clearCache: (key?: string, config?: { unmount?: boolean }) => void;
  /** 获取当前缓存的所有key */
  getCacheKeys: () => string[];
  /** 获取缓存大小 */
  getCacheSize: () => number;
}

export const CacheGroup = forwardRef<CacheGroupRef, CacheGroupProps>(
  function CacheGroup({ children, groupId, capacity = 10 }, ref) {
    const contextValue = useMemo(() => {
      const domCache = new LRUCache<string, HTMLElement>(capacity);
      const rootCache = new Map<string, Root>();

      return {
        domCache,
        rootCache,
        groupId: groupId,
        onDestroy: () => {
          // 异步处理，防止：在 React 正在渲染时同步卸载根节点。
          // React 无法在当前渲染完成之前完成根节点的卸载，
          // 这可能会导致竞态条件
          Promise.resolve().then(() => {
            rootCache.forEach((root) => {
              try {
                root.unmount();
              } catch (e) {
                console.warn("Failed to unmount root:", e);
              }
            });
            domCache.clear();
            rootCache.clear();
          });
        },
      };
    }, [groupId, capacity]);

    useImperativeHandle(ref, () => ({
      clearCache: (key, { unmount = true } = {}) => {
        const clearRoot = (root: Root) => {
          if (unmount) {
            root.unmount();
          }
        };

        if (key) {
          const root = contextValue.rootCache.get(key);
          if (root) {
            Promise.resolve().then(() => {
              clearRoot(root);
              contextValue.rootCache.delete(key);
            });
          }
          contextValue.domCache.delete(key);
        } else {
          // 清除所有缓存
          Promise.resolve().then(() => {
            contextValue.rootCache.forEach(clearRoot);
            contextValue.domCache.clear();
            contextValue.rootCache.clear();
          });
        }
      },
      getCacheKeys: () => contextValue.domCache.keys(),
      getCacheSize: () => contextValue.domCache.size,
    }));

    useEffect(() => {
      return () => {
        contextValue.onDestroy();
      };
    }, []);

    return (
      <CacheContext.Provider value={contextValue}>
        {children}
      </CacheContext.Provider>
    );
  }
);

export type { CacheGroupRef, CacheGroupProps };
