import { getRequestContext } from '@cloudflare/next-on-pages';

// 定义 Cloudflare AI 绑定的接口
interface AI {
  run: (
    model: string,
    options: {
      messages: { role: string; content: string }[];
    }
  ) => Promise<{ response: string }>;
}

export function getAI(): AI | undefined {
  if (process.env.NODE_ENV === 'development') {
    // 在开发环境中，我们无法直接访问 Cloudflare 的 AI 绑定
    // 返回一个模拟的 AI 对象用于测试
    console.log("开发模式：返回模拟 AI 对象。");
    return {
      run: async (model, options) => {
        console.log(`模拟 AI 调用: ${model}`, options.messages);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return { response: "这是一个来自本地开发环境的模拟AI回答。部署到 Cloudflare 后将使用真实 AI。" };
      }
    };
  }

  try {
    // 在 Cloudflare 环境中，通过请求上下文获取 AI 绑定
    return getRequestContext().env.AI as AI;
  } catch (e) {
    console.error('无法获取 Cloudflare 请求上下文或 AI 绑定:', e);
    return undefined;
  }
}
