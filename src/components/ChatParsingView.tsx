import React from "react";
import { Sparkles, X, RefreshCw, AlertCircle, CheckCircle, Clock, ArrowRight } from "lucide-react";
import { GameEvent, GameTag } from "../types";
import { PRESETS, GAME_TAGS, SERVERS, SERVER_LABELS } from "../constants";
import { motion, AnimatePresence } from "motion/react";

interface ChatParsingViewProps {
  inputText: string;
  setInputText: (text: string) => void;
  isExtracting: boolean;
  extractionError: string | null;
  setExtractionError: (err: string | null) => void;
  extractedEvent: Partial<GameEvent> | null;
  setExtractedEvent: (evt: Partial<GameEvent> | null) => void;
  handleUsePreset: (text: string) => void;
  handleExtractWithAI: () => void;
  handleSaveExtracted: () => void;
}

export default function ChatParsingView({
  inputText,
  setInputText,
  isExtracting,
  extractionError,
  setExtractionError,
  extractedEvent,
  setExtractedEvent,
  handleUsePreset,
  handleExtractWithAI,
  handleSaveExtracted
}: ChatParsingViewProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn" id="chat_parsing_view">
      
      {/* Left Column: Input Field & presets */}
      <div className="lg:col-span-7 flex flex-col gap-6" id="ai_input_panel">
        
        {/* AI Input card */}
        <div className="bg-[#121214] border border-[#27272a] rounded-xl p-5 flex flex-col shadow-2xl" id="ai_input_card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-violet-400" />
              <span>チャット認識 (Raw Input Buffer)</span>
            </h3>
            <span className="text-[10px] bg-zinc-800 px-2.5 py-0.5 rounded text-zinc-400 font-mono">UTF-8</span>
          </div>

          <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
            Discordのチャット募集文、Twitterのイベント告知、またはゲーム内のメモ書きなどをそのままコピー＆ペーストしてください。
            Gemini AIが内容を分析し、タイトルや日時、募集人数、Discordサーバーを瞬時に自動抽出します。
          </p>

          {/* Input textarea */}
          <div className="relative mb-4 flex-1">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="（例）明日21時からApexカスタムやるよ！メンツ＠5募集で"
              className="w-full h-44 bg-[#09090b] border border-[#27272a] focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 rounded-lg p-4 font-mono text-sm text-zinc-300 leading-relaxed resize-none outline-none transition-all"
              id="ai_input_textarea"
            />
            {inputText && (
              <button
                onClick={() => setInputText("")}
                className="absolute top-2 right-2 p-1.5 rounded bg-zinc-800 hover:bg-[#222226] text-zinc-400 hover:text-white transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Presets Grid */}
          <div className="mb-4">
            <div className="text-[10px] uppercase text-zinc-500 font-semibold tracking-wider mb-2">試してみる（テンプレートを選択）:</div>
            <div className="grid grid-cols-2 gap-2">
              {PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handleUsePreset(preset.text)}
                  className="text-left text-[11px] p-2.5 rounded-lg bg-[#09090b] hover:bg-zinc-800/60 border border-[#27272a]/60 hover:border-violet-500/30 text-zinc-300 hover:text-violet-400 truncate transition-all duration-200"
                >
                  <span className="font-semibold text-violet-400 block mb-0.5">{preset.label}</span>
                  <span className="opacity-80 block truncate text-[10px]">{preset.text}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Submit and Clear Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleExtractWithAI}
              disabled={isExtracting || !inputText.trim()}
              className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold tracking-wider transition-all flex items-center justify-center gap-2 ${
                isExtracting || !inputText.trim()
                  ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                  : "bg-violet-600 hover:bg-violet-500 text-white cursor-pointer shadow-lg shadow-violet-600/15 hover:shadow-violet-600/30"
              }`}
              id="ai_extract_submit_btn"
            >
              {isExtracting ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>解析・展開中...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-amber-300" />
                  <span>AIでパース解析を開始する</span>
                </>
              )}
            </button>
            {inputText && (
              <button
                onClick={() => {
                  setInputText("");
                  setExtractedEvent(null);
                  setExtractionError(null);
                }}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-xs font-bold text-zinc-400 hover:text-white transition-colors"
              >
                クリア
              </button>
            )}
          </div>

          {extractionError && (
            <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-start gap-2 text-xs text-rose-400">
              <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">抽出エラー</p>
                <p className="text-[11px] mt-0.5">{extractionError}</p>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Right Column: AI confirmation drawer */}
      <div className="lg:col-span-5" id="ai_output_panel">
        <AnimatePresence mode="wait">
          {extractedEvent ? (
            <motion.div
              key="result_active"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="bg-[#121214] border border-violet-500/30 rounded-xl p-5 shadow-2xl relative overflow-hidden h-full flex flex-col justify-between"
              id="ai_result_confirmation"
            >
              <div>
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-850">
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-400" />
                    <span>AI抽出したイベント下書き</span>
                  </h3>
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-red-500/50"></div>
                    <div className="w-2 h-2 rounded-full bg-amber-500/50"></div>
                    <div className="w-2 h-2 rounded-full bg-emerald-500/50"></div>
                  </div>
                </div>

                <div className="space-y-4 text-sm" id="extracted_fields_list">
                  {/* Title field */}
                  <div>
                    <label className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-1">イベントタイトル</label>
                    <input
                      type="text"
                      value={extractedEvent.title || ""}
                      onChange={(e) => setExtractedEvent({ ...extractedEvent, title: e.target.value })}
                      className="w-full bg-[#09090b] border border-[#27272a] focus:border-violet-500/50 rounded-lg px-3 py-2 text-xs text-emerald-400 font-mono"
                    />
                  </div>

                  {/* Grid for Game Tag, Server, Max Slots */}
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-1">Game Tag</label>
                      <select
                        value={extractedEvent.game_tag || "General"}
                        onChange={(e) => setExtractedEvent({ ...extractedEvent, game_tag: e.target.value as GameTag })}
                        className="w-full bg-[#09090b] border border-[#27272a] focus:border-violet-500/50 rounded-lg px-2 py-2 text-xs text-emerald-400 font-mono"
                      >
                        {GAME_TAGS.map((tag) => (
                          <option key={tag} value={tag}>
                            {tag}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-1">Discord鯖</label>
                      <select
                        value={extractedEvent.server || "メインDiscordサーバー"}
                        onChange={(e) => setExtractedEvent({ ...extractedEvent, server: e.target.value })}
                        className="w-full bg-[#09090b] border border-[#27272a] focus:border-violet-500/50 rounded-lg px-2 py-2 text-xs text-emerald-400 font-mono"
                      >
                        {SERVERS.map((srv) => (
                          <option key={srv} value={srv}>
                            {SERVER_LABELS[srv] || srv}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-1">募集人数</label>
                      <input
                        type="number"
                        value={extractedEvent.max_participants === null || extractedEvent.max_participants === undefined ? "" : extractedEvent.max_participants}
                        onChange={(e) =>
                          setExtractedEvent({
                            ...extractedEvent,
                            max_participants: e.target.value === "" ? null : parseInt(e.target.value)
                          })
                        }
                        placeholder="無制限"
                        className="w-full bg-[#09090b] border border-[#27272a] focus:border-violet-500/50 rounded-lg px-2 py-2 text-xs text-amber-400 font-mono"
                      />
                    </div>
                  </div>

                  {/* Start/End date grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-1 flex items-center gap-1">
                        <Clock className="h-3 w-3 text-violet-400" />
                        <span>開始日時 (Start)</span>
                      </label>
                      <input
                        type="text"
                        value={extractedEvent.start_time || ""}
                        onChange={(e) => setExtractedEvent({ ...extractedEvent, start_time: e.target.value })}
                        className="w-full bg-[#09090b] border border-[#27272a] focus:border-violet-500/50 rounded-lg px-3 py-2 text-xs text-emerald-400 font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-1 flex items-center gap-1">
                        <Clock className="h-3 w-3 text-pink-400" />
                        <span>終了日時 (End)</span>
                      </label>
                      <input
                        type="text"
                        value={extractedEvent.end_time || ""}
                        onChange={(e) => setExtractedEvent({ ...extractedEvent, end_time: e.target.value })}
                        className="w-full bg-[#09090b] border border-[#27272a] focus:border-violet-500/50 rounded-lg px-3 py-2 text-xs text-emerald-400 font-mono"
                      />
                    </div>
                  </div>

                  {/* Description field */}
                  <div>
                    <label className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-1">詳細説明・備考</label>
                    <textarea
                      value={extractedEvent.description || ""}
                      onChange={(e) => setExtractedEvent({ ...extractedEvent, description: e.target.value })}
                      className="w-full h-20 bg-[#09090b] border border-[#27272a] focus:border-violet-500/50 rounded-lg p-3 text-xs text-emerald-400 font-mono resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Actions buttons */}
              <div className="flex gap-3 pt-6 border-t border-zinc-850 mt-4">
                <button
                  onClick={() => setExtractedEvent(null)}
                  className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-xs font-bold text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  下書き破棄
                </button>
                <button
                  onClick={handleSaveExtracted}
                  className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-500 rounded-xl text-xs font-bold text-white transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-violet-600/15"
                >
                  <span>カレンダーに追加</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="bg-[#121214]/50 border border-dashed border-zinc-800 rounded-xl p-8 flex flex-col items-center justify-center text-center h-full min-h-[300px]">
              <Sparkles className="h-10 w-10 text-zinc-700 animate-pulse mb-3" />
              <h4 className="text-sm font-bold text-zinc-400">下書きデータ待機中</h4>
              <p className="text-xs text-zinc-500 mt-2 max-w-xs leading-relaxed">
                左側の入力欄にチャットを貼り付けて解析を実行すると、抽出されたカレンダー用のデータがここに展開されます。
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
