import React, { useState, useEffect } from "react";
import { 
  Edit2, 
  Check, 
  X, 
  Copy, 
  Users, 
  Calendar, 
  Shield, 
  Share2, 
  Plus, 
  LogOut, 
  Trash2,
  Clock,
  User,
  Gamepad2,
  CalendarDays
} from "lucide-react";
import { GameEvent } from "../types";
import { TAG_COLORS } from "../constants";

interface GroupProfileViewProps {
  groupName: string;
  isOwner: boolean;
  inviteCode: string;
  groupOverview: string;
  setGroupOverview: (group: string, overview: string) => void;
  setGroupName: (oldName: string, newName: string) => void;
  onDeleteGroup: (group: string) => void;
  onExitGroup: (group: string) => void;
  groupEvents: GameEvent[];
  onTriggerCreateEvent: () => void;
  onToggleJoinEvent: (eventId: string) => void;
  discordUser: { name: string; avatarUrl: string; tag: string } | null;
  onToast: (msg: string, type: "success" | "error" | "info") => void;
}

export default function GroupProfileView({
  groupName,
  isOwner,
  inviteCode,
  groupOverview,
  setGroupOverview,
  setGroupName,
  onDeleteGroup,
  onExitGroup,
  groupEvents,
  onTriggerCreateEvent,
  onToggleJoinEvent,
  discordUser,
  onToast
}: GroupProfileViewProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingOverview, setIsEditingOverview] = useState(false);
  const [tempName, setTempName] = useState(groupName);
  const [tempOverview, setTempOverview] = useState(groupOverview);

  // Sync state with prop updates
  useEffect(() => {
    setTempName(groupName);
  }, [groupName]);

  useEffect(() => {
    setTempOverview(groupOverview);
  }, [groupOverview]);

  const handleSaveName = () => {
    const trimmed = tempName.trim();
    if (!trimmed) {
      setTempName(groupName);
      setIsEditingName(false);
      return;
    }
    if (trimmed !== groupName) {
      setGroupName(groupName, trimmed);
    }
    setIsEditingName(false);
  };

  const handleSaveOverview = () => {
    setGroupOverview(groupName, tempOverview);
    setIsEditingOverview(false);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(inviteCode);
    onToast("共有コードをクリップボードにコピーしました！", "success");
  };

  // Format date display helper
  const formatDateStr = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const weekDays = ["日", "月", "火", "水", "木", "金", "土"];
      return `${d.getMonth() + 1}/${d.getDate()}(${weekDays[d.getDay()]})`;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="flex flex-col gap-6" id="group_profile_view">
      
      {/* Banner / Header Card */}
      <div className="bg-[#121214] border border-zinc-850 rounded-2xl overflow-hidden shadow-2xl relative" id="group_banner_card">
        {/* Colorful banner design */}
        <div className="h-32 bg-gradient-to-r from-indigo-900 via-violet-800 to-purple-800 relative overflow-hidden">
          <div className="absolute inset-0 bg-zinc-950/25" />
          <div className="absolute bottom-2 right-4 font-mono text-[9px] text-violet-300 font-bold tracking-widest opacity-40">
            GROUP_ID_{groupName.toUpperCase().replace(/\s+/g, "_")}
          </div>
        </div>

        <div className="p-6 pt-0 flex flex-col md:flex-row items-start md:items-end gap-6 relative" id="group_header_details">
          {/* Avatar initials badge */}
          <div className="relative -mt-12 shrink-0">
            <div className="w-24 h-24 rounded-2xl bg-zinc-900 border-4 border-[#121214] flex items-center justify-center font-extrabold text-violet-400 text-3xl font-mono shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-violet-600/30 to-purple-500/10" />
              {groupName.slice(0, 2).toUpperCase()}
            </div>
            {isOwner && (
              <div className="absolute -bottom-1.5 -right-1.5 bg-violet-600 border-2 border-[#121214] text-[9px] font-bold text-white px-1.5 py-0.5 rounded-full flex items-center gap-1 shadow-lg" title="あなたが作成者です">
                <Shield className="w-2.5 h-2.5" />
                <span>OWNER</span>
              </div>
            )}
          </div>

          <div className="flex-1 space-y-2 md:pb-1 w-full">
            <div className="flex flex-wrap items-center gap-3">
              {isEditingName ? (
                <div className="flex items-center gap-2 max-w-md w-full">
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    className="bg-zinc-950 border border-violet-500/50 rounded-lg px-2.5 py-1 text-sm text-white font-extrabold outline-none focus:ring-1 focus:ring-violet-500"
                    maxLength={20}
                    autoFocus
                  />
                  <button
                    onClick={handleSaveName}
                    className="p-1 rounded bg-violet-600 hover:bg-violet-500 text-white transition-colors cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setTempName(groupName);
                      setIsEditingName(false);
                    }}
                    className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 group">
                  <h2 className="text-xl font-extrabold text-zinc-100 tracking-tight">
                    {groupName}
                  </h2>
                  {isOwner && (
                    <button
                      onClick={() => setIsEditingName(true)}
                      className="p-1 rounded bg-zinc-800/40 hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-all opacity-70 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 cursor-pointer"
                      title="グループ名を編集"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}

              <span className="text-[10px] bg-violet-500/10 text-violet-400 font-bold border border-violet-500/20 px-2.5 py-0.5 rounded-md flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                <span>メンバー共通スケジュール</span>
              </span>
            </div>

            {/* Overview / Description */}
            {isEditingOverview ? (
              <div className="flex flex-col gap-2 mt-2 max-w-xl">
                <textarea
                  value={tempOverview}
                  onChange={(e) => setTempOverview(e.target.value)}
                  className="w-full bg-zinc-950/80 border border-violet-500/50 rounded-lg p-2.5 text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-violet-500 font-sans leading-relaxed"
                  rows={2}
                  maxLength={250}
                  placeholder="グループの概要や活動方針を入力してください"
                />
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => {
                      setTempOverview(groupOverview);
                      setIsEditingOverview(false);
                    }}
                    className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 rounded text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    キャンセル
                  </button>
                  <button
                    onClick={handleSaveOverview}
                    className="px-2.5 py-1 bg-violet-600 hover:bg-violet-500 text-white rounded text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    保存
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2 group max-w-xl">
                <p className="text-xs text-zinc-400 leading-relaxed italic">
                  {groupOverview ? `「${groupOverview}」` : "「グループの概要が設定されていません。」"}
                </p>
                {isOwner && (
                  <button
                    onClick={() => {
                      setTempOverview(groupOverview);
                      setIsEditingOverview(true);
                    }}
                    className="p-1 rounded bg-zinc-800/40 hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-all opacity-70 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 cursor-pointer"
                    title="概要を編集"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main split grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="group_panels_grid">
        
        {/* Left column: Sharing & Management Panel */}
        <div className="lg:col-span-1 space-y-6">
          {/* Share Code panel */}
          <div className="bg-[#121214] border border-zinc-850 rounded-2xl p-5 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center gap-2 pb-2 border-b border-zinc-900">
              <Share2 className="w-4 h-4 text-violet-400" />
              <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">メンバー招待コード</h3>
            </div>

            <div className="bg-zinc-950/80 p-3.5 rounded-xl border border-zinc-900/60 flex flex-col gap-2 relative">
              <span className="text-[10px] text-zinc-500 font-bold tracking-wider">招待用の共通コード</span>
              <div className="flex items-center justify-between gap-1.5">
                <span className="font-mono text-base font-extrabold text-violet-400 tracking-widest select-all truncate">
                  {inviteCode}
                </span>
                <button
                  onClick={copyCode}
                  className="p-1.5 rounded bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
                  title="コードをコピー"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="text-[11px] text-zinc-400 leading-relaxed space-y-1.5 bg-violet-600/5 p-3 rounded-xl border border-violet-500/10">
              <p className="font-semibold text-violet-300">💡 グループを共有する方法</p>
              <p>この招待コードをコピーして他のゲーマーに教えてあげましょう。</p>
              <p>受け取った人は、サイドバーの「グループ一覧」のプラスボタン横にあるアイコンから、コードを入力して簡単に参加することができます！</p>
            </div>
          </div>

          {/* Group Actions panel */}
          <div className="bg-[#121214] border border-zinc-850 rounded-2xl p-5 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center gap-2 pb-2 border-b border-zinc-900">
              <Shield className="w-4 h-4 text-violet-400" />
              <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">グループ管理</h3>
            </div>

            <div className="flex flex-col gap-2">
              {isOwner ? (
                <button
                  onClick={() => onDeleteGroup(groupName)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600/10 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/20 transition-all font-semibold text-xs cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>このグループを削除する</span>
                </button>
              ) : (
                <button
                  onClick={() => onExitGroup(groupName)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600/10 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/20 transition-all font-semibold text-xs cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>グループから脱退する</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right column: Group Events / Schedule list */}
        <div className="lg:col-span-2 bg-[#121214] border border-zinc-850 rounded-2xl p-5 shadow-2xl flex flex-col gap-4 min-h-[400px]">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-900">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-violet-400" />
              <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                グループの予定一覧 ({groupEvents.length}件)
              </h3>
            </div>
            
            <button
              onClick={onTriggerCreateEvent}
              className="flex items-center gap-1 bg-violet-600 hover:bg-violet-500 text-white rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition-all shadow-md cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>予定を調整</span>
            </button>
          </div>

          {/* Event Listing */}
          {groupEvents.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 gap-3 text-zinc-500 border-2 border-dashed border-zinc-900 rounded-xl bg-zinc-950/20">
              <CalendarDays className="w-10 h-10 text-zinc-700" />
              <div className="text-xs font-bold">予定が登録されていません</div>
              <p className="text-[11px] text-zinc-600 max-w-xs leading-relaxed">
                このグループ専用の予定を作成して、チームメンバーとスケジュールを合わせましょう！
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto scrollbar-thin">
              {groupEvents.map((evt) => {
                const isParticipating = discordUser ? evt.participants.includes(discordUser.name) : evt.participants.includes("Hiro");
                return (
                  <div 
                    key={evt.id}
                    className="p-4 bg-zinc-950/50 border border-zinc-850 rounded-xl hover:border-violet-500/20 transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex gap-3 items-start min-w-0">
                      {/* Game tag icon */}
                      <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
                        <Gamepad2 className="w-5 h-5 text-zinc-400" />
                      </div>

                      <div className="space-y-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${TAG_COLORS[evt.game_tag as any] || "bg-zinc-800 text-zinc-400"}`}>
                            {evt.game_tag}
                          </span>
                          <h4 className="text-xs font-bold text-zinc-100 truncate max-w-[200px]">
                            {evt.title}
                          </h4>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] text-zinc-500">
                          <span className="flex items-center gap-1 font-semibold text-violet-400">
                            <Calendar className="w-3 h-3 shrink-0" />
                            {formatDateStr(evt.start_time.split(" ")[0])}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 shrink-0" />
                            {evt.start_time.split(" ")[1] || ""} ~
                          </span>
                        </div>

                        {/* Participant tags */}
                        <div className="flex flex-wrap items-center gap-1 pt-1">
                          <span className="text-[9px] text-zinc-500 font-bold shrink-0">参加メンバー:</span>
                          {evt.participants.length === 0 ? (
                            <span className="text-[9px] text-zinc-600 italic">なし</span>
                          ) : (
                            evt.participants.map((p, idx) => (
                              <span 
                                key={idx} 
                                className={`text-[9px] px-1.5 py-0.5 rounded-md font-medium border ${
                                  (discordUser && p === discordUser.name) || (!discordUser && p === "Hiro")
                                    ? "bg-violet-500/10 border-violet-500/20 text-violet-300 font-bold"
                                    : "bg-zinc-900 border-zinc-800 text-zinc-400"
                                }`}
                              >
                                {p}
                              </span>
                            ))
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Join / Leave Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => onToggleJoinEvent(evt.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                          isParticipating
                            ? "bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/20"
                            : "bg-violet-600 hover:bg-violet-500 text-white"
                        }`}
                      >
                        {isParticipating ? (
                          <>
                            <X className="w-3 h-3" />
                            <span>不参加</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3 h-3" />
                            <span>参加する</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
