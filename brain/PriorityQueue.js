export default class PriorityQueue {
  constructor(ordering) {
    this.ordering = ordering;
    this.heap = [];
    this.numItems = 0;
  }

  _isEmpty = () => {
    return this.numItems == 0;
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
      if (this.heap[parentIndex][this.ordering] < this.heap[i][this.ordering]) {
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
          ? this.heap[rightChildIndex][this.ordering]
          : null;
      const leftChild =
        leftChildIndex < this.heap.length
          ? this.heap[leftChildIndex][this.ordering]
          : null;
      if (rightChild && leftChild) {
        if (rightChild < leftChild && leftChild > this.heap[i][this.ordering]) {
          this._swap(i, leftChildIndex);
          i = leftChildIndex;
        } else if (
          rightChild > leftChild &&
          rightChild > this.heap[i][this.ordering]
        ) {
          this._swap(i, rightChildIndex);
          i = rightChildIndex;
        }
      } else if (rightChild && rightChild > this.heap[i][this.ordering]) {
        this._swap(i, rightChildIndex);
        i = rightChildIndex;
      } else if (leftChild && leftChild > this.heap[i][this.ordering]) {
        this._swap(i, leftChildIndex);
        i = leftChildIndex;
      }
    }
  };

  dequeue() {
    if (this._isEmpty()) {
      return null;
    } else {
      const toReturn = this.heap[0];
      this.numItems -= 1;
      this.heap[0] = this.heap[this.numItems];
      this.heap.pop();
      this._siftDown(0);
      return toReturn;
    }
  }

  enqueue(item) {
    this.heap.push(item);
    this._siftUp(this.numItems);
    this.numItems += 1;
  }
}
