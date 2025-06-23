import React, { useRef, useState, useEffect } from "react";
import { CacheDom, CacheGroup, CacheGroupRef } from "react-cache-dom";

// 一个简单的组件用于演示缓存
interface CounterProps {
  count: number;
  title: string;
}

const Counter: React.FC<CounterProps> = ({ count, title }) => {
  console.log(`Counter组件渲染了: ${title}, count: ${count}`);

  return (
    <div
      style={{
        padding: "20px",
        margin: "10px",
        border: "1px solid #ccc",
        borderRadius: "8px",
        backgroundColor: "#f9f9f9",
      }}
    >
      <h3>{title}</h3>
      <p>计数: {count}</p>
      <p>渲染时间: {new Date().toLocaleTimeString()}</p>
    </div>
  );
};

/**
 * 缓存容量测试 Demo
 * @returns
 */
const CacheCapacityDemo: React.FC = () => {
  const [count, setCount] = useState(0);
  const [showCached, setShowCached] = useState(true);
  // 添加一个状态来控制显示哪个缓存组件
  const [activeCache, setActiveCache] = useState<number>(1);
  const cacheGroupRef = useRef<CacheGroupRef>(null);
  // 添加状态记录上一次的缓存组件列表
  const [prevCacheKeys, setPrevCacheKeys] = useState<string[]>([]);
  const [currentCacheKeys, setCurrentCacheKeys] = useState<string[]>([]);

  // 创建一个切换缓存的函数
  const switchCache = (cacheNum: number) => {
    setActiveCache(cacheNum);
  };

  // 更新缓存键列表
  useEffect(() => {
    if (cacheGroupRef.current) {
      const keys = cacheGroupRef.current.getCacheKeys();
      setPrevCacheKeys(currentCacheKeys);
      setCurrentCacheKeys(keys);
    }
  }, [activeCache]);

  // 计算新增和删除的缓存键
  const addedKeys = currentCacheKeys.filter((key) => !prevCacheKeys.includes(key));
  const removedKeys = prevCacheKeys.filter((key) => !currentCacheKeys.includes(key));

  return (
    <div style={{ padding: "20px" }}>
      <h1>CacheDom 缓存容量测试 Demo</h1>

      <div style={{ marginBottom: "20px" }}>
        <button onClick={() => setCount((c) => c + 1)}>增加计数: {count}</button>
        <button onClick={() => setShowCached(!showCached)} style={{ marginLeft: "10px" }}>
          {showCached ? "隐藏" : "显示"} 缓存组件
        </button>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <p>切换显示不同的缓存组件 (当前显示: 缓存{activeCache}):</p>
        <div style={{ marginBottom: "10px" }}>
          <p>
            <strong>当前的缓存组件:</strong>
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
            {currentCacheKeys.map((key) => (
              <span
                key={key}
                style={{
                  padding: "3px 8px",
                  borderRadius: "4px",
                  backgroundColor: addedKeys.includes(key) ? "#e6ffe6" : "#f0f0f0",
                  border: addedKeys.includes(key) ? "1px solid #4caf50" : "1px solid #ccc",
                  color: addedKeys.includes(key) ? "#4caf50" : "inherit",
                  fontWeight: addedKeys.includes(key) ? "bold" : "normal",
                }}
              >
                {key} {addedKeys.includes(key) && "➕"}
              </span>
            ))}
          </div>

          {removedKeys.length > 0 && (
            <>
              <p>
                <strong>被移除的缓存组件:</strong>
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                {removedKeys.map((key) => (
                  <span
                    key={key}
                    style={{
                      padding: "3px 8px",
                      borderRadius: "4px",
                      backgroundColor: "#ffebeb",
                      border: "1px solid #ff5252",
                      color: "#ff5252",
                      textDecoration: "line-through",
                      fontWeight: "bold",
                    }}
                  >
                    {key} ❌
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
        <div>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
            <button
              key={num}
              onClick={() => switchCache(num)}
              style={{
                margin: "0 5px",
                backgroundColor: activeCache === num ? "#4caf50" : "#f0f0f0",
                color: activeCache === num ? "white" : "black",
                padding: "5px 10px",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            >
              缓存{num}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <p>
          <strong>说明：</strong> CacheGroup 的 capacity 设置为 5，但我们尝试缓存 8 个组件。
          当切换到不同的组件时，超过容量的旧缓存将被淘汰
        </p>
      </div>

      <CacheGroup ref={cacheGroupRef} groupId="demo-group" capacity={5}>
        {/* 普通组件 - 每次都会重新渲染
        <Counter count={count} title="普通组件 (不缓存)" /> */}

        {/* 多个缓存组件超出容量限制 */}
        {showCached && (
          <>
            {activeCache === 1 && (
              <CacheDom
                cacheKey="cached-counter-1"
                key="cached-counter-1"
                Component={Counter}
                props={{ count: count, title: "缓存组件 1" }}
                onCacheHit={() => console.log("缓存1命中！")}
                onCacheMiss={() => console.log("缓存1未命中，渲染")}
              />
            )}
            {activeCache === 2 && (
              <CacheDom
                cacheKey="cached-counter-2"
                key="cached-counter-2"
                Component={Counter}
                props={{ count: count, title: "缓存组件 2" }}
                onCacheHit={() => console.log("缓存2命中！")}
                onCacheMiss={() => console.log("缓存2未命中，渲染")}
              />
            )}
            {activeCache === 3 && (
              <CacheDom
                cacheKey="cached-counter-3"
                key="cached-counter-3"
                Component={Counter}
                props={{ count: count, title: "缓存组件 3" }}
                onCacheHit={() => console.log("缓存3命中！")}
                onCacheMiss={() => console.log("缓存3未命中，渲染")}
              />
            )}
            {activeCache === 4 && (
              <CacheDom
                cacheKey="cached-counter-4"
                key="cached-counter-4"
                Component={Counter}
                props={{ count: count, title: "缓存组件 4" }}
                onCacheHit={() => console.log("缓存4命中！")}
                onCacheMiss={() => console.log("缓存4未命中，渲染")}
              />
            )}
            {activeCache === 5 && (
              <CacheDom
                cacheKey="cached-counter-5"
                key="cached-counter-5"
                Component={Counter}
                props={{ count: count, title: "缓存组件 5" }}
                onCacheHit={() => console.log("缓存5命中！")}
                onCacheMiss={() => console.log("缓存5未命中，渲染")}
              />
            )}
            {activeCache === 6 && (
              <CacheDom
                cacheKey="cached-counter-6"
                key="cached-counter-6"
                Component={Counter}
                props={{ count: count, title: "缓存组件 6" }}
                onCacheHit={() => console.log("缓存6命中！")}
                onCacheMiss={() => console.log("缓存6未命中，渲染")}
              />
            )}
            {activeCache === 7 && (
              <CacheDom
                cacheKey="cached-counter-7"
                key="cached-counter-7"
                Component={Counter}
                props={{ count: count, title: "缓存组件 7" }}
                onCacheHit={() => console.log("缓存7命中！")}
                onCacheMiss={() => console.log("缓存7未命中，渲染")}
              />
            )}
            {activeCache === 8 && (
              <CacheDom
                cacheKey="cached-counter-8"
                key="cached-counter-8"
                Component={Counter}
                props={{ count: count, title: "缓存组件 8" }}
                onCacheHit={() => console.log("缓存8命中！")}
                onCacheMiss={() => console.log("缓存8未命中，渲染")}
              />
            )}
          </>
        )}
      </CacheGroup>
    </div>
  );
};

export default CacheCapacityDemo;
