import { FastifyInstance } from 'fastify'
import z from 'zod'
import { prisma } from '../libs/prisma'

export async function getPoll(app: FastifyInstance) {
	app.get('/polls/:pollId', async (req, reply) => {
		const getPollParams = z.object({
			pollId: z.string().uuid(),
		})

		const { pollId } = getPollParams.parse(req.params)

		const poll = await prisma.poll.findUnique({
			where: {
				id: pollId,
			},
			include: {
				options: {
					select: {
						id: true,
						title: true,
					},
				},
			},
		})

		return reply.send({ poll })
	})
}
