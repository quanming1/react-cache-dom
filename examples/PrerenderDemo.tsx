import React, { useState, useEffect, useRef } from "react";
import { CacheDom, CacheGroup, CacheGroupRef, CacheDomHelper } from "../CacheDom/src/index";

// 为window添加__PRERENDERED_COMPONENTS__属性
declare global {
  interface Window {
    __PRERENDERED_COMPONENTS__?: Record<
      string,
      { Component: React.ComponentType<any>; props: any }
    >;
    requestIdleCallback:
      | ((callback: IdleRequestCallback, options?: IdleRequestOptions) => number)
      | undefined;
    cancelIdleCallback: ((handle: number) => void) | undefined;
  }
}

// 如果浏览器不支持requestIdleCallback，使用setTimeout模拟
const requestIdleCallbackPolyfill = (
  callback: IdleRequestCallback,
  options?: IdleRequestOptions,
): number => {
  const start = Date.now();
  return window.setTimeout(() => {
    callback({
      didTimeout: false,
      timeRemaining: () => Math.max(0, 50 - (Date.now() - start)),
    });
  }, 1);
};

const cancelIdleCallbackPolyfill = (id: number): void => {
  clearTimeout(id);
};

// 使用原生requestIdleCallback或polyfill
const requestIdleCallbackShim = window.requestIdleCallback || requestIdleCallbackPolyfill;
const cancelIdleCallbackShim = window.cancelIdleCallback || cancelIdleCallbackPolyfill;

// 模拟一个复杂的表单组件
interface ComplexItemProps {
  id: number;
  title: string;
  content: string;
  isActive: boolean;
  extraData?: {
    tags?: string[];
    author?: string;
    createdAt?: string;
    likes?: number;
    comments?: Array<{ id: number; text: string; author: string }>;
    details?: Array<{ key: string; value: string }>;
  };
}

const ComplexItem: React.FC<ComplexItemProps> = ({ id, title, content, isActive, extraData }) => {
  // 模拟复杂渲染
  console.log(`渲染复杂项: ${id} - ${title}`);

  // 模拟耗时操作
  const startTime = performance.now();
  while (performance.now() - startTime < 5) {
    // 空循环，模拟5毫秒的渲染时间
  }

  // 生成大量DOM节点
  const generateManyDomNodes = () => {
    const nodes = [];
    // 生成1000个DOM节点
    for (let i = 0; i < 200; i++) {
      nodes.push(
        <div key={`node-${i}`} style={{ padding: "2px", margin: "1px", fontSize: "10px" }}>
          <span style={{ color: i % 2 === 0 ? "#666" : "#999" }}>节点 {i}:</span>
          <span style={{ marginLeft: "4px" }}>{Math.random().toString(36).substring(2, 6)}</span>
        </div>,
      );
    }
    return nodes;
  };

  return (
    <div
      style={{
        padding: "15px",
        margin: "10px 0",
        border: "1px solid #ddd",
        borderRadius: "8px",
        backgroundColor: isActive ? "#f0f8ff" : "#fff",
      }}
    >
      <h3 style={{ marginTop: 0 }}>{title}</h3>
      <p>{content}</p>

      {extraData && (
        <div style={{ marginTop: "10px" }}>
          {extraData.author && (
            <p style={{ margin: "5px 0" }}>
              <strong>作者:</strong> {extraData.author}
            </p>
          )}
          {extraData.createdAt && (
            <p style={{ margin: "5px 0" }}>
              <strong>创建时间:</strong> {extraData.createdAt}
            </p>
          )}
          {extraData.likes !== undefined && (
            <p style={{ margin: "5px 0" }}>
              <strong>点赞:</strong> {extraData.likes}
            </p>
          )}

          {extraData.tags && extraData.tags.length > 0 && (
            <div style={{ margin: "10px 0" }}>
              {extraData.tags.map((tag, index) => (
                <span
                  key={index}
                  style={{
                    backgroundColor: "#eee",
                    padding: "3px 8px",
                    borderRadius: "4px",
                    marginRight: "5px",
                    fontSize: "12px",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {extraData.comments && extraData.comments.length > 0 && (
            <div style={{ marginTop: "15px" }}>
              <h4 style={{ margin: "5px 0" }}>评论 ({extraData.comments.length})</h4>
              {extraData.comments.map((comment) => (
                <div key={comment.id} style={{ padding: "8px", borderBottom: "1px solid #eee" }}>
                  <p style={{ margin: "0", fontSize: "14px" }}>{comment.text}</p>
                  <p style={{ margin: "3px 0 0", fontSize: "12px", color: "#666" }}>
                    {comment.author}
                  </p>
                </div>
              ))}
            </div>
          )}

          {extraData.details && extraData.details.length > 0 && (
            <div style={{ marginTop: "15px" }}>
              <h4 style={{ margin: "5px 0" }}>详细信息</h4>
              <div
                style={{
                  maxHeight: "150px",
                  overflow: "auto",
                  border: "1px solid #eee",
                  padding: "5px",
                }}
              >
                {extraData.details.map((detail, index) => (
                  <div
                    key={`detail-${index}`}
                    style={{ display: "flex", borderBottom: "1px solid #f5f5f5", padding: "2px 0" }}
                  >
                    <div style={{ flex: "0 0 100px", fontWeight: "bold", fontSize: "12px" }}>
                      {detail.key}:
                    </div>
                    <div style={{ flex: "1", fontSize: "12px" }}>{detail.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
        <input type="text" placeholder="输入评论..." style={{ flex: 1 }} />
        <button style={{ padding: "5px 10px" }}>提交</button>
      </div>

      <div
        style={{ marginTop: "10px", border: "1px solid #eee", borderRadius: "4px", padding: "5px" }}
      >
        <details>
          <summary style={{ cursor: "pointer", fontWeight: "bold" }}>
            查看详细DOM节点 (200+)
          </summary>
          <div style={{ maxHeight: "200px", overflow: "auto", fontSize: "10px" }}>
            {generateManyDomNodes()}
          </div>
        </details>
      </div>

      <div style={{ fontSize: "12px", color: "#666", marginTop: "10px" }}>
        ID: {id} | 渲染时间: {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
};

// 生成随机标签
const generateRandomTags = (): string[] => {
  const allTags = [
    "技术",
    "前端",
    "React",
    "Vue",
    "Angular",
    "JavaScript",
    "TypeScript",
    "性能优化",
    "缓存",
    "渲染",
    "组件",
    "状态管理",
  ];
  const count = Math.floor(Math.random() * 4) + 1; // 1-4个标签
  const tags: string[] = [];

  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * allTags.length);
    if (!tags.includes(allTags[randomIndex])) {
      tags.push(allTags[randomIndex]);
    }
  }

  return tags;
};

// 生成随机评论
const generateRandomComments = (): Array<{ id: number; text: string; author: string }> => {
  const commentCount = Math.floor(Math.random() * 3); // 0-2条评论
  return Array.from({ length: commentCount }, (_, i) => ({
    id: i + 1,
    text: `这是一条评论，评论ID为${i + 1}。这里包含了一些随机文本内容。`,
    author: `用户${Math.floor(Math.random() * 1000)}`,
  }));
};

// 生成随机详细信息
const generateRandomDetails = (): Array<{ key: string; value: string }> => {
  const detailCount = 50; // 生成50条详细信息
  const details: Array<{ key: string; value: string }> = [];

  for (let i = 0; i < detailCount; i++) {
    details.push({
      key: `属性 ${i + 1}`,
      value: `这是属性 ${i + 1} 的值，包含一些随机的文本内容 ${Math.random().toString(36).substring(2, 15)}`,
    });
  }

  return details;
};

// 生成大量测试数据
const generateItems = (count: number): ComplexItemProps[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    title: `项目 ${i + 1}`,
    content: `这是项目 ${i + 1} 的详细内容。这里包含了一些文本，用于模拟实际应用中的内容渲染。内容可能会很长，包含多个段落和不同的格式。`,
    isActive: false,
    extraData: {
      tags: generateRandomTags(),
      author: `作者${Math.floor(Math.random() * 100)}`,
      createdAt: new Date(Date.now() - Math.random() * 10000000000).toLocaleString(),
      likes: Math.floor(Math.random() * 1000),
      comments: generateRandomComments(),
      details: generateRandomDetails(),
    },
  }));
};

// Tab页面组件
interface TabContentProps {
  tabId: string;
  itemsCount: number;
  usePrerender: boolean;
  isShow: boolean;
  onRenderComplete?: (time: number) => void;
}

const TabContent: React.FC<TabContentProps> = ({
  tabId,
  itemsCount,
  usePrerender,
  isShow,
  onRenderComplete,
}) => {
  const [items, setItems] = useState<ComplexItemProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);

    // 模拟数据加载
    setTimeout(() => {
      const newItems = generateItems(itemsCount);
      setItems(newItems);
      setIsLoading(false);
    }, 100);
  }, [itemsCount]);

  if (isLoading) {
    return <div style={{ padding: "20px", textAlign: "center" }}>加载中...</div>;
  }

  return (
    <div>
      <div
        style={{
          marginBottom: "20px",
          padding: "10px",
          backgroundColor: "#f9f9f9",
          borderRadius: "8px",
        }}
      >
        <h3>
          Tab {tabId} - {itemsCount} 个项目
        </h3>
        <p>
          使用预渲染: <strong>{usePrerender ? "是" : "否"}</strong>
        </p>
      </div>

      {isShow && (
        <div style={{ maxHeight: "600px", overflow: "auto", padding: "10px" }}>
          {items.map((item) => (
            <CacheDom
              key={`${tabId}-item-${item.id}`}
              cacheKey={`${tabId}-item-${item.id}`}
              Component={ComplexItem}
              props={item}
            />
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * 预渲染演示组件
 */
const PrerenderDemo: React.FC = () => {
  const [usePrerender, setUsePrerender] = useState(false);
  const [isPrerenderStarted, setIsPrerenderStarted] = useState(false);
  const [prerenderProgress, setPrerenderProgress] = useState(0);
  const [isShow, setIsShow] = useState(false);
  const [itemsCount, setItemsCount] = useState(60);
  const [prerenderCompleted, setPrerenderCompleted] = useState(false);
  const tabConfig = { id: "tab1", label: "超复杂组件", itemsCount };

  const cacheGroupRef = useRef<CacheGroupRef>(null);
  const prerenderIdRef = useRef<number | null>(null);

  // 切换显示/隐藏
  const toggleShow = () => {
    setIsShow(!isShow);
  };

  // 开始预渲染
  const startPrerender = () => {
    setIsPrerenderStarted(true);
    setPrerenderProgress(0);
    setPrerenderCompleted(false);

    // 清除之前的预渲染缓存
    CacheDomHelper.clearPrerenderCache();

    // 为Tab预渲染所有项目
    const prerenderAllItems = async () => {
      const items = generateItems(tabConfig.itemsCount);
      let processedItems = 0;

      // 使用requestIdleCallback分批预渲染
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const currentIndex = i;

        // 使用Promise和requestIdleCallback
        await new Promise<void>((resolve) => {
          prerenderIdRef.current = requestIdleCallbackShim(
            (deadline) => {
              // 预渲染每个项目
              CacheDomHelper.prerender(
                ComplexItem,
                `prerender-${tabConfig.id}-item-${item.id}`,
                item,
              );

              // 更新进度
              processedItems++;
              const progress = Math.min(
                100,
                Math.round((processedItems / tabConfig.itemsCount) * 100),
              );
              setPrerenderProgress(progress);

              resolve();
            },
            { timeout: 1000 }, // 1秒超时
          );
        });

        // 每处理10个项目，暂停一下，让浏览器有时间响应其他任务
        if (currentIndex % 10 === 0 && currentIndex > 0) {
          await new Promise((resolve) => setTimeout(resolve, 0));
        }
      }

      // 预渲染完成
      setUsePrerender(true);
      setPrerenderCompleted(true);
    };

    prerenderAllItems();
  };

  // 重置预渲染
  const resetPrerender = () => {
    if (prerenderIdRef.current !== null) {
      cancelIdleCallbackShim(prerenderIdRef.current);
      prerenderIdRef.current = null;
    }

    setUsePrerender(false);
    setIsPrerenderStarted(false);
    setPrerenderProgress(0);
    setPrerenderCompleted(false);
    CacheDomHelper.clearPrerenderCache();
    cacheGroupRef.current?.clearCache();
  };

  // 处理项目数量变化
  const handleItemsCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCount = parseInt(e.target.value, 10);
    if (!isNaN(newCount) && newCount >= 10 && newCount <= 1000) {
      setItemsCount(newCount);

      // 如果已经预渲染或显示了内容，需要重置
      if (usePrerender || isShow) {
        resetPrerender();
        setIsShow(false);
      }
    }
  };

  // 清理预渲染缓存
  useEffect(() => {
    return () => {
      if (prerenderIdRef.current !== null) {
        cancelIdleCallbackShim(prerenderIdRef.current);
      }
      CacheDomHelper.clearPrerenderCache();
    };
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>预渲染演示</h1>

      <div style={{ marginBottom: "20px" }}>
        <p>
          本演示展示了使用 <code>CacheDomHelper.prerender</code> 预渲染大量复杂组件的性能优势。
          当前页面包含 {tabConfig.itemsCount} 个超复杂项目（每个项目包含200+个DOM节点），
          通过预渲染可以大幅提升渲染性能和用户体验。
        </p>

        <div style={{ marginTop: "10px", color: "#666" }}>
          <CurCacheNum cacheGroupRef={cacheGroupRef} />
        </div>
      </div>

      <div style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
        <label htmlFor="itemsCount" style={{ fontWeight: "bold" }}>
          渲染数量:
        </label>
        <input
          id="itemsCount"
          type="range"
          min="10"
          max="1000"
          step="10"
          value={itemsCount}
          onChange={handleItemsCountChange}
          style={{ flex: 1, maxWidth: "300px" }}
        />
        <input
          type="number"
          min="10"
          max="1000"
          value={itemsCount}
          onChange={handleItemsCountChange}
          style={{ width: "70px", padding: "5px" }}
        />
        <span style={{ marginLeft: "10px", color: itemsCount > 100 ? "#f44336" : "#666" }}>
          {itemsCount > 100 ? "⚠️ 数量较大，可能会影响性能" : ""}
        </span>
      </div>

      <div style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "20px" }}>
        <CacheGroup ref={cacheGroupRef} groupId="prerender-demo-group" capacity={99999}>
          <TabContent
            key={`${tabConfig.id}-${itemsCount}`}
            tabId={tabConfig.id}
            itemsCount={tabConfig.itemsCount}
            usePrerender={usePrerender}
            isShow={isShow}
            onRenderComplete={undefined}
          />
        </CacheGroup>
      </div>

      <div style={{ display: "flex", gap: "20px", marginTop: "20px", marginBottom: "20px" }}>
        <div>
          <button
            onClick={toggleShow}
            style={{
              padding: "10px 15px",
              backgroundColor: "#2196f3",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              minWidth: "120px",
            }}
          >
            {isShow ? "隐藏内容" : "显示内容"}
          </button>
        </div>

        <div>
          <button
            onClick={startPrerender}
            disabled={isPrerenderStarted}
            style={{
              padding: "10px 15px",
              backgroundColor: isPrerenderStarted
                ? prerenderCompleted
                  ? "#4caf50"
                  : "#ccc"
                : "#4caf50",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: isPrerenderStarted && !prerenderCompleted ? "not-allowed" : "pointer",
              minWidth: "120px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {prerenderCompleted
              ? "✓ 预渲染完成"
              : isPrerenderStarted
                ? "预渲染中..."
                : "开始预渲染"}
          </button>
        </div>

        <div>
          <button
            onClick={resetPrerender}
            style={{
              padding: "10px 15px",
              backgroundColor: "#f44336",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              minWidth: "120px",
            }}
          >
            清空缓存
          </button>
        </div>

        <div style={{ flex: 1 }}>
          {isPrerenderStarted && !prerenderCompleted && (
            <div style={{ width: "100%" }}>
              <div style={{ marginBottom: "5px" }}>预渲染进度: {prerenderProgress}%</div>
              <div
                style={{
                  height: "20px",
                  backgroundColor: "#e0e0e0",
                  borderRadius: "10px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${prerenderProgress}%`,
                    height: "100%",
                    backgroundColor: "#4caf50",
                    transition: "width 0.3s",
                  }}
                />
              </div>
            </div>
          )}
          {prerenderCompleted && (
            <div
              style={{
                padding: "10px",
                backgroundColor: "#e8f5e9",
                borderRadius: "8px",
                color: "#2e7d32",
                display: "flex",
                alignItems: "center",
              }}
            >
              <span style={{ marginRight: "8px", fontSize: "18px" }}>✓</span>
              <span>预渲染已完成，可以点击"显示内容"查看效果</span>
            </div>
          )}
        </div>
      </div>

      <div
        style={{
          marginBottom: "20px",
          padding: "15px",
          backgroundColor: "#f5f5f5",
          borderRadius: "8px",
        }}
      >
        <h3>使用步骤</h3>
        <ol style={{ paddingLeft: "20px" }}>
          <li>调整"项目数量"滑块，选择要渲染的项目数量</li>
          <li>点击"显示内容"按钮，查看普通渲染的性能</li>
          <li>点击"隐藏内容"按钮，隐藏所有已渲染的内容</li>
          <li>点击"清空缓存"按钮，清空所有缓存</li>
          <li>点击"开始预渲染"按钮，在后台预渲染所有内容</li>
          <li>预渲染完成后，再次点击"显示内容"按钮，体验预渲染带来的速度提升</li>
        </ol>
      </div>

      <div style={{ marginBottom: "20px", display: "flex", gap: "20px" }}>
        <div
          style={{
            flex: 1,
            padding: "15px",
            backgroundColor: "#f9f9f9",
            borderRadius: "8px",
          }}
        >
          <h4>预渲染状态</h4>
          <div style={{ fontSize: "14px" }}>
            <p>
              状态:{" "}
              <strong>
                {isPrerenderStarted ? (prerenderCompleted ? "已完成" : "进行中") : "未开始"}
              </strong>
            </p>
            <p>
              进度: <strong>{prerenderProgress}%</strong>
            </p>
            <p>
              已启用: <strong>{usePrerender ? "是" : "否"}</strong>
            </p>
            <p>
              内容显示: <strong>{isShow ? "是" : "否"}</strong>
            </p>
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: "30px",
          padding: "15px",
          backgroundColor: "#f0f8ff",
          borderRadius: "8px",
        }}
      >
        <h3>技术说明</h3>
        <ul style={{ paddingLeft: "20px" }}>
          <li>
            预渲染使用<code>requestIdleCallback</code>在浏览器空闲时间执行，不会阻塞UI
          </li>
          <li>每个项目包含200+个DOM节点，点击"查看详细DOM节点"可以展开查看</li>
          <li>预渲染过程中，组件已经被构建并缓存，但不会显示在DOM中</li>
          <li>显示预渲染内容时，只需从缓存中取出组件，无需重新渲染，因此速度更快</li>
        </ul>
      </div>
    </div>
  );
};

function CurCacheNum({ cacheGroupRef }: { cacheGroupRef: React.RefObject<CacheGroupRef> }) {
  const [cacheNum, setCacheNum] = useState(0);

  useEffect(() => {
    if (cacheGroupRef.current) {
      setCacheNum(cacheGroupRef.current.getCacheKeys().length);
      setInterval(() => {
        setCacheNum(cacheGroupRef.current?.getCacheKeys().length || 0);
      }, 1000);
    }
  }, [cacheGroupRef]);

  return <div>当前缓存数量: {cacheNum}</div>;
}

export default PrerenderDemo;
