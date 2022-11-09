import { FastifyInstance } from "fastify";
import ShortUniqueId from "short-unique-id";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { authenticate } from "../plugins/authenticate";

export async function poolRoutes(fastify: FastifyInstance) {
    /* Rota para contagem de pools */
  fastify.get("/pools/count", async () => {
    /* Ele acessa a tabela e tem várias operações*/
    // const pools = await prisma.pool.findMany({
    //   where: {
    //     code: {
    //       startsWith: "M",
    //     },
    //   },
    // });
    const count = await prisma.pool.count();

    return { count };
  });

  /* Rota para criação de um bolão */
  fastify.post("/pools", async (request, reply) => {
    // Criando uma validação para title
    const createPoolBody = z.object({
      title: z.string(),
    });

    // Ele pega o body passando a validação
    // Parse entende que o titulo vem do tipo string
    const { title } = createPoolBody.parse(request.body);

    // Criando código
    const generate = new ShortUniqueId({ length: 6 });
    const code = String(generate()).toUpperCase();

    try {
      await request.jwtVerify()
      // Se eu tenho o usuer autenticado
      await prisma.pool.create({
        data: {
          title,
          code,
          ownerId: request.user.sub, // sub é o id do user

          participants: {
            create: {
              userId: request.user.sub,
            }
          }
        },
      });

    } catch (error) {
      // Criando o pool sem o user autenticado
      await prisma.pool.create({
        data: {
          title,
          code,
        },
      }); 
    }

    return reply.status(201).send({ code });
  });

  fastify.post("/pools/join", {
    onRequest: [authenticate],
  }, async (request, reply) => {
    const joinPoolBody = z.object({
      code: z.string(),
    });

    const { code } = joinPoolBody.parse(request.body)

    const pool = await prisma.pool.findUnique({
      where: {
        code,
      },
      // Traz infos de um relacionamento
      include: {
        participants: {
          where: {
            userId: request.user.sub,
          }
        }
      }
    })

    // Se o código do pool dor inválido
    if (!pool) {
      return reply.status(400).send({
        message: 'Pool not found.'
      })
    }

    // Se ele ja tiver participado do bolão
    if (pool.participants.length > 0) {
      return reply.status(400).send({
        message: 'You already joined this pool.'
      })
    }

    // Se o pool não tiver um dodno
    if (!pool.ownerId) {
      await prisma.pool.update({
        where: {
          id: pool.id
        },
        data: {
          ownerId: request.user.sub
        }
      })
    }

    await prisma.participant.create({
      data: {
        poolId: pool.id,
        userId: request.user.sub,
      }
    })

    return reply.status(201).send()

  });

  fastify.get("/pools", {
    onRequest: [authenticate],
  }, async (request) => {
    const pools = await prisma.pool.findMany({
      where: {
        participants: {
          // Quero pelo menos um pool que tem como id o user logado
          some: {
            userId: request.user.sub
          }
        }
      },
      // Retorno informações do dono do bolão
      include: {
        // Contagem dos participantes
        _count: {
          select: {
            participants: true,
          }
        },
        participants: {
          select: {
            id: true,

            // Trago informações do relacionamento
            user: {
              select: {
                avatarUrl: true,
              }
            }
          },
          take: 4, // Quantos eu quero trazer
        },
        owner: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    })

    return { pools }
  });

  fastify.get("/pools/:id", {
    onRequest: [authenticate],
  }, async (request) => {
    const getPoolParams = z.object({
      id: z.string(),
    })

    const { id } = getPoolParams.parse(request.params)

    const pool = await prisma.pool.findUnique({
      where: {
        id,
      },
      // Retorno informações do dono do bolão
      include: {
        // Contagem dos participantes
        _count: {
          select: {
            participants: true,
          }
        },
        participants: {
          select: {
            id: true,

            // Trago informações do relacionamento
            user: {
              select: {
                avatarUrl: true,
              }
            }
          },
          take: 4, // Quantos eu quero trazer
        },
        owner: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    })

    return { pool }

  })
}