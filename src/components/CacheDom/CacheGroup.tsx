import React, { useEffect, useMemo, forwardRef, useImperativeHandle } from 'react';
import { CacheContext } from './context';
import type { Root } from 'react-dom/client';
import { LRUCache } from './LRUCache';

interface CacheGroupProps {
  children: React.ReactNode;
  groupId: string;
  capacity?: number;
}

interface CacheGroupRef {
  clearCache: (key?: string, config?: { unmount?: boolean }) => void;
  getCacheKeys: () => string[];
}

export const CacheGroup = forwardRef<CacheGroupRef, CacheGroupProps>(function CacheGroup({ children, groupId, capacity = 10 }, ref) {
  const contextValue = useMemo(() => {
    const domCache = new LRUCache<string, HTMLElement>(capacity);
    const rootCache = new Map<string, Root>();

    return {
      domCache,
      rootCache,
      groupId: groupId
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
    getCacheKeys: () => contextValue.domCache.keys()
  }));

  useEffect(() => {
    return () => {
      contextValue.rootCache.forEach((root) => {
        queueMicrotask(() => {
          // 异步卸载，防止报错
          root.unmount();
        });
      });

      setTimeout(() => {
        contextValue.domCache.forEach((dom) => {
          dom.remove();
        });

        contextValue.domCache = new LRUCache<string, HTMLElement>(capacity);
        contextValue.rootCache = new Map<string, Root>();
      }, 100);
    };
  }, []);

  return <CacheContext.Provider value={contextValue}>{children}</CacheContext.Provider>;
});

export type { CacheGroupRef, CacheGroupProps };
