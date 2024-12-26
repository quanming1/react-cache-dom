import { createContext } from "react";
import type { Root } from "react-dom/client";
import { LRUCache } from "./LRUCache";

export type Noop = (...props: any[]) => void;

export interface CacheContextValue {
  domCache: LRUCache<string, HTMLElement>;
  rootCache: Map<string, Root>;
  groupId: string;
  onDestroy: () => void;
}

export const CacheContext = createContext<CacheContextValue | null>(null);

export interface CacheDomContext {
  // 注册激活回调
  registerActiveCallback: (callback: Noop) => void;
  // 注册失活回调
  registerDeactiveCallback: (callback: Noop) => void;
}

export const CacheDomContext = createContext<CacheDomContext | null>(null);
