# 🗳️ API de Enquetes

Sistema completo de gerenciamento de enquetes com autenticação JWT, votação em tempo real e geração de QR Codes.

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Arquitetura](#arquitetura)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Executando o Projeto](#executando-o-projeto)
- [Rotas da API](#rotas-da-api)
- [Estrutura de Pastas](#estrutura-de-pastas)

## 🎯 Sobre o Projeto

API RESTful para criação e gerenciamento de enquetes, permitindo que usuários autenticados criem enquetes, votem, visualizem resultados e gerenciem suas próprias enquetes. O sistema também gera QR Codes para facilitar o compartilhamento.

### Funcionalidades

- ✅ Autenticação JWT
- ✅ Registro e login de usuários
- ✅ Criação de enquetes
- ✅ Votação em enquetes
- ✅ Fechamento e extensão de enquetes
- ✅ Visualização de resultados
- ✅ Geração de QR Code para compartilhamento
- ✅ Listagem de enquetes criadas pelo usuário
- ✅ Listagem de enquetes votadas pelo usuário

## 🚀 Tecnologias Utilizadas

- **Node.js** - Runtime JavaScript
- **TypeScript** - Superset tipado do JavaScript
- **Fastify** - Framework web de alta performance
- **Prisma ORM** - ORM moderno para TypeScript
- **PostgreSQL** - Banco de dados relacional
- **Docker** - Containerização do banco de dados
- **JWT** - Autenticação via tokens
- **Bcrypt** - Criptografia de senhas
- **QRCode** - Geração de QR Codes
- **Zod** - Validação de schemas

## 🏗️ Arquitetura

O projeto segue os princípios de **Clean Architecture** com separação em camadas:

```
src/
├── domain/          # Entidades e interfaces de domínio
├── application/     # Casos de uso (regras de negócio)
├── infra/          # Implementações de infraestrutura
├── interface/      # Camada de apresentação (HTTP)
└── main/           # Ponto de entrada da aplicação
```

## 📦 Pré-requisitos

Antes de começar, você precisa ter instalado:

- [Node.js](https://nodejs.org/) (v18 ou superior)
- [pnpm](https://pnpm.io/) (v10.7.0 ou superior)
- [Docker](https://www.docker.com/) e Docker Compose

## 🔧 Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/FellipeCavalcante/repo-web-II.git
cd trabalho-3-Fellipe_Azevedo
```

### 2. Instale as dependências

```bash
pnpm install
```

### 3. Inicie o banco de dados

```bash
docker compose up -d
```

Isso irá iniciar um container PostgreSQL na porta 5432.

## ⚙️ Configuração

### 1. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto baseado no `.env.example`:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
# Database connection URL
DATABASE_URL="postgresql://docker:docker@localhost:5432/enquetesdb?schema=public"

# JWT Secret (use uma string aleatória e segura)
JWT_SECRET="seu_secret_super_seguro_aqui_123456"

# Base URL da aplicação (para geração de QR Codes)
BASE_URL="http://localhost:3333"
```

### 2. Execute as migrations do Prisma

```bash
pnpm prisma migrate dev
```

### 3. (Opcional) Popule o banco com dados de teste

```bash
pnpm seed
```

## ▶️ Executando o Projeto

### Modo de desenvolvimento

```bash
pnpm dev
```

O servidor iniciará em `http://localhost:3333`

### Verificar se está funcionando

Acesse `http://localhost:3333` - você deve receber:

```json
{
  "statusCode": 200,
  "message": "OK",
  "timestamp": "2025-12-05T20:00:00.000Z"
}
```

## 📚 Rotas da API

### 🔓 Rotas Públicas

#### Health Check

```http
GET /
GET /health
```

#### Autenticação

**Registrar usuário**

```http
POST /api/v1/register
Content-Type: application/json

{
  "name": "João Silva",
  "email": "joao@example.com",
  "password": "senha123"
}
```

**Login**

```http
POST /api/v1/login
Content-Type: application/json

{
  "email": "joao@example.com",
  "password": "senha123"
}
```

**Resposta:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "joao@example.com",
    "name": "João Silva"
  }
}
```

**Listar enquetes públicas**

```http
GET /api/v1/polls
```

**Obter QR Code de uma enquete**

```http
GET /api/v1/polls/:pollId/qrcode
```

### 🔒 Rotas Protegidas

> **Nota:** Todas as rotas abaixo requerem autenticação via Bearer Token no header:
>
> ```
> Authorization: Bearer {seu_token}
> ```

#### Usuário Autenticado

**Ver dados do usuário logado**

```http
GET /me
```

#### Enquetes

**Criar enquete**

```http
POST /api/v1/polls
Content-Type: application/json

{
  "title": "Qual sua linguagem favorita?",
  "description": "Escolha sua linguagem de programação preferida",
  "expiresAt": "2025-12-31T23:59:59Z",
  "options": [
    { "text": "JavaScript" },
    { "text": "TypeScript" },
    { "text": "Python" }
  ]
}
```

**Obter detalhes de uma enquete**

```http
GET /api/v1/polls/:pollId
```

**Fechar uma enquete**

```http
POST /api/v1/polls/:pollId/close
```

**Estender prazo de uma enquete**

```http
PATCH /api/v1/polls/:pollId/extend
Content-Type: application/json

{
  "newExpiresAt": "2026-01-31T23:59:59Z"
}
```

**Obter resultados de uma enquete**

```http
GET /api/v1/polls/:pollId/results
```

#### Votação

**Votar em uma enquete**

```http
POST /api/v1/polls/:pollId/votes
Content-Type: application/json

{
  "optionId": "uuid-da-opcao"
}
```

#### Histórico do Usuário

**Ver enquetes criadas pelo usuário**

```http
GET /api/v1/me/polls/created
```

**Ver enquetes votadas pelo usuário**

```http
GET /api/v1/me/polls/voted
```

## 📁 Estrutura de Pastas

```
trabalho-3-Fellipe_Azevedo/
├── prisma/
│   ├── migrations/         # Migrations do banco de dados
│   ├── schema.prisma       # Schema do Prisma
│   └── seed.ts            # Script de seed
├── src/
│   ├── application/
│   │   └── use-cases/     # Casos de uso da aplicação
│   ├── domain/
│   │   ├── entities/      # Entidades de domínio
│   │   ├── repositories/  # Interfaces de repositórios
│   │   └── services/      # Interfaces de serviços
│   ├── infra/
│   │   ├── auth/          # Serviço de autenticação JWT
│   │   ├── database/      # Configuração do banco
│   │   ├── handlers/      # Handlers de erro
│   │   └── repositories/  # Implementações de repositórios
│   ├── interface/
│   │   └── http/
│   │       ├── controllers/  # Controllers HTTP
│   │       └── middlewares/  # Middlewares HTTP
│   └── main/
│       └── server.ts      # Ponto de entrada da aplicação
├── .env                   # Variáveis de ambiente
├── .env.example          # Exemplo de variáveis
├── docker-compose.yml    # Configuração do Docker
├── package.json          # Dependências do projeto
└── tsconfig.json        # Configuração do TypeScript
```

## 🔐 Autenticação

A API utiliza JWT (JSON Web Tokens) para autenticação. Após fazer login, você receberá um token que deve ser incluído no header `Authorization` de todas as requisições protegidas:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

O token expira em **7 dias**.

## 🧪 Testando a API

### Com cURL

```bash
# Login
curl -X POST http://localhost:3333/api/v1/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"senha123"}'

# Criar enquete (substitua {TOKEN} pelo token recebido)
curl -X POST http://localhost:3333/api/v1/polls \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {TOKEN}" \
  -d '{"title":"Teste","description":"Descrição","expiresAt":"2025-12-31T23:59:59Z","options":[{"text":"Opção 1"},{"text":"Opção 2"}]}'
```

### Com Postman ou Insomnia

1. Importe a collection ou crie manualmente as requisições
2. Configure a autenticação Bearer Token
3. Use as rotas documentadas acima

## 🛠️ Scripts Disponíveis

```bash
# Desenvolvimento com hot reload
pnpm dev

# Executar migrations
pnpm prisma migrate dev

# Gerar cliente Prisma
pnpm prisma generate

# Abrir Prisma Studio (interface visual do banco)
pnpm prisma studio

# Seed do banco de dados
pnpm seed
```

## 🐳 Gerenciamento do Docker

```bash
# Iniciar containers
docker compose up -d

# Parar containers
docker compose down

# Ver logs
docker compose logs -f

# Resetar banco de dados
docker compose down -v
docker compose up -d
pnpm prisma migrate dev
```

## 📝 Licença

Este projeto foi desenvolvido para fins acadêmicos.

## 👨‍💻 Autor

**Fellipe Azevedo**

---

⭐ Se este projeto foi útil, considere dar uma estrela!

