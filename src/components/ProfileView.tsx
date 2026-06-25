import React, { useState } from "react";
import { Edit2, Check, X } from "lucide-react";

interface ProfileViewProps {
  favoritedGames: string[];
  profileBio: string;
  setProfileBio: (bio: string) => void;
  discordUser: { name: string; avatarUrl: string; tag: string } | null;
  setDiscordUser: (user: { name: string; avatarUrl: string; tag: string } | null) => void;
  joinedGroups: string[];
  onTriggerDiscordLogin: () => void;
}

export default function ProfileView({
  favoritedGames,
  profileBio,
  setProfileBio,
  discordUser,
  setDiscordUser,
  joinedGroups,
  onTriggerDiscordLogin
}: ProfileViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempBio, setTempBio] = useState(profileBio);

  const handleSave = () => {
    setProfileBio(tempBio);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempBio(profileBio);
    setIsEditing(false);
  };

  return (
    <div className="flex flex-col gap-6" id="profile_view">
      
      {/* Profile Card Header with custom Gamer identity */}
      <div className="bg-[#121214] border border-zinc-850 rounded-2xl overflow-hidden shadow-2xl relative" id="profile_card_header">
        
        {/* Cyberpunk banner design */}
        <div className="h-32 bg-gradient-to-r from-violet-900 via-purple-800 to-pink-700 relative overflow-hidden">
          <div className="absolute inset-0 bg-zinc-950/20" />
          <div className="absolute bottom-2 right-4 font-mono text-[9px] text-violet-300 font-bold tracking-widest opacity-40">
            {discordUser ? `DISCORD_USER_${discordUser.name.toUpperCase()}_ID_2026` : "HIRO_ELITE_ORGANIZER_ID_2026"}
          </div>
        </div>

        <div className="p-6 pt-0 flex flex-col md:flex-row items-start md:items-end gap-6 relative" id="profile_card_details">
          
          {/* Huge Avatar container */}
          <div className="relative -mt-12 shrink-0">
            {discordUser ? (
              <img
                src={discordUser.avatarUrl}
                alt={discordUser.name}
                referrerPolicy="no-referrer"
                className="w-24 h-24 rounded-2xl bg-zinc-900 border-4 border-[#121214] object-cover shadow-2xl relative"
              />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-zinc-900 border-4 border-[#121214] flex items-center justify-center font-bold text-violet-400 font-mono text-2xl overflow-hidden shadow-2xl relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-violet-600/20 to-purple-500/10" />
                HIRO
              </div>
            )}
            <div className="absolute -bottom-1.5 -right-1.5 w-5 h-5 bg-emerald-500 border-4 border-[#121214] rounded-full animate-pulse" title="ステータス: オンライン" />
          </div>

          <div className="flex-1 space-y-1.5 md:pb-1 w-full">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-xl font-extrabold text-zinc-100 tracking-tight font-display">
                {discordUser ? discordUser.name : "Hiro"}
              </h2>
              <span className="text-xs font-mono font-bold text-zinc-500 bg-zinc-950/80 px-2.5 py-0.5 rounded-full border border-zinc-800">
                #{discordUser ? discordUser.tag : "2026"}
              </span>
              <span className="text-[10px] bg-violet-500/15 text-violet-400 font-bold border border-violet-500/20 px-2.5 py-0.5 rounded-md">
                {discordUser ? "DISCORD CONNECTED" : "ELITE ORGANIZER"}
              </span>

              {discordUser ? (
                <button
                  onClick={() => setDiscordUser(null)}
                  className="text-[10px] bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-2.5 py-0.5 rounded-md cursor-pointer transition-colors"
                >
                  連携解除
                </button>
              ) : (
                <button
                  onClick={onTriggerDiscordLogin}
                  className="text-[10px] bg-violet-600 hover:bg-violet-500 text-white font-bold px-2.5 py-0.5 rounded-md cursor-pointer transition-colors"
                >
                  Discordと連携
                </button>
              )}
            </div>

            {isEditing ? (
              <div className="flex flex-col gap-2 mt-2 max-w-xl">
                <textarea
                  value={tempBio}
                  onChange={(e) => setTempBio(e.target.value)}
                  className="w-full bg-zinc-950/80 border border-violet-500/50 rounded-lg p-2.5 text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-violet-500 font-sans leading-relaxed"
                  rows={2}
                  maxLength={150}
                  placeholder="自己紹介を入力してください"
                />
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={handleCancel}
                    className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 rounded text-[11px] font-bold flex items-center gap-1 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                    キャンセル
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-2.5 py-1 bg-violet-600 hover:bg-violet-500 text-white rounded text-[11px] font-bold flex items-center gap-1 transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" />
                    保存
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2 group max-w-xl">
                <p className="text-xs text-zinc-400 italic flex-1 leading-relaxed">
                  「{profileBio}」
                </p>
                <button
                  onClick={() => {
                    setTempBio(profileBio);
                    setIsEditing(true);
                  }}
                  className="p-1 rounded bg-zinc-800/40 hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-all opacity-70 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100"
                  title="自己紹介を編集"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Profile Bento grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="profile_bento_grid">
        
        {/* Gaming Link connections */}
        <div className="bg-[#121214] border border-zinc-850 rounded-xl p-5 space-y-4" id="profile_link_connections">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-850 pb-2">
            所属・参加グループ一覧
          </h3>

          <div className="space-y-2.5">
            {joinedGroups.map((group, idx) => {
              const roles = ["管理者", "コアメンバー", "メンバー", "サポートプレイヤー"];
              const role = roles[idx % roles.length];
              const roleColors = [
                "bg-violet-500/10 text-violet-400 border-violet-500/20",
                "bg-sky-500/10 text-sky-400 border-sky-500/20",
                "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                "bg-amber-500/10 text-amber-400 border-amber-500/20"
              ];
              const roleStyle = roleColors[idx % roleColors.length];

              return (
                <div key={group} className="flex items-center justify-between p-2.5 bg-zinc-950/40 border border-zinc-850/60 rounded-xl">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-zinc-850 border border-zinc-800 flex items-center justify-center text-[10px] font-extrabold text-zinc-300 font-mono">
                      {group.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="text-xs font-semibold text-zinc-200">{group}</span>
                  </div>
                  <span className={`text-[10px] border px-2 py-0.5 rounded font-bold ${roleStyle}`}>
                    {role}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Favorite Game Tags */}
        <div className="bg-[#121214] border border-zinc-850 rounded-xl p-5 space-y-4" id="profile_gaming_pref">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-850 pb-2">
            お気に入りゲーム一覧
          </h3>

          <p className="text-xs text-zinc-400 leading-relaxed">
            お気に入りに登録されているゲームは、カレンダー画面のクイックフィルターに自動表示されます。
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            {favoritedGames.length === 0 ? (
              ["Apex Legends", "FF14", "Monster Hunter"].map((tag) => (
                <span key={tag} className="px-2.5 py-1.5 bg-zinc-950/60 border border-zinc-800 rounded-lg text-xs font-semibold text-zinc-400">
                  {tag} (デフォルト表示)
                </span>
              ))
            ) : (
              favoritedGames.map((tag) => (
                <span key={tag} className="px-2.5 py-1.5 bg-violet-600/10 border border-violet-500/30 rounded-lg text-xs font-bold text-violet-300">
                  ★ {tag}
                </span>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
