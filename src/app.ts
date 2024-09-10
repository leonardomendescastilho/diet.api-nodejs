import fastify from 'fastify';
import cookie from '@fastify/cookie';

const app = fastify();

app.register(cookie);

export default app;
