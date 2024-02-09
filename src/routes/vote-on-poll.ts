import { randomUUID } from 'crypto'
import { FastifyInstance } from 'fastify'
import z from 'zod'
import { prisma } from '../libs/prisma'

export async function voteOnPoll(app: FastifyInstance) {
	app.post('/polls/:pollId/votes', async (req, reply) => {
		const voteOnPollParams = z.object({
			pollId: z.string().uuid(),
		})

		const voteOnPollBody = z.object({
			pollOptionId: z.string().uuid(),
		})

		const { pollId } = voteOnPollParams.parse(req.params)
		const { pollOptionId } = voteOnPollBody.parse(req.body)

		let { sessionId } = req.cookies // identifier for a unique user. a verified login could work better

		if (sessionId) {
			const userPreviousVoteOnPoll = await prisma.vote.findUnique({
				where: {
					sessionId_pollId: {
						sessionId,
						pollId,
					},
				},
			})

			if (userPreviousVoteOnPoll && userPreviousVoteOnPoll.pollOptionId !== pollOptionId) {
				await prisma.vote.delete({
					where: {
						id: userPreviousVoteOnPoll.id,
					},
				})
			} else if (userPreviousVoteOnPoll) {
				return reply.status(400).send({ message: 'You already voted on this poll.' })
			}
		}

		if (!sessionId) {
			sessionId = randomUUID()

			reply.setCookie('sessionId', sessionId, {
				path: '/',
				maxAge: 60 * 60 * 24 * 30, // 30 days
				signed: true,
				httpOnly: true,
			})
		}

		await prisma.vote.create({
			data: {
				sessionId,
				pollOptionId,
				pollId,
			},
		})

		return reply.status(201).send()
	})
}
