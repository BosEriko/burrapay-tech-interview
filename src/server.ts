import Fastify from 'fastify'
import { tournamentRoutes } from './routes/tournaments.ts'
import { playerRoutes } from './routes/players.ts'

async function buildServer() {
  const fastify = Fastify({
    logger: {
      level: process.env.NODE_ENV === 'test' ? 'silent' : 'info',
      transport: process.env.NODE_ENV !== 'production'
        ? { target: 'pino-pretty', options: { colorize: true, translateTime: 'SYS:standard' } }
        : undefined
    }
  })
  
  // Register routes
  await fastify.register(tournamentRoutes)
  await fastify.register(playerRoutes)
  
  // Basic health check endpoint (already implemented)
  fastify.get('/health', async (request, reply) => {
    return { status: 'OK', timestamp: new Date().toISOString() }
  })
  
  return fastify
}

async function start() {
  let fastify
  try {
    fastify = await buildServer()
    
    await fastify.listen({ port: 3000, host: '0.0.0.0' })
    
    fastify.log.info({ port: 3000 }, 'Server started')
    
  } catch (err) {
    if (fastify) {
      fastify.log.error({ err }, 'Failed to start server')
    } else {
      console.error('Failed to start server:', err)
    }
    process.exit(1)
  }
}

start()

export { buildServer, start }
