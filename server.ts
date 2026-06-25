import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Lazy initialization of Gemini client
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      // In development / fallback, if the key is not set, we'll output a clear error.
      // But we shouldn't crash the server during startup; instead throw on first request.
      throw new Error("GEMINI_API_KEY environment variable is required. Please set it in the Secrets panel.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(express.json());

  // API Route: AI Extraction
  app.post("/api/extract", async (req, res) => {
    try {
      const { text } = req.body;
      if (!text || typeof text !== "string") {
        return res.status(400).json({ error: "Text prompt is required and must be a string." });
      }

      const ai = getGeminiClient();

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Please analyze the following raw text entered by a gamer and extract information for registering a calendar event:
        
"${text}"`,
        config: {
          systemInstruction: `あなたはゲーマー向けカレンダーアプリの優秀なデータ抽出バックエンドAIです。
ユーザーが入力した雑多なテキスト（ゲームの予定に関するチャットやメモ）を解析し、カレンダー登録に必要な情報を正確に抽出して、指定されたJSONフォーマットでのみ出力してください。

# 基準日時 (Current Time)
2026-06-24 17:28 (水曜日 / Wednesday) [日本標準時 - JST]

この基準日時を元に、相対的な日時（「今日」「明日」「来週の水曜」「今夜」など）を日本標準時 (JST) で正確に計算してください：
- 今日 (Today): 2026-06-24
- 明日 (Tomorrow): 2026-06-25
- 明後日 (Day after tomorrow): 2026-06-26
- 来週の水曜 (Next Wednesday): 2026-07-01
- 日付が省略されている場合は、直近のその曜日や日にち（今日以降で最も近い日）を指定してください。
- 年が明記されていない場合、現在の年である2026年と仮定してください。

# 抽出ルール
1. **title**: イベントのタイトル。ゲーム名や目的（例：「Apexカスタム」「FF14レイド」など）
2. **game_tag**: ゲームのタイトル名。以下のいずれか、またはその他（判別できない場合は General とすること）：
   - "Apex Legends"
   - "FF14"
   - "Valorant"
   - "League of Legends"
   - "Monster Hunter"
   - "Overwatch"
   - "Minecraft"
   - "General" (その他のゲームや判別不可能な場合)
3. **start_time**: イベントの開始日時。フォーマットは 'YYYY-MM-DD HH:mm' とすること。
4. **end_time**: 終了日時。明記されていない場合は、start_timeの「1時間後」をデフォルトとして設定してください。
5. **description**: テキスト内にある詳細、ルール、参加条件、補足情報など。特になければ空文字 ""。
 6. **max_participants**: 募集人数（数字）。「＠5」「あと3人」「募集5人」などの記述から枠数を判断。上限がない、または不明な場合は null。
7. **server**: 該当するDiscordサーバー（ボイスチャットやコミュニティ用のサーバー）。以下のいずれかに最も合致するものを指定。特定できない場合は "メインDiscordサーバー"：
   - "メインDiscordサーバー"
   - "固定攻略Discordサーバー"
   - "FPSコミュニティ"
   - "カスタム練習用サーバー"
   - "その他"`,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: {
                type: Type.STRING,
                description: "イベントのタイトル。ゲーム名や目的など。"
              },
              game_tag: {
                type: Type.STRING,
                description: "ゲームのタイトル名。Apex Legends, FF14, Valorant, League of Legends, Monster Hunter, Overwatch, Minecraft, もしくは General。"
              },
              start_time: {
                type: Type.STRING,
                description: "イベントの開始日時。フォーマットは YYYY-MM-DD HH:mm"
              },
              end_time: {
                type: Type.STRING,
                description: "イベントの終了日時。フォーマットは YYYY-MM-DD HH:mm"
              },
              description: {
                type: Type.STRING,
                description: "補足情報やルール。ない場合は空文字にする。"
              },
              max_participants: {
                type: Type.INTEGER,
                description: "募集人数。＠5やあと3人などから判断。不明ならnull。"
              },
              server: {
                type: Type.STRING,
                description: "Discordサーバー。メインDiscordサーバー, 固定攻略Discordサーバー, FPSコミュニティ, カスタム練習用サーバー, もしくは その他 のいずれか。"
              }
            },
            required: ["title", "game_tag", "start_time", "end_time", "description", "server"]
          }
        }
      });

      const resultText = response.text;
      if (!resultText) {
        return res.status(500).json({ error: "AI response was empty." });
      }

      const parsedResult = JSON.parse(resultText.trim());
      res.json(parsedResult);
    } catch (error: any) {
      console.error("AI extraction error:", error);
      res.status(500).json({
        error: error.message || "An error occurred during AI data extraction."
      });
    }
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: "2026-06-24T08:28:30-07:00" });
  });

  // Vite development middleware vs Static files in production
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
    console.log(`[Server] Gamer Calendar Backend running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
