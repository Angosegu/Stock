import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import "dotenv/config";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc, deleteDoc, getDocFromServer } from "firebase/firestore";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));

  // Lazy-loaded Gemini Client
  let aiClient: GoogleGenAI | null = null;
  function getGeminiClient(): GoogleGenAI {
    if (!aiClient) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("A variável de ambiente GEMINI_API_KEY não foi configurada. Configure em Settings > Secrets.");
      }
      aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
    return aiClient;
  }

  // --- API Routes ---

  // --- Dynamic Database Adapter (MySQL, PostgreSQL, SQLite) ---
  const CONFIG_PATH = path.join(process.cwd(), "db_config.json");
  const DB_PATH = path.join(process.cwd(), "database.json");

  // Load database configuration (either from persistent file or from environment variables)
  let dbConfig = {
    dbType: process.env.DATABASE_TYPE || "mysql",
    dbHost: process.env.DATABASE_HOST || "65.21.252.101",
    dbPort: process.env.DATABASE_PORT || "3306",
    dbName: process.env.DATABASE_NAME || "mobitec2_amadje",
    dbUser: process.env.DATABASE_USER || "mobitec2_amadje",
    dbPass: process.env.DATABASE_PASS || "Luanda2020.",
    customDomain: process.env.VITE_CUSTOM_DOMAIN || "",
    // Firebase Fields
    fbApiKey: process.env.FIREBASE_API_KEY || "",
    fbAuthDomain: process.env.FIREBASE_AUTH_DOMAIN || "",
    fbProjectId: process.env.FIREBASE_PROJECT_ID || "",
    fbStorageBucket: process.env.FIREBASE_STORAGE_BUCKET || "",
    fbMessagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "",
    fbAppId: process.env.FIREBASE_APP_ID || "",
    fbDatabaseId: process.env.FIREBASE_DATABASE_ID || "",
  };

  let firestoreInstance: any = null;
  function getFirestoreDb(config: typeof dbConfig) {
    if (!firestoreInstance) {
      const firebaseConfig = {
        apiKey: config.fbApiKey || process.env.FIREBASE_API_KEY,
        authDomain: config.fbAuthDomain || process.env.FIREBASE_AUTH_DOMAIN,
        projectId: config.fbProjectId || process.env.FIREBASE_PROJECT_ID,
        storageBucket: config.fbStorageBucket || process.env.FIREBASE_STORAGE_BUCKET,
        messagingSenderId: config.fbMessagingSenderId || process.env.FIREBASE_MESSAGING_SENDER_ID,
        appId: config.fbAppId || process.env.FIREBASE_APP_ID,
      };

      if (!firebaseConfig.projectId) {
        throw new Error("A configuração 'fbProjectId' (Project ID) é obrigatória para usar o Firebase Firestore.");
      }

      const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
      const dbId = (config.fbDatabaseId || process.env.FIREBASE_DATABASE_ID || "").trim();
      firestoreInstance = dbId ? getFirestore(app, dbId) : getFirestore(app);
    }
    return firestoreInstance;
  }

  // Helper to trim and clean configuration inputs
  function cleanConfig(config: any) {
    if (!config) return config;
    const cleaned = { ...config };
    if (typeof cleaned.dbHost === "string") cleaned.dbHost = cleaned.dbHost.trim();
    if (typeof cleaned.dbPort === "string") cleaned.dbPort = String(cleaned.dbPort).trim();
    if (typeof cleaned.dbName === "string") cleaned.dbName = cleaned.dbName.trim();
    if (typeof cleaned.dbUser === "string") cleaned.dbUser = cleaned.dbUser.trim();
    if (typeof cleaned.fbApiKey === "string") cleaned.fbApiKey = cleaned.fbApiKey.trim();
    if (typeof cleaned.fbAuthDomain === "string") cleaned.fbAuthDomain = cleaned.fbAuthDomain.trim();
    if (typeof cleaned.fbProjectId === "string") cleaned.fbProjectId = cleaned.fbProjectId.trim();
    if (typeof cleaned.fbStorageBucket === "string") cleaned.fbStorageBucket = cleaned.fbStorageBucket.trim();
    if (typeof cleaned.fbMessagingSenderId === "string") cleaned.fbMessagingSenderId = cleaned.fbMessagingSenderId.trim();
    if (typeof cleaned.fbAppId === "string") cleaned.fbAppId = cleaned.fbAppId.trim();
    if (typeof cleaned.fbDatabaseId === "string") cleaned.fbDatabaseId = cleaned.fbDatabaseId.trim();
    return cleaned;
  }

  // Helper to translate database errors to clear, friendly Portuguese explanations
  function translateDbError(err: any): string {
    const msg = (err.message || String(err)).toLowerCase();
    const code = err.code ? String(err.code).toUpperCase() : "";
    const errno = err.errno ? String(err.errno).toUpperCase() : "";
    const errorno = err.errorno ? String(err.errorno).toUpperCase() : "";
    console.log("[VBSP BD] Falha de ligação processada.");

    if (
      msg.includes("getaddrinfo enotfound") || 
      msg.includes("eai_again") || 
      code === "ENOTFOUND" || 
      code === "EAI_AGAIN" ||
      errno === "ENOTFOUND" ||
      errorno === "ENOTFOUND"
    ) {
      const hostMatch = (err.message || String(err)).match(/(?:ENOTFOUND|EAI_AGAIN)\s+([^\s]+)/) || (err.message || String(err)).match(/getaddrinfo\s+(?:ENOTFOUND|EAI_AGAIN)\s+([^\s]+)/);
      const hostName = hostMatch ? ` "${hostMatch[1].trim()}"` : "";
      return `Servidor de base de dados não encontrado (erro de DNS)${hostName}. Por favor, verifique se o Host/IP está correto e não contém espaços extra ou carateres inválidos.`;
    }

    if (
      msg.includes("econnrefused") || 
      code === "ECONNREFUSED" || 
      errno === "ECONNREFUSED" || 
      errorno === "ECONNREFUSED"
    ) {
      const portMatch = (err.message || String(err)).match(/(\d+)/);
      const portStr = portMatch ? ` na porta ${portMatch[1]}` : "";
      return `Ligação recusada pelo servidor remoto${portStr}. Certifique-se de que o serviço (PostgreSQL/MySQL) está ativo no servidor externo e aceita ligações remotas.`;
    }

    if (
      msg.includes("etimedout") || 
      msg.includes("timeout") || 
      msg.includes("timedout") || 
      code === "ETIMEDOUT" || 
      errno === "ETIMEDOUT" || 
      errorno === "ETIMEDOUT"
    ) {
      return `Tempo limite de ligação esgotado (Timeout). O servidor remoto está inacessível. Certifique-se de que o Host/IP está correto, a porta correspondente está aberta na firewall do seu servidor (ex: 3306 para MySQL ou 5432 para PostgreSQL), e que o servidor de base de dados permite ligações externas (no cPanel, configure 'Remote MySQL' para permitir acessos de '%').`;
    }

    if (
      msg.includes("access denied") || 
      msg.includes("authentication failed") || 
      msg.includes("password authentication failed") ||
      msg.includes("28000") || 
      msg.includes("er_access_denied_error") ||
      code === "ER_ACCESS_DENIED_ERROR"
    ) {
      return `Erro de autenticação: Acesso negado. O utilizador ou a palavra-passe estão incorretos para esta base de dados.`;
    }

    if (
      msg.includes("does not exist") || 
      msg.includes("bad_db") || 
      msg.includes("er_bad_db_error") || 
      msg.includes("3d000") ||
      code === "ER_BAD_DB_ERROR"
    ) {
      return `A base de dados (Database Name) especificada não existe no servidor remoto. Certifique-se de criá-la previamente no seu servidor ou verifique o nome inserido.`;
    }

    if (msg.includes("no pg_hba.conf entry")) {
      return `Configuração de segurança (pg_hba.conf) no PostgreSQL impede esta ligação. Certifique-se de configurar o seu PostgreSQL para aceitar conexões TCP/IP externas com SSL ativo.`;
    }

    if (msg.includes("firebase") || msg.includes("firestore") || msg.includes("permission-denied") || msg.includes("unauthenticated") || msg.includes("api key") || msg.includes("invalid-api-key") || msg.includes("not-found") || msg.includes("not_found") || msg.includes("offline") || msg.includes("unavailable")) {
      if (msg.includes("permission-denied")) {
        return `Permissão negada no Firebase Firestore. Certifique-se de que as Regras de Segurança do seu Firestore estão configuradas para permitir escrita/leitura para a coleção 'state'. Ex: allow read, write: if true;`;
      }
      if (msg.includes("api-key") || msg.includes("api key") || msg.includes("invalid-api-key") || msg.includes("bad-request")) {
        return `A chave de API (API Key) do Firebase é inválida ou incorreta. Por favor, verifique se copiou a chave corretamente das configurações do seu projeto Firebase.`;
      }
      if (msg.includes("not-found") || msg.includes("not_found") || msg.includes("offline") || msg.includes("unavailable") || msg.includes("5")) {
        const projId = dbConfig.fbProjectId || "seu-projeto";
        return `Base de dados Firestore não inicializada ou inacessível no projeto '${projId}'. Por favor, aceda a https://console.firebase.google.com/project/${projId}/firestore e clique em "Criar base de dados" (Create Database) no modo '(default)' com regras de teste ou leitura/escrita pública temporária para poder ligar.`;
      }
      return `Erro do Firebase: ${err.message || String(err)}`;
    }

    return `Erro de ligação: ${err.message || String(err)}`;
  }

  if (fs.existsSync(CONFIG_PATH)) {
    try {
      const savedConfig = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8"));
      dbConfig = cleanConfig({ ...dbConfig, ...savedConfig });
    } catch (e) {
      console.log("[VBSP Config] Sem ficheiro db_config.json opcional.");
    }
  }

  // Caching flag to prevent redundant table checks
  let tablesEnsured = false;

  // Track if active database is known to be down/unreachable to prevent sluggish timeouts
  let activeDbFailed = false;
  let lastDbFailureTime = 0;
  const DB_FAILURE_COOLDOWN = 20000; // 20 seconds cooldown before retrying

  // Helper to identify direct network-level unreachability errors to avoid double timeout fallbacks
  function isNetworkUnreachableError(err: any): boolean {
    const msg = (err.message || String(err)).toLowerCase();
    const code = err.code ? String(err.code).toUpperCase() : "";
    const errno = err.errno ? String(err.errno).toUpperCase() : "";
    const errorno = err.errorno ? String(err.errorno).toUpperCase() : "";
    return (
      msg.includes("etimedout") ||
      msg.includes("econnrefused") ||
      msg.includes("enotfound") ||
      msg.includes("eai_again") ||
      msg.includes("timeout expired") ||
      msg.includes("connection timeout") ||
      code === "ETIMEDOUT" ||
      code === "ECONNREFUSED" ||
      code === "ENOTFOUND" ||
      code === "EAI_AGAIN" ||
      errno === "ETIMEDOUT" ||
      errorno === "ETIMEDOUT" ||
      errno === "ECONNREFUSED" ||
      errorno === "ECONNREFUSED"
    );
  }

  // Active database connection pool/client helper
  async function queryExternalDb(config: typeof dbConfig, queryText: string, params: any[] = [], bypassCooldown = false): Promise<any> {
    const cleaned = cleanConfig(config);
    const type = cleaned.dbType;
    if (type === "sqlite") {
      throw new Error("Base de dados local (SQLite/JSON) ativa. Sem conexão externa.");
    }

    const cleanedActive = cleanConfig(dbConfig);
    const isActiveConfig = (
      cleaned.dbHost === cleanedActive.dbHost && 
      String(cleaned.dbPort) === String(cleanedActive.dbPort) && 
      cleaned.dbName === cleanedActive.dbName && 
      cleaned.dbUser === cleanedActive.dbUser && 
      cleaned.dbType === cleanedActive.dbType
    );

    if (!bypassCooldown && isActiveConfig && activeDbFailed && (Date.now() - lastDbFailureTime < DB_FAILURE_COOLDOWN)) {
      throw new Error(`O servidor remoto (${cleaned.dbHost}) está inacessível (cooldown ativo para evitar lentidão).`);
    }

    try {
      let result;
      if (type === "postgresql") {
        const { default: pg } = await import("pg");
        let client;
        try {
          // Try with SSL first (default behavior for managed cloud dbs)
          client = new pg.Client({
            host: cleaned.dbHost,
            port: Number(cleaned.dbPort) || 5432,
            database: cleaned.dbName,
            user: cleaned.dbUser,
            password: cleaned.dbPass,
            ssl: cleaned.dbHost !== "localhost" && cleaned.dbHost !== "127.0.0.1" ? { rejectUnauthorized: false } : false,
            connectionTimeoutMillis: 4000, // 4 seconds connection timeout
          });
          await client.connect();
        } catch (sslErr: any) {
          if (isNetworkUnreachableError(sslErr)) {
            throw sslErr;
          }
          console.log("[VBSP BD] Tentativa Postgres SSL inativa, tentando sem encriptação...");
          // Fallback: Try without SSL
          client = new pg.Client({
            host: cleaned.dbHost,
            port: Number(cleaned.dbPort) || 5432,
            database: cleaned.dbName,
            user: cleaned.dbUser,
            password: cleaned.dbPass,
            ssl: false,
            connectionTimeoutMillis: 4000,
          });
          await client.connect();
        }
        try {
          const res = await client.query(queryText, params);
          result = res.rows;
        } finally {
          await client.end();
        }
      } else if (type === "mysql") {
        const { default: mysql } = await import("mysql2/promise");
        let connection;
        try {
          // Try WITHOUT forcing SSL first (optimal for typical VPS, cPanel, and external hosting providers)
          connection = await mysql.createConnection({
            host: cleaned.dbHost,
            port: Number(cleaned.dbPort) || 3306,
            database: cleaned.dbName,
            user: cleaned.dbUser,
            password: cleaned.dbPass,
            connectTimeout: 4000, // 4 seconds connection timeout
          });
        } catch (noSslErr: any) {
          const msg = noSslErr.message || "";
          // If it's explicitly an access/credentials/database error, or a network unreachable error, propagate it immediately
          if (
            isNetworkUnreachableError(noSslErr) ||
            msg.includes("Access denied") || 
            msg.includes("access denied") || 
            msg.includes("ER_BAD_DB_ERROR") || 
            msg.includes("ER_ACCESS_DENIED_ERROR")
          ) {
            throw noSslErr;
          }

          console.log("[VBSP BD] Tentativa MySQL sem SSL falhou, a tentar com encriptação...");
          // Fallback: Try with SSL forced
          connection = await mysql.createConnection({
            host: cleaned.dbHost,
            port: Number(cleaned.dbPort) || 3306,
            database: cleaned.dbName,
            user: cleaned.dbUser,
            password: cleaned.dbPass,
            ssl: { rejectUnauthorized: false },
            connectTimeout: 4000,
          });
        }
        try {
          const [rows] = await connection.execute(queryText, params);
          result = rows;
        } finally {
          await connection.end();
        }
      } else {
        throw new Error("Tipo de base de dados não suportado: " + type);
      }

      if (isActiveConfig) {
        activeDbFailed = false; // Reset failing state on success
      }
      return result;
    } catch (err: any) {
      if (isActiveConfig) {
        console.log(`[VBSP BD] Servidor de BD externa inacessível (${cleaned.dbHost}), modo offline ativo.`);
        activeDbFailed = true;
        lastDbFailureTime = Date.now();
      }
      throw err;
    }
  }

  // Ensure tables exist on external databases
  async function ensureTables(config: typeof dbConfig) {
    if (config.dbType === "sqlite") return;
    if (tablesEnsured) return;
    try {
      if (config.dbType === "postgresql") {
        await queryExternalDb(
          config,
          `CREATE TABLE IF NOT EXISTS erp_state (
            id VARCHAR(50) PRIMARY KEY,
            state_json TEXT,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );`
        );
        tablesEnsured = true;
        console.log("[VBSP BD] Tabela 'erp_state' verificada/criada com sucesso em PostgreSQL.");
      } else if (config.dbType === "mysql") {
        await queryExternalDb(
          config,
          `CREATE TABLE IF NOT EXISTS erp_state (
            id VARCHAR(50) PRIMARY KEY,
            state_json LONGTEXT,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
          );`
        );
        tablesEnsured = true;
        console.log("[VBSP BD] Tabela 'erp_state' verificada/criada com sucesso em MySQL.");
      }
    } catch (err: any) {
      console.log("[VBSP BD] Não foi possível estruturar tabelas na BD remota.");
    }
  }

  // Initial table setup at startup
  if (dbConfig.dbType !== "sqlite" && dbConfig.dbType !== "firebase") {
    ensureTables(dbConfig).catch((e) => {
      console.log("[VBSP BD] Ligação inicial externa não estabelecida.");
    });
  }

  // Cache variables for DB status
  let cachedStatus: any = null;
  let lastStatusCheckTime = 0;
  const STATUS_CACHE_TTL = 10000; // 10 seconds

  // Get active database configuration
  app.get("/api/db/config", (req, res) => {
    res.json(dbConfig);
  });

  // Get active database status
  app.get("/api/db/status", async (req, res) => {
    const now = Date.now();
    if (cachedStatus && (now - lastStatusCheckTime < STATUS_CACHE_TTL)) {
      return res.json(cachedStatus);
    }

    try {
      if (dbConfig.dbType === "sqlite") {
        cachedStatus = {
          success: true,
          status: "ONLINE",
          dbType: "sqlite",
          message: "Servidor VBSP ativo. Base de dados local (SQLite/JSON) operacional."
        };
        lastStatusCheckTime = now;
        return res.json(cachedStatus);
      }

      if (dbConfig.dbType === "firebase") {
        const db = getFirestoreDb(dbConfig);
        const docRef = doc(db, "state", "status_check");
        await getDocFromServer(docRef);
        cachedStatus = {
          success: true,
          status: "ONLINE",
          dbType: "firebase",
          message: "Servidor VBSP ativo e conectado com sucesso ao Firebase Firestore!"
        };
        lastStatusCheckTime = now;
        return res.json(cachedStatus);
      }

      const testQuery = dbConfig.dbType === "postgresql" ? "SELECT 1 AS ok" : "SELECT 1 AS ok";
      await queryExternalDb(dbConfig, testQuery);

      cachedStatus = {
        success: true,
        status: "ONLINE",
        dbType: dbConfig.dbType,
        message: `Servidor VBSP ativo e conectado com sucesso à base de dados externa (${dbConfig.dbType}).`
      };
      lastStatusCheckTime = now;
      res.json(cachedStatus);
    } catch (error: any) {
      cachedStatus = {
        success: false,
        status: "ERROR",
        dbType: dbConfig.dbType,
        message: `Servidor VBSP ativo, mas falhou ao comunicar com a base de dados externa (${dbConfig.dbType}): ${translateDbError(error)}`
      };
      lastStatusCheckTime = now;
      res.json(cachedStatus);
    }
  });

  // Test connection endpoint
  app.post("/api/db/test-connection", async (req, res) => {
    try {
      const testConfig = req.body;
      if (testConfig.dbType === "sqlite") {
        return res.json({ success: true, message: "Modo SQLite ativo por padrão. Pronto a usar!" });
      }

      if (testConfig.dbType === "firebase") {
        // Temporarily reset cache to test new credentials
        const oldInstance = firestoreInstance;
        firestoreInstance = null;
        try {
          const db = getFirestoreDb(testConfig);
          const docRef = doc(db, "state", "status_check");
          await getDocFromServer(docRef);
          return res.json({ success: true, message: "Conexão estabelecida com sucesso com o Firebase Firestore!" });
        } catch (connErr: any) {
          console.log("[Status] Erro ao testar ligação ao Firestore:", connErr.message);
          return res.status(400).json({ 
            success: false, 
            error: `O banco de dados Firestore não foi inicializado no projeto '${testConfig.fbProjectId}'. Por favor, aceda a https://console.firebase.google.com/project/${testConfig.fbProjectId}/firestore para criar a base de dados '(default)' primeiro, e certifique-se de que as regras permitem acesso.` 
          });
        } finally {
          firestoreInstance = oldInstance;
        }
      }
      
      const query = testConfig.dbType === "postgresql" ? "SELECT 1 AS ok" : "SELECT 1 AS ok";
      await queryExternalDb(testConfig, query, [], true);
      
      res.json({ success: true, message: "Conexão estabelecida com sucesso com a sua base de dados externa!" });
    } catch (error: any) {
      console.log("[Status] Conexão externa inacessível.");
      res.status(400).json({ success: false, error: translateDbError(error) });
    }
  });

  // Save server configurations dynamically and test them
  app.post("/api/db/save-config", async (req, res) => {
    try {
      const newConfig = req.body;
      
      if (newConfig.dbType !== "sqlite") {
        try {
          if (newConfig.dbType === "firebase") {
            // Test the new Firebase configuration before saving
            const oldInstance = firestoreInstance;
            firestoreInstance = null;
            try {
              const db = getFirestoreDb(newConfig);
              const docRef = doc(db, "state", "status_check");
              await getDocFromServer(docRef);
            } catch (fbErr: any) {
              console.log("[SaveConfig] Erro ao testar ligação ao Firestore:", fbErr.message);
              throw new Error(`O banco de dados Firestore não foi inicializado no projeto '${newConfig.fbProjectId}'. Por favor, aceda a https://console.firebase.google.com/project/${newConfig.fbProjectId}/firestore para criar a base de dados '(default)' primeiro.`);
            } finally {
              firestoreInstance = oldInstance;
            }
          } else {
            const query = newConfig.dbType === "postgresql" ? "SELECT 1 AS ok" : "SELECT 1 AS ok";
            await queryExternalDb(newConfig, query, [], true);
          }
        } catch (connectionErr: any) {
          return res.status(400).json({ 
            success: false, 
            error: `Não foi possível ligar ao servidor de base de dados: ${translateDbError(connectionErr)}` 
          });
        }
      }

      dbConfig = { ...dbConfig, ...newConfig };
      await fs.promises.writeFile(CONFIG_PATH, JSON.stringify(dbConfig, null, 2), "utf-8");
      
      // Reset tablesEnsured and failure flags to force a fresh connection and validation
      tablesEnsured = false;
      cachedStatus = null;
      activeDbFailed = false;
      lastDbFailureTime = 0;
      firestoreInstance = null; // Clear cached Firebase app config

      if (dbConfig.dbType !== "sqlite" && dbConfig.dbType !== "firebase") {
        await ensureTables(dbConfig);
      }

      res.json({ 
        success: true, 
        message: "Configurações de servidor gravadas com sucesso! O sistema foi migrado instantaneamente.",
        config: dbConfig 
      });
    } catch (error: any) {
      console.log("[VBSP Config] Problema ao guardar configurações de servidor.");
      res.status(500).json({ success: false, error: translateDbError(error) });
    }
  });

  // Clean and migrate local database data to Firebase Firestore
  app.post("/api/db/migrate", async (req, res) => {
    try {
      const activeConfig = req.body && req.body.dbType ? req.body : dbConfig;
      
      if (activeConfig.dbType !== "firebase") {
        return res.status(400).json({ success: false, error: "O banco de dados ativo não está configurado para o Firebase." });
      }

      console.log("[Migration] Iniciando migração de dados via API...");
      const db = getFirestoreDb(activeConfig);
      const currentDocRef = doc(db, "state", "current");
      const statusDocRef = doc(db, "state", "status_check");

      // 1. Validate connection (Fail fast if DB is not created/accessible)
      try {
        await getDocFromServer(currentDocRef);
      } catch (connErr: any) {
        console.log("[Migration] Erro de ligação ao Firestore:", connErr.message);
        return res.status(400).json({ 
          success: false, 
          error: `O banco de dados Firestore não foi inicializado no projeto '${activeConfig.fbProjectId}'. Por favor, aceda à consola do Firebase (https://console.firebase.google.com/project/${activeConfig.fbProjectId}/firestore), crie a base de dados Firestore '(default)' primeiro, e certifique-se de que as regras permitem acesso.`
        });
      }

      // 2. Clear old documents to ensure a clean migration (eliminar tudo)
      try {
        await deleteDoc(currentDocRef);
        await deleteDoc(statusDocRef);
      } catch (delErr: any) {
        console.log("[Migration] Erro ao limpar documentos:", delErr.message);
      }

      // 3. Read local data from database.json
      if (!fs.existsSync(DB_PATH)) {
        return res.status(404).json({ success: false, error: "Base de dados local (database.json) não encontrada para migração." });
      }
      
      const localDataStr = await fs.promises.readFile(DB_PATH, "utf-8");
      
      // 4. Save to Firestore under the standardized structure
      await setDoc(currentDocRef, {
        state_json: localDataStr,
        updated_at: new Date().toISOString()
      });

      console.log("[Migration] Migração efetuada com sucesso!");
      res.json({ 
        success: true, 
        message: "Migração concluída com sucesso! Todos os dados locais (Artigos, Movimentos, Faturas, Utilizadores, etc.) foram carregados no Firebase, e quaisquer dados anteriores foram completamente eliminados." 
      });
    } catch (error: any) {
      console.log("[Migration] Erro durante a migração:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Get server database state
  app.get("/api/db/get", async (req, res) => {
    try {
      if (dbConfig.dbType === "firebase") {
        try {
          const db = getFirestoreDb(dbConfig);
          const docRef = doc(db, "state", "current");
          const docSnap = await getDocFromServer(docRef);
          if (docSnap.exists()) {
            const stateData = docSnap.data();
            const parsed = typeof stateData.state_json === "string" 
              ? JSON.parse(stateData.state_json) 
              : (stateData.state_json || stateData);
            return res.json({ 
              ...parsed, 
              __dbType: dbConfig.dbType, 
              __dbHost: "firebase-firestore", 
              __fallbackLocal: false 
            });
          }
        } catch (dbErr: any) {
          console.log("[VBSP BD] Erro ao carregar do Firebase, a usar cópia de segurança local:", dbErr.message);
        }
      } else if (dbConfig.dbType !== "sqlite") {
        try {
          await ensureTables(dbConfig);
          const query = dbConfig.dbType === "postgresql" 
            ? "SELECT state_json FROM erp_state WHERE id = $1 LIMIT 1" 
            : "SELECT state_json FROM erp_state WHERE id = ? LIMIT 1";
            
          const rows = await queryExternalDb(dbConfig, query, ["current"]);
          if (rows && rows.length > 0) {
            const stateData = rows[0].state_json;
            const parsed = typeof stateData === "string" ? JSON.parse(stateData) : stateData;
            return res.json({ 
              ...parsed, 
              __dbType: dbConfig.dbType, 
              __dbHost: dbConfig.dbHost, 
              __fallbackLocal: false 
            });
          }
        } catch (dbErr: any) {
          console.log("[VBSP BD] A carregar dados locais devido a indisponibilidade externa.");
        }
      }

      // SQLite/JSON Fallback (Active if sqlite or if external connection fails)
      if (fs.existsSync(DB_PATH)) {
        const data = await fs.promises.readFile(DB_PATH, "utf-8");
        const parsed = JSON.parse(data);
        return res.json({ 
          ...parsed, 
          __dbType: dbConfig.dbType, 
          __dbHost: dbConfig.dbHost || "local", 
          __fallbackLocal: dbConfig.dbType !== "sqlite" && dbConfig.dbType !== "firebase" 
        });
      }
      return res.json({ 
        empty: true, 
        __dbType: dbConfig.dbType, 
        __dbHost: dbConfig.dbHost || "local", 
        __fallbackLocal: dbConfig.dbType !== "sqlite" && dbConfig.dbType !== "firebase" 
      });
    } catch (error: any) {
      console.log("[VBSP BD] Problema ao ler a base de dados.");
      res.status(500).json({ error: error.message });
    }
  });

  // Save server database state
  app.post("/api/db/save", async (req, res) => {
    try {
      const dbState = req.body;

      // Always save a local copy to DB_PATH (database.json) for bulletproof backup
      await fs.promises.writeFile(DB_PATH, JSON.stringify(dbState, null, 2), "utf-8");

      if (dbConfig.dbType === "firebase") {
        try {
          const db = getFirestoreDb(dbConfig);
          const docRef = doc(db, "state", "current");
          const stateStr = JSON.stringify(dbState);
          await setDoc(docRef, { 
            state_json: stateStr, 
            updated_at: new Date().toISOString() 
          });
          return res.json({ success: true, mode: dbConfig.dbType, fallbackLocal: false });
        } catch (dbErr: any) {
          console.log("[VBSP BD] Falha ao sincronizar com Firebase. Gravado localmente em segurança:", dbErr.message);
          return res.json({ success: true, mode: "sqlite", fallbackLocal: true, error: translateDbError(dbErr) });
        }
      } else if (dbConfig.dbType !== "sqlite") {
        try {
          await ensureTables(dbConfig);
          const stateStr = JSON.stringify(dbState);
          
          if (dbConfig.dbType === "postgresql") {
            await queryExternalDb(
              dbConfig,
              `INSERT INTO erp_state (id, state_json, updated_at) 
               VALUES ($1, $2, NOW()) 
               ON CONFLICT (id) DO UPDATE SET state_json = EXCLUDED.state_json, updated_at = NOW()`,
              ["current", stateStr]
            );
          } else if (dbConfig.dbType === "mysql") {
            await queryExternalDb(
              dbConfig,
              `INSERT INTO erp_state (id, state_json) 
               VALUES (?, ?) 
               ON DUPLICATE KEY UPDATE state_json = VALUES(state_json)`,
              ["current", stateStr]
            );
          }
          return res.json({ success: true, mode: dbConfig.dbType, fallbackLocal: false });
        } catch (dbErr: any) {
          console.log("[VBSP BD] Falha ao sincronizar. Sincronização offline guardada localmente.");
          return res.json({ success: true, mode: "sqlite", fallbackLocal: true, error: translateDbError(dbErr) });
        }
      }

      res.json({ success: true, mode: "sqlite", fallbackLocal: false });
    } catch (error: any) {
      console.log("[VBSP BD] Problema ao gravar a base de dados.");
      res.status(500).json({ error: error.message });
    }
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "healthy", timestamp: new Date().toISOString() });
  });

  // Intelligent Copilot endpoint
  app.post("/api/gemini/analyze", async (req, res) => {
    try {
      const { stockItems, customPrompt } = req.body;
      const ai = getGeminiClient();

      const systemPrompt = `Você é o "VBSP Assistente Logístico IA", um colega de equipa muito humano, caloroso e prestável que ajuda na gestão de armazéns e auditoria de stock do VBSP ERP.
Importante: O utilizador pediu expressamente que você responda de forma o mais humana possível, ou seja:
- Use uma linguagem extremamente natural, próxima, conversacional, amigável e empática (evite falar como um robô, um manual corporativo ou um assistente de IA frio).
- Cumprimente de forma calorosa e genuína no início das respostas (ex: "Olá! Espero que o seu dia de trabalho esteja a correr muito bem...").
- Ofereça sugestões inteligentes de forma humilde e colaborativa, como um colega de trabalho experiente faria ("Se me permite uma sugestão pessoal...", "Na minha perspetiva...", "Estive a dar uma olhadela nos nossos números...").
- Responda em Português natural de Angola/Portugal.
O utilizador enviará o estado atual do stock.
Suas tarefas são:
1. Fazer uma análise sucinta e compreensível sobre os níveis globais de stock.
2. Identificar e alertar sobre itens críticos (abaixo do stock mínimo ou com alertas de validade/lote).
3. Recomendar ações práticas e amigáveis de reabastecimento ou transferência entre armazéns (Armazém Central, Luanda, Benguela, Cabinda).
4. Responder detalhadamente mas com empatia a qualquer pergunta adicional do utilizador.
Utilize formatação Markdown limpa e agradável (tópicos, negritos, tabelas quando útil para o colega).`;

      const userText = customPrompt
        ? `Abaixo está o estado atual do inventário:
${JSON.stringify(stockItems, null, 2)}

Questão adicional do gerente do armazém: "${customPrompt}"`
        : `Por favor, realize uma auditoria completa e automática ao seguinte inventário de stock:
${JSON.stringify(stockItems, null, 2)}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: userText,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.7,
        },
      });

      res.json({ success: true, text: response.text });
    } catch (error: any) {
      console.log("[Gemini] API indisponível ou resposta inválida.");
      res.status(500).json({ 
        success: false, 
        error: error.message || "Erro desconhecido ao comunicar com a inteligência artificial. Verifique se a sua chave GEMINI_API_KEY está configurada." 
      });
    }
  });

  // Simulated SAFT-AO XML Generator for Angola AGT compliance
  app.post("/api/saft/generate", (req, res) => {
    try {
      const { items, movements } = req.body;
      
      const xml = `<?xml version="1.0" encoding="Windows-1252"?>
<!-- Ficheiro de Auditoria Tributária para Angola - SAF-T (AO) -->
<AuditFile xmlns="urn:OECD:StandardAuditFile-Tax:AO_1.01_01" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <Header>
    <AuditFileVersion>1.01_01</AuditFileVersion>
    <CompanyID>AO500492831</CompanyID>
    <TaxRegistrationNumber>500492831</TaxRegistrationNumber>
    <TaxAccountingBasis>S</TaxAccountingBasis>
    <CompanyName>VBSP - PRESTAÇÃO DE SERVIÇOS E LOGÍSTICA, LDA</CompanyName>
    <BusinessName>VBSP ERP</BusinessName>
    <CompanyAddress>
      <AddressDetail>Via S8, Talatona, Edifício VBSP, Luanda</AddressDetail>
      <City>Luanda</City>
      <Country>AO</Country>
    </CompanyAddress>
    <FiscalYear>2026</FiscalYear>
    <StartDate>2026-01-01</StartDate>
    <EndDate>2026-12-31</EndDate>
    <CurrencyCode>AOA</CurrencyCode>
    <DateCreated>${new Date().toISOString().split("T")[0]}</DateCreated>
    <TaxEntity>Global</TaxEntity>
    <ProductCompanyID>VBSP Tecnologias Lda</ProductCompanyID>
    <SoftwareValidationNumber>284/AGT/2026</SoftwareValidationNumber>
  </Header>
  <MasterFiles>
    ${(items || []).map((item: any) => `
    <Product>
      <ProductType>P</ProductType>
      <ProductCode>${item.sku || item.id}</ProductCode>
      <ProductDescription>${item.name}</ProductDescription>
      <ProductNumberCode>${item.barcode || "N/A"}</ProductNumberCode>
    </Product>`).join("")}
  </MasterFiles>
  <SourceDocuments>
    <SalesInvoices>
      <NumberOfEntries>${(movements || []).length}</NumberOfEntries>
      <TotalDebit>0.00</TotalDebit>
      <TotalCredit>${(movements || []).reduce((acc: number, m: any) => acc + (Number(m.quantity) * 1500), 0).toFixed(2)}</TotalCredit>
    </SalesInvoices>
  </SourceDocuments>
</AuditFile>`;

      res.setHeader("Content-Disposition", "attachment; filename=SAF-T_AO_VBSP_Export.xml");
      res.setHeader("Content-Type", "application/xml");
      res.send(xml);
    } catch (e: any) {
      res.status(500).json({ error: "Erro ao gerar ficheiro SAFT: " + e.message });
    }
  });

  // Vite Integration & Static Files Serving
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[VBSP ERP Server] Servidor a correr com sucesso na porta ${PORT}`);
    console.log(`[VBSP ERP Server] Aceda em http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.log("[VBSP ERP Server] Servidor terminou com a seguinte mensagem:", error.message || error);
});
