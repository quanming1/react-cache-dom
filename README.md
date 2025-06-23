# CacheDom 组件

## 简介

CacheDom 是一个用于 React 中进行缓存组件，直接通过的缓存和复用 DOM 节点实现 React 节点的缓存。

## 安装

```bash
# npm
npm install react-cache-dom

# yarn
yarn add react-cache-dom

# pnpm
pnpm add react-cache-dom
```

## 基础用法

### 简单示例

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
        key="my-component"
        Component={MyComponent}
        props={{ someData: "value" }}
        onCacheHit={handleCacheHit}
        onCacheMiss={handleCacheMiss}
      />
    </CacheGroup>
  );
}
```

## 组件 API

### CacheGroup

缓存组的容器组件，管理一组缓存实例。所有`<CacheDom />`必须包裹在 CacheGroup 内。

#### Props

| 属性     | 类型      | 必填 | 默认值 | 描述                                   |
| -------- | --------- | ---- | ------ | -------------------------------------- |
| groupId  | string    | 是   | -      | 缓存组的唯一标识                       |
| capacity | number    | 否   | 10     | 缓存容量，超出时会移除最久未使用的缓存（LRU） |
| children | ReactNode | 是   | -      | 子组件                                 |

#### Ref Methods

| 方法         | 参数                                           | 返回值   | 描述                                                |
| ------------ | ---------------------------------------------- | -------- | --------------------------------------------------- |
| clearCache   | (key?: string) | void     | 清除指定或所有缓存 |
| getCacheKeys | ()                                             | string[] | 获取所有缓存的 key                                  |

### CacheDom

具体的缓存组件，负责缓存和恢复 DOM 节点。

#### Props

| 属性              | 类型                  | 必填 | 默认值 | 描述                               |
| ----------------- | --------------------- | ---- | ------ | ---------------------------------- |
| cacheKey          | string                | 是   | -      | 缓存的唯一标识                     |
| key               | string                | 是   | -      | 组件的 key 属性                      |
| Component         | ComponentType<T>      | 是   | -      | 需要被缓存的组件                   |
| props             | T                     | 否   | {}     | 传递给组件的属性，也作为依赖项     |
| disabled          | boolean               | 否   | false  | 是否禁用缓存                       |
| onCacheHit        | () => void            | 否   | -      | 缓存命中时的回调                   |
| onCacheMiss       | () => void            | 否   | -      | 缓存未命中时的回调                 |
| containerClassName| string                | 否   | -      | 容器的类名                         |
| containerStyle    | React.CSSProperties   | 否   | -      | 容器的样式                         |

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
    console.log("缓存的 keys:", keys);
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
      <CacheDom
        cacheKey="my-component"
        key="my-component"
        Component={MyComponent}
        disabled={!shouldCache}
        props={{ someData: "value" }}
      />
    </CacheGroup>
  );
}
```

### 3. 属性更新示例

```tsx
function App() {
  const [count, setCount] = useState(0);
  const [user, setUser] = useState({ name: "John" });

  return (
    <CacheGroup groupId="main-group">
      <CacheDom
        cacheKey="my-component"
        key="my-component"
        Component={MyComponent}
        // props中的值变化会触发组件更新
        props={{ count, user }}
      />
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
