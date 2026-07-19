# 🚀 API Backend Profissional - Conexão Segura DB (VBSP ERP)

Esta é uma API backend modular e profissional baseada em **Node.js + Express** com suporte dinâmico a bases de dados **MySQL** ou **PostgreSQL**, desenvolvida especificamente para garantir comunicações seguras de alta performance, sem timeouts e com isolamento total das suas credenciais de base de dados.

Ideal para ligar a aplicação Web, aplicações móveis, ou executáveis locais (`.exe`) à sua base de dados centralizada online.

---

## 📂 Estrutura Modular (MVC)

O projeto segue um padrão MVC organizado e limpo para máxima escalabilidade:

```text
/backend-api
├── config/
│   └── db.js            # Adaptador e Pool de conexão (MySQL/PostgreSQL)
├── controllers/
│   └── userController.js# Lógica de negócio (Autenticação JWT & CRUD de Utilizadores)
├── middleware/
│   └── auth.js          # Middleware protetor de rotas via JWT
├── routes/
│   └── userRoutes.js    # Definição de rotas REST
├── .env.example         # Template de variáveis de ambiente
├── package.json         # Dependências do ecossistema
├── server.js            # Ponto de entrada Express com CORS e logs ativos
└── README.md            # Este manual de instruções
```

---

## ⚙️ 1. Instalação e Preparação

No seu servidor remoto (VPS, AWS, DigitalOcean, etc.) ou na sua máquina local:

1. Garanta que tem o **Node.js** (v16 ou superior) instalado.
2. Copie os ficheiros desta pasta `/backend-api` para a diretoria desejada do servidor.
3. Instale todas as dependências oficiais executando:

```bash
npm install
```

---

## 🔑 2. Configuração das Variáveis de Ambiente (`.env`)

Crie um ficheiro nomeado `.env` (com base no template `.env.example`) na raiz da pasta `/backend-api`:

```bash
cp .env.example .env
```

Abra o ficheiro `.env` e configure as chaves reais:

```ini
# Configuração do Servidor Express
PORT=3000
NODE_ENV=production
JWT_SECRET=sua_chave_secreta_super_segura_aqui  # Altere para algo complexo e seguro

# Tipo de Base de Dados: mysql ou postgresql
DB_TYPE=mysql

# Credenciais de Acesso à sua Base de Dados
DB_HOST=127.0.0.1       # Endereço ou IP do servidor da BD
DB_PORT=3306            # 3306 para MySQL, 5432 para PostgreSQL
DB_USER=root
DB_PASS=sua_senha_secreta
DB_NAME=sistema_db
```

---

## 🏃 3. Executando o Servidor

### 👨‍💻 Em Modo Desenvolvimento (com recarga automática):
```bash
npm run dev
```

### ⚡ Em Modo Produção (máxima performance):
```bash
npm start
```

---

## 🔓 4. Configurações Importantes do Servidor (Segurança e Firewall)

Para garantir que a comunicação ocorra sem erros de *Connection Refused* ou *Timeout*, certifique-se de validar o seguinte checklist:

### A. Abrir Portas na Firewall
No seu servidor cloud (ex: Painel AWS Security Groups, DigitalOcean Cloud Firewalls, ou no terminal Linux via `ufw`):
*   **Porta 3000 (API):** Deve estar aberta para tráfego de entrada pública (`0.0.0.0/0`) ou restrita ao IP da sua aplicação web/EXE para que os clientes consigam alcançar a API.
*   **Portas de Base de Dados (3306 / 5432):** Se a sua API correr no mesmo servidor físico da Base de Dados, **feche as portas 3306/5432 ao exterior** por motivos de segurança. A API ligar-se-á localmente via `127.0.0.1` e exporá apenas os dados necessários de forma segura pela porta `3000`.

Para gerir portas no Linux Ubuntu:
```bash
sudo ufw allow 3000/tcp
sudo ufw reload
```

### B. Permitir Conexões Externas no MySQL (se aplicável)
Se o MySQL estiver num servidor separado, certifique-se de que o ficheiro `mysqld.cnf` tem o parâmetro `bind-address` configurado como `0.0.0.0` e que o utilizador tem permissões de acesso:

```sql
GRANT ALL PRIVILEGES ON sistema_db.* TO 'root'@'%' IDENTIFIED BY 'sua_senha_secreta';
FLUSH PRIVILEGES;
```

---

## 📡 5. Rotas REST Disponíveis e Exemplo de Conexão

A API inicia com uma tabela de utilizadores (`users`) autogerada em MySQL ou PostgreSQL no primeiro arranque. Ela cria automaticamente um utilizador Administrador padrão se a tabela estiver vazia:
*   **Email:** `admin@vbsp.com`
*   **Palavra-passe:** `admin123`

### 🛣️ Endpoints da API

| Método | Rota | Descrição | Requer Autenticação |
| :--- | :--- | :--- | :--- |
| **GET** | `/` | Teste de estado rápido da API | Não |
| **POST** | `/api/login` | Login com JWT (retorna `token` e dados do utilizador) | Não |
| **GET** | `/api/users` | Listar todos os utilizadores | Sim (Bearer Token) |
| **POST** | `/api/users` | Criar um novo utilizador | Sim (Bearer Token) |
| **PUT** | `/api/users/:id` | Editar dados de um utilizador existente | Sim (Bearer Token) |
| **DELETE** | `/api/users/:id` | Eliminar um utilizador por ID | Sim (Bearer Token) |

---

## 💻 6. Exemplos de Conexão (EXE, Web, Mobile)

### Exemplo 1: Autenticar (Login) e Guardar Token
```javascript
const API_URL = 'http://SEU_IP_OU_DOMINIO:3000/api';

async function autenticar() {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@vbsp.com',
      password: 'admin123'
    })
  });
  
  const result = await response.json();
  if (result.success) {
    // Guardar o token JWT para pedidos futuros protegidos
    localStorage.setItem('auth_token', result.token);
    console.log('Token JWT Guardado:', result.token);
  } else {
    console.error('Falha de login:', result.error);
  }
}
```

### Exemplo 2: Pedido Protegido (Listar Utilizadores)
```javascript
async function listarUtilizadores() {
  const token = localStorage.getItem('auth_token');
  
  const response = await fetch(`${API_URL}/users`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const result = await response.json();
  if (result.success) {
    console.log('Utilizadores encontrados:', result.data);
  } else {
    console.error('Erro de autorização:', result.error);
  }
}
```
