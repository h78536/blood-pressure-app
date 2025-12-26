'use server';

import { getRequestContext } from '@cloudflare/next-on-pages';

// 定义 Cloudflare AI 绑定的接口
// 我们正在导出此类型，以便可以在我们的声明文件 (env.d.ts) 中使用
export interface AI {
  run: (
    model: string,
    options: {
      messages: { role: string; content: string }[];
    }
  ) => Promise<{ response: string }>;
}

export function getAI(): AI | undefined {
  // 在 Cloudflare 环境中，我们总是尝试从请求上下文中获取 AI 绑定
  // next-on-pages 会在本地开发环境中提供一个模拟的上下文
  try {
    // 感谢 src/env.d.ts，TypeScript 现在可以识别 'AI' 属性
    const aiBinding = (getRequestContext().env as any).AI as AI;
    if (aiBinding) {
      return aiBinding;
    }
  } catch (e) {
    console.error('无法获取 Cloudflare 请求上下文或 AI 绑定:', e);
  }

  // 如果在严格的本地 `next dev` 环境中（没有 next-on-pages 包装器）
  // 并且没有获取到绑定，则返回一个模拟对象
  if (process.env.NODE_ENV === 'development') {
    console.warn("开发模式：无法访问Cloudflare AI绑定，返回模拟 AI 对象。");
    return {
      run: async (model, options) => {
        console.log(`模拟 AI 调用: ${model}`, options.messages);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return { response: "这是一个来自本地开发环境的模拟AI回答。部署到 Cloudflare 后将使用真实 AI。" };
      }
    };
  }
  
  return undefined;
}
