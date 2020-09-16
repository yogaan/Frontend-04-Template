/**
 *
 *
 * @param {*} source
 * @param {*} pattern
 */
function kmp (source, pattern) {
  // 计算table
  let table = new Array(pattern.length).fill(0);
  {
    // i为自重复串的开始位置， j为已重复的数字
    let i = 1, j = 0;
    while (i < pattern.length) {
      if (pattern[i] === pattern[j]) {
        ++i, ++j
        table[i] = j
      } else {
        if (j > 0) {
          console.log('j',j)
          j = table[j]
        } else {
          ++i
        }
      }
      console.log(i, j)
    }
  }
  {
    // i patter串位置，j source串位置
    let i = 0, j = 0 ;
    while (i < source.length) {
      if (pattern[j] === source[i]) {
        ++i, ++j
      } else {
        if (j > 0) {
          j = table[j]
        } else {
          ++i
        }
      }
      if (j === pattern.length) {
        return true;
      }
    }
    return false;
  }
  console.log(table)
}
// leetcode 问题28
console.log(kmp("abc", "abca"));