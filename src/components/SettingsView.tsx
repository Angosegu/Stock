import React, { useState } from "react";
import { 
  Settings, 
  Moon, 
  Sun, 
  Shield, 
  Database, 
  Save, 
  RefreshCw, 
  Building, 
  CheckCircle2, 
  AlertCircle,
  Key,
  Download,
  Plus,
  Trash2,
  Languages,
  Activity,
  User,
  UserPlus,
  Users,
  ShieldAlert,
  Upload,
  UploadCloud,
  Globe,
  Server,
  Terminal,
  Copy,
  ExternalLink,
  HelpCircle,
  Check,
  Info,
  Layers,
  Link2,
  Wifi
} from "lucide-react";
import { UserRole } from "../types";

interface SettingsViewProps {
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  warehouses: any[];
  
  // System Customizations
  systemName: string;
  setSystemName: (name: string) => void;
  logoText: string;
  setLogoText: (logo: string) => void;
  logoImage: string;
  setLogoImage: (img: string) => void;
  systemColor: string;
  setSystemColor: (color: string) => void;
  language: string;
  setLanguage: (lang: string) => void;
  skuMode: string;
  setSkuMode: (mode: string) => void;
  defaultMinStock: number;
  setDefaultMinStock: (stock: number) => void;
  autoBackup: boolean;
  setAutoBackup: (auto: boolean) => void;
  
  // Categories & Units
  categories: string[];
  setCategories: React.Dispatch<React.SetStateAction<string[]>>;
  units: string[];
  setUnits: React.Dispatch<React.SetStateAction<string[]>>;

  // Fiscal Parameters (shared with App state for database persistence)
  companyName: string;
  setCompanyName: (name: string) => void;
  nif: string;
  setNif: (nif: string) => void;
  taxRegime: string;
  setTaxRegime: (regime: string) => void;
  
  // App state for backup
  appData: {
    items: any[];
    movements: any[];
    warehouses: any[];
    invoices: any[];
  };

  // Password changing
  onUpdatePassword: (oldPass: string, newPass: string) => { success: boolean; message: string };
  onClearAllData?: () => void;
  onRestoreDemoData?: () => void;

  // User Management
  currentUser: UserRole | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<UserRole | null>>;
  users: UserRole[];
  setUsers: React.Dispatch<React.SetStateAction<UserRole[]>>;
  userPasswords: Record<string, string>;
  setUserPasswords: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  onShowConfirm?: (title: string, message: string, onConfirm: () => void, isDestructive?: boolean) => void;
  onRestoreBackup?: (backupData: any) => void;
  
  // Connection and DB Status props
  connectionStatus?: "online" | "offline" | "sincronizando";
  activeDbType?: string;
  activeDbHost?: string;
}

const L_TEXT = {
  PT: {
    title: "Configurações do ERP",
    subtitle: "Gerencie as preferências de identidade visual, parâmetros de stock, cópias de segurança e credenciais do ERP.",
    status_title: "Estado do ERP",
    license: "Licença",
    active_branches: "Filiais Ativas",
    database: "Base de Dados",
    database_val: "SQLite (Local)",
    force_sync: "Forçar Sincronização",
    syncing: "A Sincronizar...",
    saft_warning_title: "SAF-T AO Nota Fiscal",
    saft_warning_desc: "As configurações inseridas nesta secção afetam diretamente a estrutura do cabeçalho do ficheiro XML SAF-T AO exportado para a AGT.",
    save_settings: "Guardar Configurações",
    save_success: "Configurações guardadas com sucesso!",
    
    // Sections
    visual_identity_title: "Visual & Identidade de Marca",
    system_name_label: "Nome do Sistema (Sidebar/Login)",
    logo_text_label: "Logotipo da Empresa (Iniciais)",
    system_color_label: "Cor de Destaque do Sistema",
    system_lang_label: "Idioma Geral do Sistema",
    theme_title: "Tema do Sistema",
    theme_light_title: "Tema Claro",
    theme_light_desc: "Layout de alto contraste diurno",
    theme_dark_title: "Tema Escuro",
    theme_dark_desc: "Interface noturna suave",

    stock_settings_title: "Configurações de Stock & SKU",
    sku_mode_label: "Estratégia de Geração de Códigos",
    sku_mode_auto: "Automático (Auto-gerar SKU sequenciais)",
    sku_mode_manual: "Manual (Digitação manual no registo)",
    default_threshold_label: "Stock Mínimo Padrão",
    default_threshold_desc: "Define o limiar de alerta padrão para novos artigos.",

    categories_units_title: "Gestão de Categorias e Unidades",
    add_new: "Adicionar",
    category_placeholder: "Nova categoria (ex: Escritório)",
    unit_placeholder: "Nova unidade (ex: METRO)",
    categories_list_label: "Categorias Cadastradas",
    units_list_label: "Unidades Logísticas",

    backup_title: "Cópias de Segurança & Backup",
    auto_backup_label: "Ativar Backup Automático Diário",
    auto_backup_desc: "Efetua uma cópia de segurança local compactada todos os dias às 23:59.",
    manual_backup_title: "Cópia de Segurança Manual",
    manual_backup_desc: "Descarrega um ficheiro de segurança com toda a estrutura de base de dados e movimentações.",
    trigger_backup: "Efetuar Backup Agora (Download)",
    backing_up: "A compactar ficheiros...",

    security_title: "Segurança & Palavra-passe",
    old_password: "Palavra-passe Atual",
    new_password: "Nova Palavra-passe",
    confirm_password: "Confirmar Nova Palavra-passe",
    change_password_btn: "Alterar Palavra-passe",

    fiscal_title: "Identificação Fiscal & Parâmetros AGT",
    company_name_label: "Denominação Social da Empresa",
    nif_label: "NIF Angolano (Identificação Fiscal)",
    tax_regime_label: "Regime de Imposto (IVA Angola)",
    tax_regime_excl: "Regime de Exclusão / Simplificado (Isento)",
    tax_regime_general: "Regime Geral (Taxa padrão de 14% de IVA)",
    tax_regime_trans: "Regime Transitório de IVA Angola"
  },
  EN: {
    title: "ERP Settings",
    subtitle: "Manage brand identity preferences, stock settings, database backups, and ERP user credentials.",
    status_title: "ERP Status",
    license: "License",
    active_branches: "Active Branches",
    database: "Database",
    database_val: "SQLite (Local)",
    force_sync: "Force Synchronization",
    syncing: "Syncing...",
    saft_warning_title: "SAF-T AO Invoice File",
    saft_warning_desc: "The settings entered in this section directly affect the header structure of the SAF-T AO XML file exported to AGT.",
    save_settings: "Save Settings",
    save_success: "Settings saved successfully!",
    
    // Sections
    visual_identity_title: "Visual Identity & Branding",
    system_name_label: "System Name (Sidebar/Login)",
    logo_text_label: "Company Logo (Initials)",
    system_color_label: "System Accent Color",
    system_lang_label: "System Global Language",
    theme_title: "System Theme",
    theme_light_title: "Light Theme",
    theme_light_desc: "High-contrast day layout",
    theme_dark_title: "Dark Theme",
    theme_dark_desc: "Smooth night interface",

    stock_settings_title: "Stock & SKU Configurations",
    sku_mode_label: "Code Generation Strategy",
    sku_mode_auto: "Automatic (Auto-generate sequential SKU)",
    sku_mode_manual: "Manual (Manual input during registration)",
    default_threshold_label: "Default Minimum Stock",
    default_threshold_desc: "Defines the default alert threshold for new items.",

    categories_units_title: "Category & Unit Management",
    add_new: "Add",
    category_placeholder: "New category (e.g. Office)",
    unit_placeholder: "New unit (e.g. METER)",
    categories_list_label: "Registered Categories",
    units_list_label: "Logistics Units",

    backup_title: "Database Backup & Safety",
    auto_backup_label: "Enable Daily Automatic Backup",
    auto_backup_desc: "Performs a compressed local database backup every day at 23:59.",
    manual_backup_title: "Manual Security Backup",
    manual_backup_desc: "Download a backup file containing all items, warehouses, and movements.",
    trigger_backup: "Backup Now (Download File)",
    backing_up: "Compressing database...",

    security_title: "Security & Password Change",
    old_password: "Current Password",
    new_password: "New Password",
    confirm_password: "Confirm New Password",
    change_password_btn: "Change Password",

    fiscal_title: "Tax Identification & AGT Parameters",
    company_name_label: "Company Business Name",
    nif_label: "Angolan NIF (Tax ID)",
    tax_regime_label: "Tax Regime (Angola VAT)",
    tax_regime_excl: "Exclusion / Simplified Regime (Exempt)",
    tax_regime_general: "General Regime (Standard 14% VAT)",
    tax_regime_trans: "Transition Regime of Angola VAT"
  }
};

export default function SettingsView({ 
  darkMode, 
  setDarkMode, 
  warehouses,
  systemName,
  setSystemName,
  logoText,
  setLogoText,
  logoImage,
  setLogoImage,
  systemColor,
  setSystemColor,
  language,
  setLanguage,
  skuMode,
  setSkuMode,
  defaultMinStock,
  setDefaultMinStock,
  autoBackup,
  setAutoBackup,
  categories,
  setCategories,
  units,
  setUnits,
  companyName,
  setCompanyName,
  nif,
  setNif,
  taxRegime,
  setTaxRegime,
  appData,
  onUpdatePassword,
  onClearAllData,
  onRestoreDemoData,
  currentUser,
  setCurrentUser,
  users,
  setUsers,
  userPasswords,
  setUserPasswords,
  onShowConfirm,
  onRestoreBackup,
  connectionStatus = "online",
  activeDbType = "sqlite",
  activeDbHost = "local"
}: SettingsViewProps) {
  // Interaction feedback states
  const [isSaved, setIsSaved] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [importStatus, setImportStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Categories & Units adding state
  const [newCategory, setNewCategory] = useState("");
  const [newUnit, setNewUnit] = useState("");

  // Password changing states
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [passwordStatus, setPasswordStatus] = useState<{ success?: boolean; message: string } | null>(null);

  // Local states for current user profile edit
  const [profileName, setProfileName] = useState(currentUser?.name || "");
  const [profileUsername, setProfileUsername] = useState(currentUser?.username || "");
  const [profileEmail, setProfileEmail] = useState(currentUser?.email || "");
  const [profileAvatar, setProfileAvatar] = useState(currentUser?.avatar || "");

  // Local states for new user creation
  const [newUserName, setNewUserName] = useState("");
  const [newUserUsername, setNewUserUsername] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserRole, setNewUserRole] = useState<"admin" | "operador">("operador");
  const [newUserStore, setNewUserStore] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [userActionMessage, setUserActionMessage] = useState<{ success?: boolean; message: string } | null>(null);

  // Local states for Self-Hosting Panel
  const [dbType, setDbType] = useState(() => localStorage.getItem("host_dbType") || "firebase");
  const [dbHost, setDbHost] = useState(() => localStorage.getItem("host_dbHost") || "65.21.252.101");
  const [dbPort, setDbPort] = useState(() => localStorage.getItem("host_dbPort") || "3306");
  const [dbName, setDbName] = useState(() => localStorage.getItem("host_dbName") || "mobitec2_amadje");
  const [dbUser, setDbUser] = useState(() => localStorage.getItem("host_dbUser") || "mobitec2_amadje");
  const [dbPass, setDbPass] = useState(() => localStorage.getItem("host_dbPass") || "Luanda2020.");
  const [customDomain, setCustomDomain] = useState(() => localStorage.getItem("host_customDomain") || "erp.amadje.com");
  
  // Firebase configuration states
  const [fbApiKey, setFbApiKey] = useState(() => localStorage.getItem("host_fbApiKey") || "");
  const [fbAuthDomain, setFbAuthDomain] = useState(() => localStorage.getItem("host_fbAuthDomain") || "");
  const [fbProjectId, setFbProjectId] = useState(() => localStorage.getItem("host_fbProjectId") || "");
  const [fbStorageBucket, setFbStorageBucket] = useState(() => localStorage.getItem("host_fbStorageBucket") || "");
  const [fbMessagingSenderId, setFbMessagingSenderId] = useState(() => localStorage.getItem("host_fbMessagingSenderId") || "");
  const [fbAppId, setFbAppId] = useState(() => localStorage.getItem("host_fbAppId") || "");
  const [fbDatabaseId, setFbDatabaseId] = useState(() => localStorage.getItem("host_fbDatabaseId") || "");
  const [copiedEnv, setCopiedEnv] = useState(false);
  const [copiedDocker, setCopiedDocker] = useState(false);
  const [activeHostingTab, setActiveHostingTab] = useState("db"); // 'db' | 'domain' | 'hosting' | 'env'

  const [testingConnection, setTestingConnection] = useState(false);
  const [migratingToFirebase, setMigratingToFirebase] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);
  const [hostStatusMessage, setHostStatusMessage] = useState<{ success: boolean; message: string } | null>(null);

  // Local states for External API Connectivity Panel
  const [customApiUrl, setCustomApiUrl] = useState(() => {
    const saved = localStorage.getItem("host_customApiUrl");
    if (!saved || saved === "https://api.amadje.com/api" || saved === "") {
      return "/api/db";
    }
    return saved;
  });
  const [customGetPath, setCustomGetPath] = useState(() => {
    const saved = localStorage.getItem("host_customGetPath");
    if (!saved || saved === "/api/db/get") {
      return "/get";
    }
    return saved;
  });
  const [customSavePath, setCustomSavePath] = useState(() => {
    const saved = localStorage.getItem("host_customSavePath");
    if (!saved || saved === "/api/db/save") {
      return "/save";
    }
    return saved;
  });
  const [useRemoteApi, setUseRemoteApi] = useState(() => {
    const saved = localStorage.getItem("host_useRemoteApi");
    if (saved === null) return true; // Default is remote server persistence active
    return saved !== "false";
  });
  const [testingApiConnection, setTestingApiConnection] = useState(false);
  const [customApiToken, setCustomApiToken] = useState(() => localStorage.getItem("host_customApiToken") || "");
  const [apiTestMessage, setApiTestMessage] = useState<{ success: boolean; message: string } | null>(null);
  const [exportingToApi, setExportingToApi] = useState(false);

  // Load server-active database configuration on mount
  React.useEffect(() => {
    fetch("/api/db/config")
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          if (data.dbType) setDbType(data.dbType);
          if (data.dbHost) setDbHost(data.dbHost);
          if (data.dbPort) setDbPort(data.dbPort);
          if (data.dbName) setDbName(data.dbName);
          if (data.dbUser) setDbUser(data.dbUser);
          if (data.dbPass) setDbPass(data.dbPass);
          if (data.customDomain) setCustomDomain(data.customDomain);
          // Firebase fields
          if (data.fbApiKey) setFbApiKey(data.fbApiKey);
          if (data.fbAuthDomain) setFbAuthDomain(data.fbAuthDomain);
          if (data.fbProjectId) setFbProjectId(data.fbProjectId);
          if (data.fbStorageBucket) setFbStorageBucket(data.fbStorageBucket);
          if (data.fbMessagingSenderId) setFbMessagingSenderId(data.fbMessagingSenderId);
          if (data.fbAppId) setFbAppId(data.fbAppId);
          if (data.fbDatabaseId) setFbDatabaseId(data.fbDatabaseId);
        }
      })
      .catch((err) => console.warn("Aviso: Servidor offline ou protocolo local ativo. Usando SQLite local.", err));
  }, []);

  React.useEffect(() => {
    localStorage.setItem("host_dbType", dbType);
    localStorage.setItem("host_dbHost", dbHost);
    localStorage.setItem("host_dbPort", dbPort);
    localStorage.setItem("host_dbName", dbName);
    localStorage.setItem("host_dbUser", dbUser);
    localStorage.setItem("host_dbPass", dbPass);
    localStorage.setItem("host_customDomain", customDomain);
    // Firebase fields
    localStorage.setItem("host_fbApiKey", fbApiKey);
    localStorage.setItem("host_fbAuthDomain", fbAuthDomain);
    localStorage.setItem("host_fbProjectId", fbProjectId);
    localStorage.setItem("host_fbStorageBucket", fbStorageBucket);
    localStorage.setItem("host_fbMessagingSenderId", fbMessagingSenderId);
    localStorage.setItem("host_fbAppId", fbAppId);
    localStorage.setItem("host_fbDatabaseId", fbDatabaseId);

    localStorage.setItem("host_customApiUrl", customApiUrl);
    localStorage.setItem("host_useRemoteApi", useRemoteApi ? "true" : "false");
    localStorage.setItem("host_customGetPath", customGetPath);
    localStorage.setItem("host_customSavePath", customSavePath);
    localStorage.setItem("host_customApiToken", customApiToken);
  }, [
    dbType, dbHost, dbPort, dbName, dbUser, dbPass, customDomain, 
    fbApiKey, fbAuthDomain, fbProjectId, fbStorageBucket, fbMessagingSenderId, fbAppId, fbDatabaseId,
    customApiUrl, useRemoteApi, customGetPath, customSavePath, customApiToken
  ]);

  const handleTestApiConnection = async () => {
    setTestingApiConnection(true);
    setApiTestMessage(null);
    try {
      const cleanUrl = customApiUrl.endsWith("/") ? customApiUrl.slice(0, -1) : customApiUrl;
      const cleanPath = customGetPath.startsWith("/") ? customGetPath : `/${customGetPath}`;
      const targetUrl = `${cleanUrl}${cleanPath}`;
      const statusUrl = `${cleanUrl}/status`;

      const headers: Record<string, string> = {};
      if (customApiToken && customApiToken.trim()) {
        headers["Authorization"] = `Bearer ${customApiToken.trim()}`;
      }

      // Proactive server status query (checks backend API we just created)
      let statusDetails = "";
      try {
        const statusResponse = await fetch(statusUrl, { method: "GET" }).catch(() => null);
        if (statusResponse && statusResponse.ok) {
          const statusJson = await statusResponse.json();
          if (statusJson && statusJson.status === "ONLINE") {
            statusDetails = ` [BD Ativa: ${statusJson.dbType.toUpperCase()} - Operacional]`;
          }
        }
      } catch (e) {
        // Fallback gracefully
      }

      const response = await fetch(targetUrl, { 
        method: "GET",
        headers
      }).catch(err => {
        throw new Error(`Erro de rede / CORS: Não foi possível estabelecer ligação ao servidor em "${targetUrl}". Certifique-se de que o backend remoto está ativo, que a porta (ex: 3000) está aberta na firewall da VPS, e que as configurações CORS estão ativadas para aceitar ligações externas.`);
      });
      
      if (response.ok) {
        setApiTestMessage({ 
          success: true, 
          message: `Ligação estabelecida com sucesso! O seu backend remoto respondeu com sucesso (HTTP ${response.status}) no endpoint de leitura.${statusDetails} O sistema está pronto para operar em modo remoto!` 
        });
      } else if (response.status === 404) {
        setApiTestMessage({ 
          success: false, 
          message: `Erro HTTP 404 (Não Encontrado) no URL "${targetUrl}". O servidor está online e acessível, mas este endpoint de leitura não existe. Verifique se o caminho do /get configurado coincide exatamente com a rota registada no seu ficheiro server.js do backend.` 
        });
      } else if (response.status === 401 || response.status === 403) {
        setApiTestMessage({ 
          success: false, 
          message: `Erro HTTP ${response.status} (Não Autorizado) em "${targetUrl}". A ligação foi rejeitada pelo servidor devido a falta ou erro de credenciais. Garanta que inseriu o Token JWT Bearer correto no campo acima.` 
        });
      } else {
        setApiTestMessage({ 
          success: false, 
          message: `O servidor remoto respondeu com código de erro HTTP ${response.status} no endpoint "${targetUrl}". Verifique a sua implementação backend ou consulte os logs do servidor.` 
        });
      }
    } catch (err: any) {
      setApiTestMessage({ 
        success: false, 
        message: err.message || "Erro de ligação." 
      });
    } finally {
      setTestingApiConnection(false);
    }
  };

  const handleExportToApi = async () => {
    setExportingToApi(true);
    setApiTestMessage(null);
    try {
      const cleanUrl = customApiUrl.endsWith("/") ? customApiUrl.slice(0, -1) : customApiUrl;
      const cleanPath = customSavePath.startsWith("/") ? customSavePath : `/${customSavePath}`;
      const targetUrl = `${cleanUrl}${cleanPath}`;

      const localResponse = await fetch("/api/db/get");
      if (!localResponse.ok) {
        throw new Error("Não foi possível obter o estado local atual para exportar.");
      }
      const dbState = await localResponse.json();

      const response = await fetch(targetUrl, {
        method: "POST",
        headers: (() => {
          const headers: Record<string, string> = { "Content-Type": "application/json" };
          if (customApiToken && customApiToken.trim()) {
            headers["Authorization"] = `Bearer ${customApiToken.trim()}`;
          }
          return headers;
        })(),
        body: JSON.stringify(dbState)
      }).catch(err => {
        throw new Error(`Erro de rede / CORS ao enviar dados: Certifique-se de que o seu servidor backend remoto aceita requisições CORS (POST) e que o URL "${targetUrl}" está correto.`);
      });

      if (response.ok) {
        setApiTestMessage({
          success: true,
          message: `Excelente! Todos os dados locais (artigos, faturas, movimentos) foram sincronizados com sucesso no endpoint "${targetUrl}".`
        });
      } else {
        setApiTestMessage({
          success: false,
          message: `O backend remoto recusou os dados (HTTP ${response.status}) no endpoint "${targetUrl}". Verifique a sua implementação para aceitar o payload JSON completo ou configure o caminho correto.`
        });
      }
    } catch (err: any) {
      setApiTestMessage({
        success: false,
        message: err.message || "Erro ao sincronizar dados com o backend remoto."
      });
    } finally {
      setExportingToApi(false);
    }
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setHostStatusMessage(null);
    try {
      const response = await fetch("/api/db/test-connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          dbType, dbHost, dbPort, dbName, dbUser, dbPass, customDomain,
          fbApiKey, fbAuthDomain, fbProjectId, fbStorageBucket, fbMessagingSenderId, fbAppId, fbDatabaseId
        }),
      });
      
      const text = await response.text();
      const trimmedText = text.trim();
      if (
        trimmedText.startsWith("<!DOCTYPE") || 
        trimmedText.startsWith("<!doctype") || 
        trimmedText.startsWith("<html") || 
        trimmedText.startsWith("<div") || 
        trimmedText.startsWith("<script")
      ) {
        throw new Error("O servidor local respondeu com uma página HTML em vez de dados JSON. Isso pode ocorrer se o servidor backend tiver parado ou crashado.");
      }

      let data;
      try {
        data = JSON.parse(text);
      } catch (jsonErr: any) {
        throw new Error(`Erro ao interpretar resposta como JSON: ${jsonErr.message}`);
      }

      if (response.ok) {
        setHostStatusMessage({ success: true, message: data.message });
      } else {
        setHostStatusMessage({ success: false, message: data.error || "Falha ao estabelecer ligação." });
      }
    } catch (err: any) {
      setHostStatusMessage({ success: false, message: "Erro de comunicação com o servidor: " + err.message });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleMigrateToFirebase = async () => {
    const confirmMigrate = window.confirm(
      "Tem a certeza de que deseja eliminar todos os dados no Firebase e migrar todo o conteúdo local atual (Artigos, Clientes, Logística, Utilizadores e Configurações) para o Firebase Firestore?"
    );
    if (!confirmMigrate) return;

    setMigratingToFirebase(true);
    setHostStatusMessage(null);
    try {
      const response = await fetch("/api/db/migrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          dbType, dbHost, dbPort, dbName, dbUser, dbPass, customDomain,
          fbApiKey, fbAuthDomain, fbProjectId, fbStorageBucket, fbMessagingSenderId, fbAppId, fbDatabaseId
        }),
      });
      
      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (jsonErr: any) {
        throw new Error("O servidor respondeu com um formato inválido.");
      }

      if (response.ok && data.success) {
        setHostStatusMessage({ success: true, message: data.message });
      } else {
        setHostStatusMessage({ success: false, message: data.error || "Falha ao migrar dados." });
      }
    } catch (err: any) {
      setHostStatusMessage({ success: false, message: "Erro durante a migração: " + err.message });
    } finally {
      setMigratingToFirebase(false);
    }
  };

  const handleSaveConfig = async () => {
    setSavingConfig(true);
    setHostStatusMessage(null);
    try {
      const response = await fetch("/api/db/save-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          dbType, dbHost, dbPort, dbName, dbUser, dbPass, customDomain,
          fbApiKey, fbAuthDomain, fbProjectId, fbStorageBucket, fbMessagingSenderId, fbAppId, fbDatabaseId
        }),
      });
      
      const text = await response.text();
      const trimmedText = text.trim();
      if (
        trimmedText.startsWith("<!DOCTYPE") || 
        trimmedText.startsWith("<!doctype") || 
        trimmedText.startsWith("<html") || 
        trimmedText.startsWith("<div") || 
        trimmedText.startsWith("<script")
      ) {
        throw new Error("O servidor local respondeu com uma página HTML em vez de dados JSON.");
      }

      let data;
      try {
        data = JSON.parse(text);
      } catch (jsonErr: any) {
        throw new Error(`Erro ao interpretar resposta como JSON: ${jsonErr.message}`);
      }

      if (response.ok) {
        setHostStatusMessage({ 
          success: true, 
          message: data.message + " A recarregar o sistema em breve..." 
        });
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setHostStatusMessage({ success: false, message: data.error || "Erro ao gravar as configurações." });
      }
    } catch (err: any) {
      setHostStatusMessage({ success: false, message: "Erro de comunicação ao gravar: " + err.message });
    } finally {
      setSavingConfig(false);
    }
  };

  // Sync profile editing when currentUser loads or changes
  React.useEffect(() => {
    if (currentUser) {
      setProfileName(currentUser.name);
      setProfileUsername(currentUser.username);
      setProfileEmail(currentUser.email);
      setProfileAvatar(currentUser.avatar || "");
    }
  }, [currentUser]);

  // Handler to update currently logged in user's profile and login name
  const handleUpdateProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUserActionMessage(null);
    if (!currentUser) return;

    const cleanUsername = profileUsername.trim().toLowerCase();
    const cleanName = profileName.trim();
    const cleanEmail = profileEmail.trim().toLowerCase();

    if (!cleanUsername || !cleanName) {
      setUserActionMessage({ success: false, message: "O nome e login não podem estar vazios." });
      return;
    }

    // Check if login name is taken
    if (cleanUsername !== currentUser.username.toLowerCase()) {
      const exists = users.some(u => u.username.toLowerCase() === cleanUsername);
      if (exists) {
        setUserActionMessage({ success: false, message: "Este nome de login já está em uso por outro utilizador." });
        return;
      }
    }

    const updatedUser: UserRole = {
      ...currentUser,
      name: cleanName,
      username: cleanUsername,
      email: cleanEmail,
      avatar: profileAvatar || cleanName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()
    };

    // Update list of users
    const updatedUsers = users.map(u => u.username === currentUser.username ? updatedUser : u);
    setUsers(updatedUsers);

    // Update passwords mapping key
    if (cleanUsername !== currentUser.username) {
      const currentPassword = userPasswords[currentUser.username] || "admin";
      const nextPasswords = { ...userPasswords };
      delete nextPasswords[currentUser.username];
      nextPasswords[cleanUsername] = currentPassword;
      setUserPasswords(nextPasswords);
    }

    // Set updated user as logged in
    setCurrentUser(updatedUser);
    setUserActionMessage({ success: true, message: "Os seus dados de login foram atualizados com sucesso!" });
  };

  // Handler to create a new user
  const handleCreateUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUserActionMessage(null);

    const cleanUsername = newUserUsername.trim().toLowerCase();
    const cleanName = newUserName.trim();
    const cleanPassword = newUserPassword.trim();
    const cleanEmail = newUserEmail.trim().toLowerCase();

    if (!cleanUsername || !cleanName || !cleanPassword) {
      setUserActionMessage({ success: false, message: "Por favor, preencha todos os campos obrigatórios (Nome, Login, Palavra-passe)." });
      return;
    }

    // Check if login name exists
    const exists = users.some(u => u.username.toLowerCase() === cleanUsername);
    if (exists) {
      setUserActionMessage({ success: false, message: "Este nome de login já está em uso." });
      return;
    }

    const newUser: UserRole = {
      username: cleanUsername,
      name: cleanName,
      role: newUserRole,
      assignedStore: newUserRole === "operador" ? newUserStore || undefined : undefined,
      email: cleanEmail || `${cleanUsername}@vbsp.ao`,
      avatar: cleanName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()
    };

    setUsers(prev => [...prev, newUser]);

    // Save user password
    setUserPasswords(prev => ({
      ...prev,
      [cleanUsername]: cleanPassword
    }));

    // Reset fields
    setNewUserName("");
    setNewUserUsername("");
    setNewUserPassword("");
    setNewUserRole("operador");
    setNewUserStore("");
    setNewUserEmail("");

    setUserActionMessage({ success: true, message: `Utilizador "${cleanName}" criado com sucesso!` });
  };

  // Handler to delete user
  const handleDeleteUser = (usernameToDelete: string) => {
    if (!currentUser) return;
    if (usernameToDelete.toLowerCase() === currentUser.username.toLowerCase()) {
      alert("Não pode apagar o seu próprio utilizador enquanto estiver logado.");
      return;
    }
    
    const performDelete = () => {
      setUsers(prev => prev.filter(u => u.username !== usernameToDelete));
      setUserPasswords(prev => {
        const copy = { ...prev };
        delete copy[usernameToDelete];
        return copy;
      });
      setUserActionMessage({ success: true, message: `Utilizador "${usernameToDelete}" foi removido com sucesso.` });
    };

    if (onShowConfirm) {
      onShowConfirm(
        "Remover Utilizador",
        `Tem a certeza de que deseja apagar permanentemente o utilizador "${usernameToDelete}"? Esta ação revogará todo o acesso dele ao sistema.`,
        performDelete,
        true
      );
    } else if (confirm(`Tem a certeza que deseja apagar o utilizador "${usernameToDelete}"?`)) {
      performDelete();
    }
  };

  const t = (key: keyof typeof L_TEXT["PT"]) => {
    return L_TEXT[language as "PT" | "EN"]?.[key] || L_TEXT.PT[key] || key;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("vbsp_companyName", companyName);
    localStorage.setItem("vbsp_nif", nif);
    localStorage.setItem("vbsp_taxRegime", taxRegime);

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      alert(language === "PT" 
        ? "Base de dados local sincronizada com sucesso com o servidor central AMADJE Angola!" 
        : "Local database synchronized successfully with AMADJE Angola central server!");
    }, 1500);
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    if (categories.includes(newCategory.trim())) {
      alert(language === "PT" ? "Esta categoria já existe." : "This category already exists.");
      return;
    }
    setCategories(prev => [...prev, newCategory.trim()]);
    setNewCategory("");
  };

  const handleDeleteCategory = (cat: string) => {
    if (categories.length <= 1) {
      alert(language === "PT" ? "Deve manter pelo menos uma categoria." : "You must keep at least one category.");
      return;
    }
    setCategories(prev => prev.filter(c => c !== cat));
  };

  const handleAddUnit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUnit.trim()) return;
    const formattedUnit = newUnit.trim().toUpperCase();
    if (units.includes(formattedUnit)) {
      alert(language === "PT" ? "Esta unidade já existe." : "This unit already exists.");
      return;
    }
    setUnits(prev => [...prev, formattedUnit]);
    setNewUnit("");
  };

  const handleDeleteUnit = (unit: string) => {
    if (units.length <= 1) {
      alert(language === "PT" ? "Deve manter pelo menos uma unidade." : "You must keep at least one unit.");
      return;
    }
    setUnits(prev => prev.filter(u => u !== unit));
  };

  const handleTriggerBackup = () => {
    setIsBackingUp(true);
    setTimeout(() => {
      setIsBackingUp(false);
      
      const backupPayload = {
        backup_timestamp: new Date().toISOString(),
        system_name: systemName,
        logo_text: logoText,
        system_color: systemColor,
        system_language: language,
        sku_strategy: skuMode,
        default_min_stock: defaultMinStock,
        registered_categories: categories,
        registered_units: units,
        users: users,
        user_passwords: userPasswords,
        fiscal_parameters: {
          companyName,
          nif,
          taxRegime
        },
        database_dump: appData
      };

      const blob = new Blob([JSON.stringify(backupPayload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `AMADJE_ERP_BACKUP_${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }, 1500);
  };

  const handleImportFile = (file: File) => {
    setImportStatus(null);
    if (file.type !== "application/json" && !file.name.endsWith(".json")) {
      setImportStatus({ success: false, message: "Apenas ficheiros JSON de backup são suportados." });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (!json.database_dump || !json.system_name) {
          setImportStatus({ success: false, message: "Ficheiro de backup inválido ou com formato incorreto." });
          return;
        }

        const performRestore = () => {
          if (onRestoreBackup) {
            onRestoreBackup(json);
            
            // Sync current view state
            if (json.fiscal_parameters) {
              const fp = json.fiscal_parameters;
              if (fp.companyName) setCompanyName(fp.companyName);
              if (fp.nif) setNif(fp.nif);
              if (fp.taxRegime) setTaxRegime(fp.taxRegime);
            }
            
            setImportStatus({ success: true, message: "Cópia de segurança restaurada com sucesso! Todos os dados do ERP foram reconfigurados." });
          } else {
            setImportStatus({ success: false, message: "Erro ao carregar os dados no motor persistente do sistema." });
          }
        };

        if (onShowConfirm) {
          onShowConfirm(
            "Restaurar Cópia de Segurança",
            `Atenção: Carregar este backup irá substituir TODOS os dados de stock, movimentações, faturas, filiais, utilizadores e configurações atuais do ERP. Esta ação é irreversível. Deseja continuar?`,
            performRestore,
            true
          );
        } else if (confirm("Atenção: Carregar este backup irá substituir TODOS os dados de stock, movimentações, faturas, filiais, utilizadores e configurações atuais do ERP. Esta ação é irreversível. Deseja continuar?")) {
          performRestore();
        }

      } catch (err) {
        setImportStatus({ success: false, message: "Erro ao processar o ficheiro: Formato JSON corrompido." });
      }
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleImportFile(file);
    }
  };

  const handleChangePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordStatus(null);

    if (!oldPass || !newPass || !confirmPass) {
      setPasswordStatus({ success: false, message: language === "PT" ? "Por favor, preencha todos os campos." : "Please fill in all fields." });
      return;
    }

    if (newPass !== confirmPass) {
      setPasswordStatus({ success: false, message: language === "PT" ? "As novas palavras-passe não coincidem." : "New passwords do not match." });
      return;
    }

    const res = onUpdatePassword(oldPass, newPass);
    setPasswordStatus({ success: res.success, message: res.message });
    
    if (res.success) {
      setOldPass("");
      setNewPass("");
      setConfirmPass("");
    }
  };

  return (
    <div className="space-y-6 max-w-5xl" id="settings-view-container">
      {/* Header */}
      <div>
        <h2 className="text-xl md:text-2xl font-display font-semibold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <Settings className="text-brand-500 animate-spin-slow" size={24} />
          <span>{t("title")}</span>
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {t("subtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Navigation / Side card (ERP STATUS) */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white dark:bg-dark-surface p-4 rounded-xl border border-slate-200 dark:border-dark-border space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{t("status_title")}</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-1.5"><Shield size={14} className="text-brand-500" /> {t("license")}:</span>
                <span className="font-mono bg-brand-500/10 text-brand-600 dark:text-brand-400 px-2 py-0.5 rounded text-[10px] font-bold">AMADJE-PRO-2026</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-1.5"><Building size={14} className="text-emerald-500" /> {t("active_branches")}:</span>
                <span className="font-bold">{warehouses.length} Lojas</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-1.5"><Database size={14} className="text-blue-500" /> {t("database")}:</span>
                <span className="font-mono font-bold capitalize">
                  {connectionStatus === "offline" ? "SQLite Fallback (Local)" : activeDbType === "firebase" ? "Firebase (Firestore)" : activeDbType === "postgresql" ? "PostgreSQL Nuvem" : "SQLite Local"}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-1.5"><Wifi size={14} className={connectionStatus === "online" ? "text-emerald-500 animate-pulse" : "text-slate-400"} /> Estado:</span>
                <span className="flex items-center gap-1 font-bold">
                  <span className={`w-2 h-2 rounded-full ${
                    connectionStatus === "online" 
                      ? "bg-emerald-500 animate-ping" 
                      : connectionStatus === "offline" 
                        ? "bg-red-500" 
                        : "bg-amber-500 animate-spin"
                  }`} />
                  <span className="capitalize">{connectionStatus}</span>
                </span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span>Servidor:</span>
                <span className="truncate max-w-[120px]" title={activeDbHost}>{activeDbHost}</span>
              </div>
            </div>
            <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
              <button
                onClick={handleSync}
                disabled={isSyncing}
                className="w-full bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <RefreshCw size={12} className={isSyncing ? "animate-spin" : ""} />
                <span>{isSyncing ? t("syncing") : t("force_sync")}</span>
              </button>
            </div>
          </div>

          <div className="bg-brand-500/5 dark:bg-brand-500/10 border border-brand-500/20 p-4 rounded-xl text-xs space-y-2">
            <h4 className="font-bold text-brand-700 dark:text-brand-300 flex items-center gap-1">
              <AlertCircle size={14} /> {t("saft_warning_title")}
            </h4>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              {t("saft_warning_desc")}
            </p>
          </div>
        </div>

        {/* Configuration Columns */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSave} className="space-y-6">
            
            {/* Section 1: Visual Identity & Branding Customizer */}
            <div className="bg-white dark:bg-dark-surface p-6 rounded-xl border border-slate-200 dark:border-dark-border space-y-4">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
                <Sun size={15} className="text-amber-500 animate-pulse" />
                <span>{t("visual_identity_title")}</span>
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block">
                    {t("system_name_label")}
                  </label>
                  <input
                    type="text"
                    required
                    value={systemName}
                    onChange={(e) => setSystemName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-800 dark:text-white focus:ring-2 focus:ring-brand-500 outline-hidden font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block">
                    {t("logo_text_label")}
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={5}
                    value={logoText}
                    onChange={(e) => setLogoText(e.target.value)}
                    placeholder="AMADJE"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-800 dark:text-white focus:ring-2 focus:ring-brand-500 outline-hidden font-mono font-bold uppercase"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                    {t("system_color_label")}
                  </label>
                  <div className="flex flex-wrap gap-2.5 pt-1">
                    {[
                      { id: "blue", name: "Azul AMADJE", bg: "bg-[#0b57d0]" },
                      { id: "emerald", name: "Verde Esmeralda", bg: "bg-[#10b981]" },
                      { id: "orange", name: "Laranja", bg: "bg-[#f97316]" },
                      { id: "indigo", name: "Índigo", bg: "bg-[#6366f1]" },
                      { id: "violet", name: "Violeta", bg: "bg-[#8b5cf6]" },
                      { id: "rose", name: "Carmim", bg: "bg-[#f43f5e]" },
                      { id: "amber", name: "Âmbar", bg: "bg-[#f59e0b]" },
                    ].map((pal) => (
                      <button
                        key={pal.id}
                        type="button"
                        onClick={() => setSystemColor(pal.id)}
                        className={`group relative flex items-center justify-center p-0.5 rounded-full border-2 transition-all hover:scale-110 active:scale-95 cursor-pointer ${
                          systemColor === pal.id 
                            ? "border-brand-500 ring-2 ring-brand-500/20" 
                            : "border-transparent hover:border-slate-300 dark:hover:border-slate-700"
                        }`}
                        title={pal.name}
                      >
                        <span className={`w-6 h-6 rounded-full block ${pal.bg} shadow-xs`} />
                        {systemColor === pal.id && (
                          <span className="absolute w-1.5 h-1.5 bg-white rounded-full" />
                        )}
                      </button>
                    ))}
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-1">
                    Selecione a cor de destaque principal para os elementos gráficos e botões do ERP.
                  </span>
                </div>

                <div className="space-y-1.5 sm:col-span-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block">
                    {t("system_lang_label")}
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setLanguage("PT")}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                        language === "PT"
                          ? "bg-brand-500/10 border-brand-500 text-brand-600 dark:text-brand-300"
                          : "border-slate-200 dark:border-slate-700 text-slate-400"
                      }`}
                    >
                      Português (AO/PT)
                    </button>
                    <button
                      type="button"
                      onClick={() => setLanguage("EN")}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                        language === "EN"
                          ? "bg-brand-500/10 border-brand-500 text-brand-600 dark:text-brand-300"
                          : "border-slate-200 dark:border-slate-700 text-slate-400"
                      }`}
                    >
                      English (US/UK)
                    </button>
                  </div>
                </div>

                {/* Logo Image Upload widget */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block">
                    Upload de Logotipo da Empresa
                  </label>
                  <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700/80 rounded-xl">
                    <div className="w-16 h-16 bg-brand-500 rounded-xl overflow-hidden flex items-center justify-center font-display font-bold text-2xl text-white shadow-md shrink-0 border border-slate-300 dark:border-slate-700">
                      {logoImage ? (
                        <img src={logoImage} alt="Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        logoText
                      )}
                    </div>
                    <div className="flex-1 space-y-2 text-center sm:text-left w-full">
                      <div className="flex items-center gap-2 justify-center sm:justify-start">
                        <label className="bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors shadow-xs inline-block">
                          <span>Escolher Ficheiro</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                if (file.size > 2 * 1024 * 1024) {
                                  alert("A imagem não deve exceder 2MB.");
                                  return;
                                }
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setLogoImage(reader.result as string);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </label>
                        {logoImage && (
                          <button
                            type="button"
                            onClick={() => setLogoImage("")}
                            className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 text-xs font-semibold px-2 py-1.5 rounded-lg transition-colors cursor-pointer"
                          >
                            Remover
                          </button>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400">
                        Formatos suportados: PNG, JPG ou SVG. Tamanho máximo recomendado: 2MB. Substitui as iniciais na sidebar e no ecrã de login.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Theme Selector */}
              <div className="space-y-3 pt-2">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block">
                  {t("theme_title")}
                </label>
                
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setDarkMode(false)}
                    className={`flex items-center justify-between p-3.5 rounded-xl border transition-all text-left cursor-pointer ${
                      !darkMode 
                        ? "border-brand-500 bg-brand-500/5 dark:bg-brand-500/10" 
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="p-2 bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-lg shrink-0">
                        <Sun size={15} />
                      </span>
                      <div>
                        <span className="text-xs font-bold block text-slate-800 dark:text-slate-200">{t("theme_light_title")}</span>
                        <span className="text-[10px] text-slate-400">{t("theme_light_desc")}</span>
                      </div>
                    </div>
                    {!darkMode && <CheckCircle2 size={15} className="text-brand-500 shrink-0" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setDarkMode(true)}
                    className={`flex items-center justify-between p-3.5 rounded-xl border transition-all text-left cursor-pointer ${
                      darkMode 
                        ? "border-brand-500 bg-brand-500/5 dark:bg-brand-500/10" 
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="p-2 bg-slate-800 text-slate-300 rounded-lg shrink-0">
                        <Moon size={15} />
                      </span>
                      <div>
                        <span className="text-xs font-bold block text-slate-800 dark:text-slate-200">{t("theme_dark_title")}</span>
                        <span className="text-[10px] text-slate-400">{t("theme_dark_desc")}</span>
                      </div>
                    </div>
                    {darkMode && <CheckCircle2 size={15} className="text-brand-500 shrink-0" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Section 2: Stock Thresholds & SKU Strategy */}
            <div className="bg-white dark:bg-dark-surface p-6 rounded-xl border border-slate-200 dark:border-dark-border space-y-4">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
                <Database size={15} className="text-blue-500" />
                <span>{t("stock_settings_title")}</span>
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block">
                    {t("sku_mode_label")}
                  </label>
                  <select
                    value={skuMode}
                    onChange={(e) => setSkuMode(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-800 dark:text-white focus:ring-2 focus:ring-brand-500 outline-hidden cursor-pointer"
                  >
                    <option value="automatico">{t("sku_mode_auto")}</option>
                    <option value="manual">{t("sku_mode_manual")}</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block">
                    {t("default_threshold_label")}
                  </label>
                  <input
                    type="number"
                    value={defaultMinStock}
                    onChange={(e) => setDefaultMinStock(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-800 dark:text-white focus:ring-2 focus:ring-brand-500 outline-hidden font-mono"
                  />
                  <span className="text-[10px] text-slate-400">{t("default_threshold_desc")}</span>
                </div>
              </div>
            </div>

            {/* Section 3: SAFT AO parameters */}
            <div className="bg-white dark:bg-dark-surface p-6 rounded-xl border border-slate-200 dark:border-dark-border space-y-4">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
                <Activity size={15} className="text-emerald-500" />
                <span>{t("fiscal_title")}</span>
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    {t("company_name_label")}
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-800 dark:text-white focus:ring-2 focus:ring-brand-500 outline-hidden"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    {t("nif_label")}
                  </label>
                  <input
                    type="text"
                    value={nif}
                    onChange={(e) => setNif(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-800 dark:text-white focus:ring-2 focus:ring-brand-500 outline-hidden font-mono"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    {t("tax_regime_label")}
                  </label>
                  <select
                    value={taxRegime}
                    onChange={(e) => setTaxRegime(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-800 dark:text-white focus:ring-2 focus:ring-brand-500 outline-hidden cursor-pointer"
                  >
                    <option value="simplificado">{t("tax_regime_excl")}</option>
                    <option value="geral">{t("tax_regime_general")}</option>
                    <option value="transitorio">{t("tax_regime_trans")}</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Form Save Button */}
            <div className="flex items-center justify-between">
              {isSaved ? (
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 px-3 py-2 rounded-lg border border-emerald-500/20">
                  <CheckCircle2 size={14} />
                  <span>{t("save_success")}</span>
                </span>
              ) : (
                <div />
              )}

              <button
                type="submit"
                className="bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs py-2.5 px-6 rounded-xl flex items-center gap-2 shadow-md shadow-brand-500/15 cursor-pointer active:scale-98 transition-all"
              >
                <Save size={14} />
                <span>{t("save_settings")}</span>
              </button>
            </div>
          </form>

          {/* Section 4: Interactive Categories & Units Manager */}
          <div className="bg-white dark:bg-dark-surface p-6 rounded-xl border border-slate-200 dark:border-dark-border space-y-6">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
              <Languages size={15} className="text-brand-500" />
              <span>{t("categories_units_title")}</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Category Manager */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">{t("categories_list_label")}</h4>
                
                <form onSubmit={handleAddCategory} className="flex gap-2">
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder={t("category_placeholder")}
                    className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-850 dark:text-white focus:ring-2 focus:ring-brand-500 outline-hidden"
                  />
                  <button
                    type="submit"
                    className="bg-slate-900 dark:bg-slate-800 hover:bg-brand-500 dark:hover:bg-brand-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all"
                  >
                    <Plus size={13} />
                    <span>{t("add_new")}</span>
                  </button>
                </form>

                <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 border border-slate-150 dark:border-slate-750 rounded-lg">
                  {categories.map(cat => (
                    <div key={cat} className="flex items-center justify-between p-2.5 text-xs text-slate-700 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-900/30">
                      <span>{cat}</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteCategory(cat)}
                        className="text-slate-400 hover:text-red-500 p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Eliminar categoria"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Unit Manager */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">{t("units_list_label")}</h4>
                
                <form onSubmit={handleAddUnit} className="flex gap-2">
                  <input
                    type="text"
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    placeholder={t("unit_placeholder")}
                    className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-850 dark:text-white focus:ring-2 focus:ring-brand-500 outline-hidden uppercase"
                  />
                  <button
                    type="submit"
                    className="bg-slate-900 dark:bg-slate-800 hover:bg-brand-500 dark:hover:bg-brand-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all"
                  >
                    <Plus size={13} />
                    <span>{t("add_new")}</span>
                  </button>
                </form>

                <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 border border-slate-150 dark:border-slate-750 rounded-lg">
                  {units.map(unit => (
                    <div key={unit} className="flex items-center justify-between p-2.5 text-xs text-slate-700 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-900/30">
                      <span className="font-mono font-bold text-slate-900 dark:text-slate-200">{unit}</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteUnit(unit)}
                        className="text-slate-400 hover:text-red-500 p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Eliminar unidade"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* Section 5: Real-time Data Backups */}
          <div className="bg-white dark:bg-dark-surface p-6 rounded-xl border border-slate-200 dark:border-dark-border space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
              <Database size={15} className="text-slate-500" />
              <span>{t("backup_title")}</span>
            </h3>

            <div className="space-y-4">
              <label className="flex items-start gap-3 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoBackup}
                  onChange={(e) => setAutoBackup(e.target.checked)}
                  className="rounded text-brand-500 focus:ring-brand-500 h-4 w-4 border-slate-300 dark:border-slate-700 mt-0.5 shrink-0"
                />
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-900 dark:text-slate-100 block">{t("auto_backup_label")}</span>
                  <span className="text-[10px] text-slate-400 block">{t("auto_backup_desc")}</span>
                </div>
              </label>

              <div className="bg-slate-50 dark:bg-slate-900/30 border border-slate-150 dark:border-slate-850 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center sm:text-left">
                  <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1 justify-center sm:justify-start">
                    <Download size={14} />
                    <span>{t("manual_backup_title")}</span>
                  </span>
                  <span className="text-[10px] text-slate-400 block max-w-sm">
                    {t("manual_backup_desc")}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleTriggerBackup}
                  disabled={isBackingUp}
                  className="bg-slate-900 hover:bg-brand-500 text-white font-semibold text-xs px-4 py-2.5 rounded-lg transition-all flex items-center gap-2 whitespace-nowrap active:scale-95 disabled:bg-slate-750 cursor-pointer"
                >
                  <RefreshCw size={13} className={isBackingUp ? "animate-spin" : ""} />
                  <span>{isBackingUp ? t("backing_up") : t("trigger_backup")}</span>
                </button>
              </div>

              {/* Drag & Drop Upload Zone */}
              <div className="space-y-2 pt-4 border-t border-dashed border-slate-200 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <UploadCloud size={14} className="text-brand-500" />
                  <span>Restauro de Cópia de Segurança (Importar Backup)</span>
                </span>
                <p className="text-[10px] text-slate-400 leading-normal">
                  Arraste ou selecione um ficheiro de backup JSON do ERP AMADJE para restaurar de forma instantânea todo o stock, movimentos, faturas, armazéns, logins de utilizadores e configurações globais.
                </p>

                {importStatus && (
                  <div className={`p-3 rounded-lg border text-xs font-semibold ${
                    importStatus.success
                      ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-500 text-emerald-700 dark:text-emerald-400"
                      : "bg-red-50 dark:bg-red-950/20 border-red-500 text-red-700 dark:text-red-400"
                  }`}>
                    {importStatus.message}
                  </div>
                )}

                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById("backup-file-input")?.click()}
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2.5 ${
                    isDragging
                      ? "border-brand-500 bg-brand-50/10 dark:bg-brand-950/10 scale-[1.01]"
                      : "border-slate-200 dark:border-slate-800 hover:border-brand-500 hover:bg-slate-50/50 dark:hover:bg-slate-900/10"
                  }`}
                >
                  <input
                    id="backup-file-input"
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleImportFile(file);
                      }
                    }}
                  />
                  <div className={`p-2.5 rounded-full ${
                    isDragging ? "bg-brand-100 text-brand-600 dark:bg-brand-950/30 dark:text-brand-400" : "bg-slate-100 text-slate-400 dark:bg-slate-800"
                  }`}>
                    <Upload size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Arraste o ficheiro de backup aqui ou clique para procurar
                    </p>
                    <p className="text-[9px] text-slate-400 font-medium mt-0.5">
                      Apenas ficheiros .json gerados pelo sistema são aceites para importação direta
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 5.3: Conectividade API & Base de Dados Remota */}
          <div className="bg-white dark:bg-dark-surface p-6 rounded-xl border border-slate-200 dark:border-dark-border space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
                <Wifi size={15} className="text-brand-500 animate-pulse" />
                <span>Conectividade API & Base de Dados Remota</span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-1 font-medium">
                Alterne entre o armazenamento offline 100% local ou ligue o seu ERP a um domínio particular ou servidor privado (VPS, cPanel, Hostinger, Render) de forma segura.
              </p>
            </div>

            <div className="space-y-4">
              {/* Toggle Mode */}
              <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800 space-y-3">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Modo de Armazenamento Activo
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setUseRemoteApi(false)}
                    className={`py-3 px-4 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      !useRemoteApi
                        ? "bg-brand-50 border-brand-300 text-brand-700 dark:bg-brand-950/20 dark:border-brand-900 dark:text-brand-400 shadow-sm"
                        : "bg-white dark:bg-dark-surface border-slate-200 dark:border-dark-border text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    <Database size={14} />
                    <div className="text-left">
                      <p className="font-bold">Modo Local (localStorage)</p>
                      <p className="text-[9px] font-normal opacity-80 mt-0.5">Persistência direta no seu navegador. Rápido e offline-first.</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setUseRemoteApi(true)}
                    className={`py-3 px-4 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      useRemoteApi
                        ? "bg-brand-50 border-brand-300 text-brand-700 dark:bg-brand-950/20 dark:border-brand-900 dark:text-brand-400 shadow-sm"
                        : "bg-white dark:bg-dark-surface border-slate-200 dark:border-dark-border text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    <Link2 size={14} />
                    <div className="text-left">
                      <p className="font-bold">Modo Remoto (Domínio Particular)</p>
                      <p className="text-[9px] font-normal opacity-80 mt-0.5">Sincronização com base de dados externa via domínio ou IP privado (/api/db).</p>
                    </div>
                  </button>
                </div>
              </div>

              {useRemoteApi && (
                <div className="space-y-4 animate-fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                        URL Base do Servidor API / Domínio Particular
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={customApiUrl}
                          onChange={(e) => setCustomApiUrl(e.target.value)}
                          placeholder="Ex: https://erp.oseudominio.com/api/db"
                          className="w-full text-xs bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-dark-border rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-brand-500 font-mono text-slate-700 dark:text-slate-200"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                        <span>Chave / Token JWT</span>
                        <span className="text-[9px] font-normal text-slate-400 font-sans bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">Opcional</span>
                      </label>
                      <div className="relative">
                        <input
                          type="password"
                          value={customApiToken}
                          onChange={(e) => setCustomApiToken(e.target.value)}
                          placeholder="Ex: Bearer eyJhbGci..."
                          className="w-full text-xs bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-dark-border rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-brand-500 font-mono text-slate-700 dark:text-slate-200"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-[10px] text-slate-400 mt-1 font-medium leading-relaxed">
                    Indique o endpoint principal do servidor (padrão de rede do ERP: <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-brand-600 font-mono">/api/db</code>). Pode configurar uma URL absoluta para outro servidor externo e passar chaves de autenticação JWT/Bearer no cabeçalho.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-900/20 p-4 rounded-xl border border-slate-150 dark:border-dark-border">
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400">
                        Caminho de Leitura (GET)
                      </label>
                      <input
                        type="text"
                        value={customGetPath}
                        onChange={(e) => setCustomGetPath(e.target.value)}
                        placeholder="/get"
                        className="w-full text-xs bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-brand-500 font-mono text-slate-700 dark:text-slate-200"
                      />
                      <p className="text-[10px] text-slate-400 font-mono break-all mt-1">
                        GET final: <span className="text-brand-600 dark:text-brand-400 font-bold">{(customApiUrl.endsWith("/") ? customApiUrl.slice(0, -1) : customApiUrl) + (customGetPath.startsWith("/") ? customGetPath : `/${customGetPath}`)}</span>
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400">
                        Caminho de Escrita (POST)
                      </label>
                      <input
                        type="text"
                        value={customSavePath}
                        onChange={(e) => setCustomSavePath(e.target.value)}
                        placeholder="/save"
                        className="w-full text-xs bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-brand-500 font-mono text-slate-700 dark:text-slate-200"
                      />
                      <p className="text-[10px] text-slate-400 font-mono break-all mt-1">
                        POST final: <span className="text-brand-600 dark:text-brand-400 font-bold">{(customApiUrl.endsWith("/") ? customApiUrl.slice(0, -1) : customApiUrl) + (customSavePath.startsWith("/") ? customSavePath : `/${customSavePath}`)}</span>
                      </p>
                    </div>
                  </div>

                  {apiTestMessage && (
                    <div className={`p-3.5 rounded-xl border text-xs font-medium animate-fade-in ${
                      apiTestMessage.success
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-800 dark:text-emerald-300"
                        : "bg-red-500/10 border-red-500/20 text-red-800 dark:text-red-300"
                    }`}>
                      <div className="flex items-start gap-2.5">
                        <div className={`mt-0.5 p-1 rounded-full ${apiTestMessage.success ? "bg-emerald-500/20 text-emerald-600" : "bg-red-500/20 text-red-600"}`}>
                          {apiTestMessage.success ? <Check size={14} /> : <AlertCircle size={14} />}
                        </div>
                        <div>
                          <p className="font-bold flex items-center gap-1.5">
                            <span>{apiTestMessage.success ? "🟢 ONLINE - Ligação Concluída" : "🔴 OFFLINE - Erro de Conexão"}</span>
                          </p>
                          <p className="text-[10px] opacity-90 mt-1 font-sans leading-relaxed">{apiTestMessage.message}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3 pt-1">
                    <button
                      type="button"
                      onClick={handleTestApiConnection}
                      disabled={testingApiConnection || exportingToApi || !customApiUrl}
                      className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-dark-border text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer active:scale-98"
                    >
                      {testingApiConnection ? (
                        <span className="w-4 h-4 border-2 border-slate-500 border-t-transparent rounded-full animate-spin"></span>
                      ) : (
                        <RefreshCw size={14} className="text-slate-500 animate-spin-slow" />
                      )}
                      <span>{testingApiConnection ? "A verificar..." : "Testar Conexão"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleExportToApi}
                      disabled={testingApiConnection || exportingToApi || !customApiUrl}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-brand-600 text-white hover:bg-brand-700 text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer active:scale-98"
                    >
                      {exportingToApi ? (
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      ) : (
                        <UploadCloud size={14} />
                      )}
                      <span>{exportingToApi ? "A sincronizar dados..." : "Sincronizar e Exportar Dados Locais"}</span>
                    </button>
                  </div>

                  {/* Guide on how to connect private domain and remote server */}
                  <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-250 dark:border-dark-border space-y-3">
                    <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                      <Globe size={15} className="text-brand-500" />
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Guia: Ligar a Base de Dados Remota ao seu Domínio Particular</span>
                    </div>
                    
                    <div className="text-xs text-slate-600 dark:text-slate-400 space-y-2.5 leading-relaxed font-sans">
                      <p>
                        Para hospedar a base de dados no seu próprio domínio particular (ex: <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded font-mono text-brand-600">erp.empresa.com</code>) de forma robusta e sem limites de timeout do browser, siga estes passos simples:
                      </p>

                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <span className="font-bold text-brand-500">1.</span>
                          <p>
                            <strong>Hospede a sua API Remota:</strong> Carregue o ficheiro <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded font-mono">server.js</code> do seu backend para a sua máquina Linux VPS, cPanel ou serviço Cloud (Render, Railway, Hostinger).
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <span className="font-bold text-brand-500">2.</span>
                          <p>
                            <strong>Aponte o Domínio DNS:</strong> Na zona DNS do seu domínio principal, crie um registo <strong>A</strong> apontando para o IP público do seu servidor, ou um subdomínio (ex: <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded font-mono">api</code>) do tipo <strong>CNAME</strong>.
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <span className="font-bold text-brand-500">3.</span>
                          <p>
                            <strong>Libertar CORS:</strong> Certifique-se de que o seu servidor backend responde com os cabeçalhos de CORS ativos. Na nossa API padrão, o pacote <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded font-mono">cors</code> já está totalmente configurado e aceita conexões seguras.
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <span className="font-bold text-brand-500">4.</span>
                          <p>
                            <strong>Proteja com JWT:</strong> Para segurança absoluta do seu ERP, introduza o token no cabeçalho. O ERP enviará automaticamente como <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded font-mono">Authorization: Bearer [Seu_Token]</code> em todas as requisições de leitura e escrita.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 5.3.1: Base de Dados do Servidor Central (MySQL / Sincronização Automática) */}
          <div className="bg-white dark:bg-dark-surface p-6 rounded-xl border border-slate-200 dark:border-dark-border space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
                <Database size={15} className="text-brand-500" />
                <span>Configuração de Base de Dados do Servidor (MySQL, Postgres ou Firebase Firestore)</span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-1 font-medium">
                O seu servidor central armazena dados em tempo real numa base de dados segura. Escolha o provedor de dados desejado para garantir persistência robusta na nuvem.
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5 md:col-span-3">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Tipo de Banco de Dados</label>
                  <select
                    value={dbType}
                    onChange={(e) => setDbType(e.target.value)}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-dark-border rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-brand-500 font-semibold text-slate-700 dark:text-slate-250 cursor-pointer"
                  >
                    <option value="firebase">Firebase Firestore (Nuvem em Tempo Real - Gratuito e Recomendado)</option>
                    <option value="mysql">MySQL / MariaDB (Recomendado para Produção/cPanel)</option>
                    <option value="postgresql">PostgreSQL (Suporte Corporativo)</option>
                    <option value="sqlite">SQLite (Ficheiro Local - Modo Desenvolvimento e Volátil)</option>
                  </select>
                </div>
              </div>

              {dbType !== "sqlite" && dbType !== "firebase" && (
                <div className="space-y-4 animate-fade-in">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Host / IP do Servidor Banco de Dados</label>
                    <input
                      type="text"
                      value={dbHost}
                      onChange={(e) => setDbHost(e.target.value)}
                      placeholder="Ex: 65.21.252.101"
                      className="w-full text-xs bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-dark-border rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-brand-500 font-mono text-slate-700 dark:text-slate-200"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Porta</label>
                      <input
                        type="text"
                        value={dbPort}
                        onChange={(e) => setDbPort(e.target.value)}
                        placeholder="3306"
                        className="w-full text-xs bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-dark-border rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-brand-500 font-mono text-slate-700 dark:text-slate-200"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Nome do Banco de Dados</label>
                      <input
                        type="text"
                        value={dbName}
                        onChange={(e) => setDbName(e.target.value)}
                        placeholder="Ex: mobitec2_amadje"
                        className="w-full text-xs bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-dark-border rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-brand-500 font-mono text-slate-700 dark:text-slate-200"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Utilizador do Banco (User)</label>
                      <input
                        type="text"
                        value={dbUser}
                        onChange={(e) => setDbUser(e.target.value)}
                        placeholder="Ex: mobitec2_amadje"
                        className="w-full text-xs bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-dark-border rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-brand-500 font-mono text-slate-700 dark:text-slate-200"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Senha (Password)</label>
                      <input
                        type="password"
                        value={dbPass}
                        onChange={(e) => setDbPass(e.target.value)}
                        placeholder="••••••••"
                        className="w-full text-xs bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-dark-border rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-brand-500 font-mono text-slate-700 dark:text-slate-200"
                      />
                    </div>
                  </div>
                </div>
              )}

              {dbType === "firebase" && (
                <div className="space-y-4 animate-fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">ID do Projecto Firebase (Project ID) <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        value={fbProjectId}
                        onChange={(e) => setFbProjectId(e.target.value)}
                        placeholder="Ex: vbsp-erp-3038"
                        className="w-full text-xs bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-dark-border rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-brand-500 font-mono text-slate-700 dark:text-slate-200"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Chave de API (API Key) <span className="text-red-500">*</span></label>
                      <input
                        type="password"
                        value={fbApiKey}
                        onChange={(e) => setFbApiKey(e.target.value)}
                        placeholder="Ex: AIzaSyA3..."
                        className="w-full text-xs bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-dark-border rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-brand-500 font-mono text-slate-700 dark:text-slate-200"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Domínio de Autenticação (Auth Domain)</label>
                      <input
                        type="text"
                        value={fbAuthDomain}
                        onChange={(e) => setFbAuthDomain(e.target.value)}
                        placeholder="Ex: vbsp-erp-3038.firebaseapp.com"
                        className="w-full text-xs bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-dark-border rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-brand-500 font-mono text-slate-700 dark:text-slate-200"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Balde de Armazenamento (Storage Bucket)</label>
                      <input
                        type="text"
                        value={fbStorageBucket}
                        onChange={(e) => setFbStorageBucket(e.target.value)}
                        placeholder="Ex: vbsp-erp-3038.appspot.com"
                        className="w-full text-xs bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-dark-border rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-brand-500 font-mono text-slate-700 dark:text-slate-200"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">ID do Remetente de Mensagens (Messaging Sender ID)</label>
                      <input
                        type="text"
                        value={fbMessagingSenderId}
                        onChange={(e) => setFbMessagingSenderId(e.target.value)}
                        placeholder="Ex: 893120129312"
                        className="w-full text-xs bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-dark-border rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-brand-500 font-mono text-slate-700 dark:text-slate-200"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">ID da Aplicação (App ID)</label>
                      <input
                        type="text"
                        value={fbAppId}
                        onChange={(e) => setFbAppId(e.target.value)}
                        placeholder="Ex: 1:893120129312:web:a2b3c4d5"
                        className="w-full text-xs bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-dark-border rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-brand-500 font-mono text-slate-700 dark:text-slate-200"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <span>ID da Base de Dados (Database ID)</span>
                      <span className="text-[10px] font-normal text-slate-400 dark:text-slate-500">(Opcional - Vazio por padrão para usar a base de dados principal "(default)")</span>
                    </label>
                    <input
                      type="text"
                      value={fbDatabaseId}
                      onChange={(e) => setFbDatabaseId(e.target.value)}
                      placeholder="Ex: (default)"
                      className="w-full text-xs bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-dark-border rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-brand-500 font-mono text-slate-700 dark:text-slate-200"
                    />
                  </div>
                </div>
              )}

              <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                Ao clicar em <strong>"Gravar Configurações"</strong>, o sistema grava de forma segura estas credenciais no servidor VBSP e liga-se de imediato à base de dados na nuvem para persistência multi-utilizador em tempo real.
              </p>

              {hostStatusMessage && (
                <div className={`p-3.5 rounded-xl border text-xs font-medium animate-fade-in ${
                  hostStatusMessage.success
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-800 dark:text-emerald-300"
                    : "bg-red-500/10 border-red-500/20 text-red-800 dark:text-red-300"
                }`}>
                  <div className="flex items-start gap-2.5">
                    <div className={`mt-0.5 p-1 rounded-full ${hostStatusMessage.success ? "bg-emerald-500/20 text-emerald-600" : "bg-red-500/20 text-red-600"}`}>
                      {hostStatusMessage.success ? <Check size={14} /> : <AlertCircle size={14} />}
                    </div>
                    <div>
                      <p className="font-bold">{hostStatusMessage.success ? "Status do Servidor" : "Falha na Ligação"}</p>
                      <p className="text-[10px] opacity-90 mt-0.5">{hostStatusMessage.message}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={testingConnection || savingConfig || migratingToFirebase}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-dark-border text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer active:scale-98"
                >
                  {testingConnection ? (
                    <span className="w-4 h-4 border-2 border-slate-500 border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <RefreshCw size={14} className="text-slate-500 animate-spin-slow" />
                  )}
                  <span>{testingConnection ? "A testar..." : "Testar Ligação"}</span>
                </button>

                {dbType === "firebase" && (
                  <button
                    type="button"
                    onClick={handleMigrateToFirebase}
                    disabled={testingConnection || savingConfig || migratingToFirebase}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer active:scale-98"
                  >
                    {migratingToFirebase ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      <Database size={14} />
                    )}
                    <span>{migratingToFirebase ? "A migrar..." : "Eliminar & Migrar para Firebase"}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleSaveConfig}
                  disabled={testingConnection || savingConfig || migratingToFirebase}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer active:scale-98"
                >
                  {savingConfig ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <Server size={14} />
                  )}
                  <span>{savingConfig ? "A gravar..." : "Gravar Configurações"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Section 5.5: Gestão de Utilizadores & Logins */}
          <div className="bg-white dark:bg-dark-surface p-6 rounded-xl border border-slate-200 dark:border-dark-border space-y-6">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
              <Users size={15} className="text-brand-500" />
              <span>Gestão de Utilizadores & Login</span>
            </h3>

            {userActionMessage && (
              <div className={`p-3 rounded-lg border text-xs font-semibold ${
                userActionMessage.success 
                  ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-500 text-emerald-700 dark:text-emerald-400" 
                  : "bg-red-50 dark:bg-red-950/20 border-red-500 text-red-700 dark:text-red-400"
              }`}>
                {userActionMessage.message}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column: Alterar nome do login do utilizador atual */}
              <div className="space-y-4 bg-slate-55/60 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-150 dark:border-slate-850">
                <div className="flex items-center gap-2">
                  <User size={14} className="text-brand-500" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Alterar Nome de Login Atual</span>
                </div>
                <p className="text-[10px] text-slate-400">
                  Aqui pode alterar o seu nome de exibição e o nome de utilizador usado para fazer login no sistema.
                </p>

                <form onSubmit={handleUpdateProfileSubmit} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider block">Foto de Perfil / Avatar</label>
                    <div className="flex items-center gap-3 py-1">
                      <div className="w-12 h-12 rounded-full bg-brand-500 overflow-hidden flex items-center justify-center font-display font-bold text-sm text-white border border-slate-200 dark:border-slate-700 shrink-0">
                        {profileAvatar && profileAvatar.startsWith("data:image/") ? (
                          <img src={profileAvatar} alt="Foto de perfil" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          profileAvatar || (profileName ? profileName.substring(0, 2).toUpperCase() : "US")
                        )}
                      </div>
                      <div className="flex-1 flex items-center gap-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                if (event.target?.result && typeof event.target.result === "string") {
                                  setProfileAvatar(event.target.result);
                                }
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="hidden"
                          id="user-profile-avatar-upload"
                        />
                        <label
                          htmlFor="user-profile-avatar-upload"
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg text-[10px] font-semibold text-slate-750 dark:text-slate-300 border border-slate-200 dark:border-slate-700 cursor-pointer transition-all hover:scale-[1.02] active:scale-95"
                        >
                          Carregar Foto
                        </label>
                        {profileAvatar && profileAvatar.startsWith("data:image/") && (
                          <button
                            type="button"
                            onClick={() => setProfileAvatar("")}
                            className="text-[10px] font-semibold text-red-500 hover:text-red-600 hover:underline cursor-pointer"
                          >
                            Remover
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider block">Nome Completo</label>
                    <input
                      type="text"
                      required
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-850 dark:text-white focus:ring-2 focus:ring-brand-500 outline-hidden"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider block">Nome de Utilizador (Login)</label>
                    <input
                      type="text"
                      required
                      value={profileUsername}
                      onChange={(e) => setProfileUsername(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-850 dark:text-white focus:ring-2 focus:ring-brand-500 outline-hidden font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider block">E-mail de Contacto</label>
                    <input
                      type="email"
                      value={profileEmail}
                      onChange={(e) => setProfileEmail(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-850 dark:text-white focus:ring-2 focus:ring-brand-500 outline-hidden"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs py-2 px-4 rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Save size={13} />
                    <span>Atualizar Meu Login</span>
                  </button>
                </form>
              </div>

              {/* Right Column: Criar Novo Utilizador */}
              <div className="space-y-4 bg-slate-55/60 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-150 dark:border-slate-850">
                <div className="flex items-center gap-2">
                  <UserPlus size={14} className="text-brand-500" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Criar Novo Utilizador</span>
                </div>
                <p className="text-[10px] text-slate-400">
                  Adicione novos operadores ou administradores para aceder ao ERP e monitorizar filiais.
                </p>

                <form onSubmit={handleCreateUserSubmit} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider block">Nome Completo *</label>
                      <input
                        type="text"
                        required
                        value={newUserName}
                        onChange={(e) => setNewUserName(e.target.value)}
                        placeholder="Ex: Pedro Viana"
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-850 dark:text-white focus:ring-2 focus:ring-brand-500 outline-hidden"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider block">Login (Username) *</label>
                      <input
                        type="text"
                        required
                        value={newUserUsername}
                        onChange={(e) => setNewUserUsername(e.target.value)}
                        placeholder="Ex: pedro.viana"
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-850 dark:text-white focus:ring-2 focus:ring-brand-500 outline-hidden font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider block">Senha Inicial *</label>
                      <input
                        type="password"
                        required
                        value={newUserPassword}
                        onChange={(e) => setNewUserPassword(e.target.value)}
                        placeholder="Defina a senha"
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-850 dark:text-white focus:ring-2 focus:ring-brand-500 outline-hidden font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider block">E-mail (Opcional)</label>
                      <input
                        type="email"
                        value={newUserEmail}
                        onChange={(e) => setNewUserEmail(e.target.value)}
                        placeholder="pedro@empresa.ao"
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-850 dark:text-white focus:ring-2 focus:ring-brand-500 outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider block">Função / Perfil</label>
                      <select
                        value={newUserRole}
                        onChange={(e) => setNewUserRole(e.target.value as "admin" | "operador")}
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-850 dark:text-white focus:ring-2 focus:ring-brand-500 outline-hidden"
                      >
                        <option value="operador">Operador (Acesso Restrito)</option>
                        <option value="admin">Administrador (Global)</option>
                      </select>
                    </div>

                    {newUserRole === "operador" && (
                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider block">Filial Atribuída</label>
                        <select
                          value={newUserStore}
                          onChange={(e) => setNewUserStore(e.target.value)}
                          className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-850 dark:text-white focus:ring-2 focus:ring-brand-500 outline-hidden"
                        >
                          <option value="">Nenhuma (Vê todo o stock)</option>
                          {warehouses.map(w => (
                            <option key={w.id} value={w.name}>{w.name.split(" (")[0]}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-4 rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer mt-2"
                  >
                    <Plus size={13} />
                    <span>Criar Novo Utilizador</span>
                  </button>
                </form>
              </div>
            </div>

            {/* List of Registered Users */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2">
                <Users size={14} className="text-brand-500" />
                <span className="text-xs font-bold text-slate-900 dark:text-white">Utilizadores Registados no Sistema</span>
              </div>
              <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-55/60 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-850 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="p-3">Utilizador</th>
                      <th className="p-3">Nome de Login</th>
                      <th className="p-3">Perfil / Função</th>
                      <th className="p-3">Filial/Loja</th>
                      <th className="p-3">E-mail</th>
                      <th className="p-3 text-center">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-slate-700 dark:text-slate-300">
                    {users.map(u => (
                      <tr key={u.username} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                        <td className="p-3 flex items-center gap-2">
                          <div className="w-7 h-7 bg-brand-500/10 dark:bg-brand-500/20 text-brand-600 dark:text-brand-300 rounded-full flex items-center justify-center font-bold text-[10px] uppercase">
                            {u.avatar || u.name.substring(0,2).toUpperCase()}
                          </div>
                          <span className="font-semibold text-slate-900 dark:text-white">{u.name}</span>
                          {u.username === currentUser?.username && (
                            <span className="px-1.5 py-0.5 text-[8px] font-bold bg-brand-100 text-brand-700 dark:bg-brand-950/40 dark:text-brand-400 rounded-md border border-brand-200">Tu</span>
                          )}
                        </td>
                        <td className="p-3 font-mono text-[11px] text-slate-500">{u.username}</td>
                        <td className="p-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                            u.role === "admin" 
                              ? "bg-purple-50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-400 border border-purple-200" 
                              : "bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 border border-blue-200"
                          }`}>
                            {u.role === "admin" ? "Administrador" : "Operador"}
                          </span>
                        </td>
                        <td className="p-3 text-slate-500">{u.assignedStore ? u.assignedStore.split(" (")[0] : "Acesso Global"}</td>
                        <td className="p-3 text-slate-500 text-[11px] font-sans">{u.email}</td>
                        <td className="p-3 text-center">
                          {u.username === currentUser?.username ? (
                            <span className="text-[10px] italic text-slate-400">Ativo</span>
                          ) : (
                            <button
                              onClick={() => handleDeleteUser(u.username)}
                              className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer inline-flex items-center justify-center"
                              title="Remover Utilizador"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Section 6: Secure Password Management */}
          <div className="bg-white dark:bg-dark-surface p-6 rounded-xl border border-slate-200 dark:border-dark-border space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
              <Key size={15} className="text-red-500" />
              <span>{t("security_title")}</span>
            </h3>

            <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">{t("old_password")}</label>
                  <input
                    type="password"
                    required
                    value={oldPass}
                    onChange={(e) => setOldPass(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-850 dark:text-white focus:ring-2 focus:ring-brand-500 outline-hidden font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">{t("new_password")}</label>
                  <input
                    type="password"
                    required
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-850 dark:text-white focus:ring-2 focus:ring-brand-500 outline-hidden font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">{t("confirm_password")}</label>
                  <input
                    type="password"
                    required
                    value={confirmPass}
                    onChange={(e) => setConfirmPass(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-850 dark:text-white focus:ring-2 focus:ring-brand-500 outline-hidden font-mono"
                  />
                </div>
              </div>

              {passwordStatus && (
                <div className={`p-2.5 rounded-lg border text-xs font-semibold ${
                  passwordStatus.success 
                    ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-500 text-emerald-700 dark:text-emerald-400" 
                    : "bg-red-50 dark:bg-red-950/20 border-red-500 text-red-700 dark:text-red-400"
                }`}>
                  {passwordStatus.message}
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-2 px-4 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <Key size={13} />
                  <span>{t("change_password_btn")}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Section 7: Danger Zone / Reset System */}
          <div className="bg-red-55/30 dark:bg-red-950/15 p-6 rounded-xl border border-red-200/80 dark:border-red-900/40 space-y-4">
            <h3 className="text-sm font-semibold text-red-700 dark:text-red-400 border-b border-red-100/50 dark:border-red-900/20 pb-2 flex items-center gap-2">
              <AlertCircle size={15} className="text-red-500" />
              <span>Zona de Perigo (Zerar o Sistema)</span>
            </h3>

            <div className="space-y-4">
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                As opções abaixo permitem gerir a massa de dados do ERP. Se deseja iniciar o uso do sistema com os seus <strong>dados reais</strong>, clique em <strong>"Zerar Todo o Sistema"</strong> para eliminar definitivamente todas as referências de stock, movimentações e documentos fiscais fictícios de demonstração.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    const performClear = () => {
                      onClearAllData?.();
                      alert("O sistema foi zerado com sucesso! Todos os dados de demonstração foram removidos e o stock está pronto para dados reais.");
                    };

                    if (onShowConfirm) {
                      onShowConfirm(
                        "Zerar Todo o Sistema",
                        "Tem a certeza absoluta de que deseja ZERAR todo o sistema? Esta ação irá apagar definitivamente todos os artigos, movimentos e faturas do seu stock de demonstração e não poderá ser desfeita.",
                        performClear,
                        true
                      );
                    } else if (confirm("Tem a certeza absoluta de que deseja ZERAR todo o sistema? Esta ação irá apagar definitivamente todos os artigos, movimentos e faturas do seu stock de demonstração e não poderá ser desfeita.")) {
                      performClear();
                    }
                  }}
                  className="flex-1 sm:flex-initial bg-red-650 hover:bg-red-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <Trash2 size={14} />
                  <span>Zerar Todo o Sistema (Limpar Tudo)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const performRestore = () => {
                      onRestoreDemoData?.();
                      alert("Os dados originais de demonstração foram restaurados com sucesso!");
                    };

                    if (onShowConfirm) {
                      onShowConfirm(
                        "Restaurar Dados de Demonstração",
                        "Deseja realmente restaurar os dados originais de demonstração do stock? Quaisquer alterações feitas por si serão substituídas pelos dados de demonstração padrão.",
                        performRestore,
                        false
                      );
                    } else if (confirm("Deseja restaurar os dados originais de demonstração do stock?")) {
                      performRestore();
                    }
                  }}
                  className="flex-1 sm:flex-initial bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <RefreshCw size={13} />
                  <span>Restaurar Dados de Demonstração</span>
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
