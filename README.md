# CacheDom 组件

## 简介

CacheDom 是一个用于 React 应用的高性能 DOM 缓存组件。它通过智能的缓存机制来保存和复用 DOM 节点，从而提升应用性能，减少不必要的重渲染。

## 特性

- 🚀 高性能的 DOM 缓存机制
- 💾 LRU（最近最少使用）缓存策略，自动管理缓存容量
- 🎯 精确的生命周期控制
- 📦 灵活的缓存管理 API
- 🔄 支持缓存命中/未命中回调
- 🎨 支持条件渲染和动态更新
- 📊 对标 VueRouter 的 Keep-Alive 组件，为 React 提供类似能力
- 🛡️ 完整的 TypeScript 类型支持

## 安装

```bash
# npm
npm install cache-dom

# yarn
yarn add cache-dom

# pnpm
pnpm add cache-dom
```

## 基础用法

### 简单示例

```tsx
import { CacheGroup, CacheDom } from "cache-dom";

function App() {
  const [show, setShow] = useState(true);

  return (
    <CacheGroup groupId="main-group">
      {show && (
        <CacheDom cacheKey="my-component">
          <MyComponent />
        </CacheDom>
      )}
    </CacheGroup>
  );
}
```

### 带回调的使用示例

```tsx
function App() {
  const handleCacheHit = () => {
    console.log("组件从缓存中恢复");
  };

  const handleCacheMiss = () => {
    console.log("组件首次渲染，已加入缓存");
  };

  return (
    <CacheGroup groupId="main-group">
      <CacheDom
        cacheKey="my-component"
        onCacheHit={handleCacheHit}
        onCacheMiss={handleCacheMiss}
      >
        <MyComponent />
      </CacheDom>
    </CacheGroup>
  );
}
```

## 组件 API

### CacheGroup

缓存组的容器组件，管理一组缓存实例。所有需要缓存的组件都必须包裹在 CacheGroup 内。

#### Props

| 属性     | 类型      | 必填 | 默认值 | 描述                                   |
| -------- | --------- | ---- | ------ | -------------------------------------- |
| groupId  | string    | 是   | -      | 缓存组的唯一标识                       |
| capacity | number    | 否   | 10     | 缓存容量，超出时会移除最久未使用的缓存 |
| children | ReactNode | 是   | -      | 子组件                                 |

#### Ref Methods

| 方法         | 参数                                           | 返回值   | 描述                                                |
| ------------ | ---------------------------------------------- | -------- | --------------------------------------------------- |
| clearCache   | (key?: string, config?: { unmount?: boolean }) | void     | 清除指定或所有缓存，unmount 表示是否卸载 DOM 根节点 |
| getCacheKeys | ()                                             | string[] | 获取所有缓存的 key                                  |
| getCacheSize | ()                                             | number   | 获取当前缓存数量                                    |

### CacheDom

具体的缓存组件，负责缓存和恢复 DOM 节点。

#### Props

| 属性        | 类型       | 必填 | 默认值 | 描述                                       |
| ----------- | ---------- | ---- | ------ | ------------------------------------------ |
| cacheKey    | string     | 是   | -      | 缓存的唯一标识                             |
| disabled    | boolean    | 否   | false  | 是否禁用缓存                               |
| deps        | any[]      | 否   | []     | 依赖数组，变化时会重新渲染，类似 useEffect |
| onCacheHit  | () => void | 否   | -      | 缓存命中时的回调                           |
| onCacheMiss | () => void | 否   | -      | 缓存未命中时的回调                         |
| children    | ReactNode  | 是   | -      | 需要被缓存的内容                           |

## 高级用法

### 1. 手动管理缓存

```tsx
function App() {
  const cacheGroupRef = useRef<CacheGroupRef>(null);

  const handleClearSpecific = () => {
    // 清除特定缓存
    cacheGroupRef.current?.clearCache("my-component");
  };

  const handleClearAll = () => {
    // 清除所有缓存
    cacheGroupRef.current?.clearCache();
  };

  const handleCheckCache = () => {
    // 获取所有缓存的 key
    const keys = cacheGroupRef.current?.getCacheKeys();
    // 获取当前缓存数量
    const size = cacheGroupRef.current?.getCacheSize();
    console.log("缓存的 keys:", keys);
    console.log("缓存数量:", size);
  };

  return (
    <CacheGroup ref={cacheGroupRef} groupId="main-group">
      {/* ... */}
    </CacheGroup>
  );
}
```

### 2. 条件缓存

```tsx
function App() {
  const [shouldCache, setShouldCache] = useState(true);

  return (
    <CacheGroup groupId="main-group">
      <CacheDom cacheKey="my-component" disabled={!shouldCache}>
        <MyComponent />
      </CacheDom>
    </CacheGroup>
  );
}
```

### 3. 依赖更新示例

```tsx
function App() {
  const [count, setCount] = useState(0);
  const [user, setUser] = useState({ name: "John" });

  return (
    <CacheGroup groupId="main-group">
      <CacheDom
        cacheKey="my-component"
        deps={[count, user]} // 当 count 或 user 变化时，组件会重新渲染
      >
        <MyComponent count={count} user={user} />
      </CacheDom>
    </CacheGroup>
  );
}
```

### 4. 多缓存组管理

```tsx
function App() {
  return (
    <div>
      {/* 主要内容的缓存组 */}
      <CacheGroup groupId="main-content" capacity={5}>
        {/* ... */}
      </CacheGroup>

      {/* 侧边栏的缓存组 */}
      <CacheGroup groupId="sidebar" capacity={3}>
        {/* ... */}
      </CacheGroup>
    </div>
  );
}
```

## 性能优化建议

1. 合理设置缓存容量：

   - 根据实际需求设置 capacity
   - 避免设置过大的缓存容量，可能会占用过多内存

2. 使用 deps 优化更新：

   - 只在必要的依赖变化时才触发重渲染
   - 避免传入不必要的依赖

3. 适时禁用缓存：
   - 对于频繁更新的组件，可以考虑禁用缓存
   - 使用 disabled 属性来动态控制缓存行为

## 注意事项

1. CacheDom 必须在 CacheGroup 内使用
2. cacheKey 在同一个 CacheGroup 内必须唯一
3. 当组件被缓存时，其内部状态会被保留
4. 清除缓存时建议使用 clearCache 方法，而不是直接操作 DOM

## 贡献指南

1. Fork 本仓库
2. 创建特性分支：`git checkout -b my-new-feature`
3. 提交改动：`git commit -am 'Add some feature'`
4. 推送分支：`git push origin my-new-feature`
5. 提交 Pull Request

## 许可证

MIT

## 问题反馈

如果你发现任何问题或有新功能建议，欢迎在 GitHub Issues 中提出。
