export class XNode<T> {
  public prev: XNode<T> | null = null;
  public next: XNode<T> | null = null;

  constructor(public data: T) {}
}

export default class DoubleLinkedList<T> {
  private head: XNode<T> | null = null;
  private tail: XNode<T> | null = null;
  private length: number = 0;

  public append(data: T): void {
    const newNode = new XNode(data);
    if (!this.head) {
      this.head = this.tail = newNode;
    } else {
      if (this.tail) {
        this.tail.next = newNode;
        newNode.prev = this.tail;
        this.tail = newNode;
      }
    }
    this.length++;
  }

  public prepend(data: T): void {
    const newNode = new XNode(data);
    if (!this.head) {
      this.head = this.tail = newNode;
    } else {
      newNode.next = this.head;
      this.head.prev = newNode;
      this.head = newNode;
    }
    this.length++;
  }

  public delete(data: T): boolean {
    let current = this.head;
    while (current) {
      if (current.data === data) {
        if (current.prev) {
          current.prev.next = current.next;
        } else {
          this.head = current.next;
        }
        if (current.next) {
          current.next.prev = current.prev;
        } else {
          this.tail = current.prev;
        }
        this.length--;
        return true;
      }
      current = current.next;
    }
    return false;
  }

  public size(): number {
    return this.length;
  }
  public getHead(): XNode<T> | null {
    return this.head;
  }

  public getSize() {
    return this.length;
  }

  toString() {
    let result = '';
    let current = this.head;
    while (current) {
      result += current.data + ' ';
      current = current.next;
    }
    return result;
  }
}
