export interface Env {
  // Add environment bindings here, e.g.:
  // MY_KV: KVNamespace
  // DB: D1Database
}

export default {
  async fetch(request: Request, _env: Env): Promise<Response> {
    const url = new URL(request.url)

    if (url.pathname === '/health') {
      return Response.json({ status: 'ok' })
    }

    return new Response('Not Found', { status: 404 })
  },
} satisfies ExportedHandler<Env>
