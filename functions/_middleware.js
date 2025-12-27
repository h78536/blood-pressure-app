export async function onRequest(context) {
  try {
    const { request, next, env } = context;
    const url = new URL(request.url);
    
    // 如果是静态文件或API，直接通过
    if (url.pathname.startsWith('/_next/') || 
        url.pathname.startsWith('/api/') ||
        url.pathname.startsWith('/static/')) {
      return next();
    }
    
    // 其他所有请求都重写到根目录，让Next.js处理路由
    return env.ASSETS.fetch(new URL('/', request.url));
  } catch (error) {
    return new Response('Internal Server Error', { status: 500 });
  }
}