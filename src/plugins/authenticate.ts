import { FastifyRequest } from "fastify";

// Checha se possui um token valido no cabeçalho
export async function authenticate(request: FastifyRequest) {
    await request.jwtVerify()
}