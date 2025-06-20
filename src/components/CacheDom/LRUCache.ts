export class LRUCache<K, V> {
  private _capacity: number;
  private cache: Map<K, V>;
  private keyOrder: K[];

  constructor(capacity: number) {
    this._capacity = capacity;
    this.cache = new Map();
    this.keyOrder = [];
  }

  get(key: K): V | undefined {
    const value = this.cache.get(key);
    if (value !== undefined) {
      // 移动到最新使用
      this.keyOrder = this.keyOrder.filter((k) => k !== key);
      this.keyOrder.push(key);
    }
    return value;
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      // 更新现有值
      this.cache.set(key, value);
      this.keyOrder = this.keyOrder.filter((k) => k !== key);
      this.keyOrder.push(key);
    } else {
      // 添加新值
      if (this.keyOrder.length >= this._capacity) {
        // 删除最久未使用的
        const lruKey = this.keyOrder.shift();
        if (lruKey !== undefined) {
          this.cache.delete(lruKey);
        }
      }
      this.cache.set(key, value);
      this.keyOrder.push(key);
    }
  }

  delete(key: K): void {
    this.cache.delete(key);
    this.keyOrder = this.keyOrder.filter((k) => k !== key);
  }

  forEach(callback: (value: V, key: K) => void): void {
    this.cache.forEach((value, key) => {
      callback(value, key);
    });
  }

  clear(): void {
    this.cache.clear();
    this.keyOrder = [];
  }

  has(key: K): boolean {
    return this.cache.has(key);
  }

  /**
   * 获取所有缓存的键
   * @returns 键数组
   */
  keys(): K[] {
    return [...this.keyOrder];
  }

  /**
   * 获取当前缓存大小
   */
  get size(): number {
    return this.keyOrder.length;
  }

  /**
   * 获取缓存容量
   */
  get capacity(): number {
    return this._capacity;
  }
}
