export const extractCodeBlocks = (str: string): string[] => {
  // 如果字符串为空，则返回空数组
  if (!str) {
    return [];
  }

  // 正则表达式匹配所有的代码块内容
  // ``` 开头，``` 结尾，中间包含任意字符，包括换行符
  // 捕获组 $1 匹配代码块内容
  const matches = str.match(/```[\s\S]*?\n([\s\S]*?)\n```/g);

  // 如果找到了匹配项，则返回提取的内容，否则返回空数组
  // 使用 map 函数对匹配到的结果进行处理，提取代码块内容并去除空格
  return matches
    ? matches.map((match) =>
        match.replace(/```[\s\S]*?\n([\s\S]*?)\n```/, '$1').trim(),
      )
    : [];
};
