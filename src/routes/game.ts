import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { authenticate } from "../plugins/authenticate";

export async function gameRoutes(fastify: FastifyInstance) {
  fastify.get("/pools/:id/games", {
    onRequest: [authenticate],
  }, async (request) => {
    const getPoolParams = z.object({
        id: z.string(),
      })
  
      const { id } = getPoolParams.parse(request.params)

      const games = await prisma.game.findMany({
        orderBy: {
            date: 'desc',
        },
        // Se o participante já criou um palpite irá retornar
        include: {
            guesses: {
                where: {
                    participant: {
                        userId: request.user.sub,
                        poolId: id,
                    }
                }
            }
        }
      })

      // Ajustando o retorno, já que um bolão só pode ter um palpite de um único user
      return { 
        games: games.map(game => {
            return {
                ...game, // Todas as informações que já existem
                guess: game.guesses.length > 0 ? game.guesses[0] : null,
                guesses: undefined,
            }
        })
     }
  })
}