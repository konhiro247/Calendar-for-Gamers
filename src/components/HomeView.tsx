import React from "react";
import { Sparkles, Gamepad2, ArrowRight, User, ShieldCheck, Calendar, Users, ListFilter, Cpu } from "lucide-react";
import { GameEvent, GameTag } from "../types";
import { TAG_COLORS } from "../constants";

interface HomeViewProps {
  events: GameEvent[];
  setActiveSidebarTab: (tab: "home" | "calendar" | "chat" | "profile" | "group") => void;
  setSelectedEventId: (id: string | null) => void;
  discordUser: { name: string; avatarUrl: string; tag: string } | null;
}

export default function HomeView({ events, setActiveSidebarTab, setSelectedEventId, discordUser }: HomeViewProps) {
  // Read stats from localStorage to stay synced with rest of the app
  const joinedGroups = React.useMemo(() => {
    try {
      const saved = localStorage.getItem("gamer_calendar_joined_groups");
      return saved ? JSON.parse(saved) : [
        "FF14 固定攻略チーム",
        "Apex Legends エンジョイ部",
        "Valorant ランク固定",
        "Minecraft 建築鯖"
      ];
    } catch {
      return [];
    }
  }, []);

  const favoritedGames = React.useMemo(() => {
    try {
      const saved = localStorage.getItem("gamer_calendar_favorited_games");
      return saved ? JSON.parse(saved) : ["Apex Legends", "FF14", "Valorant", "Monster Hunter"];
    } catch {
      return ["Apex Legends", "FF14", "Valorant", "Monster Hunter"];
    }
  }, []);

  // Filter out past events if any, but since anchor date is 2026-06-24, just show upcoming or all
  const upcomingEvents = React.useMemo(() => {
    return events.slice(0, 3); // Get top 3 events
  }, [events]);

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto animate-fadeIn" id="home_view">
      
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-violet-950/40 via-zinc-900 to-zinc-950 border border-zinc-800/80 p-6 md:p-8 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden" id="home_welcome_banner">
        {/* Visual glow strip */}
        <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-violet-600" />
        
        <div className="space-y-2">
          <span className="text-[10px] text-violet-400 font-bold uppercase tracking-widest bg-violet-500/10 border border-violet-500/20 px-2.5 py-1 rounded-full">
            Welcome back
          </span>
          <h2 className="text-xl md:text-2xl font-bold text-zinc-100 font-display">
            ようこそ、{discordUser ? discordUser.name : "Hiro"}さん！🎮
          </h2>
          <p className="text-xs text-zinc-400 leading-relaxed max-w-md">
            PartyUp! へようこそ。AIでの予定抽出やグループ連携、カレンダー調整で快適なゲーミングライフを。
          </p>
        </div>

        <div className="flex flex-col items-end gap-1 shrink-0 bg-zinc-950/60 p-3 rounded-xl border border-zinc-800/60 font-mono">
          <span className="text-[10px] text-zinc-500 font-bold">CURRENT DATE</span>
          <span className="text-xs text-zinc-300 font-bold">2026/06/24 (水) [JST]</span>
          <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            SYSTEM LIVE
          </span>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" id="home_stats_grid">
        <div className="bg-[#121214] border border-zinc-850 p-4.5 rounded-xl flex items-center justify-between relative overflow-hidden group">
          <div className="space-y-1">
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">登録スケジュール</span>
            <span className="text-2xl font-extrabold text-white font-mono">{events.length}</span>
            <span className="text-[10px] text-zinc-400 block">アクティブなイベント</span>
          </div>
          <div className="p-3 bg-violet-500/10 text-violet-400 rounded-xl border border-violet-500/20">
            <Calendar className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-[#121214] border border-zinc-850 p-4.5 rounded-xl flex items-center justify-between relative overflow-hidden group">
          <div className="space-y-1">
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">参加中グループ</span>
            <span className="text-2xl font-extrabold text-white font-mono">{joinedGroups.length}</span>
            <span className="text-[10px] text-zinc-400 block">コミュニティサーバー</span>
          </div>
          <div className="p-3 bg-pink-500/10 text-pink-400 rounded-xl border border-pink-500/20">
            <Users className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-[#121214] border border-zinc-850 p-4.5 rounded-xl flex items-center justify-between relative overflow-hidden group">
          <div className="space-y-1">
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">お気に入りゲーム</span>
            <span className="text-2xl font-extrabold text-white font-mono">{favoritedGames.length}</span>
            <span className="text-[10px] text-zinc-400 block">プロフィール登録数</span>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
            <Gamepad2 className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Main Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="home_content_grid">
        
        {/* Left Column: Recent events list (lg:col-span-7) */}
        <div className="lg:col-span-7 bg-[#121214] border border-zinc-850 rounded-xl p-5 flex flex-col gap-4 relative overflow-hidden" id="home_recent_events">
          <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
              <Calendar className="h-4 w-4 text-violet-400" />
              <span>直近の予定セッション</span>
            </h3>
            <button
              onClick={() => setActiveSidebarTab("calendar")}
              className="text-[10px] text-violet-400 hover:text-violet-300 font-bold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>カレンダーで見る</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          <div className="space-y-3 flex-1">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map((event) => {
                const colors = TAG_COLORS[event.game_tag as GameTag] || TAG_COLORS.General;
                const isMax = event.max_participants !== null;
                const currentParticipants = event.participants.length;
                const isFull = isMax && currentParticipants >= (event.max_participants || 0);

                return (
                  <div
                    key={event.id}
                    onClick={() => setSelectedEventId(event.id)}
                    className="p-3.5 rounded-xl bg-zinc-950/40 hover:bg-zinc-950/90 border border-zinc-850/60 hover:border-violet-500/30 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative group"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      {/* Accent Game Tag */}
                      <span className={`px-2 py-1 rounded text-[9px] font-bold shrink-0 uppercase tracking-wider ${colors.bg} ${colors.text} border ${colors.border}`}>
                        {event.game_tag}
                      </span>
                      
                      <div className="min-w-0 space-y-1">
                        <h4 className="text-xs font-bold text-zinc-200 group-hover:text-white transition-colors truncate">
                          {event.title}
                        </h4>
                        <div className="flex items-center gap-3 text-[10px] text-zinc-500 font-mono">
                          <span>{event.start_time}</span>
                          <span className="text-zinc-700">|</span>
                          <span className="truncate max-w-[120px]">{event.server}</span>
                        </div>
                      </div>
                    </div>

                    {/* Member Slots status */}
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center bg-zinc-900/60 border border-zinc-850 px-2.5 py-1 rounded-lg">
                      <Users className="h-3.5 w-3.5 text-zinc-500" />
                      <span className="text-xs font-mono font-bold text-zinc-300">
                        {currentParticipants}
                        {isMax && <span className="text-zinc-600">/{event.max_participants}</span>}
                      </span>
                      {isMax && (
                        <span className={`w-1.5 h-1.5 rounded-full ${isFull ? "bg-red-500" : "bg-emerald-500"}`} />
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed border-zinc-800 rounded-xl h-full min-h-[180px]">
                <Gamepad2 className="h-8 w-8 text-zinc-700 mb-2" />
                <p className="text-xs text-zinc-400">現在スケジュールはありません。</p>
                <p className="text-[10px] text-zinc-500 mt-1">「予定追加」または「チャット認識」から追加しましょう！</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Profile summary & Quick Action Panel (lg:col-span-5) */}
        <div className="lg:col-span-5 flex flex-col gap-6" id="home_quick_actions">
          
          {/* Quick Actions Router Menu */}
          <div className="bg-[#121214] border border-zinc-850 rounded-xl p-5 flex flex-col gap-3 relative overflow-hidden">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2 border-b border-zinc-850 pb-2.5">
              <Cpu className="h-4 w-4 text-violet-400 animate-pulse" />
              <span>クイックナビゲーション</span>
            </h3>

            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() => setActiveSidebarTab("calendar")}
                className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-950/40 hover:bg-zinc-950/80 border border-zinc-850/60 hover:border-violet-500/30 text-left transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <span className="p-1.5 bg-violet-600/10 text-violet-400 rounded-md border border-violet-500/20">
                    <Calendar className="h-3.5 w-3.5" />
                  </span>
                  <div>
                    <span className="text-xs font-bold text-zinc-300 group-hover:text-violet-400 transition-colors block">カレンダーを開く</span>
                    <span className="text-[10px] text-zinc-500">週・月スケジュール表示、手動予定作成</span>
                  </div>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-zinc-600 group-hover:text-violet-400 group-hover:translate-x-0.5 transition-all" />
              </button>

              <button
                onClick={() => setActiveSidebarTab("chat")}
                className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-950/40 hover:bg-zinc-950/80 border border-zinc-850/60 hover:border-violet-500/30 text-left transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <span className="p-1.5 bg-pink-600/10 text-pink-400 rounded-md border border-pink-500/20">
                    <Sparkles className="h-3.5 w-3.5" />
                  </span>
                  <div>
                    <span className="text-xs font-bold text-zinc-300 group-hover:text-pink-400 transition-colors block">AI チャット認識を使う</span>
                    <span className="text-[10px] text-zinc-500">Discord募集文をそのまま予定に自動変換</span>
                  </div>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-zinc-600 group-hover:text-pink-400 group-hover:translate-x-0.5 transition-all" />
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
