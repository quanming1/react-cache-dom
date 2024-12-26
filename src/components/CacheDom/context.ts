import { createContext } from "react";
import type { Root } from "react-dom/client";
import { LRUCache } from "./LRUCache";

export interface CacheContextValue {
  domCache: LRUCache<string, HTMLElement>;
  rootCache: Map<string, Root>;
  groupId: string;
  onDestroy: () => void;
}

export const CacheContext = createContext<CacheContextValue | null>(null);
