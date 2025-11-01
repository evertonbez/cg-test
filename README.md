# 🎨 Cograde

Aplicação que faz upload de imagens, processa de forma assíncrona (redimensiona, converte para escala de cinza, adiciona marca d'água) e armazena em Cloudflare R2.

## 🚀 Como Rodar

### Pré-requisitos

- Docker e Docker Compose
- Conta Firebase com credenciais
- Cloudflare R2 com bucket e credenciais

### 1. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Edite `.env` com:

- `FIREBASE_SERVICE_ACCOUNT` - JSON do Firebase (Project Settings > Service Accounts)
- `AWS_ACCESS_KEY_ID` - Chave R2
- `AWS_SECRET_ACCESS_KEY` - Secret R2
- `R2_BUCKET_NAME` - Nome do bucket R2
- `R2_ACCOUNT_ID` - Account ID do Cloudflare

### 2. Inicie a aplicação

```bash
docker-compose up -d
```

### 3. Acesse

- **Frontend**: http://localhost
- **API**: http://localhost:3333
- **Admin Panel**: http://localhost:3333/admin (user: admin / pass: password)

## 🔄 Fluxo

1. Usuário faz upload de imagem no frontend
2. Frontend envia URL da imagem para `/api/jobs`
3. API cria um job e enfileira no Redis
4. Worker processa:
   - Download da imagem
   - Redimensiona para 1024x1024
   - Converte para escala de cinza
   - Adiciona marca d'água "evertonbez"
   - Faz upload para R2
5. Frontend monitora em tempo real via Firestore
6. Imagem transformada fica disponível quando completo

## 🛑 Parar

```bash
docker-compose down
```

## 📊 Stack

- **Frontend**: React + Vite + Tailwind
- **API**: Node.js + Hono
- **Fila**: Bull MQ + Redis
- **DB**: Firebase Firestore
- **Storage**: Cloudflare R2
- **Processamento de imagens**: Sharp
