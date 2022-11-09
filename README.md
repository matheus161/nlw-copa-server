## Tecnologia utilizadas:

npm i typescript -D

npx tsc --init

npm i fastify

## Utilizado para compilar o código automaticamente de TS para JS já que o node não reconhece TS diretamente

npm i tsx -D

## Interface para automatizar e criar algumas tabelas novas

npm i prisma -D

## Utilizado para conectar com o banco de dados

npm i @prisma/client

## Configurando o SQLite como banco da aplicação

npx prisma init --datasource-provider SQLite

## Comando que detecta que o Prisma criou uma nova tabela no BD

npx prisma migrate dev

Migration: Mecanismos para fazer versionamento no banco de dados (Arquivos com instruções para CRUD e afins)

## Visualizar o BD pelo navegador

npx prisma studio

Mermaid: Projeto para geração de diagramas através de códigos

## Gerando o diagram de banco de dados

npx prisma generate

## Cors: mecanismo de segurança para nossa aplicação. Quais aplicações estão aptas para consumir nossa api

npm i @fastify/cors

## Biblioteca de validação de Schema

npm i zod

## Biblioteca para gerar id aleatórios

npm i short-unique-id

## Sigleton -> reaproveita o código de um determinado arquivo.

## JWT
- Token/hash gerado através de vários algoritmos. Criamos dentro do backend e terá uma data de validade

npm i @fastify/jwt
