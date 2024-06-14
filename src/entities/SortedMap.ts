export default class SortedMap<T> {
  private map: Map<number, T> = new Map();
  private keys: number[] = [];
  private order: string = 'asc';

  constructor(order: string = 'asc') {
    this.order = order;
  }

  public set(key: number, value: T): void {
    if (!this.map.has(key)) {
      this.keys.push(key);
      if (this.order === 'asc') {
        this.keys.sort((a, b) => a - b);
      } else {
        this.keys.sort((a, b) => b - a);
      }
    }
    this.map.set(key, value);
  }

  public get(key: number): T | undefined {
    return this.map.get(key);
  }

  public delete(key: number): boolean {
    const index = this.keys.indexOf(key);
    if (index !== -1) {
      this.keys.splice(index, 1);
      this.map.delete(key);
      return true;
    }
    return false;
  }

  public getSize(): number {
    return this.keys.length;
  }

  public getFirst(): T {
    return this.map.get(this.keys[0]);
  }

  toString() {
    return this.keys.map((key) => this.map.get(key)).join('\n');
  }
}
