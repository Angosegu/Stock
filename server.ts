import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import "dotenv/config";

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

  const DB_PATH = path.join(process.cwd(), "database.json");

  // Get server database state
  app.get("/api/db/get", async (req, res) => {
    try {
      if (fs.existsSync(DB_PATH)) {
        const data = await fs.promises.readFile(DB_PATH, "utf-8");
        return res.json(JSON.parse(data));
      }
      return res.json({ empty: true });
    } catch (error: any) {
      console.error("Erro ao ler base de dados local:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Save server database state
  app.post("/api/db/save", async (req, res) => {
    try {
      const dbState = req.body;
      await fs.promises.writeFile(DB_PATH, JSON.stringify(dbState, null, 2), "utf-8");
      res.json({ success: true });
    } catch (error: any) {
      console.error("Erro ao gravar base de dados local:", error);
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
      console.error("Erro no Gemini API:", error);
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
  console.error("[VBSP ERP Server] Falha catastrófica ao arrancar o servidor:", error);
});
