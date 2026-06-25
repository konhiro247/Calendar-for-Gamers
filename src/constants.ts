import { GameEvent, GameTag } from "./types";

export const INITIAL_EVENTS: GameEvent[] = [
  {
    id: "seed-1",
    title: "FF14 黄金のレガシー 極レイド攻略",
    game_tag: "FF14",
    start_time: "2026-06-24 21:00",
    end_time: "2026-06-24 22:30",
    description: "新レイドの1層から攻略していきます！マクロ・予習必須。通話はDiscordで行います。",
    max_participants: 8,
    participants: ["Alex", "Hiro", "Kuro", "Yuki", "Sora"],
    is_ai_extracted: false,
    server: "FF14 固定攻略チーム"
  },
  {
    id: "seed-2",
    title: "Apex Legends カジュアル練習カスタム",
    game_tag: "Apex Legends",
    start_time: "2026-06-25 20:00",
    end_time: "2026-06-25 22:00",
    description: "雑談多めでエンジョイカスタムです。初心者大歓迎！メンツ＠1募集！",
    max_participants: 3,
    participants: ["You", "Taka"],
    is_ai_extracted: true,
    raw_text_source: "明日20時からApexカスタム練習会やります！エンジョイ勢メイン、あと1人募集中です！",
    server: "Apex Legends エンジョイ部"
  },
  {
    id: "seed-3",
    title: "Valorant ダイヤ帯フルパランク",
    game_tag: "Valorant",
    start_time: "2026-06-26 22:00",
    end_time: "2026-06-26 23:30",
    description: "ダイヤ・アセンダント帯のフルパランク。現在＠2募集中！楽しく連携重視でいきましょう。",
    max_participants: 5,
    participants: ["Ken", "Mio", "Ryu"],
    is_ai_extracted: true,
    raw_text_source: "金曜日の22時〜 Valorantランク行ける人＠2募集！ダイヤ帯付近で楽しく勝ちに行きましょう！",
    server: "Valorant ランク固定"
  },
  {
    id: "seed-4",
    title: "モンハン金冠・レア素材周回",
    game_tag: "Monster Hunter",
    start_time: "2026-06-27 14:00",
    end_time: "2026-06-27 17:00",
    description: "大型モンスターの金冠を狙ってマルチで周回します。ボイチャ聞き専もOKです！",
    max_participants: 4,
    participants: ["Yuki", "You"],
    is_ai_extracted: false,
    server: "Minecraft 建築鯖"
  }
];

export const SERVERS = [
  "FF14 固定攻略チーム",
  "Apex Legends エンジョイ部",
  "Valorant ランク固定",
  "Minecraft 建築鯖",
  "その他"
];

export const SERVER_LABELS: Record<string, string> = {
  All: "すべてのグループ",
  "FF14 固定攻略チーム": "FF14 固定攻略チーム",
  "Apex Legends エンジョイ部": "Apex Legends エンジョイ部",
  "Valorant ランク固定": "Valorant ランク固定",
  "Minecraft 建築鯖": "Minecraft 建築鯖",
  "その他": "その他"
};

export const PRESETS = [
  {
    label: "Apex Legends",
    text: "明日21時からApexカスタムやるよ！メンツ＠5募集で"
  },
  {
    label: "FF14 レイド",
    text: "7/4の15時からFF14の新レイド攻略行きます。予習必須でお願いします！"
  },
  {
    label: "Valorant ランク",
    text: "来週の水曜の20時にValorantのフルパランク行こう。現在＠3です、ダイヤ帯の方で！"
  },
  {
    label: "モンハン周回",
    text: "金曜日（6/26）の22時からモンハンワイルズで大型モンスター討伐手伝ってください！あと2人入れます。"
  }
];

export const GAME_TAGS: GameTag[] = [
  "Apex Legends",
  "FF14",
  "Valorant",
  "League of Legends",
  "Monster Hunter",
  "Overwatch",
  "Minecraft",
  "General"
];

export const TAG_COLORS: Record<GameTag, { bg: string; text: string; border: string; glow: string; primary: string }> = {
  "Apex Legends": {
    bg: "bg-red-500/10",
    text: "text-red-400",
    border: "border-red-500/20",
    glow: "shadow-red-500/20",
    primary: "#ef4444"
  },
  FF14: {
    bg: "bg-sky-500/10",
    text: "text-sky-400",
    border: "border-sky-500/20",
    glow: "shadow-sky-500/20",
    primary: "#0ea5e9"
  },
  Valorant: {
    bg: "bg-teal-500/10",
    text: "text-teal-400",
    border: "border-teal-500/20",
    glow: "shadow-teal-500/20",
    primary: "#14b8a6"
  },
  "League of Legends": {
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    border: "border-amber-500/20",
    glow: "shadow-amber-500/20",
    primary: "#f59e0b"
  },
  "Monster Hunter": {
    bg: "bg-orange-500/10",
    text: "text-orange-400",
    border: "border-orange-500/20",
    glow: "shadow-orange-500/20",
    primary: "#f97316"
  },
  Overwatch: {
    bg: "bg-yellow-500/10",
    text: "text-yellow-400",
    border: "border-yellow-500/20",
    glow: "shadow-yellow-500/20",
    primary: "#eab308"
  },
  Minecraft: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/20",
    glow: "shadow-emerald-500/20",
    primary: "#10b981"
  },
  General: {
    bg: "bg-purple-500/10",
    text: "text-purple-400",
    border: "border-purple-500/20",
    glow: "shadow-purple-500/20",
    primary: "#a855f7"
  }
};
