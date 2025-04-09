import { Document } from '@langchain/core/documents';

export const documents = [
  new Document({
    pageContent: '笨笨是一只很喜欢睡觉的猫咪',
    metadata: { page: 1 },
  }),
  new Document({
    pageContent: '我喜欢在夜晚听音乐，这让我感到放松。',
    metadata: { page: 2 },
  }),
  new Document({
    pageContent: '猫咪在窗台上打盹，看起来非常可爱',
    metadata: { page: 3 },
  }),
  new Document({
    pageContent: '学习新技能是每个人都应该追求的目标。',
    metadata: { page: 4 },
  }),
  new Document({
    pageContent: '我最喜欢的食物是意大利面，尤其是番茄酱的那种。',
    metadata: { page: 5 },
  }),
  new Document({
    pageContent: '昨晚我做了一个奇怪的梦，梦见自己在太空飞行。',
    metadata: { page: 6 },
  }),
  new Document({
    pageContent: '我的手机突然关机了，让我有些焦虑。',
    metadata: { page: 7 },
  }),
  new Document({
    pageContent: '阅读是我每天都会做的事情，我觉得很充实。',
    metadata: { page: 8 },
  }),
  new Document({
    pageContent: '他们一起计划了一次周末的野餐，希望天气能好。',
    metadata: { page: 9 },
  }),
  new Document({
    pageContent: '我的狗喜欢追逐球，看起来非常开心。',
    metadata: { page: 10 },
  }),
];

export const texts = documents.map((doc) => doc.pageContent);
