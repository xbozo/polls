import { FastifyInstance } from 'fastify'
import z from 'zod'
import { prisma } from '../libs/prisma'

export async function createPoll(app: FastifyInstance) {
	app.post('/polls', async (req, reply) => {
		const createPollBody = z.object({
			title: z.string(),
			options: z.array(z.string()),
		})

		const { title, options } = createPollBody.parse(req.body)

		const poll = await prisma.poll.create({
			data: {
				title,
				options: {
					createMany: {
						data: options.map((option) => {
							return {
								title: option,
							}
						}),
					},
				},
			},
		})

		console.log(poll)

		return reply.status(201).send({ pollId: poll.id })
	})
}
