import React, { useState } from "react";
import { ShieldAlert, UserCheck, Trash2, Database, Save, Sparkles, Check, Server, Calendar, Key, Eye, EyeOff, Lock } from "lucide-react";
import { GameEvent } from "../types";

interface AdminViewProps {
  events: GameEvent[];
  setEvents: (events: GameEvent[]) => void;
  adminDiscordId: string;
  setAdminDiscordId: (id: string) => void;
  discordUser: { name: string; avatarUrl: string; tag: string } | null;
  setToast: (toast: { message: string; type: "success" | "error" | "info" } | null) => void;
  discordClientId: string;
  setDiscordClientId: (id: string) => void;
  discordClientSecret: string;
  setDiscordClientSecret: (secret: string) => void;
}

export default function AdminView({
  events,
  setEvents,
  adminDiscordId,
  setAdminDiscordId,
  discordUser,
  setToast,
  discordClientId,
  setDiscordClientId,
  discordClientSecret,
  setDiscordClientSecret
}: AdminViewProps) {
  const [newAdminId, setNewAdminId] = useState(adminDiscordId);
  const [isSaved, setIsSaved] = useState(false);
  
  // Local state for OAuth form
  const [newClientId, setNewClientId] = useState(discordClientId);
  const [newClientSecret, setNewClientSecret] = useState(discordClientSecret);
  const [showSecret, setShowSecret] = useState(false);
  const [isOAuthSaved, setIsOAuthSaved] = useState(false);

  // Stats for the system
  const totalEvents = events.length;
  const gameStats = React.useMemo(() => {
    const stats: Record<string, number> = {};
    events.forEach(e => {
      stats[e.game_tag] = (stats[e.game_tag] || 0) + 1;
    });
    return stats;
  }, [events]);

  const handleSaveAdminId = () => {
    if (!newAdminId.trim()) {
      setToast({ message: "管理者IDを空にすることはできません", type: "error" });
      return;
    }
    setAdminDiscordId(newAdminId.trim());
    localStorage.setItem("gamer_calendar_admin_discord_id", newAdminId.trim());
    setIsSaved(true);
    setToast({ message: `管理者DiscordユーザーIDを「${newAdminId}」に設定しました`, type: "success" });
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleClearAllEvents = () => {
    if (window.confirm("警告: すべてのカレンダーイベントを完全に削除します。よろしいですか？")) {
      setEvents([]);
      localStorage.setItem("gamer_calendar_events", JSON.stringify([]));
      setToast({ message: "すべてのイベントを削除しました", type: "success" });
    }
  };

  const handleResetToDefault = () => {
    if (window.confirm("すべてのカレンダーイベントを初期状態にリセットします。よろしいですか？")) {
      localStorage.removeItem("gamer_calendar_events");
      // App.tsx side will reload initial events if we pass empty or trigger reload
      // But we can reload the page or just set default events.
      // For simplicity, reload to restore complete default app state
      window.location.reload();
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto animate-fadeIn" id="admin_view">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-red-950/30 via-zinc-900 to-zinc-950 border border-red-900/30 p-6 md:p-8 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden" id="admin_header_banner">
        <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-red-600" />
        
        <div className="space-y-2">
          <span className="text-[10px] text-red-400 font-bold uppercase tracking-widest bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded-full flex items-center gap-1 w-fit">
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>Admin Control Panel</span>
          </span>
          <h2 className="text-xl md:text-2xl font-bold text-zinc-100 font-display">
            管理者専用ダッシュボード
          </h2>
          <p className="text-xs text-zinc-400 leading-relaxed max-w-md">
            システム設定、管理者の指定、イベントの一括操作、統計データの確認が可能です。
          </p>
        </div>

        <div className="flex flex-col items-end gap-1 shrink-0 bg-zinc-950/60 p-3 rounded-xl border border-zinc-800/60 font-mono">
          <span className="text-[10px] text-zinc-500 font-bold">STATUS</span>
          <span className="text-xs text-red-400 font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            AUTHORIZED
          </span>
        </div>
      </div>

      {/* Main Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left Column: Admin ID & Discord OAuth Configuration (md:col-span-7) */}
        <div className="md:col-span-7 flex flex-col gap-6">
          
          {/* Admin ID Configuration */}
          <div className="bg-[#121214] border border-zinc-850 rounded-xl p-5 flex flex-col gap-5 relative overflow-hidden">
            <div>
              <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
                <UserCheck className="h-4.5 w-4.5 text-red-400" />
                <span>管理者Discordユーザーの指定</span>
              </h3>
              <p className="text-[11px] text-zinc-500 mt-1">
                指定されたDiscordユーザーID（Tagまたは名前）を持つユーザーのみが、この管理画面にアクセス可能になります。
              </p>
            </div>

            <div className="bg-zinc-950/60 p-4 rounded-xl border border-zinc-850/60 space-y-4">
              <div>
                <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block mb-1.5">
                  管理者のDiscord Tagまたはユーザー名
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newAdminId}
                    onChange={(e) => setNewAdminId(e.target.value)}
                    placeholder="例: 2026 または Hiro"
                    className="flex-1 bg-zinc-900 border border-zinc-800 focus:border-red-500/50 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none transition-colors font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleSaveAdminId}
                    className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    {isSaved ? <Check className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
                    <span>{isSaved ? "保存済" : "保存"}</span>
                  </button>
                </div>
              </div>

              <div className="p-3 bg-zinc-900/40 rounded-lg border border-zinc-800/40 space-y-1.5">
                <div className="flex justify-between text-[11px]">
                  <span className="text-zinc-500">現在の管理者ID:</span>
                  <span className="text-zinc-300 font-mono font-bold">{adminDiscordId}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-zinc-500">ログイン中のユーザー:</span>
                  <span className="text-zinc-300 font-mono">
                    {discordUser ? `${discordUser.name}#${discordUser.tag}` : "ゲスト (未連携)"}
                  </span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-zinc-500">管理者ステータス:</span>
                  <span className={`font-bold ${discordUser && (discordUser.tag === adminDiscordId || discordUser.name === adminDiscordId) ? "text-red-400" : "text-zinc-500"}`}>
                    {discordUser && (discordUser.tag === adminDiscordId || discordUser.name === adminDiscordId) ? "管理者認証済み" : "ゲスト/一般ユーザー"}
                  </span>
                </div>
              </div>
              
              <div className="text-[10px] text-zinc-500 bg-red-950/10 border border-red-500/10 p-2.5 rounded-lg">
                <strong>補足:</strong> コード側のデフォルト管理者設定は、<code>src/App.tsx</code> の上部にある <code>DEFAULT_ADMIN_DISCORD_ID</code> を直接変更することでも指定可能です。
              </div>
            </div>
          </div>

          {/* Discord OAuth2 Configuration */}
          <div className="bg-[#121214] border border-zinc-850 rounded-xl p-5 flex flex-col gap-5 relative overflow-hidden" id="discord_oauth2_config">
            <div>
              <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
                <Lock className="h-4.5 w-4.5 text-violet-400" />
                <span>Discord OAuth2 アプリケーション設定</span>
              </h3>
              <p className="text-[11px] text-zinc-500 mt-1">
                Discord Developer Portal で作成したアプリケーションの Client ID と Client Secret を設定・保存します。
              </p>
            </div>

            <div className="bg-zinc-950/60 p-4 rounded-xl border border-zinc-850/60 space-y-4">
              <div>
                <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block mb-1.5">
                  Client ID (クライアントID)
                </label>
                <input
                  type="text"
                  value={newClientId}
                  onChange={(e) => setNewClientId(e.target.value)}
                  placeholder="例: 1045678901234567890"
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-violet-500/50 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none transition-colors font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block mb-1.5">
                  Client Secret (クライアントシークレット)
                </label>
                <div className="relative">
                  <input
                    type={showSecret ? "text" : "password"}
                    value={newClientSecret}
                    onChange={(e) => setNewClientSecret(e.target.value)}
                    placeholder="例: aB1cD2eF3gH4iJ5kL6mN7oP8qR9sT0uV"
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-violet-500/50 rounded-xl pl-3 pr-10 py-2 text-xs text-zinc-100 focus:outline-none transition-colors font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecret(!showSecret)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer flex items-center justify-center"
                  >
                    {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setDiscordClientId(newClientId.trim());
                    setDiscordClientSecret(newClientSecret.trim());
                    localStorage.setItem("gamer_calendar_discord_client_id", newClientId.trim());
                    localStorage.setItem("gamer_calendar_discord_client_secret", newClientSecret.trim());
                    setIsOAuthSaved(true);
                    setToast({ message: "Discord OAuth2 認証設定を保存しました", type: "success" });
                    setTimeout(() => setIsOAuthSaved(false), 3000);
                  }}
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-violet-600/10 hover:shadow-violet-600/25"
                >
                  {isOAuthSaved ? <Check className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
                  <span>{isOAuthSaved ? "保存済" : "設定を保存"}</span>
                </button>
              </div>

              <div className="p-3 bg-zinc-900/40 rounded-lg border border-zinc-800/40 space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-zinc-500">保存中の Client ID:</span>
                  <span className="text-zinc-300 font-mono">{discordClientId || "未設定"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">保存中の Client Secret:</span>
                  <span className="text-zinc-300 font-mono">
                    {discordClientSecret ? "••••••••••••••••" : "未設定"}
                  </span>
                </div>
              </div>

              <div className="text-[10px] text-zinc-500 bg-violet-950/10 border border-violet-500/10 p-2.5 rounded-lg">
                <strong>管理者ガイド:</strong> この設定は、Discord OAuth2 ログインでの認証フローに使用されます。リダイレクト URI には、アプリケーションのドメイン（本番またはプレビュー環境）を指定してください。
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Database & Actions (md:col-span-5) */}
        <div className="md:col-span-5 flex flex-col gap-6">
          
          {/* Quick Stats Panel */}
          <div className="bg-[#121214] border border-zinc-850 rounded-xl p-5 flex flex-col gap-4">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2 border-b border-zinc-850 pb-2.5">
              <Database className="h-4 w-4 text-red-400" />
              <span>システム統計</span>
            </h3>

            <div className="grid grid-cols-2 gap-3 font-mono">
              <div className="bg-zinc-950/40 p-3 rounded-xl border border-zinc-850/60 text-center">
                <span className="text-[10px] text-zinc-500 block">総イベント数</span>
                <span className="text-xl font-bold text-white mt-1 block">{totalEvents}</span>
              </div>
              <div className="bg-zinc-950/40 p-3 rounded-xl border border-zinc-850/60 text-center">
                <span className="text-[10px] text-zinc-500 block">ゲームタグ種類</span>
                <span className="text-xl font-bold text-white mt-1 block">{Object.keys(gameStats).length}</span>
              </div>
            </div>

            {/* Event Distribution */}
            {Object.keys(gameStats).length > 0 && (
              <div className="space-y-2">
                <span className="text-[10px] text-zinc-500 font-bold block uppercase tracking-wider">タグ別イベント配分</span>
                <div className="space-y-1.5 max-h-[120px] overflow-y-auto pr-1">
                  {Object.entries(gameStats).map(([tag, count]) => (
                    <div key={tag} className="flex items-center justify-between text-xs bg-zinc-950/20 p-1.5 rounded border border-zinc-900">
                      <span className="text-zinc-400 font-mono">{tag}</span>
                      <span className="text-zinc-300 font-bold font-mono">{count}件</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Destructive Actions */}
          <div className="bg-[#121214] border border-zinc-850 rounded-xl p-5 flex flex-col gap-3">
            <h3 className="text-xs font-bold text-red-400 uppercase tracking-widest flex items-center gap-2 border-b border-zinc-850 pb-2.5">
              <span>危険な操作</span>
            </h3>

            <div className="space-y-2">
              <button
                type="button"
                onClick={handleClearAllEvents}
                className="w-full py-2 bg-red-950/20 hover:bg-red-950/40 border border-red-900/30 text-red-400 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>全イベントの一括削除</span>
              </button>

              <button
                type="button"
                onClick={handleResetToDefault}
                className="w-full py-2 bg-zinc-800 hover:bg-zinc-750 border border-zinc-750 text-zinc-300 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
                <span>初期データにリセット</span>
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
