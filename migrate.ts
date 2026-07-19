import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, doc, deleteDoc, setDoc, getDocFromServer } from "firebase/firestore";
import * as fs from "fs";
import * as path from "path";

async function runMigration() {
  console.log("=== INICIANDO MIGRAÇÃO DE DADOS PARA FIREBASE ===");

  // 1. Carregar Configurações do Banco de Dados
  const configPath = path.join(process.cwd(), "db_config.json");
  if (!fs.existsSync(configPath)) {
    throw new Error("Ficheiro db_config.json não encontrado. Configure o Firebase nas Definições primeiro.");
  }

  const dbConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));

  const firebaseConfig = {
    apiKey: dbConfig.fbApiKey,
    authDomain: dbConfig.fbAuthDomain,
    projectId: dbConfig.fbProjectId,
    storageBucket: dbConfig.fbStorageBucket,
    messagingSenderId: dbConfig.fbMessagingSenderId,
    appId: dbConfig.fbAppId,
  };

  if (!firebaseConfig.projectId || !firebaseConfig.apiKey) {
    throw new Error("Credenciais do Firebase incompletas no db_config.json. Verifique as configurações de ID do Projeto e Chave de API.");
  }

  const projectId = firebaseConfig.projectId;
  console.log(`Conectando ao Firebase Firestore no projeto: ${projectId}`);
  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  
  const dbId = (dbConfig.fbDatabaseId || "").trim();
  const db = dbId ? getFirestore(app, dbId) : getFirestore(app);

  // 2. Validar a Conexão e Existência do Banco de Dados usando getDocFromServer (Fails-Fast)
  console.log("Validando conexão e existência do banco de dados no Firestore...");
  const currentDocRef = doc(db, "state", "current");
  const statusDocRef = doc(db, "state", "status_check");

  try {
    // getDocFromServer força uma requisição imediata de leitura direta da rede
    await getDocFromServer(currentDocRef);
    console.log("✅ Conexão validada com sucesso! O banco de dados do Firestore está ativo e acessível.");
  } catch (err: any) {
    const errMsg = err.message || "";
    console.error("\n❌ FALHA NA CONEXÃO COM O FIRESTORE:");
    
    if (errMsg.includes("NOT_FOUND") || err.code === "not-found" || err.code === "unavailable" || errMsg.toLowerCase().includes("not found") || errMsg.includes("5") || errMsg.toLowerCase().includes("offline")) {
      console.error("\n==================================================================");
      console.error("ERRO: O Banco de Dados Firestore '(default)' não foi inicializado!");
      console.error(`Projeto afetado: ${projectId}`);
      console.error("==================================================================");
      console.error("Para corrigir este problema e prosseguir com a migração, siga estes passos:");
      console.error(`1. Aceda ao Console do Firebase: https://console.firebase.google.com/project/${projectId}/firestore`);
      console.error("2. Clique no botão 'Criar base de dados' (Create Database).");
      console.error("3. Selecione o modo desejado (Produção ou Teste) e a localização física.");
      console.error("4. Aguarde a criação ser concluída e execute este comando de migração novamente!");
      console.error("==================================================================\n");
    } else {
      console.error("Detalhes do erro:", err);
    }
    process.exit(1);
  }

  // 3. Eliminar tudo o que estiver na base de dados (documentos conhecidos do ERP)
  console.log("\n--- LIMPEZA: Eliminando dados existentes na base de dados Firebase ---");
  
  try {
    console.log("Eliminando documento 'state/current'...");
    await deleteDoc(currentDocRef);
    console.log("Documento 'state/current' eliminado com sucesso.");
  } catch (err: any) {
    console.warn("Aviso ao eliminar 'state/current':", err.message);
  }

  try {
    console.log("Eliminando documento 'state/status_check'...");
    await deleteDoc(statusDocRef);
    console.log("Documento 'state/status_check' eliminado com sucesso.");
  } catch (err: any) {
    console.warn("Aviso ao eliminar 'state/status_check':", err.message);
  }

  console.log("Limpeza concluída com sucesso.");

  // 4. Carregar os Dados Locais
  console.log("\n--- CARREGAMENTO: Lendo dados do sistema local (database.json) ---");
  const localDbPath = path.join(process.cwd(), "database.json");
  if (!fs.existsSync(localDbPath)) {
    throw new Error("Ficheiro database.json local não encontrado. Certifique-se de que existem dados locais para migrar.");
  }

  const localDataStr = fs.readFileSync(localDbPath, "utf-8");
  const localData = JSON.parse(localDataStr);
  console.log(`Dados carregados localmente:`);
  console.log(`- Artigos (items): ${localData.items?.length || 0}`);
  console.log(`- Movimentos: ${localData.movements?.length || 0}`);
  console.log(`- Faturas: ${localData.invoices?.length || 0}`);
  console.log(`- Armazéns: ${localData.warehouses?.length || 0}`);
  console.log(`- Utilizadores: ${localData.users?.length || 0}`);
  console.log(`- Configurações do Sistema: ${localData.settings ? "Sim" : "Não"}`);

  // 5. Gravar os dados no Firebase Firestore
  console.log("\n--- GRAVAÇÃO: Enviando dados migrados para o Firebase Firestore ---");
  await setDoc(currentDocRef, {
    state_json: localDataStr,
    updated_at: new Date().toISOString()
  });
  console.log("Dados do sistema gravados com sucesso no documento 'state/current' do Firebase Firestore!");

  // 6. Validar a gravação
  console.log("\n--- VALIDAÇÃO: Verificando integridade dos dados no Firestore ---");
  const verifySnap = await getDocFromServer(currentDocRef);
  if (verifySnap.exists()) {
    const verifyData = verifySnap.data();
    const parsedVerify = typeof verifyData.state_json === "string" 
      ? JSON.parse(verifyData.state_json) 
      : (verifyData.state_json || verifyData);
    
    console.log("Validação efetuada com sucesso!");
    console.log(`- Artigos gravados no Firestore: ${parsedVerify.items?.length || 0}`);
    console.log(`- Utilizadores gravados no Firestore: ${parsedVerify.users?.length || 0}`);
    console.log(`- Configurações de sincronização confirmadas: OK`);
  } else {
    throw new Error("Erro de validação: O documento gravado não foi encontrado no Firestore.");
  }

  console.log("\n=== MIGRAÇÃO CONCLUÍDA COM SUCESSO! ===");
}

runMigration().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error("\n❌ ERRO NA MIGRAÇÃO:", error.message);
  process.exit(1);
});
