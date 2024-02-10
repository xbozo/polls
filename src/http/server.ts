import cookie from '@fastify/cookie'
import websocket from '@fastify/websocket'
import fastify from 'fastify'
import { createPoll } from './routes/create-poll'
import { getPoll } from './routes/get-poll'
import { voteOnPoll } from './routes/vote-on-poll'
import { pollResults } from './websocket/poll-result'

const app = fastify()

app.register(cookie, {
	secret: 'polls-app-nlw',
	hook: 'onRequest',
})

app.register(createPoll)
app.register(getPoll)
app.register(voteOnPoll)

app.register(websocket)

app.register(pollResults)

app.listen({ port: 3333 }).then(() => {
	console.log(`HTTP server running on port 3333`)
})
