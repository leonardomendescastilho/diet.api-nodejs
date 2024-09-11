import { FastifyRequest, FastifyReply } from 'fastify';

export async function checkSessionId(
	request: FastifyRequest,
	reply: FastifyReply
) {
	const session_id = request.cookies.session_id;

	if (!session_id) {
		reply.status(401).send({
			message: 'Unauthorized.',
		});

		throw new Error('Unauthorized.');
	}
}
