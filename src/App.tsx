import React, { useState, useEffect } from "react";
import { 
  Building, 
  Package, 
  Activity, 
  FileText, 
  Sparkles, 
  LayoutDashboard, 
  Moon, 
  Sun, 
  User, 
  Search, 
  Bell, 
  ShieldAlert,
  BarChart3,
  LogOut,
  Settings,
  AlertTriangle,
  CheckCircle2
} from "lucide-react";
import { StockItem, Warehouse, StockMovement, SAFTInvoiceSim, AIAnalysisResult, UserRole } from "./types";
import { INITIAL_ITEMS, INITIAL_WAREHOUSES, INITIAL_MOVEMENTS, INITIAL_INVOICES, SYSTEM_USERS } from "./data";
import DashboardView from "./components/DashboardView";
import InventoryView from "./components/InventoryView";
import WarehousesView from "./components/WarehousesView";
import MovementsView from "./components/MovementsView";
import InvoicesView from "./components/InvoicesView";
import ReportsView from "./components/ReportsView";
import LoginView from "./components/LoginView";
import SettingsView from "./components/SettingsView";
import ConfirmationModal from "./components/ConfirmationModal";

export default function App() {
  // Navigation
  const [activeTab, setActiveTabRaw] = useState("dashboard");
  const [pendingTab, setPendingTab] = useState("dashboard");
  const [menuLoading, setMenuLoading] = useState(false);
  const tabTimerRef = React.useRef<any>(null);

  const setActiveTab = (tabId: string) => {
    setActiveTabRaw((current) => {
      if (tabId === current) return current;
      if (tabTimerRef.current) {
        clearTimeout(tabTimerRef.current);
      }
      setPendingTab(tabId);
      setMenuLoading(true);
      tabTimerRef.current = setTimeout(() => {
        setActiveTabRaw(tabId);
        setMenuLoading(false);
        tabTimerRef.current = null;
      }, 400); // smooth transitions
      return current;
    });
  };

  // User Access & Role
  const [currentUser, setCurrentUser] = useState<UserRole | null>(null);
  const [loadingDb, setLoadingDb] = useState(true);

  // Real-time server connection status (online, offline, sincronizando)
  const [connectionStatus, setConnectionStatus] = useState<"online" | "offline" | "sincronizando">("sincronizando");

  // Poll connection status in real-time
  useEffect(() => {
    let active = true;
    let pollInterval: any;

    const checkConnection = async (isFirst = false) => {
      if (isFirst) {
        setConnectionStatus("sincronizando");
      }
      try {
        const res = await fetch("/api/db/status");
        if (!res.ok) throw new Error("Falha no status HTTP");
        const data = await res.json();
        if (!active) return;

        if (data && data.success) {
          setConnectionStatus("online");
        } else {
          setConnectionStatus("offline");
        }
      } catch (err) {
        if (!active) return;
        setConnectionStatus("offline");
      }
    };

    // Initial check
    checkConnection(true);

    // Poll every 8 seconds
    pollInterval = setInterval(() => {
      checkConnection(false);
    }, 8000);

    return () => {
      active = false;
      clearInterval(pollInterval);
    };
  }, []);

  // Persistent System Settings
  const [systemName, setSystemName] = useState(() => localStorage.getItem("vbsp_systemName") || "AMADJE - COMERCIO GERAL");
  const [logoText, setLogoText] = useState(() => localStorage.getItem("vbsp_logoText") || "A");
  const [systemColor, setSystemColor] = useState(() => localStorage.getItem("vbsp_systemColor") || "blue");
  const [language, setLanguage] = useState(() => localStorage.getItem("vbsp_language") || "PT");
  const [skuMode, setSkuMode] = useState(() => localStorage.getItem("vbsp_skuMode") || "automatico"); // "automatico" | "manual"
  const [defaultMinStock, setDefaultMinStock] = useState(() => Number(localStorage.getItem("vbsp_defaultMinStock")) || 15);
  const [autoBackup, setAutoBackup] = useState(() => (localStorage.getItem("vbsp_autoBackup") !== "false")); // default true
  const [companyName, setCompanyName] = useState(() => localStorage.getItem("vbsp_companyName") || "AMADJE - COMERCIO GERAL");
  const [nif, setNif] = useState(() => localStorage.getItem("vbsp_nif") || "AO500982312");
  const [taxRegime, setTaxRegime] = useState(() => localStorage.getItem("vbsp_taxRegime") || "simplificado");
  
  // Custom categories and units
  const [categories, setCategories] = useState<string[]>(() => {
    const stored = localStorage.getItem("vbsp_categories");
    return stored ? JSON.parse(stored) : ["Farmacêuticos", "Sistemas de Segurança", "Cablagem e Conectores", "Redes e Telecomunicações", "Deteção de Incêndio"];
  });
  const [units, setUnits] = useState<string[]>(() => {
    const stored = localStorage.getItem("vbsp_units");
    return stored ? JSON.parse(stored) : ["UN", "KG", "LITRO", "BOBINA", "CAIXA"];
  });

  // User passwords (default admin / admin)
  const [userPasswords, setUserPasswords] = useState<Record<string, string>>(() => {
    const stored = localStorage.getItem("vbsp_userPasswords");
    return stored ? JSON.parse(stored) : {
      admin: "admin",
      "operador-luanda": "admin",
      "operador-benguela": "admin",
      "operador-lobito": "admin",
    };
  });

  // State managers (default empty for a clean production slate)
  const [items, setItems] = useState<StockItem[]>(() => {
    const stored = localStorage.getItem("vbsp_items");
    return stored ? JSON.parse(stored) : [];
  });
  const [warehouses, setWarehouses] = useState<Warehouse[]>(() => {
    const stored = localStorage.getItem("vbsp_warehouses");
    return stored ? JSON.parse(stored) : INITIAL_WAREHOUSES;
  });
  const [users, setUsers] = useState<UserRole[]>(() => {
    const stored = localStorage.getItem("vbsp_users");
    return stored ? JSON.parse(stored) : SYSTEM_USERS;
  });
  const [movements, setMovements] = useState<StockMovement[]>(() => {
    const stored = localStorage.getItem("vbsp_movements");
    return stored ? JSON.parse(stored) : [];
  });
  const [invoices, setInvoices] = useState<SAFTInvoiceSim[]>(() => {
    const stored = localStorage.getItem("vbsp_invoices");
    return stored ? JSON.parse(stored) : [];
  });

  // Persist items, movements, and invoices in localStorage
  useEffect(() => {
    localStorage.setItem("vbsp_items", JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem("vbsp_movements", JSON.stringify(movements));
  }, [movements]);

  useEffect(() => {
    localStorage.setItem("vbsp_invoices", JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem("vbsp_warehouses", JSON.stringify(warehouses));
  }, [warehouses]);

  useEffect(() => {
    localStorage.setItem("vbsp_users", JSON.stringify(users));
  }, [users]);

  // Persist settings
  useEffect(() => {
    localStorage.setItem("vbsp_systemName", systemName);
  }, [systemName]);

  useEffect(() => {
    localStorage.setItem("vbsp_logoText", logoText);
  }, [logoText]);

  useEffect(() => {
    localStorage.setItem("vbsp_systemColor", systemColor);
  }, [systemColor]);

  useEffect(() => {
    localStorage.setItem("vbsp_language", language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem("vbsp_skuMode", skuMode);
  }, [skuMode]);

  useEffect(() => {
    localStorage.setItem("vbsp_defaultMinStock", String(defaultMinStock));
  }, [defaultMinStock]);

  useEffect(() => {
    localStorage.setItem("vbsp_autoBackup", String(autoBackup));
  }, [autoBackup]);

  useEffect(() => {
    localStorage.setItem("vbsp_categories", JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem("vbsp_units", JSON.stringify(units));
  }, [units]);

  useEffect(() => {
    localStorage.setItem("vbsp_userPasswords", JSON.stringify(userPasswords));
  }, [userPasswords]);

  useEffect(() => {
    localStorage.setItem("vbsp_companyName", companyName);
    document.title = companyName || "AMADJE - COMÉRCIO GERAL";
  }, [companyName]);

  useEffect(() => {
    localStorage.setItem("vbsp_nif", nif);
  }, [nif]);

  useEffect(() => {
    localStorage.setItem("vbsp_taxRegime", taxRegime);
  }, [taxRegime]);

  // Filtered lists if current user is an operator assigned to a single store
  const filteredItems = currentUser?.assignedStore
    ? items.filter(item => item.warehouse === currentUser.assignedStore)
    : items;

  const filteredMovements = currentUser?.assignedStore
    ? movements.filter(m => 
        (m.type === "entrada" && m.toWarehouse === currentUser.assignedStore) ||
        (m.type === "saida" && m.fromWarehouse === currentUser.assignedStore) ||
        (m.type === "transferencia" && (m.fromWarehouse === currentUser.assignedStore || m.toWarehouse === currentUser.assignedStore))
      )
    : movements;

  // Dark Mode
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("vbsp_darkMode") === "true");
  const [logoImage, setLogoImage] = useState(() => localStorage.getItem("vbsp_logoImage") || "");
  const [showNotifications, setShowNotifications] = useState(false);

  // AI Auditor results
  const [aiResult, setAiResult] = useState<AIAnalysisResult>({
    text: "",
    loading: false,
    error: null
  });

  // Global Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    isDestructive?: boolean;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    isDestructive: false,
  });

  const triggerConfirm = (title: string, message: string, onConfirm: () => void, isDestructive = false) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      },
      isDestructive
    });
  };

  // Restauro de Cópia de Segurança (Importar Backup)
  const handleRestoreBackup = (data: any) => {
    if (data.system_name !== undefined) setSystemName(data.system_name);
    if (data.logo_text !== undefined) setLogoText(data.logo_text);
    if (data.system_color !== undefined) setSystemColor(data.system_color);
    if (data.system_language !== undefined) setLanguage(data.system_language);
    if (data.sku_strategy !== undefined) setSkuMode(data.sku_strategy);
    if (data.default_min_stock !== undefined) setDefaultMinStock(Number(data.default_min_stock));
    if (data.registered_categories !== undefined) setCategories(data.registered_categories);
    if (data.registered_units !== undefined) setUnits(data.registered_units);
    
    if (data.users !== undefined) setUsers(data.users);
    if (data.user_passwords !== undefined) setUserPasswords(data.user_passwords);

    if (data.database_dump) {
      const dump = data.database_dump;
      if (dump.items) setItems(dump.items);
      if (dump.movements) setMovements(dump.movements);
      if (dump.warehouses) setWarehouses(dump.warehouses);
      if (dump.invoices) setInvoices(dump.invoices);
    }
    
    if (data.fiscal_parameters) {
      const fp = data.fiscal_parameters;
      if (fp.companyName) localStorage.setItem("vbsp_companyName", fp.companyName);
      if (fp.nif) localStorage.setItem("vbsp_nif", fp.nif);
      if (fp.taxRegime) localStorage.setItem("vbsp_taxRegime", fp.taxRegime);
    }
  };

  const getDbEndpoint = (endpointPath: string): string => {
    const remoteActive = localStorage.getItem("host_useRemoteApi") !== "false";
    if (!remoteActive) {
      return `/api/db/${endpointPath}`;
    }

    const customUrl = (localStorage.getItem("host_customApiUrl") || "").trim();
    
    // If it's empty, contains the legacy domain, or is not an absolute URL (doesn't start with http/https), return default local path
    if (!customUrl || customUrl.includes("api.amadje.com") || (!customUrl.startsWith("http://") && !customUrl.startsWith("https://"))) {
      return `/api/db/${endpointPath}`;
    }

    // It is a valid external absolute URL! Let's build the endpoint cleanly.
    const cleanUrl = customUrl.endsWith("/") ? customUrl.slice(0, -1) : customUrl;
    
    let customPath = endpointPath === "get"
      ? (localStorage.getItem("host_customGetPath") || "").trim()
      : (localStorage.getItem("host_customSavePath") || "").trim();

    // Reset legacy relative paths to default paths for external URL
    if (!customPath || customPath === "/api/db/get" || customPath === "api/db/get" || customPath === "/get") {
      customPath = "/get";
    } else if (customPath === "/api/db/save" || customPath === "api/db/save" || customPath === "/save") {
      customPath = "/save";
    }

    const cleanPath = customPath.startsWith("/") ? customPath : `/${customPath}`;
    return `${cleanUrl}${cleanPath}`;
  };

  const getCustomHeaders = (baseHeaders: Record<string, string> = {}): Record<string, string> => {
    const headers = { ...baseHeaders };
    const remoteActive = localStorage.getItem("host_useRemoteApi") !== "false";
    if (remoteActive) {
      const token = localStorage.getItem("host_customApiToken");
      if (token && token.trim()) {
        headers["Authorization"] = `Bearer ${token.trim()}`;
      }
    }
    return headers;
  };

  // Load database from server on mount (local server-side JSON database)
  useEffect(() => {
    let active = true;
    const fetchDatabase = async () => {
      // 1. If running under 'file:' protocol (direct packaged EXE without web server, e.g. Electron, Tauri, static WebView),
      // we bypass fetching from API server entirely and rely 100% on LocalStorage. This is extremely fast and robust!
      if (window.location.protocol === "file:") {
        console.log("Detectado protocolo file://. Modo offline local ativado com sucesso!");
        if (active) {
          setLoadingDb(false);
        }
        return;
      }

      // Check if remote persistence is enabled
      const remoteActive = localStorage.getItem("host_useRemoteApi") !== "false";
      if (!remoteActive) {
        console.log("Modo Local (localStorage) activo. A ler dados do navegador...");
        
        try {
          const storedItems = localStorage.getItem("vbsp_items");
          const storedMovements = localStorage.getItem("vbsp_movements");
          const storedInvoices = localStorage.getItem("vbsp_invoices");
          const storedWarehouses = localStorage.getItem("vbsp_warehouses");
          const storedUsers = localStorage.getItem("vbsp_users");
          const storedUserPasswords = localStorage.getItem("vbsp_userPasswords");

          if (storedItems) setItems(JSON.parse(storedItems));
          if (storedMovements) setMovements(JSON.parse(storedMovements));
          if (storedInvoices) setInvoices(JSON.parse(storedInvoices));
          if (storedWarehouses) setWarehouses(JSON.parse(storedWarehouses));
          if (storedUsers) setUsers(JSON.parse(storedUsers));
          if (storedUserPasswords) setUserPasswords(JSON.parse(storedUserPasswords));

          if (localStorage.getItem("vbsp_companyName")) setCompanyName(localStorage.getItem("vbsp_companyName") || "");
          if (localStorage.getItem("vbsp_nif")) setNif(localStorage.getItem("vbsp_nif") || "");
          if (localStorage.getItem("vbsp_taxRegime")) setTaxRegime(localStorage.getItem("vbsp_taxRegime") || "simplificado");
          if (localStorage.getItem("vbsp_systemName")) setSystemName(localStorage.getItem("vbsp_systemName") || "AMADJE ERP");
          if (localStorage.getItem("vbsp_logoText")) setLogoText(localStorage.getItem("vbsp_logoText") || "AMADJE");
          if (localStorage.getItem("vbsp_systemColor")) setSystemColor(localStorage.getItem("vbsp_systemColor") || "blue");
          if (localStorage.getItem("vbsp_language")) setLanguage(localStorage.getItem("vbsp_language") || "PT");
          if (localStorage.getItem("vbsp_skuMode")) setSkuMode(localStorage.getItem("vbsp_skuMode") || "automatico");
          if (localStorage.getItem("vbsp_defaultMinStock")) setDefaultMinStock(Number(localStorage.getItem("vbsp_defaultMinStock")) || 5);
          if (localStorage.getItem("vbsp_autoBackup")) setAutoBackup(localStorage.getItem("vbsp_autoBackup") === "true");
          if (localStorage.getItem("vbsp_categories")) setCategories(JSON.parse(localStorage.getItem("vbsp_categories") || "[]"));
          if (localStorage.getItem("vbsp_units")) setUnits(JSON.parse(localStorage.getItem("vbsp_units") || "[]"));
        } catch (e) {
          console.error("Erro ao carregar dados locais do localStorage:", e);
        }

        if (active) {
          setLoadingDb(false);
        }
        return;
      }

      // 2. Set up an AbortController with a 1.2s timeout to prevent hanging if the backend does not answer or is offline
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, 1200);

      try {
        const response = await fetch(getDbEndpoint("get"), { 
          signal: controller.signal,
          headers: getCustomHeaders()
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`Resposta HTTP inválida (${response.status}) ao aceder à base de dados.`);
        }

        const text = await response.text();
        const trimmedText = text.trim();
        if (
          trimmedText.startsWith("<!DOCTYPE") || 
          trimmedText.startsWith("<!doctype") || 
          trimmedText.startsWith("<html") || 
          trimmedText.startsWith("<div") || 
          trimmedText.startsWith("<script")
        ) {
          throw new Error("O servidor respondeu com uma página HTML em vez de dados JSON válidos. Verifique se o URL e caminhos configurados em Definições estão corretos.");
        }

        let data;
        try {
          data = JSON.parse(text);
        } catch (jsonErr: any) {
          throw new Error(`Erro ao interpretar os dados como JSON: ${jsonErr.message}`);
        }

        if (!active) return;

        if (data && !data.empty) {
          // Load everything into states
          if (data.items) setItems(data.items);
          if (data.movements) setMovements(data.movements);
          if (data.invoices) setInvoices(data.invoices);
          if (data.warehouses) setWarehouses(data.warehouses);
          if (data.users) setUsers(data.users);
          if (data.userPasswords) setUserPasswords(data.userPasswords);
          
          if (data.settings) {
            const s = data.settings;
            if (s.systemName) setSystemName(s.systemName);
            if (s.logoText) setLogoText(s.logoText);
            if (s.systemColor) setSystemColor(s.systemColor);
            if (s.language) setLanguage(s.language);
            if (s.skuMode) setSkuMode(s.skuMode);
            if (s.defaultMinStock !== undefined) setDefaultMinStock(s.defaultMinStock);
            if (s.autoBackup !== undefined) setAutoBackup(s.autoBackup);
            if (s.categories) setCategories(s.categories);
            if (s.units) setUnits(s.units);
            if (s.darkMode !== undefined) setDarkMode(s.darkMode);
            if (s.companyName) setCompanyName(s.companyName);
            if (s.nif) setNif(s.nif);
            if (s.taxRegime) setTaxRegime(s.taxRegime);
          }
        } else {
          // If server database is empty, seed it with whatever is currently in localStorage (so we don't lose anything)
          // or start clean if localStorage is empty.
          const localItems = localStorage.getItem("vbsp_items");
          const hasLocalData = localItems && JSON.parse(localItems).length > 0;
          
          const initialDbState = {
            items: hasLocalData ? JSON.parse(localStorage.getItem("vbsp_items") || "[]") : [],
            movements: hasLocalData ? JSON.parse(localStorage.getItem("vbsp_movements") || "[]") : [],
            invoices: hasLocalData ? JSON.parse(localStorage.getItem("vbsp_invoices") || "[]") : [],
            warehouses: localStorage.getItem("vbsp_warehouses") ? JSON.parse(localStorage.getItem("vbsp_warehouses")!) : INITIAL_WAREHOUSES,
            users: localStorage.getItem("vbsp_users") ? JSON.parse(localStorage.getItem("vbsp_users")!) : SYSTEM_USERS,
            userPasswords: localStorage.getItem("vbsp_userPasswords") ? JSON.parse(localStorage.getItem("vbsp_userPasswords")!) : {
              admin: "admin",
              "operador-luanda": "admin",
              "operador-benguela": "admin",
              "operador-lobito": "admin"
            },
            settings: {
              systemName,
              logoText,
              systemColor,
              language,
              skuMode,
              defaultMinStock,
              autoBackup,
              categories,
              units,
              darkMode,
              companyName,
              nif,
              taxRegime
            }
          };

          // Save to server to initialize it
          await fetch(getDbEndpoint("save"), {
            method: "POST",
            headers: getCustomHeaders({ "Content-Type": "application/json" }),
            body: JSON.stringify(initialDbState)
          });
        }
      } catch (err) {
        clearTimeout(timeoutId);
        console.warn("Falha ao sincronizar com a base de dados do servidor, usando dados locais offline:", err);
      } finally {
        if (active) {
          setLoadingDb(false);
        }
      }
    };

    fetchDatabase();
    return () => {
      active = false;
    };
  }, []);

  // Automatically save state to server local database whenever it is updated
  useEffect(() => {
    if (loadingDb) return; // Wait until initial load is complete!

    // Always save to localStorage as local backup/mode persistence
    localStorage.setItem("vbsp_items", JSON.stringify(items));
    localStorage.setItem("vbsp_movements", JSON.stringify(movements));
    localStorage.setItem("vbsp_invoices", JSON.stringify(invoices));
    localStorage.setItem("vbsp_warehouses", JSON.stringify(warehouses));
    localStorage.setItem("vbsp_users", JSON.stringify(users));
    localStorage.setItem("vbsp_userPasswords", JSON.stringify(userPasswords));
    
    localStorage.setItem("vbsp_systemName", systemName);
    localStorage.setItem("vbsp_logoText", logoText);
    localStorage.setItem("vbsp_systemColor", systemColor);
    localStorage.setItem("vbsp_language", language);
    localStorage.setItem("vbsp_skuMode", skuMode);
    localStorage.setItem("vbsp_defaultMinStock", String(defaultMinStock));
    localStorage.setItem("vbsp_autoBackup", String(autoBackup));
    localStorage.setItem("vbsp_categories", JSON.stringify(categories));
    localStorage.setItem("vbsp_units", JSON.stringify(units));
    localStorage.setItem("vbsp_companyName", companyName);
    localStorage.setItem("vbsp_nif", nif);
    localStorage.setItem("vbsp_taxRegime", taxRegime);

    if (window.location.protocol === "file:") return; // Bypass API save on local packaged offline files

    const remoteActive = localStorage.getItem("host_useRemoteApi") !== "false";
    if (!remoteActive) return; // Bypass API save when in local storage mode!

    const saveTimeout = setTimeout(async () => {
      try {
        setConnectionStatus("sincronizando");
        const dbState = {
          items,
          movements,
          invoices,
          warehouses,
          users,
          userPasswords,
          settings: {
            systemName,
            logoText,
            systemColor,
            language,
            skuMode,
            defaultMinStock,
            autoBackup,
            categories,
            units,
            darkMode,
            companyName,
            nif,
            taxRegime
          }
        };

        const response = await fetch(getDbEndpoint("save"), {
          method: "POST",
          headers: getCustomHeaders({ "Content-Type": "application/json" }),
          body: JSON.stringify(dbState)
        });

        if (response.ok) {
          const resData = await response.json();
          if (resData && resData.fallbackLocal) {
            setConnectionStatus("offline");
          } else {
            setConnectionStatus("online");
          }
        } else {
          setConnectionStatus("offline");
        }
      } catch (err) {
        console.warn("Erro ao guardar dados no servidor:", err);
        setConnectionStatus("offline");
      }
    }, 500); // 500ms debounce to prevent spamming saving requests on fast sequential operations

    return () => clearTimeout(saveTimeout);
  }, [
    loadingDb,
    items,
    movements,
    invoices,
    warehouses,
    users,
    userPasswords,
    systemName,
    logoText,
    systemColor,
    language,
    skuMode,
    defaultMinStock,
    autoBackup,
    categories,
    units,
    darkMode,
    companyName,
    nif,
    taxRegime
  ]);

  // Watch for dark mode changes
  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("vbsp_darkMode", String(darkMode));
  }, [darkMode]);

  // Persist logo image
  useEffect(() => {
    localStorage.setItem("vbsp_logoImage", logoImage);
  }, [logoImage]);

  // Map colors to hex codes & inject into document styles
  const COLOR_PALETTES: Record<string, { brand50: string; brand100: string; brand500: string; brand600: string; brand700: string; brand800: string; brand900: string }> = {
    blue: {
      brand50: "#f0f7ff",
      brand100: "#e0effe",
      brand500: "#0b57d0",
      brand600: "#0045b5",
      brand700: "#003691",
      brand800: "#002970",
      brand900: "#001f5c"
    },
    emerald: {
      brand50: "#ecfdf5",
      brand100: "#d1fae5",
      brand500: "#10b981",
      brand600: "#059669",
      brand700: "#047857",
      brand800: "#065f46",
      brand900: "#064e3b"
    },
    orange: {
      brand50: "#fff7ed",
      brand100: "#ffedd5",
      brand500: "#f97316",
      brand600: "#ea580c",
      brand700: "#c2410c",
      brand800: "#9a3412",
      brand900: "#7c2d12"
    },
    indigo: {
      brand50: "#eef2ff",
      brand100: "#e0e7ff",
      brand500: "#6366f1",
      brand600: "#4f46e5",
      brand700: "#4338ca",
      brand800: "#3730a3",
      brand900: "#312e81"
    },
    violet: {
      brand50: "#f5f3ff",
      brand100: "#ede9fe",
      brand500: "#8b5cf6",
      brand600: "#7c3aed",
      brand700: "#6d28d9",
      brand800: "#5b21b6",
      brand900: "#4c1d95"
    },
    rose: {
      brand50: "#fff1f2",
      brand100: "#ffe4e6",
      brand500: "#f43f5e",
      brand600: "#e11d48",
      brand700: "#be123c",
      brand800: "#9f1239",
      brand900: "#881337"
    },
    amber: {
      brand50: "#fffbeb",
      brand100: "#fef3c7",
      brand500: "#f59e0b",
      brand600: "#d97706",
      brand700: "#b45309",
      brand800: "#92400e",
      brand900: "#78350f"
    }
  };

  useEffect(() => {
    const palette = COLOR_PALETTES[systemColor] || COLOR_PALETTES.blue;
    const root = window.document.documentElement;
    root.style.setProperty("--color-brand-50", palette.brand50);
    root.style.setProperty("--color-brand-100", palette.brand100);
    root.style.setProperty("--color-brand-500", palette.brand500);
    root.style.setProperty("--color-brand-600", palette.brand600);
    root.style.setProperty("--color-brand-700", palette.brand700);
    root.style.setProperty("--color-brand-800", palette.brand800);
    root.style.setProperty("--color-brand-900", palette.brand900);
  }, [systemColor]);

  // Global Keyboard Shortcuts (Ctrl+1 for Dashboard, Ctrl+2 for Inventário, etc.)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && !e.altKey && !e.metaKey) {
        const keyNum = parseInt(e.key);
        if (!isNaN(keyNum) && keyNum >= 1 && keyNum <= 7) {
          e.preventDefault();
          const targetTabs = ["dashboard", "inventory", "warehouses", "movements", "reports", "copilot", "settings"];
          setActiveTab(targetTabs[keyNum - 1]);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Update password helper
  const handleUpdatePassword = (oldPass: string, newPass: string) => {
    if (!currentUser) return { success: false, message: "Utilizador não autenticado." };
    const currentPass = userPasswords[currentUser.username] || "admin";
    if (oldPass !== currentPass) {
      return { success: false, message: "A palavra-passe atual está incorreta." };
    }
    setUserPasswords(prev => ({
      ...prev,
      [currentUser.username]: newPass
    }));
    return { success: true, message: "Palavra-passe alterada com sucesso!" };
  };

  // Clear system data to pristine state for real usage
  const handleClearAllData = () => {
    setItems([]);
    setMovements([]);
    setInvoices([]);
    localStorage.removeItem("vbsp_items");
    localStorage.removeItem("vbsp_movements");
    localStorage.removeItem("vbsp_invoices");
  };

  // Restore system mock data for testing/demo
  const handleRestoreDemoData = () => {
    setItems(INITIAL_ITEMS);
    setMovements(INITIAL_MOVEMENTS);
    setInvoices(INITIAL_INVOICES);
    localStorage.setItem("vbsp_items", JSON.stringify(INITIAL_ITEMS));
    localStorage.setItem("vbsp_movements", JSON.stringify(INITIAL_MOVEMENTS));
    localStorage.setItem("vbsp_invoices", JSON.stringify(INITIAL_INVOICES));
  };

  // Translation dictionary
  const TRANSLATIONS: Record<string, Record<string, string>> = {
    PT: {
      dashboard: "Dashboard",
      inventory: "Gestão de Stock",
      warehouses: "Lojas (Filiais)",
      movements: "Movimentações",
      reports: "Relatórios",
      copilot: "AI Copilot",
      settings: "Configurações",
      logout: "Sair do ERP",
      system_global: "SISTEMA GLOBAL: ADMINISTRADOR",
      restricted_access: "ACESSO RESTRITO",
      search_placeholder: "Pesquisar referências...",
      database_type: "Base de Dados: Local (SQLite)",
      synchronized: "Sincronizado",
      stock_alert_header: "Alertas de Stock Crítico",
      stock_alerts: "alertas",
      no_alerts: "Não existem roturas de stock no momento.",
      view_all_stock: "Ver Gestão de Stock Integral"
    },
    EN: {
      dashboard: "Dashboard",
      inventory: "Stock Management",
      warehouses: "Stores (Branches)",
      movements: "Movements",
      reports: "Reports",
      copilot: "AI Copilot",
      settings: "Settings",
      logout: "Exit ERP",
      system_global: "GLOBAL SYSTEM: ADMINISTRATOR",
      restricted_access: "RESTRICTED ACCESS",
      search_placeholder: "Search references...",
      database_type: "Database: Local (SQLite)",
      synchronized: "Synchronized",
      stock_alert_header: "Critical Stock Alerts",
      stock_alerts: "alerts",
      no_alerts: "There are no stockouts at the moment.",
      view_all_stock: "View Complete Stock Management"
    }
  };

  const t = (key: string) => {
    return TRANSLATIONS[language]?.[key] || TRANSLATIONS.PT[key] || key;
  };

  // Recalculate stock item status helper
  const getItemStatus = (current: number, min: number): "normal" | "critico" | "sem-stock" => {
    if (current === 0) return "sem-stock";
    if (current <= min) return "critico";
    return "normal";
  };

  // --- State modification Handlers ---

  // Add Item
  const handleAddItem = (newItem: Omit<StockItem, "id" | "status">) => {
    const nextId = "item-" + (items.length + 1);
    const itemWithId: StockItem = {
      ...newItem,
      id: nextId,
      status: getItemStatus(newItem.currentStock, newItem.minStock)
    };
    setItems(prev => [itemWithId, ...prev]);

    // Log automatic initial entry movement
    const initialMovement: StockMovement = {
      id: "MOV-" + Math.floor(1000 + Math.random() * 9000),
      type: "entrada",
      itemId: nextId,
      itemName: newItem.name,
      sku: newItem.sku,
      toWarehouse: newItem.warehouse,
      quantity: newItem.currentStock,
      date: new Date().toISOString().replace("T", " ").substring(0, 16),
      user: "Sistema AMADJE",
      reference: "STOCK-INICIAL",
      lot: newItem.lot,
      notes: "Stock registado no arranque do artigo"
    };
    setMovements(prev => [initialMovement, ...prev]);
  };

  // Update Item
  const handleUpdateItem = (updatedItem: StockItem) => {
    setItems(prev => prev.map(item => {
      if (item.id === updatedItem.id) {
        return {
          ...updatedItem,
          status: getItemStatus(updatedItem.currentStock, updatedItem.minStock)
        };
      }
      return item;
    }));
  };

  // Delete Item
  const handleDeleteItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  // Quick Stock Adjustment
  const handleQuickAdjust = (itemId: string, quantity: number, type: "entrada" | "saida", note: string) => {
    setItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const nextStock = type === "entrada" 
          ? item.currentStock + quantity 
          : Math.max(0, item.currentStock - quantity);
        return {
          ...item,
          currentStock: nextStock,
          status: getItemStatus(nextStock, item.minStock)
        };
      }
      return item;
    }));

    const targetItem = items.find(i => i.id === itemId);
    if (targetItem) {
      // Log movement record
      const move: StockMovement = {
        id: "MOV-" + Math.floor(1000 + Math.random() * 9000),
        type,
        itemId,
        itemName: targetItem.name,
        sku: targetItem.sku,
        fromWarehouse: type === "saida" ? targetItem.warehouse : undefined,
        toWarehouse: type === "entrada" ? targetItem.warehouse : undefined,
        quantity,
        date: new Date().toISOString().replace("T", " ").substring(0, 16),
        user: "Admin AMADJE (Auditoria)",
        reference: "AJUSTE-MANUAL",
        lot: targetItem.lot,
        notes: note
      };
      setMovements(prev => [move, ...prev]);
    }
  };

  // Add formal movement (entrée, sortie, transfert) and update stock
  const handleAddMovement = (newMove: Omit<StockMovement, "id" | "date">) => {
    const moveId = "MOV-" + Math.floor(1000 + Math.random() * 9000);
    const dateStr = new Date().toISOString().replace("T", " ").substring(0, 16);
    const movementWithMeta: StockMovement = {
      ...newMove,
      id: moveId,
      date: dateStr,
      user: currentUser?.name || newMove.user
    };

    setMovements(prev => [movementWithMeta, ...prev]);

    // Apply movement updates to physical product quantities
    setItems(prev => prev.map(item => {
      if (item.id === newMove.itemId) {
        let nextStock = item.currentStock;
        if (newMove.type === "entrada") {
          nextStock += newMove.quantity;
        } else if (newMove.type === "saida") {
          nextStock = Math.max(0, item.currentStock - newMove.quantity);
        } else if (newMove.type === "transferencia") {
          // Inside a transfer, if this is the active warehouse of the item
          // we update its registered warehouse field or log adjustment
          // In an advanced database we modify location, but for simplicity we change stock or location alocation
          nextStock = Math.max(0, item.currentStock - newMove.quantity);
        }

        return {
          ...item,
          currentStock: nextStock,
          status: getItemStatus(nextStock, item.minStock)
        };
      }

      // If this is a transfer and we are transferring to an existing item representation in another warehouse
      if (newMove.type === "transferencia" && item.sku === newMove.sku && item.warehouse === newMove.toWarehouse) {
        const nextStock = item.currentStock + newMove.quantity;
        return {
          ...item,
          currentStock: nextStock,
          status: getItemStatus(nextStock, item.minStock)
        };
      }

      return item;
    }));

    // If transferring to a warehouse that doesn't yet have this SKU representation, we clone it for that warehouse
    if (newMove.type === "transferencia") {
      const sourceItem = items.find(i => i.id === newMove.itemId);
      const destItemExists = items.some(i => i.sku === newMove.sku && i.warehouse === newMove.toWarehouse);
      
      if (sourceItem && !destItemExists) {
        const clonedItemForDest: StockItem = {
          ...sourceItem,
          id: "item-" + (items.length + 1) + "-cloned",
          warehouse: newMove.toWarehouse || "",
          currentStock: newMove.quantity,
          status: getItemStatus(newMove.quantity, sourceItem.minStock)
        };
        setItems(prev => [...prev, clonedItemForDest]);
      }
    }
  };

  // Void/Cancel a stock movement and reverse its effects on warehouse stock
  const handleVoidMovement = (movementId: string) => {
    const move = movements.find(m => m.id === movementId);
    if (!move) return;
    if (move.voided) {
      alert("Este movimento já se encontra anulado.");
      return;
    }

    const performVoid = () => {
      // Mark the movement as voided
      setMovements(prev => prev.map(m => m.id === movementId ? { ...m, voided: true } : m));

      // Reverse stock calculations on items
      setItems(prevItems => prevItems.map(item => {
        // Reversing an ENTRADA: we subtract from the destination warehouse
        if (move.type === "entrada" && item.id === move.itemId) {
          const nextStock = Math.max(0, item.currentStock - move.quantity);
          return {
            ...item,
            currentStock: nextStock,
            status: getItemStatus(nextStock, item.minStock)
          };
        }

        // Reversing a SAIDA: we add back to the source warehouse
        if (move.type === "saida" && item.id === move.itemId) {
          const nextStock = item.currentStock + move.quantity;
          return {
            ...item,
            currentStock: nextStock,
            status: getItemStatus(nextStock, item.minStock)
          };
        }

        // Reversing a TRANSFERENCIA:
        // We add back to the original source (fromWarehouse)
        if (move.type === "transferencia" && item.id === move.itemId) {
          const nextStock = item.currentStock + move.quantity;
          return {
            ...item,
            currentStock: nextStock,
            status: getItemStatus(nextStock, item.minStock)
          };
        }
        // And we subtract from the destination (toWarehouse)
        if (move.type === "transferencia" && item.sku === move.sku && item.warehouse === move.toWarehouse) {
          const nextStock = Math.max(0, item.currentStock - move.quantity);
          return {
            ...item,
            currentStock: nextStock,
            status: getItemStatus(nextStock, item.minStock)
          };
        }

        return item;
      }));

      alert("O movimento foi anulado com sucesso e os níveis de stock foram corrigidos!");
    };

    triggerConfirm(
      "Anular Movimento de Stock",
      `Deseja realmente anular o movimento de ${move.type.toUpperCase()} (${move.reference}) de ${move.quantity} UN do artigo "${move.itemName}"? Os stocks correspondentes serão revertidos.`,
      performVoid,
      true
    );
  };

  // Emit SAFT compliance invoice, update stock and log "saida" movement
  const handleEmitInvoice = (newInv: Omit<SAFTInvoiceSim, "id" | "date" | "invoiceNo" | "status">) => {
    const docNo = `FT AMADJE2026/${String(invoices.length + 1).padStart(5, "0")}`;
    const dateStr = new Date().toISOString().split("T")[0];

    const invoice: SAFTInvoiceSim = {
      ...newInv,
      id: "INV-" + (invoices.length + 1),
      invoiceNo: docNo,
      date: dateStr,
      status: "emitida"
    };

    setInvoices(prev => [invoice, ...prev]);

    // Find first item matching to deduct stock
    // Find item with same price or first available
    const itemToDeduct = items.find(i => i.currentStock >= newInv.itemsCount);
    if (itemToDeduct) {
      // Deduct stock
      setItems(prev => prev.map(item => {
        if (item.id === itemToDeduct.id) {
          const nextStock = Math.max(0, item.currentStock - newInv.itemsCount);
          return {
            ...item,
            currentStock: nextStock,
            status: getItemStatus(nextStock, item.minStock)
          };
        }
        return item;
      }));

      // Log movement saida
      const move: StockMovement = {
        id: "MOV-" + Math.floor(1000 + Math.random() * 9000),
        type: "saida",
        itemId: itemToDeduct.id,
        itemName: itemToDeduct.name,
        sku: itemToDeduct.sku,
        fromWarehouse: itemToDeduct.warehouse,
        quantity: newInv.itemsCount,
        date: new Date().toISOString().replace("T", " ").substring(0, 16),
        user: "AGT Faturação SAFT",
        reference: docNo,
        lot: itemToDeduct.lot,
        notes: `Faturação emitida a ${newInv.customerName} (NIF: ${newInv.customerNif})`
      };
      setMovements(prev => [move, ...prev]);
    }
  };

  // Main system auto-audit via Gemini API
  const handleRunAudit = async () => {
    setAiResult(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await fetch("/api/gemini/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stockItems: items })
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
        throw new Error("O servidor retornou uma página HTML em vez de JSON. Verifique se a API local está a correr corretamente.");
      }

      let data;
      try {
        data = JSON.parse(text);
      } catch (jsonErr: any) {
        throw new Error(`Erro ao interpretar os dados da auditoria como JSON: ${jsonErr.message}`);
      }

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Erro ao efetuar auditoria remota.");
      }

      setAiResult({
        text: data.text,
        loading: false,
        error: null
      });
    } catch (err: any) {
      console.error(err);
      setAiResult({
        text: "",
        loading: false,
        error: err.message || "Erro desconhecido ao ligar ao assistente IA."
      });
      alert("Não foi possível realizar a auditoria automática: " + (err.message || "Verifique se a variável GEMINI_API_KEY está configurada corretamente nos Secrets."));
    }
  };

  // Nav categories items
  const menuItems = [
    { id: "dashboard", label: t("dashboard"), icon: <LayoutDashboard size={18} /> },
    { id: "inventory", label: t("inventory"), icon: <Package size={18} /> },
    { id: "warehouses", label: t("warehouses"), icon: <Building size={18} /> },
    { id: "movements", label: t("movements"), icon: <Activity size={18} /> },
    { id: "reports", label: t("reports"), icon: <BarChart3 size={18} /> },
    { id: "settings", label: t("settings"), icon: <Settings size={18} /> },
  ];

  if (loadingDb) {
    return (
      <div className="flex flex-col items-center justify-center h-screen w-full bg-slate-900 text-white font-sans">
        <div className="flex flex-col items-center space-y-4 max-w-sm px-6 text-center">
          <div className="relative flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin"></div>
            <div className="absolute font-display font-bold text-xl text-brand-400">A</div>
          </div>
          <div className="space-y-1.5">
            <h1 className="text-lg font-display font-bold tracking-tight text-slate-100 font-sans">AMADJE - COMÉRCIO GERAL</h1>
            <p className="text-xs text-slate-400 font-mono animate-pulse">Sincronizando com a Base de Dados Local...</p>
          </div>
          <div className="text-[10px] text-slate-500 max-w-[240px]">
            O seu inventário e configurações estão a ser carregados de forma segura e permanente no servidor.
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <LoginView 
        users={users}
        userPasswords={userPasswords}
        systemName={systemName}
        logoText={logoText}
        logoImage={logoImage}
        onLogin={(user) => {
          setCurrentUser(user);
          setActiveTab("dashboard");
        }} 
      />
    );
  }

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-dark-bg font-sans overflow-hidden transition-colors duration-200">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 flex flex-col flex-shrink-0 z-20">
        {/* Brand Header */}
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="w-10 h-10 bg-brand-500 rounded-lg flex items-center justify-center font-display font-bold text-xl text-white shadow-md overflow-hidden">
            {logoImage ? (
              <img src={logoImage} alt="Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              logoText
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-white font-display font-bold leading-tight tracking-tight">{systemName}</span>
            <span className="text-slate-400 text-[10px] uppercase font-semibold tracking-wider">{t("inventory")}</span>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {menuItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive 
                    ? "bg-brand-500/10 dark:bg-brand-500/20 text-brand-600 dark:text-brand-100 border-l-4 border-brand-500 pl-2.5" 
                    : "text-slate-400 hover:bg-slate-800/60 hover:text-white border-l-4 border-transparent"
                }`}
                id={`nav-link-${item.id}`}
              >
                <span className={isActive ? "text-brand-600 dark:text-brand-400" : "text-slate-400"}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Account Info Bottom */}
        <div className="mt-auto p-4 border-t border-slate-800 space-y-2">
          <div className="bg-slate-800/80 rounded-xl p-3 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center text-white text-xs font-bold font-display uppercase shrink-0">
              {currentUser?.avatar || "US"}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-xs font-semibold text-white truncate leading-snug">{currentUser?.name}</p>
              <p className="text-[9px] text-slate-400 font-mono truncate">{currentUser?.email}</p>
            </div>
          </div>
          <button
            onClick={() => setCurrentUser(null)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-800/40 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-lg text-xs font-bold transition-all border border-transparent hover:border-red-500/20"
            title="Sair da sessão"
          >
            <LogOut size={13} />
            <span>Sair do ERP</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT CONTAINER */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* TOP NAVBAR HEADER */}
        <header className="h-16 bg-white dark:bg-dark-surface border-b border-slate-200 dark:border-dark-border px-8 flex items-center justify-between flex-shrink-0 z-10 transition-colors">
          <div className="flex items-center gap-4">
            <h1 className="text-sm md:text-base font-display font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              {menuItems.find(m => m.id === activeTab)?.label}
            </h1>
            
            {currentUser?.assignedStore ? (
              <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 text-[10px] font-bold border border-amber-200 dark:border-amber-900 items-center gap-1">
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>
                <span>ACESSO RESTRITO: {currentUser.assignedStore.toUpperCase()}</span>
              </span>
            ) : (
              <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-[10px] font-semibold tracking-wide items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                <span>SISTEMA GLOBAL: ADMINISTRADOR</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-4">
            {/* Quick search input */}
            <div className="relative hidden md:block">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Search size={14} />
              </span>
              <input 
                type="text" 
                placeholder="Pesquisar referências..." 
                className="bg-slate-50 dark:bg-slate-800 border-none rounded-lg px-3 pl-8 py-1.5 text-xs w-52 focus:outline-hidden focus:ring-2 focus:ring-brand-500 text-slate-800 dark:text-white"
                onClick={() => setActiveTab("inventory")}
              />
            </div>

            {/* Dark Mode toggle */}
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg text-slate-500 dark:text-slate-300 transition-colors"
              title="Alternar Tema"
              id="btn-toggle-theme"
            >
              {darkMode ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            {/* Notifications Bell with Popover Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg text-slate-500 dark:text-slate-300 transition-colors relative cursor-pointer"
                title="Notificações de Stock"
                id="btn-stock-notifications"
              >
                <Bell size={15} />
                {items.some(i => i.currentStock <= i.minStock) && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-ping" />
                )}
              </button>

              {showNotifications && (
                <>
                  {/* Backdrop overlay to close when clicking outside */}
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowNotifications(false)} 
                  />
                  
                  {/* Dropdown panel */}
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl z-50 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="p-3.5 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-slate-900 dark:text-white font-bold text-xs">
                        <AlertTriangle size={14} className="text-amber-500" />
                        <span>Alertas de Stock Crítico</span>
                      </div>
                      <span className="text-[10px] bg-red-500/10 text-red-600 dark:text-red-400 font-bold px-2 py-0.5 rounded-full">
                        {items.filter(i => i.currentStock <= i.minStock).length} alertas
                      </span>
                    </div>

                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                      {items.filter(i => i.currentStock <= i.minStock).map(i => (
                        <button
                          key={i.id}
                          onClick={() => {
                            setActiveTab("inventory");
                            setShowNotifications(false);
                          }}
                          className="w-full p-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-left transition-colors flex gap-2.5 items-start focus:outline-none"
                        >
                          <span className={`p-1.5 rounded-md mt-0.5 shrink-0 ${
                            i.currentStock === 0 
                              ? "bg-red-50 dark:bg-red-950/30 text-red-500" 
                              : "bg-amber-50 dark:bg-amber-950/30 text-amber-500"
                          }`}>
                            <AlertTriangle size={12} />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate leading-tight">
                              {i.name}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate mt-0.5">
                              {i.warehouse.split(" (")[0]} • SKU: {i.sku}
                            </p>
                            <div className="flex items-center justify-between mt-1.5">
                              <span className="text-[9px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-500 px-1 py-0.5 rounded">
                                Lote: {i.lot}
                              </span>
                              <span className={`text-[10px] font-mono font-bold ${i.currentStock === 0 ? "text-red-600" : "text-amber-600"}`}>
                                Qtd: {i.currentStock} (Min: {i.minStock})
                              </span>
                            </div>
                          </div>
                        </button>
                      ))}
                      {items.filter(i => i.currentStock <= i.minStock).length === 0 && (
                        <div className="py-8 text-center text-slate-400 text-xs">
                          <CheckCircle2 size={24} className="mx-auto mb-1.5 text-emerald-500" />
                          <span>Não existem roturas de stock no momento.</span>
                        </div>
                      )}
                    </div>

                    <div className="p-2 bg-slate-50 dark:bg-slate-900/50">
                      <button
                        onClick={() => {
                          setActiveTab("inventory");
                          setShowNotifications(false);
                        }}
                        className="w-full bg-brand-500 hover:bg-brand-600 text-white font-semibold text-[11px] py-1.5 rounded-lg transition-colors cursor-pointer text-center"
                      >
                        Ver Gestão de Stock Integral
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* WORKSPACE RENDERING AREA */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 relative min-h-[400px]">
          
          {/* Menu Loading Overlay */}
          {menuLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/70 dark:bg-dark-bg/70 backdrop-blur-[2px] z-30 animate-in fade-in duration-200">
              <div className="flex flex-col items-center space-y-4 max-w-sm px-6 text-center">
                <div className="relative flex items-center justify-center">
                  <div className="w-14 h-14 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin"></div>
                  <span className="absolute font-display font-bold text-sm text-brand-600 dark:text-brand-400">
                    {logoText}
                  </span>
                </div>
                <div className="space-y-1">
                  <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                    A carregar módulo
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    A preparar {menuItems.find(m => m.id === pendingTab)?.label || "Menu"}...
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className={menuLoading ? "opacity-35 pointer-events-none filter blur-[2px] transition-all duration-200" : "transition-all duration-200"}>
            {/* Dashboard Tab */}
          {activeTab === "dashboard" && (
            <DashboardView 
              items={filteredItems} 
              movements={filteredMovements} 
              warehouses={warehouses}
              onNavigate={setActiveTab} 
              onRunAudit={handleRunAudit}
              aiResult={aiResult}
            />
          )}

          {/* Inventory Tab */}
          {activeTab === "inventory" && (
            <InventoryView 
              items={filteredItems}
              warehouses={warehouses}
              onAddItem={handleAddItem}
              onUpdateItem={handleUpdateItem}
              onDeleteItem={handleDeleteItem}
              onQuickAdjust={handleQuickAdjust}
              categoriesList={categories}
              unitsList={units}
              skuMode={skuMode}
              defaultMinStock={defaultMinStock}
              onShowConfirm={triggerConfirm}
            />
          )}

          {/* Warehouses Tab */}
          {activeTab === "warehouses" && (
            <WarehousesView 
              warehouses={warehouses}
              items={filteredItems}
              setWarehouses={setWarehouses}
              users={users}
              setUsers={setUsers}
              currentUser={currentUser}
              onShowConfirm={triggerConfirm}
            />
          )}

          {/* Movements Tab */}
          {activeTab === "movements" && (
            <MovementsView 
              movements={filteredMovements}
              items={filteredItems}
              warehouses={warehouses}
              onAddMovement={handleAddMovement}
              onVoidMovement={handleVoidMovement}
              currentUser={currentUser}
            />
          )}

          {/* Invoices Tab */}
          {activeTab === "invoices" && (
            <InvoicesView 
              invoices={invoices}
              items={filteredItems}
              movements={filteredMovements}
              onEmitInvoice={handleEmitInvoice}
            />
          )}

          {/* Reports Tab */}
          {activeTab === "reports" && (
            <ReportsView 
              movements={filteredMovements}
              items={filteredItems}
              warehouses={warehouses}
            />
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <SettingsView 
              darkMode={darkMode}
              setDarkMode={setDarkMode}
              warehouses={warehouses}
              systemName={systemName}
              setSystemName={setSystemName}
              logoText={logoText}
              setLogoText={setLogoText}
              logoImage={logoImage}
              setLogoImage={setLogoImage}
              systemColor={systemColor}
              setSystemColor={setSystemColor}
              language={language}
              setLanguage={setLanguage}
              skuMode={skuMode}
              setSkuMode={setSkuMode}
              defaultMinStock={defaultMinStock}
              setDefaultMinStock={setDefaultMinStock}
              autoBackup={autoBackup}
              setAutoBackup={setAutoBackup}
              categories={categories}
              setCategories={setCategories}
              units={units}
              setUnits={setUnits}
              companyName={companyName}
              setCompanyName={setCompanyName}
              nif={nif}
              setNif={setNif}
              taxRegime={taxRegime}
              setTaxRegime={setTaxRegime}
              appData={{ items, movements, warehouses, invoices }}
              onUpdatePassword={handleUpdatePassword}
              onClearAllData={handleClearAllData}
              onRestoreDemoData={handleRestoreDemoData}
              currentUser={currentUser}
              setCurrentUser={setCurrentUser}
              users={users}
              setUsers={setUsers}
              userPasswords={userPasswords}
              setUserPasswords={setUserPasswords}
              onShowConfirm={triggerConfirm}
              onRestoreBackup={handleRestoreBackup}
            />
          )}

          </div>
        </div>

        {/* SYSTEM STATUS FOOTER */}
        <footer className="h-10 bg-white dark:bg-dark-surface border-t border-slate-200 dark:border-dark-border px-8 flex items-center justify-between flex-shrink-0 text-[10px] text-slate-400 font-medium transition-colors">
          <p>AMADJE ERP Enterprise v2.4.0 (Windows Desktop Runtime)</p>
          <div className="flex items-center gap-6">
            <span className="text-slate-500 dark:text-slate-400">Conexão Servidor (65.21.252.101):</span>
            
            {connectionStatus === "online" && (
              <span className="flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Online</span>
              </span>
            )}

            {connectionStatus === "offline" && (
              <span className="flex items-center gap-1.5 font-semibold text-rose-600 dark:text-rose-400">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                <span>Offline</span>
              </span>
            )}

            {connectionStatus === "sincronizando" && (
              <span className="flex items-center gap-1.5 font-semibold text-amber-600 dark:text-amber-400">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                <span>Sincronizando</span>
              </span>
            )}
          </div>
        </footer>

      </main>

      {/* Global Confirmation Modal overlay */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        isDestructive={confirmModal.isDestructive}
      />
    </div>
  );
}
