export default class PriorityQueue {
  constructor(orderedBy, descending) {
    this.orderedBy = orderedBy;
    this.descending = descending;
    this.heap = [];
  }

  _isEmpty = () => {
    return this.heap.length == 0;
  };

  _swap = (ind1, ind2) => {
    const saved = this.heap[ind2];
    this.heap[ind2] = this.heap[ind1];
    this.heap[ind1] = saved;
  };

  _siftUp = index => {
    let i = index;
    let last;
    while (i != last) {
      last = i;
      const parentIndex = Math.max(Math.floor((i - 1) / 2), 0);
      const parentValue = this.heap[parentIndex][this.orderedBy];
      if (
        parentValue && this.descending
          ? parentValue <= this.heap[i][this.orderedBy]
          : parentValue >= this.heap[i][this.orderedBy]
      ) {
        this._swap(parentIndex, i);
        i = parentIndex;
      }
    }
  };

  _siftDown = index => {
    let i = index;
    let last;
    while (i != last) {
      last = i;
      const rightChildIndex = i * 2 + 2;
      const leftChildIndex = i * 2 + 1;
      const rightChild =
        rightChildIndex < this.heap.length
          ? this.heap[rightChildIndex][this.orderedBy]
          : null;
      const leftChild =
        leftChildIndex < this.heap.length
          ? this.heap[leftChildIndex][this.orderedBy]
          : null;
      if (rightChild && leftChild) {
        if (
          this.descending
            ? rightChild <= leftChild &&
              leftChild >= this.heap[i][this.orderedBy]
            : rightChild >= leftChild &&
              leftChild <= this.heap[i][this.orderedBy]
        ) {
          this._swap(i, leftChildIndex);
          i = leftChildIndex;
        } else if (
          this.descending
            ? rightChild >= leftChild &&
              rightChild >= this.heap[i][this.orderedBy]
            : rightChild <= leftChild &&
              rightChild <= this.heap[i][this.orderedBy]
        ) {
          this._swap(i, rightChildIndex);
          i = rightChildIndex;
        }
      } else if (
        this.descending
          ? rightChild && rightChild >= this.heap[i][this.orderedBy]
          : rightChild && rightChild <= this.heap[i][this.orderedBy]
      ) {
        this._swap(i, rightChildIndex);
        i = rightChildIndex;
      } else if (
        this.descending
          ? leftChild && leftChild >= this.heap[i][this.orderedBy]
          : leftChild && leftChild <= this.heap[i][this.orderedBy]
      ) {
        this._swap(i, leftChildIndex);
        i = leftChildIndex;
      }
    }
  };

  dequeue() {
    if (this._isEmpty()) {
      return null;
    } else {
      const toReturn = this.heap.shift();
      this.heap.unshift(this.heap.pop());
      this._siftDown(0);
      return toReturn;
    }
  }

  enqueue(item) {
    this.heap.push(item);
    this._siftUp(this.heap.length - 1);
  }
}
