import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import fetch from "node-fetch";
import { authenticate } from "../plugins/authenticate";

export async function authRoutes(fastify: FastifyInstance) {
    fastify.get('/me', {
        // Middleware de rota
        onRequest: [authenticate],
    }, async (request) => {
        return { user: request.user }
    })

    fastify.post('/users', async (request) => {
    // Criando uma validação para access_token
    const createUserBody = z.object({
        access_token: z.string(),
    });

    const { access_token } = createUserBody.parse(request.body)

    // Envio o token que veio do front para checar as infos do user
    const userResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${access_token}`
        }
    })

    const userData = await userResponse.json()

    const userInfoSchema = z.object({
        id: z.string(),
        email: z.string().email(),
        name: z.string(),
        picture: z.string().url(),
    })

    const userInfo = userInfoSchema.parse(userData)

    // Checo se ele existe no banco
    let user = await prisma.user.findUnique({
        where: {
            googleId: userInfo.id,
        }
    })

    // Se não existir eu crio o usuário
    if (!user) {
        user = await prisma.user.create({
            data: {
                googleId: userInfo.id,
                name: userInfo.name,
                email: userInfo.email,
                avatarUrl: userInfo.picture
            }
        })
    }

    // Refresh token
    // Criando o token e passando os parametros
    const token = fastify.jwt.sign({
        name: user.name,
        avatarUrl: user.avatarUrl,
    }, {
        // Quem gerou o token
        sub: user.id,
        expiresIn: '7 days',
    })

        return { token }
    })
}