import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";

import { poolRoutes } from "./routes/pool";
import { authRoutes } from "./routes/auth";
import { gameRoutes } from "./routes/game";
import { guessRoutes } from "./routes/guess";
import { userRoutes } from "./routes/user";

async function bootstrap() {
  const fastify = Fastify({
    /* Vai gerar logs*/
    logger: true,
  });

  /* Especificando que todos pode acessar a aplicação */
  await fastify.register(cors, {
    origin: true,
  });

  await fastify.register(jwt, {
    secret: 'nlwcopa',
  });

  await fastify.register(poolRoutes)
  await fastify.register(authRoutes)
  await fastify.register(gameRoutes)
  await fastify.register(guessRoutes)
  await fastify.register(userRoutes)

  /* Porta da aplicação */
  await fastify.listen({ port: 3350, host: "0.0.0.0" });
}

bootstrap();
