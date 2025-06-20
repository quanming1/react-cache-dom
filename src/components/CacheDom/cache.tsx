/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useLayoutEffect, useRef, useState } from "react";
import { _FlushCallbacks } from "./CacheDom";
import { createRoot, Root } from "react-dom/client";
import { useImmediate } from "./helper";

let id = 0;

const CacheMap = new Map<string, { ele: HTMLElement; root: Root }>();
export const clearCache = () => {
  CacheMap.forEach((value) => {
    value.root.unmount();
  });

  CacheMap.clear();
};

interface ComponentPropsExtends {
  containerClassName?: string; // 容器类名
  containerStyle?: React.CSSProperties; // 容器样式
  onCacheHit?: () => void; // 缓存命中回调
  onCacheMiss?: () => void; // 缓存未命中回调
}

export function cache<COMP_TYPE>(
  Component: React.ComponentType<COMP_TYPE>,
  { cacheKey, isUpdateAfterUnmount = false }: { cacheKey: string; isUpdateAfterUnmount?: boolean }
) {
  return function (props: COMP_TYPE & ComponentPropsExtends) {
    const divRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
      if (!divRef.current) return;
      const hitElement = CacheMap.get(cacheKey);

      if (hitElement) {
        divRef.current.appendChild(hitElement.ele);
        props.onCacheHit?.();
      } else {
        const root = createRoot(divRef.current);

        const _Comp = () => {
          const [propsState, setPropsState] = useState<COMP_TYPE>(props);
          useImmediate(() => {
            _FlushCallbacks.set(cacheKey, (props) => {
              setPropsState(props);

              // 去除ComponentPropsExtends
              const { containerClassName, containerStyle, onCacheHit, onCacheMiss, ...rest } = props;
              setPropsState(rest);
            });

            return () => {
              _FlushCallbacks.delete(cacheKey);
            };
          }, []);

          return <Component {...(propsState as any)} />;
        };

        root.render(<_Comp />);
        CacheMap.set(cacheKey, { ele: divRef.current, root });
        props.onCacheMiss?.();
      }
    }, []);

    useImmediate(() => {
      _FlushCallbacks.get(cacheKey)?.(props);

      if (isUpdateAfterUnmount) {
        return () => {
          CacheMap.delete(cacheKey);
        };
      }
    }, ...Object.values(props));

    return <div data-id={id++} className={`cache-dom-container ${props.containerClassName || ""}`} style={props.containerStyle} ref={divRef} />;
  };
}
