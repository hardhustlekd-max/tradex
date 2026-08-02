import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// API route for AI Market Analysis
app.post("/api/ai-analysis", async (req, res) => {
  try {
    const { symbol, price, change24h, high24h, low24h, volume24h, recentCandles, rsi, ma20, ma50 } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "GEMINI_API_KEY environment variable is missing" });
    }

    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const prompt = `
You are Nexus AI, a senior quantitative trader and technical analyst at Nexus Trading Exchange.
Analyze the following crypto market data for ${symbol}:

- Current Price: $${price}
- 24h Change: ${change24h}%
- 24h High: $${high24h} | 24h Low: $${low24h}
- 24h Volume: $${volume24h}
- Relative Strength Index (RSI 14): ${rsi ? rsi.toFixed(1) : '52.4'}
- MA20: $${ma20 ? ma20.toFixed(2) : 'N/A'} | MA50: $${ma50 ? ma50.toFixed(2) : 'N/A'}
- Recent 5 Candles Close Prices: ${recentCandles ? JSON.stringify(recentCandles.map((c: any) => c.close)) : 'N/A'}

Provide a concise, professional, structured market analysis formatted in JSON with the following schema:
{
  "symbol": "${symbol}",
  "bias": "Bullish" | "Bearish" | "Neutral",
  "confidenceScore": number (0 to 100),
  "summary": "Short 2-sentence summary of price action and momentum",
  "supportLevels": ["$level1", "$level2"],
  "resistanceLevels": ["$level1", "$level2"],
  "technicalHighlights": [
    "Highlight 1 (e.g. RSI condition or MA alignment)",
    "Highlight 2 (e.g. Volume trend)",
    "Highlight 3 (e.g. Price action pattern)"
  ],
  "recommendedStrategy": {
    "action": "Buy / Long" | "Sell / Short" | "Wait / Hold",
    "entryZone": "price range",
    "targetPrice": "target price",
    "stopLossPrice": "stop loss price",
    "riskRewardRatio": "e.g. 1:2.5"
  }
}
Return ONLY valid JSON.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const responseText = response.text || "{}";
    const data = JSON.parse(responseText);
    res.json({ success: true, analysis: data });
  } catch (error: any) {
    console.error("Error generating AI analysis:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to generate market analysis" });
  }
});

async function startServer() {
  // Vite middleware for development vs static in production
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
    console.log(`Nexus Exchange Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
