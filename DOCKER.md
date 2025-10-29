# Docker Setup - Cograde API

Este documento descreve como executar o projeto Cograde API usando Docker Compose.

## Pré-requisitos

- Docker
- Docker Compose

## Configuração

1. **Clone o repositório** (se ainda não fez):

```bash
git clone <repository-url>
cd cograde
```

2. **Crie um arquivo .env** na raiz do projeto:

```bash
# API Configuration
NODE_ENV=development
PORT=3000

# Redis Configuration
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=
```

## Executando o Projeto

### Desenvolvimento

Para executar em modo de desenvolvimento:

```bash
# Iniciar todos os serviços
docker-compose up

# Executar em background
docker-compose up -d

# Ver logs
docker-compose logs -f api
```

### Parando os Serviços

```bash
# Parar todos os serviços
docker-compose down

# Parar e remover volumes
docker-compose down -v
```

## Serviços

### API (Porta 3000)

- **URL**: http://localhost:3000
- **Container**: cograde-api
- **Dependências**: Redis

### Redis (Porta 6379)

- **URL**: redis://localhost:6379
- **Container**: cograde-redis
- **Persistência**: Volume `redis_data`

## Comandos Úteis

```bash
# Rebuild da API
docker-compose build api

# Executar comandos no container da API
docker-compose exec api sh

# Ver logs do Redis
docker-compose logs redis

# Verificar status dos serviços
docker-compose ps
```

## Estrutura dos Arquivos

```
cograde/
├── docker-compose.yml          # Configuração dos serviços
├── apps/api/Dockerfile         # Imagem da API
└── .env                        # Variáveis de ambiente
```

## Troubleshooting

### Problema de Conexão com Redis

Se a API não conseguir conectar com o Redis, verifique:

1. Se o Redis está rodando: `docker-compose ps`
2. Se as variáveis de ambiente estão corretas
3. Se o health check do Redis passou: `docker-compose logs redis`

### Rebuild Necessário

Se houver mudanças no código, pode ser necessário rebuild:

```bash
docker-compose down
docker-compose build --no-cache
docker-compose up
```
