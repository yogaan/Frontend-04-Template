
# 寻路
## 广度优先搜索寻路，沿着点的四周挨个找，已经找过的点则跳过，效率较慢
## 启发式寻路，用一个函数判断点扩展的优先级，沿着点的方向寻路。给集合里的点排序，每次找出集合里距离终点最小的点，这样找出来的路径就很有可能是最优路径

### 小技巧：当数组比较大，且对数组元素顺序没有要求时，删除数组元素的操作如果用splice方法，可能会产生O(n)的操作，这样效率较慢。可改为将数组最后一个元素替换将要删除的目标位置，然后再将最后一个元素删除即可
```js
  const arr = Array(10000);
  let deleteIndex = 10;
  arr[deleteIndex] = arr[arr.length];
  arr.pop()
```

# LL算法构建AST

  AST叫做抽象语法树。代码在计算机的分析过程中，首先把我们的编程语言分词，接着把这些词组成层层嵌套的语法树。 构建AST语法树的过程叫语法分析，语法分析的算法的核心算法主要有两种，LL（left left）算法和LR, 

  ## 四则运算分析
  ### 词法定义
    TokenNumber 1234567890的组合
    Operator + - * /

    WhiteSpace <SP>
    LineTerminator: <LF><CR>

  ### 语法定义
    <Expression>::=
      <AdditiveExpression><EOF>

    <AdditiveExpression>::=
      <MultiplicativeExpression>
      |<AdditiveExpression><+><MultiplicativeExpression>
      |<AdditiveExpression><-><MultiplicativeExpression>

    <MultiplicativeExpression>::=
      <Number>
      |<MultiplicativeExpression><*><Number>
      |<MultiplicativeExpression></><Number>

  