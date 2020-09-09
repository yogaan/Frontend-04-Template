const sleep = (time) => new Promise((resolve) => setTimeout(resolve, time))

class Sorted {
  constructor (data, compare) {
    this.data = data.slice();
    this.compare = compare || ((a, b) => a - b);
  }
  take () {
    if (!this.data.length) {
      return;
    }
    let min = this.data[0];
    let minIndex = 0
    for (let i = 1; i < this.data.length; i++) {
      if (this.compare(this.data[i], min) < 0) {
        min = this.data[i];
        minIndex = i;
      }
    }
    // 不用splice，因为splice从原位删除后，会把后面的往前挪，产生O（N）的计算
    // this.data.splice(minIndex, 1)
    // 使用位置交换，将数字最后的值替换minIndex的位置，然后再删除最后的值
    this.data[minIndex] = this.data[this.data.length - 1];
    this.data.pop();
    return min;
  }
  give (v) {
    this.data.push(v)
  }
  get length () {
    return this.data.length
  }
}

class Main {
  constructor() {
    this.mapData = this.getLocalMapData() || this.initEmptyMapData();
    this.container = document.querySelector("#root");
    this.render();
    this.bindMouseEvents();
    this.bindSaveEvent();
    this.bindResetEvent();
    this.bindGoEvent();
    this.bindBlurEvent();
    const {x = 50, y = 50} = this.getLocalMarkPoint();
    this.inputX = x;
    this.inputY = y;
    this.setInputValue(x, y)
    this.drawMarkPoint();
    this.isClearMode = false;
    this.isPressingDown = false;
  }
  initEmptyMapData() {
    return Array(10000).fill(0);
  }
  setInputValue (x, y) {
    document.querySelector('#x').value = x;
    document.querySelector('#y').value = y;
  }
  render() {
    this.container.innerHTML = "";
    const { mapData } = this;
    const fragment = document.createDocumentFragment();
    for (let y = 0; y < 100; y++) {
      for (let x = 0; x < 100; x++) {
        const element = document.createElement("span");
        element.classList.add("cell");

        if (mapData[100 * y + x] === 1) {
          element.style.backgroundColor = "#333";
        }
        element.setAttribute("x", x);
        element.setAttribute("y", y);
        fragment.appendChild(element);
      }
    }
    this.container.appendChild(fragment)
  }
  /** 广度优先搜索，沿着点的四周挨个找，已经找过的点则跳过 */
  async findPath (map, start, end) {
    const table = Object.create(map);
    const queue = [start];
    const insert = async (x, y, prev) => {
      if (x < 0 || x >= 100 || y < 0 || y >= 100) {
        return;
      }
      if (table[y * 100 + x]) {
        return;
      }
      table[y * 100 + x] = prev;
      this.container.children[y * 100 + x].style.backgroundColor = 'green';
      await this.drawAnimation()
      queue.push([x, y])
    }
    while (queue.length) {
      let [x , y] = queue.shift();
      if (x === end[0] && y === end[1]) {
        let path = []
        while (x !== start[0] || y !== start[1]) {
          path.push(map[y * 100 + x]);
          [x, y] = table[y * 100 + x];
          await sleep(30)
          this.container.children[y * 100 + x].style.backgroundColor = 'yellow';
        }
        return path;
      }
      await insert(x - 1, y, [x, y])
      await insert(x, y - 1, [x, y])
      await insert(x + 1, y, [x, y])
      await insert(x, y + 1, [x, y])

      await insert(x - 1, y - 1, [x, y]);
      await insert(x + 1, y - 1, [x, y]);
      await insert(x - 1, y + 1, [x, y]);
      await insert(x + 1, y + 1, [x, y])
    }
    return null
  }
  
  /** 启发式寻路（用一个函数判断点扩展的优先级，沿着点的方向寻路。A*是能找到最佳路径的启发式寻路。 ） */
  async findAStarPath (map, start, end) {
    const table = Object.create(map);
    const queue = new Sorted([start], (a, b) => distance(a) - distance(b));
    const insert = async (x, y, prev) => {
      if (x < 0 || x >= 100 || y < 0 || y >= 100) {
        return;
      }
      if (table[y * 100 + x]) {
        return;
      }
      table[y * 100 + x] = prev;
      this.container.children[y * 100 + x].style.backgroundColor = 'blue';
      await this.drawAnimation()
      queue.give([x, y])
    }
    function distance (point) {
      return (point[0] - end[0]) ** 2 + (point[1] - end[1]) ** 2
    }
    while (queue.length) {
      let [x , y] = queue.take();
      if (x === end[0] && y === end[1]) {
        let path = []
        while (x !== start[0] || y !== start[1]) {
          path.push(map[y * 100 + x]);
          [x, y] = table[y * 100 + x];
          await sleep(30)
          this.container.children[y * 100 + x].style.backgroundColor = 'red';
        }
        return path;
      }
      await insert(x - 1, y, [x, y])
      await insert(x, y - 1, [x, y])
      await insert(x + 1, y, [x, y])
      await insert(x, y + 1, [x, y])

      await insert(x - 1, y - 1, [x, y]);
      await insert(x + 1, y - 1, [x, y]);
      await insert(x - 1, y + 1, [x, y]);
      await insert(x + 1, y + 1, [x, y])
    }
    return null
  }
  async drawAnimation () {
    const time = document.querySelector('#animationTime').value;
    if (time && !isNaN(Number(time)) && Number(time) > 0) {
      await sleep(time)
    }
  }
  bindMouseEvents() {
    this.container.addEventListener("mousemove", (e) => {
      if (
        e.target &&
        e.target.classList &&
        e.target.classList.contains("cell")
      ) {
        if (!this.isPressingDown) {
          return;
        }
        const x = Number(e.target.getAttribute("x"));
        const y = Number(e.target.getAttribute("y"));
        this.mapData[y * 100 + x] = this.isClearMode ? 0 : 1;
        e.target.style.backgroundColor = this.isClearMode ? "" : "#333";
      }
    });

    document.addEventListener("mousedown", (e) => {
      this.isPressingDown = true;
      this.isClearMode = e.which === 3;
    });
    document.addEventListener("mouseup", () => (this.isPressingDown = false));
    document.addEventListener("contextmenu", (e) => e.preventDefault());
  }
  bindSaveEvent() {
    document.querySelector("#save").addEventListener("click", () => {
      this.saveLocalData();
    });
  }
  bindResetEvent() {
    document.querySelector("#reset").addEventListener("click", () => {
      this.mapData = this.initEmptyMapData();
      this.inputX = 50;
      this.inputY = 50;
      this.saveLocalData();
      this.render();
      this.setInputValue(50, 50)
      this.drawMarkPoint();
    });
  }
  bindBlurEvent() {
    [
      { selector: "#x", property: "inputX" },
      { selector: "#y", property: "inputY" },
    ].forEach(({ selector, property }) => {
      document.querySelector(selector).addEventListener("blur", (e) => {
        this[property] = e.target.value;
        [...this.container.children].forEach(dom => dom.classList.remove('mark'))
        this.drawMarkPoint();
      });
    });
  }
  bindGoEvent() {
    ['#wideSearch', '#aStarSearch'].forEach((selector) => {
      document.querySelector(selector).addEventListener("click", (e) => {
        if (this.inputX === '') {
          alert("请输入x的值");
          return;
        }
        if (this.inputY === '') {
          alert("请输入y的值");
          return;
        }
        const params = [this.mapData, [0, 0], [Number(this.inputX), Number(this.inputY)]];
        if (e.target.id === 'wideSearch') {
          this.findPath(...params)
        } else {
          this.findAStarPath(...params)
        }
      });
    })
  }
  drawMarkPoint () {
    if (this.inputX !== '' && this.inputY !== '') {
      this.container.children[Number(this.inputY) * 100 + Number(this.inputX)].classList.add('mark');
    }
  }
  getMarkData () {
    // this.inputX
  }
  saveLocalData() {
    localStorage.setItem("mapData", JSON.stringify(this.mapData));
    localStorage.setItem("markPoint", JSON.stringify({ x: this.inputX, y: this.inputY }));
  }
  getLocalMapData() {
    const localMapData = localStorage.getItem("mapData");
    return localMapData ? JSON.parse(localMapData) : null;
  }
  getLocalMarkPoint () {
    const data = localStorage.getItem("markPoint");
    return data ? JSON.parse(data) : {};
  }
}

new Main();
