import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Initialize Gemini API lazily or check key
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return null;
  }
  return new GoogleGenAI({ apiKey });
}

// Model is env-overridable: Google retires flash generations regularly
// (2.5-flash now 404s for new keys), so GEMINI_MODEL can pin a working one.
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.6-flash";

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// AI Insights endpoint
app.post("/api/ai/insights", async (req, res) => {
  try {
    const { totalIncome, totalAllocated, totalSpent, categories, expenses, savingsBalance, currency } = req.body;
    
    const ai = getGeminiClient();
    if (!ai) {
      // Fallback rule-based insights if Gemini API key isn't provided
      const remaining = totalIncome - totalSpent;
      const spentRatio = totalIncome > 0 ? (totalSpent / totalIncome) * 100 : 0;
      
      const fallbackInsights = [
        {
          id: "rule-1",
          type: spentRatio > 85 ? "warning" : spentRatio > 60 ? "info" : "success",
          title: spentRatio > 85 ? "High Spending Ratio" : spentRatio > 60 ? "Balanced Budget Progress" : "Great Savings Buffer",
          message: spentRatio > 85 
            ? `You have spent ${spentRatio.toFixed(1)}% of your available budget. Consider pausing non-essential expenses.`
            : `You have spent ${spentRatio.toFixed(1)}% of your total income (${currency || '$'}${totalSpent.toLocaleString()}). You have ${currency || '$'}${remaining.toLocaleString()} remaining.`,
          actionableTip: "Review top spending categories and check subcategory limits before making non-essential purchases.",
          confidence: "Rule-Based"
        },
        {
          id: "rule-2",
          type: "tip",
          title: "50/30/20 Rule Recommendation",
          message: `Aim to allocate 50% for Needs, 30% for Wants, and 20% for Savings (${currency || '$'}${((totalIncome || 0) * 0.2).toFixed(0)}/mo).`,
          actionableTip: "Set up an automatic monthly savings transfer to build your emergency fund faster.",
          confidence: "Rule-Based"
        }
      ];

      if (savingsBalance === 0) {
        fallbackInsights.push({
          id: "rule-3",
          type: "warning",
          title: "Savings Goal Initialization",
          message: "You haven't set aside any savings for this cycle yet.",
          actionableTip: "Consider routing unspent funds during the monthly closing workflow into your Savings module.",
          confidence: "Rule-Based"
        });
      }

      return res.json({ insights: fallbackInsights, source: "rule-engine" });
    }

    const prompt = `You are a professional personal finance advisor and financial planner.
Analyze the following user budget summary and provide 3-4 highly specific, encouraging, actionable insights or recommendations:

Budget Details:
- Total Monthly Income/Budget: ${currency} ${totalIncome}
- Total Allocated: ${currency} ${totalAllocated}
- Total Spent: ${currency} ${totalSpent}
- Current Savings Balance: ${currency} ${savingsBalance}
- Top Categories: ${JSON.stringify(categories?.map((c: any) => ({ name: c.name, allocated: c.allocated, spent: c.spent })) || [])}
- Recent Expenses Count: ${expenses?.length || 0}

Return ONLY a valid JSON object matching this TypeScript format (no markdown backticks or extra text outside JSON):
{
  "insights": [
    {
      "id": "string",
      "type": "warning" | "success" | "info" | "tip",
      "title": "string",
      "message": "string",
      "actionableTip": "string",
      "confidence": "AI Model"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text || "{}";
    const parsed = JSON.parse(text);
    return res.json({ insights: parsed.insights || [], source: "gemini" });
  } catch (error: any) {
    console.error("Error in AI insights:", error);
    return res.status(500).json({ error: "Failed to generate AI insights", details: error.message });
  }
});

// AI Auto-Categorize endpoint
app.post("/api/ai/categorize", async (req, res) => {
  try {
    const { title, amount, categories } = req.body;
    const ai = getGeminiClient();
    
    if (!ai) {
      // Fallback simple keyword matching
      const lowerTitle = (title || "").toLowerCase();
      let matchedCategory = categories[0] || null;
      let matchedSub = matchedCategory?.subcategories?.[0] || null;

      for (const cat of categories) {
        if (lowerTitle.includes(cat.name.toLowerCase())) {
          matchedCategory = cat;
          break;
        }
        for (const sub of cat.subcategories || []) {
          if (lowerTitle.includes(sub.name.toLowerCase())) {
            matchedCategory = cat;
            matchedSub = sub;
            break;
          }
        }
      }

      return res.json({
        categoryId: matchedCategory?.id || null,
        subcategoryId: matchedSub?.id || null,
        confidence: "Rule-Based"
      });
    }

    const categoryList = categories.map((c: any) => ({
      id: c.id,
      name: c.name,
      subcategories: c.subcategories?.map((s: any) => ({ id: s.id, name: s.name }))
    }));

    const prompt = `Categorize this expense item into one of the available categories and subcategories.
Expense Title: "${title}"
Amount: ${amount}
Available Categories: ${JSON.stringify(categoryList)}

Return ONLY JSON format:
{
  "categoryId": "matched_category_id",
  "subcategoryId": "matched_subcategory_id_or_null",
  "reason": "short explanation"
}`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json(parsed);
  } catch (error: any) {
    console.error("Error in AI categorize:", error);
    return res.status(500).json({ error: "Failed to auto-categorize expense" });
  }
});

// AI Audio Transcription endpoint (Phase 2 fallback).
// Records via MediaRecorder in the browser, transcribes here with Gemini.
// Used when the browser's built-in cloud speech service is unreachable.
app.post("/api/ai/transcribe", async (req, res) => {
  try {
    const { audioBase64, mimeType } = req.body;

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error: "Audio transcription needs a GEMINI_API_KEY. Add it to frontend/.env and restart the dev server. Typed input works without it.",
      });
    }

    if (!audioBase64 || typeof audioBase64 !== "string") {
      return res.status(400).json({ error: "Missing audio data." });
    }
    if (audioBase64.length > 8_000_000) {
      return res.status(413).json({ error: "Recording too long. Keep it under ~90 seconds." });
    }
    const mime =
      typeof mimeType === "string" && mimeType.startsWith("audio/") ? mimeType : "audio/webm";

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [
        { inlineData: { mimeType: mime, data: audioBase64 } },
        { text: "Transcribe this expense voice note accurately. Return ONLY the spoken words as plain text, with no commentary or extra formatting." },
      ],
    });

    const transcript = (response.text || "").trim();
    if (!transcript) {
      return res.status(502).json({ error: "Transcription came back empty. Try recording again, closer to the mic." });
    }
    return res.json({ transcript, source: "gemini" });
  } catch (error: any) {
    console.error("Error in AI transcribe:", error);
    return res.status(500).json({ error: "Failed to transcribe audio", details: error.message });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
    console.log(`Open the app at http://localhost:${PORT} (voice/mic need localhost or HTTPS, not a LAN IP over plain HTTP)`);
  });
}

startServer();
