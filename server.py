import os
import json
import urllib.request
import urllib.error
import mimetypes
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

DEFAULT_PORT = 3000
DIST_DIR = os.path.join(os.getcwd(), "dist")

def load_dotenv(path=".env"):
    if not os.path.exists(path):
        return

    with open(path, "r", encoding="utf-8-sig") as env_file:
        for raw_line in env_file:
            line = raw_line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue

            key, value = line.split("=", 1)
            key = key.strip()
            value = value.strip().strip("\"'")
            if key and key not in os.environ:
                os.environ[key] = value

def get_web_port():
    raw_port = os.environ.get("WEB_PORT", str(DEFAULT_PORT)).strip()
    try:
        port = int(raw_port)
    except ValueError as exc:
        raise ValueError(f"WEB_PORT must be an integer between 1 and 65535. Got: {raw_port}") from exc

    if port < 1 or port > 65535:
        raise ValueError(f"WEB_PORT must be an integer between 1 and 65535. Got: {raw_port}")

    return port

load_dotenv()
PORT = get_web_port()

class GamerCalendarHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        # Enable CORS and disable HMR / caching where applicable
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        # Serve health check
        if self.path == "/api/health":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            response = {"status": "ok", "server": "python", "time": "2026-06-25T02:17:33-07:00"}
            self.wfile.write(json.dumps(response).encode("utf-8"))
            return

        # For API requests that are not registered
        if self.path.startswith("/api/"):
            self.send_response(404)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"error": "Endpoint not found"}).encode("utf-8"))
            return

        # Static files serving with SPA routing support
        # Clean the path to look inside DIST_DIR
        clean_path = self.path.split("?")[0].split("#")[0]
        if clean_path == "/":
            clean_path = "/index.html"

        file_path = os.path.join(DIST_DIR, clean_path.lstrip("/"))

        # If the file exists and is a file, serve it
        if os.path.exists(file_path) and os.path.isfile(file_path):
            self.send_response(200)
            # Guess MIME type
            mime_type, _ = mimetypes.guess_type(file_path)
            if mime_type:
                self.send_header("Content-Type", mime_type)
            self.end_headers()
            with open(file_path, "rb") as f:
                self.wfile.write(f.read())
        else:
            # Fallback to index.html for SPA routing
            index_path = os.path.join(DIST_DIR, "index.html")
            if os.path.exists(index_path):
                self.send_response(200)
                self.send_header("Content-Type", "text/html")
                self.end_headers()
                with open(index_path, "rb") as f:
                    self.wfile.write(f.read())
            else:
                self.send_response(404)
                self.end_headers()
                self.wfile.write(b"Static build not found. Please run 'npm run build' first.")

    def do_POST(self):
        # Handle AI Extraction
        if self.path == "/api/extract":
            content_length = int(self.headers.get("Content-Length", 0))
            post_data = self.rfile.read(content_length)
            
            try:
                body = json.loads(post_data.decode("utf-8"))
                text = body.get("text", "")
            except Exception as e:
                self.send_response(400)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Invalid JSON body"}).encode("utf-8"))
                return

            if not text or not isinstance(text, str):
                self.send_response(400)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Text prompt is required and must be a string."}).encode("utf-8"))
                return

            # Call Gemini REST API
            api_key = os.environ.get("GEMINI_API_KEY")
            if not api_key:
                self.send_response(500)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({
                    "error": "GEMINI_API_KEY environment variable is required. Please set it in the Secrets panel."
                }).encode("utf-8"))
                return

            # Construct Gemini request payload
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key={api_key}"
            
            payload = {
                "contents": [
                    {
                        "parts": [
                            {
                                "text": f"Please analyze the following raw text entered by a gamer and extract information for registering a calendar event:\n\n\"{text}\""
                            }
                        ]
                    }
                ],
                "systemInstruction": {
                    "parts": [
                        {
                            "text": (
                                "あなたはゲーマー向けカレンダーアプリの優秀なデータ抽出バックエンドAIです。\n"
                                "ユーザーが入力した雑多なテキスト（ゲームの予定に関するチャットやメモ）を解析し、"
                                "カレンダー登録に必要な情報を正確に抽出して、指定されたJSONフォーマットでのみ出力してください。\n\n"
                                "# 基準日時 (Current Time)\n"
                                "2026-06-24 17:28 (水曜日 / Wednesday) [日本標準時 - JST]\n\n"
                                "この基準日時を元に、相対的な日時（「今日」「明日」「来週の水曜」「今夜」など）を日本標準時 (JST) で正確に計算してください：\n"
                                "- 今日 (Today): 2026-06-24\n"
                                "- 明日 (Tomorrow): 2026-06-25\n"
                                "- 明後日 (Day after tomorrow): 2026-06-26\n"
                                "- 来週の水曜 (Next Wednesday): 2026-07-01\n"
                                "- 日付が省略されている場合は、直近のその曜日や日にち（今日以降で最も近い日）を指定してください。\n"
                                "- 年が明記されていない場合、現在の年である2026年と仮定してください。\n\n"
                                "# 抽出ルール\n"
                                "1. **title**: イベントのタイトル。ゲーム名や目的（例：「Apexカスタム」「FF14レイド」など）\n"
                                "2. **game_tag**: ゲームのタイトル名。以下のいずれか、またはその他（判別できない場合は General とすること）：\n"
                                "   - \"Apex Legends\"\n"
                                "   - \"FF14\"\n"
                                "   - \"Valorant\"\n"
                                "   - \"League of Legends\"\n"
                                "   - \"Monster Hunter\"\n"
                                "   - \"Overwatch\"\n"
                                "   - \"Minecraft\"\n"
                                "   - \"General\" (その他のゲームや判別不可能な場合)\n"
                                "3. **start_time**: イベントの開始日時。フォーマットは 'YYYY-MM-DD HH:mm' とすること。\n"
                                "4. **end_time**: 終了日時。明記されていない場合は、start_timeの「1時間後」をデフォルトとして設定してください。\n"
                                "5. **description**: テキスト内にある詳細、ルール、参加条件、補足情報など。特になければ空文字 \"\"。\n"
                                "6. **max_participants**: 募集人数（数字）。「＠5」「あと3人」「募集5人」などの記述から枠数を判断。上限がない、または不明な場合は null。\n"
                                "7. **server**: 該当するDiscordサーバー（ボイスチャットやコミュニティ用のサーバー）。以下のいずれかに最も合致するものを指定。特定できない場合は \"メインDiscordサーバー\"：\n"
                                "   - \"メインDiscordサーバー\"\n"
                                "   - \"固定攻略Discordサーバー\"\n"
                                "   - \"FPSコミュニティ\"\n"
                                "   - \"カスタム練習用サーバー\"\n"
                                "   - \"その他\""
                            )
                        }
                    ]
                },
                "generationConfig": {
                    "responseMimeType": "application/json",
                    "responseSchema": {
                        "type": "OBJECT",
                        "properties": {
                            "title": {
                                "type": "STRING",
                                "description": "イベントのタイトル。ゲーム名や目的など。"
                            },
                            "game_tag": {
                                "type": "STRING",
                                "description": "ゲームのタイトル名。Apex Legends, FF14, Valorant, League of Legends, Monster Hunter, Overwatch, Minecraft, もしくは General。"
                            },
                            "start_time": {
                                "type": "STRING",
                                "description": "イベントの開始日時。フォーマットは YYYY-MM-DD HH:mm"
                            },
                            "end_time": {
                                "type": "STRING",
                                "description": "イベントの終了日時。フォーマットは YYYY-MM-DD HH:mm"
                            },
                            "description": {
                                "type": "STRING",
                                "description": "補足情報やルール。ない場合は空文字にする。"
                            },
                            "max_participants": {
                                "type": "INTEGER",
                                "description": "募集人数。＠5やあと3人などから判断。不明ならnull。"
                            },
                            "server": {
                                "type": "STRING",
                                "description": "Discordサーバー。メインDiscordサーバー, 固定攻略Discordサーバー, FPSコミュニティ, カスタム練習用サーバー, もしくは その他 のいずれか。"
                            }
                        },
                        "required": ["title", "game_tag", "start_time", "end_time", "description", "server"]
                    }
                }
            }

            req = urllib.request.Request(
                url,
                data=json.dumps(payload).encode("utf-8"),
                headers={
                    "Content-Type": "application/json",
                    "User-Agent": "aistudio-build-python"
                },
                method="POST"
            )

            try:
                with urllib.request.urlopen(req) as res:
                    gemini_response = json.loads(res.read().decode("utf-8"))
                    
                    # Extract the generated text from Gemini structure
                    candidates = gemini_response.get("candidates", [])
                    if not candidates:
                        raise ValueError("No candidates returned from Gemini.")
                    
                    parts = candidates[0].get("content", {}).get("parts", [])
                    if not parts:
                        raise ValueError("No content parts found in candidate.")
                    
                    result_text = parts[0].get("text", "")
                    
                    # Try to parse response text to verify it's valid JSON
                    parsed_result = json.loads(result_text.strip())
                    
                    self.send_response(200)
                    self.send_header("Content-Type", "application/json")
                    self.end_headers()
                    self.wfile.write(json.dumps(parsed_result).encode("utf-8"))
                    
            except urllib.error.HTTPError as e:
                error_body = e.read().decode("utf-8") if e.fp else ""
                print(f"[Gemini Error] HTTP Error {e.code}: {error_body}")
                self.send_response(500)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({
                    "error": f"Gemini API request failed with code {e.code}: {error_body}"
                }).encode("utf-8"))
            except Exception as e:
                print(f"[Gemini Error] {str(e)}")
                self.send_response(500)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode("utf-8"))
            return

        self.send_response(404)
        self.end_headers()

def run(server_class=ThreadingHTTPServer, handler_class=GamerCalendarHandler):
    # Ensure dist folder exists so the server starts safely
    os.makedirs(DIST_DIR, exist_ok=True)
    
    server_address = ("0.0.0.0", PORT)
    httpd = server_class(server_address, handler_class)
    print(f"[Python Server] PartyUp! Backend running on http://localhost:{PORT}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        httpd.server_close()

if __name__ == "__main__":
    run()
