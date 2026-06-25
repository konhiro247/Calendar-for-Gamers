import React, { useState, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  Sparkles,
  Users,
  Clock,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Filter,
  UserPlus,
  UserMinus,
  Edit,
  Tag,
  Gamepad2,
  FileText,
  X,
  RefreshCw,
  ArrowRight,
  Home,
  User,
  MessageSquare,
  MoreVertical,
  Copy,
  Settings,
  ShieldAlert
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { GameEvent, GameTag, ExtractionResult } from "./types";
import {
  INITIAL_EVENTS,
  SERVERS,
  SERVER_LABELS,
  PRESETS,
  GAME_TAGS,
  TAG_COLORS
} from "./constants";
import HomeView from "./components/HomeView";
import ProfileView from "./components/ProfileView";
import ChatParsingView from "./components/ChatParsingView";
import GroupProfileView from "./components/GroupProfileView";
import AdminView from "./components/AdminView";

// ============================================================================
// ADMIN CONFIGURATION (管理者のDiscordユーザーID / タグの初期設定プレースホルダー)
// ============================================================================
export const DEFAULT_ADMIN_DISCORD_ID = "your Discord ID";

function MiniDateTimePicker({
  label,
  value,
  onChange,
  allowTBD
}: {
  label: string;
  value: string; // YYYY-MM-DD HH:mm or "未定"
  onChange: (val: string) => void;
  allowTBD?: boolean;
}) {
  const [showCalendar, setShowCalendar] = useState(false);
  const isTBD = value === "未定";

  // Parse initial value "YYYY-MM-DD HH:mm"
  const parseValue = (valStr: string) => {
    if (valStr === "未定") {
      return { y: 2026, m: 5, d: 24, h: 21, min: 0 };
    }
    const parts = valStr.split(" ");
    const datePart = parts[0] || "2026-06-24";
    const timePart = parts[1] || "20:00";
    
    const dateSubparts = datePart.split("-");
    const y = parseInt(dateSubparts[0]) || 2026;
    const m = parseInt(dateSubparts[1]) ? parseInt(dateSubparts[1]) - 1 : 5; // 0-indexed
    const d = parseInt(dateSubparts[2]) || 24;
    
    const timeSubparts = timePart.split(":");
    const h = parseInt(timeSubparts[0]) || 20;
    const min = parseInt(timeSubparts[1]) || 0;
    
    return { y, m, d, h, min };
  };

  const { y, m, d, h, min } = parseValue(value);
  
  // Browsing state for mini calendar
  const [browseYear, setBrowseYear] = useState(y);
  const [browseMonth, setBrowseMonth] = useState(m);

  useEffect(() => {
    const parsed = parseValue(value);
    setBrowseYear(parsed.y);
    setBrowseMonth(parsed.m);
  }, [value]);

  const updateDateTime = (newY: number, newM: number, newD: number, newH: number, newMin: number) => {
    const formattedDate = `${newY}-${String(newM + 1).padStart(2, "0")}-${String(newD).padStart(2, "0")}`;
    const formattedTime = `${String(newH).padStart(2, "0")}:${String(newMin).padStart(2, "0")}`;
    onChange(`${formattedDate} ${formattedTime}`);
  };

  const daysInMonth = new Date(browseYear, browseMonth + 1, 0).getDate();
  const firstDayIndex = new Date(browseYear, browseMonth, 1).getDay();

  const handlePrevMonth = () => {
    if (browseMonth === 0) {
      setBrowseMonth(11);
      setBrowseYear(prev => prev - 1);
    } else {
      setBrowseMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (browseMonth === 11) {
      setBrowseMonth(0);
      setBrowseYear(prev => prev + 1);
    } else {
      setBrowseMonth(prev => prev + 1);
    }
  };

  const selectDay = (day: number) => {
    if (isTBD) return;
    updateDateTime(browseYear, browseMonth, day, h, min);
    setShowCalendar(false);
  };

  const handleHourChange = (newHStr: string) => {
    if (isTBD) return;
    let newH = parseInt(newHStr);
    if (isNaN(newH)) newH = 0;
    if (newH < 0) newH = 0;
    if (newH > 23) newH = 23;
    updateDateTime(y, m, d, newH, min);
  };

  const handleMinuteChange = (newMinStr: string) => {
    if (isTBD) return;
    let newMin = parseInt(newMinStr);
    if (isNaN(newMin)) newMin = 0;
    if (newMin < 0) newMin = 0;
    if (newMin > 59) newMin = 59;
    updateDateTime(y, m, d, h, newMin);
  };

  const adjustHour = (diff: number) => {
    if (isTBD) return;
    let newH = (h + diff + 24) % 24;
    updateDateTime(y, m, d, newH, min);
  };

  const adjustMinute = (diff: number) => {
    if (isTBD) return;
    let newMin = (min + diff + 60) % 60;
    updateDateTime(y, m, d, h, newMin);
  };

  const daysGrid: (number | null)[] = [];
  for (let i = 0; i < firstDayIndex; i++) {
    daysGrid.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    daysGrid.push(i);
  }

  const monthLabels = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];

  return (
    <div className="space-y-1.5 relative w-full" id={`picker-${label}`}>
      <label className="text-xs text-zinc-400 font-semibold block">{label}</label>
      <div className="flex flex-col gap-2">
        {/* Upper tier: Date Selector */}
        <div className="relative w-full">
          <button
            type="button"
            disabled={isTBD}
            onClick={() => setShowCalendar(!showCalendar)}
            className="w-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 focus:border-violet-500 rounded-lg px-3 py-2 text-xs text-white font-mono flex items-center justify-between transition-all disabled:opacity-50"
          >
            <span>{isTBD ? "未定" : `${y}/${String(m + 1).padStart(2, "0")}/${String(d).padStart(2, "0")}`}</span>
            <CalendarIcon className="h-3.5 w-3.5 text-violet-400" />
          </button>

          {showCalendar && !isTBD && (
            <div className="absolute z-50 mt-1 left-0 right-0 bg-zinc-950 border border-zinc-850 p-3 rounded-xl shadow-2xl space-y-2">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-1 rounded hover:bg-zinc-900 text-zinc-400 hover:text-white"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-xs font-bold text-zinc-200">
                  {browseYear}年 {monthLabels[browseMonth]}
                </span>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-1 rounded hover:bg-zinc-900 text-zinc-400 hover:text-white"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-0.5 text-center text-[10px] font-bold text-zinc-500">
                <div className="text-rose-500">日</div>
                <div>月</div>
                <div>火</div>
                <div>水</div>
                <div>木</div>
                <div>金</div>
                <div className="text-sky-400">土</div>
              </div>

              <div className="grid grid-cols-7 gap-0.5">
                {daysGrid.map((dayNum, idx) => {
                  if (dayNum === null) {
                    return <div key={`empty-${idx}`} />;
                  }
                  const isSel = dayNum === d && browseMonth === m && browseYear === y;
                  return (
                    <button
                      type="button"
                      key={`day-${idx}`}
                      onClick={() => selectDay(dayNum)}
                      className={`text-[10px] font-medium p-1 rounded transition-all ${
                        isSel
                          ? "bg-violet-600 text-white font-bold"
                          : "text-zinc-300 hover:bg-zinc-900 hover:text-white"
                      }`}
                    >
                      {dayNum}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Lower tier: Time Selector with arrows above/below the numbers */}
        <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1 w-full justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-zinc-500 font-bold uppercase select-none">時間:</span>
            
            <div className="flex items-center gap-1">
              {/* Hour Stack */}
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => adjustHour(1)}
                  disabled={isTBD}
                  className="text-zinc-500 hover:text-violet-400 focus:outline-none transition-colors disabled:opacity-30 disabled:hover:text-zinc-500 p-0.5"
                  title="時を増やす"
                >
                  <ChevronUp className="h-3 w-3" />
                </button>
                <input
                  type="text"
                  value={isTBD ? "--" : String(h).padStart(2, "0")}
                  onChange={(e) => handleHourChange(e.target.value)}
                  disabled={isTBD}
                  className="w-8 bg-zinc-950 border border-zinc-800 text-center font-mono text-xs text-white rounded py-0.5 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 disabled:opacity-40"
                  maxLength={2}
                />
                <button
                  type="button"
                  onClick={() => adjustHour(-1)}
                  disabled={isTBD}
                  className="text-zinc-500 hover:text-violet-400 focus:outline-none transition-colors disabled:opacity-30 disabled:hover:text-zinc-500 p-0.5"
                  title="時を減らす"
                >
                  <ChevronDown className="h-3 w-3" />
                </button>
              </div>

              <span className="text-zinc-600 text-xs font-bold select-none self-center pt-0.5">:</span>

              {/* Minute Stack */}
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => adjustMinute(5)}
                  disabled={isTBD}
                  className="text-zinc-500 hover:text-violet-400 focus:outline-none transition-colors disabled:opacity-30 disabled:hover:text-zinc-500 p-0.5"
                  title="分を増やす"
                >
                  <ChevronUp className="h-3 w-3" />
                </button>
                <input
                  type="text"
                  value={isTBD ? "--" : String(min).padStart(2, "0")}
                  onChange={(e) => handleMinuteChange(e.target.value)}
                  disabled={isTBD}
                  className="w-8 bg-zinc-950 border border-zinc-800 text-center font-mono text-xs text-white rounded py-0.5 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 disabled:opacity-40"
                  maxLength={2}
                />
                <button
                  type="button"
                  onClick={() => adjustMinute(-5)}
                  disabled={isTBD}
                  className="text-zinc-500 hover:text-violet-400 focus:outline-none transition-colors disabled:opacity-30 disabled:hover:text-zinc-500 p-0.5"
                  title="分を減らす"
                >
                  <ChevronDown className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>

          <span className="text-[9px] text-zinc-500 font-mono select-none hidden sm:inline">
            {isTBD ? "時間未定" : "矢印キーで増減"}
          </span>
        </div>

        {/* TBD Option Checkbox */}
        {allowTBD && (
          <label className="flex items-center gap-1.5 cursor-pointer mt-0.5 bg-zinc-900/40 hover:bg-zinc-900/60 px-2 py-1 rounded border border-zinc-850 transition-colors select-none">
            <input
              type="checkbox"
              checked={isTBD}
              onChange={(e) => {
                if (e.target.checked) {
                  onChange("未定");
                } else {
                  onChange("2026-06-24 21:00");
                }
              }}
              className="accent-violet-600 rounded cursor-pointer w-3.5 h-3.5 shrink-0"
            />
            <span className="text-[10px] text-zinc-300 font-semibold">終了時間を「未定」にする</span>
          </label>
        )}
      </div>
    </div>
  );
}

export default function App() {
  // Persistence state
  const [events, setEvents] = useState<GameEvent[]>(() => {
    const saved = localStorage.getItem("gamer_calendar_events");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error loading events", e);
      }
    }
    return INITIAL_EVENTS;
  });

  useEffect(() => {
    localStorage.setItem("gamer_calendar_events", JSON.stringify(events));
  }, [events]);

  // UI state
  const [activeSidebarTab, setActiveSidebarTab] = useState<"home" | "calendar" | "chat" | "profile" | "group" | "admin">("home");
  const [activeTab, setActiveTab] = useState<"calendar" | "list">("calendar");
  const [calendarView, setCalendarView] = useState<"month" | "week">("month");
  const [selectedTag, setSelectedTag] = useState<string>("All");
  const [selectedServer, setSelectedServer] = useState<string>("All");
  const [showGameDropdown, setShowGameDropdown] = useState(false);
  const [showServerDropdown, setShowServerDropdown] = useState(false);
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 5, 24)); // Anchor to June 24, 2026

  // Admin Discord ID/Tag state
  const [adminDiscordId, setAdminDiscordId] = useState<string>(() => {
    const saved = localStorage.getItem("gamer_calendar_admin_discord_id");
    return saved || DEFAULT_ADMIN_DISCORD_ID;
  });

  // Discord OAuth2 App Client ID and Secret states
  const [discordClientId, setDiscordClientId] = useState<string>(() => {
    return localStorage.getItem("gamer_calendar_discord_client_id") || "";
  });
  const [discordClientSecret, setDiscordClientSecret] = useState<string>(() => {
    return localStorage.getItem("gamer_calendar_discord_client_secret") || "";
  });

  // Discord user state
  const [discordUser, setDiscordUser] = useState<{ name: string; avatarUrl: string; tag: string } | null>(() => {
    const saved = localStorage.getItem("gamer_calendar_discord_user");
    return saved ? JSON.parse(saved) : null;
  });

  const isAdmin = discordUser && (discordUser.tag === adminDiscordId || discordUser.name === adminDiscordId);

  const setDiscordUserAndPersist = (user: { name: string; avatarUrl: string; tag: string } | null) => {
    setDiscordUser(user);
    if (user) {
      localStorage.setItem("gamer_calendar_discord_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("gamer_calendar_discord_user");
    }
  };

  // Group list state
  const [joinedGroups, setJoinedGroups] = useState<string[]>(() => {
    const saved = localStorage.getItem("gamer_calendar_joined_groups");
    return saved ? JSON.parse(saved) : [
      "FF14 固定攻略チーム",
      "Apex Legends エンジョイ部",
      "Valorant ランク固定",
      "Minecraft 建築鯖"
    ];
  });

  // Created groups (to determine ownership - only creator/owner can modify settings)
  const [createdGroups, setCreatedGroups] = useState<string[]>(() => {
    const saved = localStorage.getItem("gamer_calendar_created_groups");
    return saved ? JSON.parse(saved) : [];
  });

  // Group Invitation Codes map
  const [groupInviteCodes, setGroupInviteCodes] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem("gamer_calendar_group_invite_codes");
    if (saved) return JSON.parse(saved);
    return {
      "FF14 固定攻略チーム": "GC-FF14CO",
      "Apex Legends エンジョイ部": "GC-APEXEN",
      "Valorant ランク固定": "GC-VALOR",
      "Minecraft 建築鯖": "GC-MINEC"
    };
  });

  // Group Overviews map
  const [groupOverviews, setGroupOverviews] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem("gamer_calendar_group_overviews");
    if (saved) return JSON.parse(saved);
    return {
      "FF14 固定攻略チーム": "ファイナルファンタジーXIVのレイド・討伐戦攻略のための固定グループです。毎週の攻略予定を調整・共有します。",
      "Apex Legends エンジョイ部": "Apex Legendsを気軽にカジュアルやランク、カスタムマッチで楽しむためのサークルです。初心者歓迎！",
      "Valorant ランク固定": "VALORANTのフルパーティー・コンペティティブ攻略グループ。各ロール・マップの戦術や予定を合わせます。",
      "Minecraft 建築鯖": "マインクラフトの建築共有サーバー用グループ。みんなで作り上げる大規模建築の進捗や作業時間を調整します。"
    };
  });

  // Invitation-code based join form toggle and text field state
  const [showJoinGroupInput, setShowJoinGroupInput] = useState(false);
  const [joinGroupCode, setJoinGroupCode] = useState("");

  // States to control active context menu and configuration modal
  const [activeGroupMenu, setActiveGroupMenu] = useState<string | null>(null);
  const [showGroupSettingsModal, setShowGroupSettingsModal] = useState<string | null>(null);
  const [settingsGroupName, setSettingsGroupName] = useState("");

  const [isGroupsExpanded, setIsGroupsExpanded] = useState(true);
  const [showAddGroupInput, setShowAddGroupInput] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [showDiscordLoginModal, setShowDiscordLoginModal] = useState(false);

  // For simulation login inputs
  const [discordLoginName, setDiscordLoginName] = useState("Hiro");
  const [selectedDiscordAvatar, setSelectedDiscordAvatar] = useState("https://cdn.discordapp.com/embed/avatars/0.png");

  // Favorite Games State
  const [favoritedGames, setFavoritedGames] = useState<string[]>(() => {
    const saved = localStorage.getItem("gamer_calendar_favorited_games");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error loading favorited games", e);
      }
    }
    return [];
  });

  const [isEditingFavorites, setIsEditingFavorites] = useState(false);

  // Profile Bio State
  const [profileBio, setProfileBio] = useState<string>(() => {
    const saved = localStorage.getItem("gamer_calendar_profile_bio");
    return saved !== null ? saved : "Apexカスタム、FF14レイド攻略、モンハンマルチを幅広く活動中。予定のパースはお任せあれ！";
  });

  useEffect(() => {
    localStorage.setItem("gamer_calendar_profile_bio", profileBio);
  }, [profileBio]);

  useEffect(() => {
    localStorage.setItem("gamer_calendar_favorited_games", JSON.stringify(favoritedGames));
  }, [favoritedGames]);

  useEffect(() => {
    localStorage.setItem("gamer_calendar_joined_groups", JSON.stringify(joinedGroups));
  }, [joinedGroups]);

  useEffect(() => {
    localStorage.setItem("gamer_calendar_created_groups", JSON.stringify(createdGroups));
  }, [createdGroups]);

  useEffect(() => {
    localStorage.setItem("gamer_calendar_group_invite_codes", JSON.stringify(groupInviteCodes));
  }, [groupInviteCodes]);

  useEffect(() => {
    localStorage.setItem("gamer_calendar_group_overviews", JSON.stringify(groupOverviews));
  }, [groupOverviews]);

  // Helper to generate unique invite codes for groups
  const generateInviteCode = (groupName: string) => {
    const cleanPrefix = groupName.replace(/[^a-zA-Z0-9ぁ-んァ-ヶ一-龠]/g, "").slice(0, 3).toUpperCase();
    const hex = Math.floor(1000 + Math.random() * 9000).toString();
    return `GC-${cleanPrefix || "GRP"}-${hex}`;
  };

  // Extraction state
  const [inputText, setInputText] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionError, setExtractionError] = useState<string | null>(null);
  const [extractedEvent, setExtractedEvent] = useState<Partial<GameEvent> | null>(null);

  // Manual event modal/drawer state
  const [showManualForm, setShowManualForm] = useState(false);
  const [isCustomGame, setIsCustomGame] = useState(false);
  const [formEvent, setFormEvent] = useState<Partial<GameEvent>>({
    title: "",
    game_tag: "General",
    start_time: "2026-06-24 20:00",
    end_time: "2026-06-24 21:00",
    description: "",
    max_participants: null,
    participants: ["You"],
    server: "メインDiscordサーバー"
  });

  useEffect(() => {
    if (showManualForm) {
      if (formEvent.game_tag && !GAME_TAGS.includes(formEvent.game_tag as any)) {
        setIsCustomGame(true);
      } else {
        setIsCustomGame(false);
      }
    }
  }, [showManualForm]);

  // Selected event modal details
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  // Toast notification state
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  // Custom confirmation modal state
  const [confirmModal, setConfirmModal] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Pre-fill text with preset
  const handleUsePreset = (text: string) => {
    setInputText(text);
    setExtractionError(null);
    setExtractedEvent(null);
  };

  // Perform AI extraction call to our backend endpoint
  const handleExtractWithAI = async () => {
    if (!inputText.trim()) {
      setExtractionError("解析するテキストを入力してください。");
      return;
    }

    setIsExtracting(true);
    setExtractionError(null);
    setExtractedEvent(null);

    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ text: inputText })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "スケジュール抽出に失敗しました。");
      }

      const parsed: ExtractionResult = await res.json();

      // Normalize tag
      let matchedTag: GameTag = "General";
      const normalizedTagInput = parsed.game_tag.toLowerCase().replace(/\s+/g, "");
      
      for (const tag of GAME_TAGS) {
        const nTag = tag.toLowerCase().replace(/\s+/g, "");
        if (nTag.includes(normalizedTagInput) || normalizedTagInput.includes(nTag)) {
          matchedTag = tag;
          break;
        }
      }

      // Prepare standard temporary game event
      const newExtracted: Partial<GameEvent> = {
        title: parsed.title || "無題のゲームセッション",
        game_tag: matchedTag,
        start_time: parsed.start_time,
        end_time: parsed.end_time,
        description: parsed.description,
        max_participants: parsed.max_participants,
        participants: ["You"], // Owner automatically joins
        is_ai_extracted: true,
        raw_text_source: inputText,
        server: parsed.server || "メインDiscordサーバー"
      };

      setExtractedEvent(newExtracted);
      showToast("AI解析が完了しました！内容を確認してください。", "success");
    } catch (err: any) {
      console.error(err);
      setExtractionError(err.message || "AI接続に失敗しました。時間をおいて再度お試しください。");
      showToast("AI解析に失敗しました。", "error");
    } finally {
      setIsExtracting(false);
    }
  };

  // Save the extracted event to calendar
  const handleSaveExtracted = () => {
    if (!extractedEvent) return;

    const finalEvent: GameEvent = {
      id: `ai-${Date.now()}`,
      title: extractedEvent.title || "無題のゲームセッション",
      game_tag: (extractedEvent.game_tag as GameTag) || "General",
      start_time: extractedEvent.start_time || "2026-06-24 20:00",
      end_time: extractedEvent.end_time || "2026-06-24 21:00",
      description: extractedEvent.description || "",
      max_participants: extractedEvent.max_participants !== undefined ? extractedEvent.max_participants : null,
      participants: extractedEvent.participants || ["You"],
      is_ai_extracted: true,
      raw_text_source: extractedEvent.raw_text_source,
      server: extractedEvent.server || "メインDiscordサーバー"
    };

    setEvents((prev) => [finalEvent, ...prev]);
    setExtractedEvent(null);
    setInputText("");
    showToast("カレンダーにイベントを追加しました！", "success");
  };

  // Save manually created/edited event
  const handleSaveManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEvent.title) {
      showToast("イベントタイトルを入力してください。", "error");
      return;
    }

    const finalEvent: GameEvent = {
      id: formEvent.id || `manual-${Date.now()}`,
      title: formEvent.title,
      game_tag: (formEvent.game_tag as GameTag) || "General",
      start_time: formEvent.start_time || "2026-06-24 20:00",
      end_time: formEvent.end_time || "2026-06-24 21:00",
      description: formEvent.description || "",
      max_participants: formEvent.max_participants !== undefined ? formEvent.max_participants : null,
      participants: formEvent.participants || ["You"],
      is_ai_extracted: formEvent.is_ai_extracted || false,
      server: formEvent.server || "メインDiscordサーバー"
    };

    if (formEvent.id) {
      // Edit existing
      setEvents((prev) => prev.map((item) => (item.id === formEvent.id ? finalEvent : item)));
      showToast("イベントを更新しました！", "success");
    } else {
      // Add new
      setEvents((prev) => [finalEvent, ...prev]);
      showToast("イベントをカレンダーに追加しました！", "success");
    }

    setShowManualForm(false);
    setFormEvent({
      title: "",
      game_tag: "General",
      start_time: "2026-06-24 20:00",
      end_time: "2026-06-24 21:00",
      description: "",
      max_participants: null,
      participants: ["You"],
      server: "メインDiscordサーバー"
    });
  };

  // Open edit form
  const handleOpenEdit = (evt: GameEvent) => {
    setFormEvent(evt);
    setShowManualForm(true);
    setSelectedEventId(null);
  };

  // Delete event
  const handleDeleteEvent = (id: string) => {
    setConfirmModal({
      title: "イベントの削除",
      message: "このイベントを削除してもよろしいですか？",
      onConfirm: () => {
        setEvents((prev) => prev.filter((item) => item.id !== id));
        setSelectedEventId(null);
        showToast("イベントを削除しました。", "info");
      }
    });
  };

  // Toggle Join/Leave Session
  const handleToggleJoin = (id: string) => {
    setEvents((prev) =>
      prev.map((evt) => {
        if (evt.id !== id) return evt;
        const joined = evt.participants.includes("You");
        let updatedParticipants = [...evt.participants];

        if (joined) {
          updatedParticipants = updatedParticipants.filter((p) => p !== "You");
          showToast("セッションへの参加をキャンセルしました。", "info");
        } else {
          if (evt.max_participants !== null && evt.participants.length >= evt.max_participants) {
            showToast("募集人数が上限に達しているため参加できません。", "error");
            return evt;
          }
          updatedParticipants.push("You");
          showToast("セッションに参加しました！盛り上げていきましょう！", "success");
        }
        return { ...evt, participants: updatedParticipants };
      })
    );
  };

  // Filter events by Tag and Server
  const filteredEvents = events.filter((evt) => {
    const matchesTag = selectedTag === "All" || evt.game_tag === selectedTag;
    const matchesServer = selectedServer === "All" || (evt.server || "Other") === selectedServer;
    return matchesTag && matchesServer;
  });

  const displayedGameTags = favoritedGames.length > 0 
    ? favoritedGames 
    : ["Apex Legends", "FF14", "Monster Hunter"];

  const toggleFavoriteGame = (tag: string) => {
    setFavoritedGames((prev) => {
      const isFav = prev.includes(tag);
      const updated = isFav ? prev.filter((t) => t !== tag) : [...prev, tag];
      
      // If the current selected tag is no longer displayed, reset to "All"
      const nextDisplayed = updated.length > 0 ? updated : ["Apex Legends", "FF14", "Monster Hunter"];
      if (selectedTag !== "All" && !nextDisplayed.includes(selectedTag)) {
        setSelectedTag("All");
      }
      return updated;
    });
  };

  // Calendar Utility Methods
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  // Setup Month details
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 5 = June
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayIndex = getFirstDayOfMonth(year, month);

  // Month navigation
  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };
  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };
  const resetToToday = () => {
    setCurrentDate(new Date(2026, 5, 24)); // Reset to Wednesday June 24, 2026
  };

  // Format month name in Japanese
  const monthNamesJp = [
    "1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"
  ];

  // Map dates in month grid
  const daysGrid: (number | null)[] = [];
  for (let i = 0; i < firstDayIndex; i++) {
    daysGrid.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    daysGrid.push(d);
  }

  // Find events for a specific day in the month
  const getEventsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return filteredEvents.filter((evt) => evt.start_time.startsWith(dateStr));
  };

  // Setup Weekly View starting from Monday of the week containing current day
  const getWeeklyDates = (date: Date) => {
    const currentDayOfWeek = date.getDay(); // 0 is Sunday, 1 is Monday
    const distanceToMonday = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
    const monday = new Date(date);
    monday.setDate(date.getDate() + distanceToMonday);

    const week: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const nextDay = new Date(monday);
      nextDay.setDate(monday.getDate() + i);
      week.push(nextDay);
    }
    return week;
  };

  const weeklyDates = getWeeklyDates(currentDate);

  return (
    <div className="min-h-screen bg-[#09090b] text-[#fafafa] flex flex-col selection:bg-violet-600 selection:text-white" id="main_container">
      {/* Toast notifications */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border ${
              toast.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                : toast.type === "error"
                ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
                : "bg-violet-500/10 border-violet-500/20 text-violet-400"
            }`}
            id="toast_notification"
          >
            {toast.type === "success" ? (
              <CheckCircle className="h-5 w-5 text-emerald-400" />
            ) : toast.type === "error" ? (
              <AlertCircle className="h-5 w-5 text-rose-400" />
            ) : (
              <HelpCircle className="h-5 w-5 text-indigo-400" />
            )}
            <p className="text-sm font-medium mr-1">{toast.message}</p>
            <button
              onClick={() => setToast(null)}
              className="p-0.5 rounded hover:bg-white/10 text-current/60 hover:text-current transition-colors cursor-pointer shrink-0 ml-1"
              title="閉じる"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Layout Area with Left Sidebar */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 bg-[#09090b]" id="app_body_layout">
        
        {/* Left Sidebar */}
        <aside className="w-full lg:w-64 bg-[#0c0c0e] border-b lg:border-b-0 lg:border-r border-[#1f1f23] p-4 lg:p-6 flex flex-col gap-6 shrink-0 lg:h-screen lg:sticky lg:top-0 justify-between" id="left_navigation_sidebar">
          
          <div className="flex flex-col gap-6">
            {/* App title logo on sidebar */}
            <div className="hidden lg:flex flex-col gap-1 pb-4 border-b border-[#1f1f23]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center text-white shadow-lg shadow-violet-500/20">
                  <Gamepad2 className="w-4.5 h-4.5" />
                </div>
                <span className="font-bold text-sm tracking-tight text-white">PartyUp!</span>
              </div>
            </div>

            {/* Sidebar Navigation Tabs - horizontal scrolling on mobile, vertical list on desktop */}
            <nav className="flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible pb-1 lg:pb-0 scrollbar-none w-full" id="sidebar_nav">
              <button
                onClick={() => setActiveSidebarTab("home")}
                className={`flex-1 lg:flex-initial flex items-center justify-center lg:justify-start gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                  activeSidebarTab === "home"
                    ? "bg-violet-600 text-white shadow-lg shadow-violet-600/10 font-bold"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40"
                }`}
              >
                <Home className="h-4 w-4" />
                <span className="flex-1 text-left hidden lg:inline">ホーム</span>
                <span className="inline lg:hidden">ホーム</span>
              </button>

              <button
                onClick={() => setActiveSidebarTab("calendar")}
                className={`flex-1 lg:flex-initial flex items-center justify-center lg:justify-start gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                  activeSidebarTab === "calendar"
                    ? "bg-violet-600 text-white shadow-lg shadow-violet-600/10 font-bold"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40"
                }`}
              >
                <CalendarIcon className="h-4 w-4" />
                <span className="flex-1 text-left hidden lg:inline">カレンダー</span>
                <span className="inline lg:hidden">カレンダー</span>
                <span className="hidden lg:inline-block bg-zinc-800 text-[10px] text-zinc-400 px-2 py-0.5 rounded font-mono font-bold">
                  {events.length}
                </span>
              </button>

              <button
                onClick={() => setActiveSidebarTab("chat")}
                className={`flex-1 lg:flex-initial flex items-center justify-center lg:justify-start gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                  activeSidebarTab === "chat"
                    ? "bg-violet-600 text-white shadow-lg shadow-violet-600/10 font-bold"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40"
                }`}
              >
                <MessageSquare className="h-4 w-4 text-violet-400" />
                <span className="flex-1 text-left hidden lg:inline">チャット認識 (AI)</span>
                <span className="inline lg:hidden">チャット認識</span>
                <span className="hidden lg:inline-block bg-violet-500/10 text-violet-400 border border-violet-500/20 text-[9px] px-1.5 py-0.5 rounded font-bold">
                  AI
                </span>
              </button>

              {isAdmin && (
                <button
                  onClick={() => setActiveSidebarTab("admin")}
                  className={`flex-1 lg:flex-initial flex items-center justify-center lg:justify-start gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                    activeSidebarTab === "admin"
                      ? "bg-red-600 text-white shadow-lg shadow-red-600/10 font-bold"
                      : "text-red-400 hover:text-red-300 hover:bg-red-950/20"
                  }`}
                >
                  <ShieldAlert className="h-4 w-4" />
                  <span className="flex-1 text-left hidden lg:inline">管理者パネル</span>
                  <span className="inline lg:hidden font-bold">管理パネル</span>
                </button>
              )}



              {!discordUser && (
                <button
                  onClick={() => setShowDiscordLoginModal(true)}
                  className="lg:hidden flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer text-violet-400 hover:text-violet-300 hover:bg-violet-500/10 border border-violet-500/20"
                >
                  <span>ログイン</span>
                </button>
              )}
            </nav>

            {/* Groups Section (グループ一覧) */}
            <div className="hidden lg:flex flex-col gap-2 border-t border-zinc-800/60 pt-4" id="sidebar_groups_section">
              <div className="flex items-center justify-between px-1">
                <button
                  onClick={() => setIsGroupsExpanded(!isGroupsExpanded)}
                  className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-bold uppercase tracking-wider hover:text-zinc-300 transition-colors"
                >
                  <Users className="h-3.5 w-3.5 text-violet-400" />
                  <span>グループ一覧</span>
                  <span className="text-[8px] opacity-70">
                    {isGroupsExpanded ? "▼" : "▶"}
                  </span>
                </button>
                
                <div className="flex items-center gap-1">
                  {/* Join Group via Invite Code toggle */}
                  <button
                    onClick={() => {
                      setShowJoinGroupInput(!showJoinGroupInput);
                      setShowAddGroupInput(false);
                    }}
                    className={`p-1 rounded transition-colors cursor-pointer ${
                      showJoinGroupInput ? "bg-violet-600/20 text-violet-400" : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-850"
                    }`}
                    title="招待コードでグループに参加"
                  >
                    <UserPlus className="h-3.5 w-3.5" />
                  </button>

                  {/* Add Group inline toggle */}
                  <button
                    onClick={() => {
                      setShowAddGroupInput(!showAddGroupInput);
                      setShowJoinGroupInput(false);
                    }}
                    className={`p-1 rounded transition-colors cursor-pointer ${
                      showAddGroupInput ? "bg-violet-600/20 text-violet-400" : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-850"
                    }`}
                    title="グループを作成"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Inline Add Group Form */}
              {showAddGroupInput && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const trimmed = newGroupName.trim();
                    if (trimmed && !joinedGroups.includes(trimmed)) {
                      const updated = [...joinedGroups, trimmed];
                      setJoinedGroups(updated);
                      
                      // Mark as owner/creator
                      setCreatedGroups([...createdGroups, trimmed]);
                      
                      // Assign a unique invite code
                      const inviteCode = generateInviteCode(trimmed);
                      setGroupInviteCodes({
                        ...groupInviteCodes,
                        [trimmed]: inviteCode
                      });

                      setNewGroupName("");
                      setShowAddGroupInput(false);
                      setToast({ message: `グループ「${trimmed}」を作成しました！ 招待コード: ${inviteCode}`, type: "success" });
                    } else if (trimmed) {
                      setToast({ message: `すでに同じ名前のグループが存在します。`, type: "error" });
                    }
                  }}
                  className="px-1 mt-1 flex gap-1.5"
                >
                  <input
                    type="text"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="新しいグループ名"
                    className="flex-1 bg-zinc-950 border border-zinc-800 focus:border-violet-500/50 rounded px-2 py-1 text-xs text-zinc-200 outline-none"
                    autoFocus
                    maxLength={20}
                  />
                  <button
                    type="submit"
                    className="bg-violet-600 hover:bg-violet-500 text-white rounded px-2 py-1 text-xs font-bold transition-colors cursor-pointer"
                  >
                    作成
                  </button>
                </form>
              )}

              {/* Inline Join Group Form */}
              {showJoinGroupInput && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const code = joinGroupCode.trim().toUpperCase();
                    if (!code) return;

                    // Match existing invite codes
                    let matchedGroupName = Object.keys(groupInviteCodes).find(
                      (grp) => groupInviteCodes[grp].toUpperCase() === code
                    );

                    if (matchedGroupName) {
                      if (joinedGroups.includes(matchedGroupName)) {
                        setToast({ message: `すでに「${matchedGroupName}」に参加しています。`, type: "info" });
                      } else {
                        setJoinedGroups([...joinedGroups, matchedGroupName]);
                        setToast({ message: `グループ「${matchedGroupName}」に参加しました！`, type: "success" });
                        setJoinGroupCode("");
                        setShowJoinGroupInput(false);
                      }
                    } else {
                      // Creative simulator for unrecognized GC-XXXX codes or custom user codes
                      let simulatedName = "";
                      if (code.startsWith("GC-")) {
                        const sfx = code.split("-")[1] || code.replace("GC-", "");
                        simulatedName = `${sfx.slice(0, 4)} 連合チーム`;
                      } else {
                        simulatedName = `${code}クラン`;
                      }

                      if (joinedGroups.includes(simulatedName)) {
                        setToast({ message: `すでに「${simulatedName}」に参加しています。`, type: "info" });
                      } else {
                        setJoinedGroups([...joinedGroups, simulatedName]);
                        setGroupInviteCodes({
                          ...groupInviteCodes,
                          [simulatedName]: code
                        });
                        setToast({ message: `招待コードから「${simulatedName}」を作成して参加しました！`, type: "success" });
                        setJoinGroupCode("");
                        setShowJoinGroupInput(false);
                      }
                    }
                  }}
                  className="px-1 mt-1 flex gap-1.5"
                >
                  <input
                    type="text"
                    value={joinGroupCode}
                    onChange={(e) => setJoinGroupCode(e.target.value)}
                    placeholder="招待コード (GC-XXXX)"
                    className="flex-1 bg-zinc-950 border border-zinc-800 focus:border-violet-500/50 rounded px-2 py-1 text-xs text-zinc-200 outline-none placeholder-zinc-650 uppercase font-mono"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="bg-violet-600 hover:bg-violet-500 text-white rounded px-2 py-1 text-xs font-bold transition-colors cursor-pointer"
                  >
                    参加
                  </button>
                </form>
              )}

              {isGroupsExpanded && (
                <div className="flex flex-col gap-1 mt-1" id="sidebar_groups_list">
                  {joinedGroups.map((group) => {
                    const isSelected = selectedServer === group;
                    const isOwner = createdGroups.includes(group);
                    return (
                      <div
                        key={group}
                        className="group/item relative flex items-center justify-between w-full rounded-lg hover:bg-zinc-900/45 transition-colors"
                      >
                        <button
                          onClick={() => {
                            setSelectedServer(group);
                            setActiveSidebarTab("group");
                          }}
                          className={`flex-1 flex items-center gap-2 px-2 py-1.5 rounded-l-lg text-left text-xs font-medium transition-all cursor-pointer truncate ${
                            isSelected
                              ? "text-violet-300 font-semibold"
                              : "text-zinc-400 hover:text-zinc-200"
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-mono font-extrabold transition-all shrink-0 ${
                            isSelected ? "bg-violet-600 text-white" : "bg-zinc-900 text-zinc-500"
                          }`}>
                            {group.slice(0, 2).toUpperCase()}
                          </div>
                          <span className="truncate flex-1">{group}</span>
                          {isOwner && (
                            <span className="text-[8px] bg-violet-500/10 text-violet-400 border border-violet-500/20 px-1 rounded transform scale-90 shrink-0 select-none">
                              オーナー
                            </span>
                          )}
                        </button>

                        {/* Actions 3-dot Button */}
                        <div className="relative shrink-0 pr-1 flex items-center">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveGroupMenu(activeGroupMenu === group ? null : group);
                            }}
                            className={`p-1 rounded opacity-0 group-hover/item:opacity-100 focus:opacity-100 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-all cursor-pointer ${
                              activeGroupMenu === group ? "opacity-100 bg-zinc-800" : ""
                            }`}
                            title="グループメニュー"
                          >
                            <MoreVertical className="h-3.5 w-3.5" />
                          </button>

                          {/* Individual Context Popover */}
                          {activeGroupMenu === group && (
                            <>
                              <div
                                className="fixed inset-0 z-[40]"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveGroupMenu(null);
                                }}
                              />
                              <div className="absolute right-0 top-7 z-[50] bg-zinc-950 border border-zinc-800 rounded-lg p-1.5 shadow-2xl min-w-[170px] flex flex-col gap-1 text-left">
                                {/* Share Code Header */}
                                <div className="px-2 py-1 border-b border-zinc-900 pb-1.5 mb-1 text-left">
                                  <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">共有コード</div>
                                  <div className="flex items-center justify-between gap-1 mt-0.5">
                                    <span className="font-mono text-xs font-bold text-violet-400 select-all truncate max-w-[100px]">
                                      {groupInviteCodes[group] || "GC-SHARED"}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const code = groupInviteCodes[group] || "GC-SHARED";
                                        navigator.clipboard.writeText(code);
                                        setToast({ message: "共有コードをクリップボードにコピーしました！", type: "success" });
                                        setActiveGroupMenu(null);
                                      }}
                                      className="p-1 rounded hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
                                      title="コードをコピー"
                                    >
                                      <Copy className="h-3 w-3" />
                                    </button>
                                  </div>
                                </div>

                                {/* Settings Option */}
                                {isOwner ? (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSettingsGroupName(group);
                                      setShowGroupSettingsModal(group);
                                      setActiveGroupMenu(null);
                                    }}
                                    className="w-full text-left px-2 py-1.5 text-xs text-zinc-300 hover:bg-zinc-900 hover:text-white rounded flex items-center gap-1.5 cursor-pointer transition-colors"
                                  >
                                    <Settings className="h-3.5 w-3.5 text-violet-400" />
                                    <span>グループ設定</span>
                                  </button>
                                ) : (
                                  <div className="w-full text-left px-2 py-1.5 text-[10px] text-zinc-500 bg-zinc-950 rounded flex items-center gap-1.5 select-none opacity-60">
                                    <Settings className="h-3.5 w-3.5 text-zinc-600" />
                                    <span>設定 (オーナー限定)</span>
                                  </div>
                                )}

                                {/* Delete or Exit Option */}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveGroupMenu(null);
                                    if (isOwner) {
                                      setConfirmModal({
                                        title: "グループ削除の確認",
                                        message: `本当にグループ「${group}」を削除しますか？\n(グループに所属するスケジュールも影響を受ける場合があります)`,
                                        onConfirm: () => {
                                          setJoinedGroups(joinedGroups.filter((g) => g !== group));
                                          setCreatedGroups(createdGroups.filter((g) => g !== group));
                                          if (selectedServer === group) {
                                            setSelectedServer("All");
                                            setActiveSidebarTab("home");
                                          }
                                          setToast({ message: `グループ「${group}」を削除しました。`, type: "success" });
                                        }
                                      });
                                    } else {
                                      setConfirmModal({
                                        title: "グループ脱退の確認",
                                        message: `本当にグループ「${group}」から脱退しますか？`,
                                        onConfirm: () => {
                                          setJoinedGroups(joinedGroups.filter((g) => g !== group));
                                          if (selectedServer === group) {
                                            setSelectedServer("All");
                                            setActiveSidebarTab("home");
                                          }
                                          setToast({ message: `グループ「${group}」から脱退しました。`, type: "success" });
                                        }
                                      });
                                    }
                                  }}
                                  className="w-full text-left px-2 py-1.5 text-xs text-red-400 hover:bg-red-500/10 rounded flex items-center gap-1.5 cursor-pointer transition-colors border-t border-zinc-900 mt-1 pt-1.5"
                                >
                                  {isOwner ? (
                                    <>
                                      <Trash2 className="h-3.5 w-3.5" />
                                      <span>グループを削除</span>
                                    </>
                                  ) : (
                                    <>
                                      <X className="h-3.5 w-3.5" />
                                      <span>グループを脱退</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Desktop Bottom Section: Discord Login / Profile */}
          <div className="hidden lg:flex flex-col gap-3 mt-auto pt-4 border-t border-zinc-800/60" id="sidebar_bottom_widget">
            {isAdmin && (
              <button
                type="button"
                onClick={() => setActiveSidebarTab("admin")}
                className={`w-full py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
                  activeSidebarTab === "admin"
                    ? "bg-red-600 text-white border-red-500 shadow-red-600/15"
                    : "bg-red-950/20 hover:bg-red-950/40 text-red-400 border-red-900/30 hover:border-red-500/30"
                }`}
              >
                <ShieldAlert className="h-4 w-4 animate-pulse" />
                <span>管理者コントロールパネル</span>
              </button>
            )}
            {discordUser ? (
              <div 
                onClick={() => setActiveSidebarTab("profile")}
                className="flex items-center justify-between p-2 rounded-xl bg-zinc-950/40 border border-zinc-850/60 hover:border-violet-500/30 hover:bg-zinc-900/90 cursor-pointer transition-all duration-300 group shadow-md"
                title="プロフィールを表示"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="relative shrink-0">
                    <img
                      src={discordUser.avatarUrl}
                      alt={discordUser.name}
                      referrerPolicy="no-referrer"
                      className="w-9 h-9 rounded-xl object-cover border border-violet-500/30"
                    />
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border border-[#0c0c0e] rounded-full animate-pulse" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-zinc-200 truncate group-hover:text-violet-400 transition-colors">
                      {discordUser.name}
                    </div>
                    <div className="text-[9px] text-zinc-500 font-mono font-medium">
                      #{discordUser.tag}
                    </div>
                  </div>
                </div>
                
                {/* Logout button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDiscordUserAndPersist(null);
                    setToast({ message: "ログアウトしました", type: "success" });
                  }}
                  className="p-1.5 rounded hover:bg-zinc-800/80 text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
                  title="連携を解除"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowDiscordLoginModal(true)}
                className="w-full h-10 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 border border-indigo-400/20 cursor-pointer"
              >
                <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 127.14 96.36">
                  <path d="M107.7,8.07A105.15,105.15,0,0,0,77.26,0a77.19,77.19,0,0,0-3.3,6.83A96.67,96.67,0,0,0,53.22,6.83,77.19,77.19,0,0,0,49.88,0,105.15,105.15,0,0,0,19.44,8.07C3.66,31.58-1.86,54.65,1,77.53A105.73,105.73,0,0,0,32,96.36a77.7,77.7,0,0,0,6.63-10.85,68.43,68.43,0,0,1-10.5-5c.88-.65,1.72-1.34,2.51-2a75.58,75.58,0,0,0,73,0c.79.71,1.63,1.4,2.52,2a68.11,68.11,0,0,1-10.5,5,78.37,78.37,0,0,0,6.63,10.85,105.73,105.73,0,0,0,31.06-18.83C129.81,49.8,123.36,27,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53S36.18,40.36,42.45,40.36,53.9,46,53.9,53,48.72,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.24,60,73.24,53S78.41,40.36,84.69,40.36,96.14,46,96.14,53,91,65.69,84.69,65.69Z" />
                </svg>
                <span>Discordでログイン</span>
              </button>
            )}
          </div>

        </aside>

        {/* Main Workspace Window */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto w-full" id="main_body_window">
          
          {activeSidebarTab === "home" && (
            <HomeView
              events={events}
              setActiveSidebarTab={setActiveSidebarTab}
              setSelectedEventId={setSelectedEventId}
              discordUser={discordUser}
            />
          )}

          {activeSidebarTab === "admin" && (
            <AdminView
              events={events}
              setEvents={setEvents}
              adminDiscordId={adminDiscordId}
              setAdminDiscordId={setAdminDiscordId}
              discordUser={discordUser}
              setToast={setToast}
              discordClientId={discordClientId}
              setDiscordClientId={setDiscordClientId}
              discordClientSecret={discordClientSecret}
              setDiscordClientSecret={setDiscordClientSecret}
            />
          )}

          {activeSidebarTab === "profile" && (
            <ProfileView 
              favoritedGames={favoritedGames} 
              profileBio={profileBio} 
              setProfileBio={setProfileBio} 
              discordUser={discordUser}
              setDiscordUser={setDiscordUserAndPersist}
              joinedGroups={joinedGroups}
              onTriggerDiscordLogin={() => setShowDiscordLoginModal(true)}
            />
          )}

          {activeSidebarTab === "chat" && (
            <ChatParsingView
              inputText={inputText}
              setInputText={setInputText}
              isExtracting={isExtracting}
              extractionError={extractionError}
              setExtractionError={setExtractionError}
              extractedEvent={extractedEvent}
              setExtractedEvent={setExtractedEvent}
              handleUsePreset={handleUsePreset}
              handleExtractWithAI={handleExtractWithAI}
              handleSaveExtracted={handleSaveExtracted}
            />
          )}

          {activeSidebarTab === "group" && (
            <GroupProfileView
              groupName={selectedServer}
              isOwner={createdGroups.includes(selectedServer)}
              inviteCode={groupInviteCodes[selectedServer] || "GC-SHARED"}
              groupOverview={groupOverviews[selectedServer] || ""}
              setGroupOverview={(group, overview) => {
                setGroupOverviews({
                  ...groupOverviews,
                  [group]: overview
                });
              }}
              setGroupName={(oldName, newName) => {
                setJoinedGroups(joinedGroups.map(g => g === oldName ? newName : g));
                setCreatedGroups(createdGroups.map(g => g === oldName ? newName : g));
                
                const currentCode = groupInviteCodes[oldName] || generateInviteCode(newName);
                const updatedCodes = { ...groupInviteCodes };
                delete updatedCodes[oldName];
                updatedCodes[newName] = currentCode;
                setGroupInviteCodes(updatedCodes);

                const currentOverview = groupOverviews[oldName] || "";
                const updatedOverviews = { ...groupOverviews };
                delete updatedOverviews[oldName];
                updatedOverviews[newName] = currentOverview;
                setGroupOverviews(updatedOverviews);

                setEvents(events.map(evt => evt.server === oldName ? { ...evt, server: newName } : evt));

                setSelectedServer(newName);
                setToast({ message: `グループ名を「${newName}」に変更しました。`, type: "success" });
              }}
              onDeleteGroup={(group) => {
                setJoinedGroups(joinedGroups.filter((g) => g !== group));
                setCreatedGroups(createdGroups.filter((g) => g !== group));
                setSelectedServer("All");
                setActiveSidebarTab("home");
                setToast({ message: `グループ「${group}」を削除しました。`, type: "success" });
              }}
              onExitGroup={(group) => {
                setJoinedGroups(joinedGroups.filter((g) => g !== group));
                setSelectedServer("All");
                setActiveSidebarTab("home");
                setToast({ message: `グループ「${group}」から脱退しました。`, type: "success" });
              }}
              groupEvents={events.filter((evt) => evt.server === selectedServer)}
              onTriggerCreateEvent={() => {
                setFormEvent({
                  ...formEvent,
                  server: selectedServer
                });
                setShowManualForm(true);
              }}
              onToggleJoinEvent={(eventId) => {
                const userDisplayName = discordUser ? discordUser.name : "Hiro";
                setEvents(
                  events.map((evt) => {
                    if (evt.id === eventId) {
                      const isParticipating = evt.participants.includes(userDisplayName);
                      const updatedParticipants = isParticipating
                        ? evt.participants.filter((p) => p !== userDisplayName)
                        : [...evt.participants, userDisplayName];
                      
                      setToast({
                        message: isParticipating 
                          ? `「${evt.title}」の参加をキャンセルしました。` 
                          : `「${evt.title}」に参加登録しました！`,
                        type: "success"
                      });

                      return { ...evt, participants: updatedParticipants };
                    }
                    return evt;
                  })
                );
              }}
              discordUser={discordUser}
              onToast={(msg, type) => setToast({ message: msg, type })}
            />
          )}

          {activeSidebarTab === "calendar" && (
            <div className="flex flex-col gap-6" id="calendar_view_container">
              
              {/* Calendar Display Control Center */}
              <div className="border border-zinc-800/80 bg-zinc-950/40 backdrop-blur-md rounded-2xl p-5 shadow-2xl relative z-40 overflow-visible transition-all duration-300 hover:border-violet-500/30 hover:shadow-violet-500/5 flex flex-col" id="calendar_control_box">
            
            {/* View Selection & Add manual event */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800 pb-4 mb-4">
              
              {/* Tab options */}
              <div className="flex items-center gap-2 bg-zinc-950/80 p-1 rounded-xl border border-zinc-800/80 w-fit">
                <button
                  onClick={() => {
                    setActiveTab("calendar");
                    setCalendarView("month");
                  }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    activeTab === "calendar" && calendarView === "month"
                      ? "bg-violet-600 text-white shadow-md shadow-violet-600/10"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40"
                  }`}
                >
                  <CalendarIcon className="h-3.5 w-3.5" />
                  <span>月間カレンダー</span>
                </button>
                <button
                  onClick={() => {
                    setActiveTab("calendar");
                    setCalendarView("week");
                  }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    activeTab === "calendar" && calendarView === "week"
                      ? "bg-violet-600 text-white shadow-md shadow-violet-600/10"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40"
                  }`}
                >
                  <Clock className="h-3.5 w-3.5" />
                  <span>週間スケジュール</span>
                </button>
                <button
                  onClick={() => setActiveTab("list")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    activeTab === "list"
                      ? "bg-violet-600 text-white shadow-md shadow-violet-600/10"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40"
                  }`}
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>予定セッション一覧</span>
                </button>
              </div>

              {/* Add manual event */}
              <button
                onClick={() => {
                  setFormEvent({
                    title: "",
                    game_tag: "General",
                    start_time: "2026-06-24 20:00",
                    end_time: "2026-06-24 21:00",
                    description: "",
                    max_participants: null,
                    participants: ["You"]
                  });
                  setShowManualForm(true);
                }}
                className="py-1.5 px-3.5 bg-violet-600/10 border border-violet-500/20 hover:bg-violet-600/20 text-violet-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all w-full sm:w-auto"
                id="btn_open_manual_creator"
              >
                <Plus className="h-4 w-4" />
                <span>手動で予定を登録</span>
              </button>
            </div>

            {/* Filter Panel */}
            <div className="flex flex-col gap-4 border-t border-zinc-900/50 pt-4" id="calendar_filters_panel">
              
              {/* Game Tag Filters Row */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 relative z-30" id="game_filters_row">
                <div className="flex items-center gap-1.5 shrink-0 select-none">
                  <span className="text-[11px] text-zinc-500 font-semibold flex items-center gap-1">
                    <Gamepad2 className="h-3.5 w-3.5 text-violet-400" />
                    ゲーム:
                  </span>
                  <div className="relative inline-block text-left">
                    <button
                      type="button"
                      onClick={() => {
                        setShowGameDropdown(!showGameDropdown);
                        setShowServerDropdown(false);
                      }}
                      className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 rounded-md px-1.5 py-0.5 text-[10px] font-mono flex items-center gap-1 cursor-pointer shadow-md"
                      title="ゲームを選択"
                    >
                      <span className="max-w-[70px] truncate">{selectedTag === "All" ? "すべて" : selectedTag}</span>
                      <span className="text-[8px] text-zinc-500">▼</span>
                    </button>
                    {showGameDropdown && (
                      <div className="absolute left-0 mt-1 z-[9999] bg-zinc-950 border border-zinc-800 rounded-lg p-1 shadow-2xl min-w-[120px] flex flex-col gap-0.5 max-h-[312px] overflow-y-auto">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedTag("All");
                            setShowGameDropdown(false);
                          }}
                          className={`w-full text-left px-2 h-8 flex items-center shrink-0 text-xs rounded transition-colors ${
                            selectedTag === "All" ? "bg-violet-600 text-white font-semibold" : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                          }`}
                        >
                          すべて
                        </button>
                        {GAME_TAGS.map((tag) => (
                          <button
                            type="button"
                            key={tag}
                            onClick={() => {
                              setSelectedTag(tag);
                              setShowGameDropdown(false);
                            }}
                            className={`w-full text-left px-2 h-8 flex items-center shrink-0 text-xs rounded transition-colors gap-1.5 ${
                              selectedTag === tag ? "bg-violet-600 text-white font-semibold" : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                            }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: TAG_COLORS[tag]?.primary || "#8b5cf6" }} />
                            <span className="truncate">{tag}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none flex-1">
                  <button
                    onClick={() => setSelectedTag("All")}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                      selectedTag === "All"
                        ? "bg-zinc-100 text-zinc-900 font-semibold shadow-md"
                        : "bg-zinc-900/60 hover:bg-zinc-800/80 text-zinc-400 hover:text-zinc-200 border border-zinc-800/50"
                    }`}
                  >
                    すべて
                  </button>
                  {displayedGameTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setSelectedTag(tag)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1 shrink-0 ${
                        selectedTag === tag
                          ? `${TAG_COLORS[tag].bg} ${TAG_COLORS[tag].text} border ${TAG_COLORS[tag].border} font-semibold`
                          : "bg-zinc-900/60 hover:bg-zinc-800/80 text-zinc-400 hover:text-zinc-200 border border-transparent"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full`} style={{ backgroundColor: TAG_COLORS[tag].primary }} />
                      <span>{tag}</span>
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setIsEditingFavorites(!isEditingFavorites)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shrink-0 ${
                    isEditingFavorites
                      ? "bg-violet-600/20 border border-violet-500 text-violet-300 animate-pulse"
                      : "bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300"
                  }`}
                  id="btn_toggle_edit_favorites"
                >
                  <Sparkles className={`h-3.5 w-3.5 ${isEditingFavorites ? "text-amber-400 animate-pulse" : "text-zinc-400"}`} />
                  <span>お気に入り編集</span>
                </button>
              </div>

              {/* Inline Favorite Games Editor */}
              {isEditingFavorites && (
                <div className="bg-zinc-950/80 border border-violet-500/20 rounded-xl p-3.5 space-y-2" id="favorite_editor_panel">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-violet-400 font-bold uppercase tracking-wider">
                      お気に入り登録 (フィルター表示するゲームの選択)
                    </span>
                    <span className="text-[9px] text-zinc-500 font-mono">
                      {favoritedGames.length === 0 ? "未設定（おすすめを表示中）" : `${favoritedGames.length}個設定済み`}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    星マークをクリックしてお気に入りゲームを設定できます。未選択の場合はプレイ履歴に基づくおすすめ「Apex, FF14, MH」が表示されます。
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {GAME_TAGS.map((tag) => {
                      const isFav = favoritedGames.includes(tag);
                      return (
                        <button
                          key={tag}
                          onClick={() => toggleFavoriteGame(tag)}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                            isFav
                              ? "bg-amber-500/10 border-amber-500/30 text-amber-300 shadow-lg shadow-amber-500/5 font-bold"
                              : "bg-zinc-900/40 border-zinc-800/80 text-zinc-400 hover:text-zinc-200"
                          }`}
                        >
                          <span className={`text-sm ${isFav ? "text-amber-400" : "text-zinc-600"}`}>
                            {isFav ? "★" : "☆"}
                          </span>
                          <span>{tag}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Server Filters Row */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-t border-zinc-900/50 pt-3 relative z-20" id="server_filters_row">
                <div className="flex items-center gap-1.5 shrink-0 select-none">
                  <span className="text-[11px] text-zinc-500 font-semibold flex items-center gap-1">
                    <Users className="h-3.5 w-3.5 text-violet-400" />
                    グループ:
                  </span>
                  <div className="relative inline-block text-left">
                    <button
                      type="button"
                      onClick={() => {
                        setShowServerDropdown(!showServerDropdown);
                        setShowGameDropdown(false);
                      }}
                      className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 rounded-md px-1.5 py-0.5 text-[10px] font-mono flex items-center gap-1 cursor-pointer shadow-md"
                      title="グループを選択"
                    >
                      <span className="max-w-[100px] truncate">{selectedServer === "All" ? "すべて" : selectedServer}</span>
                      <span className="text-[8px] text-zinc-500">▼</span>
                    </button>
                    {showServerDropdown && (
                      <div className="absolute left-0 mt-1 z-[9999] bg-zinc-950 border border-zinc-800 rounded-lg p-1 shadow-2xl min-w-[150px] flex flex-col gap-0.5 max-h-[290px] overflow-y-auto scrollbar-thin">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedServer("All");
                            setShowServerDropdown(false);
                          }}
                          className={`w-full text-left px-2 h-8 flex items-center shrink-0 text-xs rounded transition-colors ${
                            selectedServer === "All" ? "bg-violet-600 text-white font-semibold" : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                          }`}
                        >
                          すべて
                        </button>
                        {joinedGroups.map((srv) => (
                          <button
                            type="button"
                            key={srv}
                            onClick={() => {
                              setSelectedServer(srv);
                              setShowServerDropdown(false);
                            }}
                            className={`w-full text-left px-2 h-8 flex items-center shrink-0 text-xs rounded transition-colors gap-1.5 ${
                              selectedServer === srv ? "bg-violet-600 text-white font-semibold" : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                            }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-violet-400" />
                            <span className="truncate">{srv}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none flex-1">
                  <button
                    onClick={() => setSelectedServer("All")}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                      selectedServer === "All"
                        ? "bg-zinc-100 text-zinc-900 font-semibold shadow-md"
                        : "bg-zinc-900/60 hover:bg-zinc-800/80 text-zinc-400 hover:text-zinc-200 border border-zinc-800/50"
                    }`}
                  >
                    すべて
                  </button>
                  {joinedGroups.map((srv) => (
                    <button
                      key={srv}
                      onClick={() => setSelectedServer(srv)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 shrink-0 ${
                        selectedServer === srv
                          ? "bg-violet-600/20 border border-violet-500 text-violet-300 font-semibold shadow-sm shadow-violet-500/5"
                          : "bg-zinc-900/60 hover:bg-zinc-800/80 text-zinc-400 hover:text-zinc-200 border border-transparent"
                      }`}
                    >
                      <span className="w-1 h-1 rounded-full bg-violet-400" />
                      <span>{srv}</span>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* Interactive views container */}
          <div className="border border-zinc-800/80 bg-zinc-950/40 backdrop-blur-md rounded-2xl p-5 shadow-2xl relative overflow-hidden flex-1 flex flex-col" id="view_render_box">
            
            {activeTab === "calendar" && calendarView === "month" && (
              /* MONTHLY GRID VIEW */
              <div className="flex flex-col flex-1" id="monthly_grid_view">
                
                {/* Navigation Bar */}
                <div className="flex items-center justify-between mb-4 bg-zinc-950/80 p-2 rounded-xl border border-zinc-800/60">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={prevMonth}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="font-display font-bold text-sm text-zinc-100 tracking-wide select-none min-w-[70px] text-center">
                      {year}年 {monthNamesJp[month]}
                    </span>
                    <button
                      onClick={nextMonth}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={resetToToday}
                      className="text-[10px] bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 hover:border-violet-500/40 text-violet-300 font-bold px-2 py-1 rounded-lg transition-all"
                    >
                      2026年6月24日に戻る
                    </button>
                  </div>
                </div>

                {/* Day Labels */}
                <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-zinc-500 mb-1">
                  <div className="text-rose-500">日</div>
                  <div>月</div>
                  <div>火</div>
                  <div>水</div>
                  <div>木</div>
                  <div>金</div>
                  <div className="text-violet-400">土</div>
                </div>

                {/* Month Days Grid */}
                <div className="grid grid-cols-7 gap-1 flex-1 min-h-[300px]">
                  {daysGrid.map((day, idx) => {
                    if (day === null) {
                      return <div key={`empty-${idx}`} className="bg-zinc-950/20 border border-zinc-900/40 rounded-lg" />;
                    }

                    // Check if today (June 24, 2026)
                    const isToday = year === 2026 && month === 5 && day === 24;
                    const dayEvents = getEventsForDay(day);

                    return (
                      <div
                        key={`day-${day}`}
                        className={`bg-zinc-950/50 border min-h-[70px] p-1.5 rounded-lg flex flex-col justify-between hover:bg-zinc-900/60 transition-all ${
                          isToday
                            ? "border-violet-500 shadow-md shadow-violet-500/10 relative"
                            : "border-zinc-800/60"
                        }`}
                      >
                        {/* Day indicator */}
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className={`text-[10px] font-bold ${
                              isToday
                                ? "bg-violet-600 text-white rounded-full w-5 h-5 flex items-center justify-center animate-pulse"
                                : idx % 7 === 0
                                ? "text-rose-500"
                                : idx % 7 === 6
                                ? "text-violet-400"
                                : "text-zinc-400"
                            }`}
                          >
                            {day}
                          </span>
                          {dayEvents.length > 0 && (
                            <span className="text-[9px] bg-zinc-800 text-zinc-300 px-1.5 py-0.2 rounded font-semibold font-mono">
                              {dayEvents.length}
                            </span>
                          )}
                        </div>

                        {/* Events list */}
                        <div className="flex-1 flex flex-col gap-1 overflow-y-auto max-h-[55px] scrollbar-none">
                          {dayEvents.map((evt) => {
                            const colors = TAG_COLORS[evt.game_tag] || TAG_COLORS.General;
                            return (
                              <button
                                key={evt.id}
                                onClick={() => setSelectedEventId(evt.id)}
                                className={`text-[9px] truncate text-left p-1 rounded border ${colors.bg} ${colors.text} ${colors.border} hover:opacity-85 font-sans font-medium transition-opacity block w-full`}
                                title={`${evt.game_tag}: ${evt.title}`}
                              >
                                {evt.title}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === "calendar" && calendarView === "week" && (
              /* WEEKLY GRID VIEW */
              <div className="flex flex-col flex-1" id="weekly_grid_view">
                
                {/* Navigation info for the week */}
                <div className="flex items-center justify-between mb-4 bg-zinc-950/80 p-2 rounded-xl border border-zinc-800/60">
                  <span className="text-xs text-zinc-400 font-semibold flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-violet-400" />
                    <span>
                      {weeklyDates[0].getMonth() + 1}/{weeklyDates[0].getDate()} 〜 {weeklyDates[6].getMonth() + 1}/{weeklyDates[6].getDate()} のスケジュール
                    </span>
                  </span>
                  
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        const prevWeekDate = new Date(currentDate);
                        prevWeekDate.setDate(currentDate.getDate() - 7);
                        setCurrentDate(prevWeekDate);
                      }}
                      className="p-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        const nextWeekDate = new Date(currentDate);
                        nextWeekDate.setDate(currentDate.getDate() + 7);
                        setCurrentDate(nextWeekDate);
                      }}
                      className="p-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors"
                    >
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Week Columns */}
                <div className="grid grid-cols-7 gap-1.5 flex-1">
                  {weeklyDates.map((date, idx) => {
                    const d = date.getDate();
                    const m = date.getMonth();
                    const y = date.getFullYear();
                    const isToday = y === 2026 && m === 5 && d === 24;

                    // Find events for this specific date
                    const dateStr = `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
                    const dayEvents = filteredEvents.filter((evt) => evt.start_time.startsWith(dateStr));

                    const dayNames = ["日", "月", "火", "水", "木", "金", "土"];

                    return (
                      <div
                        key={`week-day-${idx}`}
                        className={`bg-zinc-950/50 border rounded-xl p-2 flex flex-col ${
                          isToday ? "border-violet-500 bg-violet-950/5" : "border-zinc-850"
                        }`}
                      >
                        <div className="text-center pb-2 border-b border-zinc-850 mb-2">
                          <span className={`text-[10px] block font-semibold ${
                            idx === 0 ? "text-rose-500" : idx === 6 ? "text-violet-400" : "text-zinc-500"
                          }`}>
                            {dayNames[date.getDay()]}
                          </span>
                          <span className={`text-sm font-bold block leading-none mt-1 ${
                            isToday ? "text-violet-400" : "text-zinc-200"
                          }`}>
                            {d}
                          </span>
                        </div>

                        {/* Event List for this day */}
                        <div className="flex-1 flex flex-col gap-2 overflow-y-auto max-h-[250px] scrollbar-none">
                          {dayEvents.length === 0 ? (
                            <div className="text-zinc-700 text-[10px] text-center py-6">予定なし</div>
                          ) : (
                            dayEvents.map((evt) => {
                              const colors = TAG_COLORS[evt.game_tag] || TAG_COLORS.General;
                              const timeStr = evt.start_time.split(" ")[1] || "00:00";
                              return (
                                <div
                                  key={evt.id}
                                  onClick={() => setSelectedEventId(evt.id)}
                                  className={`p-1.5 rounded-lg border text-left cursor-pointer hover:scale-[1.02] active:scale-95 transition-all text-[11px] ${colors.bg} ${colors.text} ${colors.border}`}
                                >
                                  <div className="font-mono font-bold opacity-90 mb-0.5">{timeStr}</div>
                                  <div className="font-medium line-clamp-2 leading-snug">{evt.title}</div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === "list" && (
              /* LIST VIEW */
              <div className="flex flex-col flex-1" id="upcoming_list_view">
                {filteredEvents.length === 0 ? (
                  <div className="text-center py-16 text-zinc-500">
                    <CalendarIcon className="h-12 w-12 text-zinc-700 mx-auto mb-3" />
                    <p className="font-semibold text-sm">表示する予定セッションが見つかりません</p>
                    <p className="text-xs text-zinc-600 mt-1">タグフィルターを切り替えるか、新しく予定を登録してください。</p>
                  </div>
                ) : (
                  <div className="space-y-3 overflow-y-auto max-h-[400px] pr-1" id="list_view_scrollable">
                    {filteredEvents.map((evt) => {
                      const colors = TAG_COLORS[evt.game_tag] || TAG_COLORS.General;
                      const hasJoined = evt.participants.includes("You");
                      const maxSlots = evt.max_participants;
                      const currentSlots = evt.participants.length;

                      return (
                        <div
                          key={evt.id}
                          className="bg-zinc-950/60 hover:bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all"
                        >
                          <div className="flex items-start gap-3.5 flex-1 min-w-0">
                            {/* Game Badge */}
                            <div className="shrink-0 flex flex-col items-center gap-1">
                              <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${colors.bg} ${colors.text} ${colors.border}`}>
                                {evt.game_tag}
                              </span>
                              {evt.is_ai_extracted && (
                                <span className="text-[8px] bg-violet-500/10 text-violet-400 border border-violet-500/20 px-1 py-0.2 rounded flex items-center gap-0.5" title="AIがチャットから自動抽出した予定です">
                                  <Sparkles className="h-2 w-2" />
                                  <span>AI</span>
                                </span>
                              )}
                            </div>

                            {/* Details */}
                            <div className="flex-1 min-w-0">
                              <h4
                                onClick={() => setSelectedEventId(evt.id)}
                                className="font-bold text-zinc-100 hover:text-violet-400 cursor-pointer text-sm md:text-base leading-snug tracking-tight truncate"
                              >
                                {evt.title}
                              </h4>
                              
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-xs text-zinc-400 font-mono">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3.5 w-3.5 text-violet-400 shrink-0" />
                                  <span>{evt.start_time} 〜 {evt.end_time === "未定" ? "未定" : (evt.end_time.split(" ")[1] || "終了不明")}</span>
                                </span>
                                <span className="flex items-center gap-1">
                                  <Users className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                                  <span>
                                    {maxSlots === null ? `${currentSlots}人参加` : `枠：${currentSlots}/${maxSlots}人`}
                                  </span>
                                </span>
                              </div>

                              {evt.description && (
                                <p className="text-xs text-zinc-500 mt-2 line-clamp-1 italic">「{evt.description}」</p>
                              )}
                            </div>
                          </div>

                          {/* Quick Interactive Controls */}
                          <div className="flex items-center gap-2 shrink-0">
                            {/* Join toggle button */}
                            <button
                              onClick={() => handleToggleJoin(evt.id)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                                hasJoined
                                  ? "bg-zinc-800 hover:bg-rose-950/20 text-rose-400 border border-zinc-700 hover:border-rose-500/30"
                                  : "bg-violet-600 hover:bg-violet-500 text-white"
                              }`}
                            >
                              {hasJoined ? (
                                <>
                                  <UserMinus className="h-3.5 w-3.5" />
                                  <span>参加中 (抜ける)</span>
                                </>
                              ) : (
                                <>
                                  <UserPlus className="h-3.5 w-3.5" />
                                  <span>参加する</span>
                                </>
                              )}
                            </button>

                            {/* Options menu triggers modal info */}
                            <button
                              onClick={() => setSelectedEventId(evt.id)}
                              className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors"
                              title="詳細を表示"
                            >
                              <HelpCircle className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
        )}
      </main>
    </div>

      {/* BACKDROP & MODALS */}
      <AnimatePresence>
        
        {/* Modal 1: Event Details & Participant Roster */}
        {selectedEventId && (() => {
          const evt = events.find((item) => item.id === selectedEventId);
          if (!evt) return null;
          const colors = TAG_COLORS[evt.game_tag] || TAG_COLORS.General;
          const hasJoined = evt.participants.includes("You");

          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-zinc-950/90 backdrop-blur-md flex items-center justify-center p-4"
              onClick={() => setSelectedEventId(null)}
              id="event_details_modal"
            >
              <motion.div
                initial={{ scale: 0.95, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 15 }}
                className="bg-zinc-950 border border-zinc-800/80 rounded-2xl p-6 shadow-2xl max-w-md w-full relative overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Visual identity strip */}
                <div className="absolute top-0 left-0 right-0 h-2" style={{ backgroundColor: colors.primary }} />

                <div className="flex items-start justify-between mb-4 pt-1">
                  <div>
                    <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold border inline-block mb-1.5 ${colors.bg} ${colors.text} ${colors.border}`}>
                      {evt.game_tag}
                    </span>
                    <h3 className="font-bold text-white text-lg tracking-tight leading-snug">{evt.title}</h3>
                  </div>
                  <button
                    onClick={() => setSelectedEventId(null)}
                    className="p-1 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-4 text-sm" id="modal_content_details">
                  
                  {/* Timing */}
                  <div className="bg-zinc-900/80 p-3 rounded-xl border border-zinc-800 flex items-center gap-3 font-mono">
                    <Clock className="h-5 w-5 text-violet-400 shrink-0" />
                    <div>
                      <div className="text-[10px] text-zinc-500 font-bold uppercase">日時 (Date & Time)</div>
                      <div className="text-xs text-zinc-200 mt-0.5">
                        {evt.start_time} 〜 {evt.end_time === "未定" ? "未定" : (evt.end_time.split(" ")[1] || "終了不明")}
                      </div>
                    </div>
                  </div>

                  {/* Description text */}
                  <div>
                    <span className="text-xs text-zinc-500 font-bold uppercase block mb-1">詳細・補足ルール</span>
                    <div className="bg-zinc-900/80 p-3 rounded-xl border border-zinc-800 text-zinc-300 text-xs leading-relaxed max-h-24 overflow-y-auto">
                      {evt.description || <span className="text-zinc-600 italic">補足情報はありません。</span>}
                    </div>
                  </div>

                  {/* Roster list */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-zinc-500 font-bold uppercase block">参加メンバー・ロースター</span>
                      <span className="text-xs text-zinc-400 font-mono font-semibold">
                        {evt.max_participants === null ? `${evt.participants.length}人参加` : `枠：${evt.participants.length}/${evt.max_participants}人`}
                      </span>
                    </div>

                    <div className="bg-zinc-900/80 p-3 rounded-xl border border-zinc-800">
                      <div className="flex flex-wrap gap-2">
                        {evt.participants.map((player, idx) => (
                          <span
                            key={idx}
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1 border ${
                              player === "You"
                                ? "bg-violet-500/15 border-violet-500/30 text-violet-300 font-semibold"
                                : "bg-zinc-800/80 border-zinc-700/60 text-zinc-300"
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${player === "You" ? "bg-violet-400" : "bg-zinc-450"}`} />
                            {player}
                          </span>
                        ))}
                        {evt.max_participants !== null && evt.max_participants > evt.participants.length && (
                          <span className="px-2.5 py-1 rounded-lg text-xs border border-dashed border-zinc-800 text-zinc-600 bg-transparent flex items-center gap-1">
                            空き枠
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* If extracted via AI, display source chat */}
                  {evt.is_ai_extracted && evt.raw_text_source && (
                    <div className="border-t border-zinc-800/80 pt-3">
                      <span className="text-[10px] text-zinc-500 font-bold uppercase block mb-1 flex items-center gap-1">
                        <Sparkles className="h-3 w-3 text-violet-400" />
                        <span>AI抽出の原文チャット・メモ:</span>
                      </span>
                      <p className="text-[11px] text-zinc-400 bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-800/60 italic">
                        「{evt.raw_text_source}」
                      </p>
                    </div>
                  )}

                  {/* Bottom Actions Row */}
                  <div className="flex items-center justify-between gap-3 border-t border-zinc-800/80 pt-4 mt-2">
                    
                    {/* Delete button (only available or customizable) */}
                    <button
                      onClick={() => handleDeleteEvent(evt.id)}
                      className="p-2.5 bg-zinc-950 hover:bg-rose-950/25 border border-zinc-800 hover:border-rose-500/30 text-zinc-500 hover:text-rose-400 rounded-xl transition-colors"
                      title="イベントを削除"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>

                    <div className="flex gap-2 flex-1 justify-end">
                      {/* Manual Edit button */}
                      <button
                        onClick={() => handleOpenEdit(evt)}
                        className="py-2.5 px-4 bg-zinc-850 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <Edit className="h-3.5 w-3.5" />
                        <span>編集</span>
                      </button>

                      {/* Join / Leave toggle */}
                      <button
                        onClick={() => handleToggleJoin(evt.id)}
                        className={`py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                          hasJoined
                            ? "bg-rose-600 hover:bg-rose-500 text-white"
                            : "bg-violet-600 hover:bg-violet-500 text-white"
                        }`}
                      >
                        {hasJoined ? (
                          <>
                            <UserMinus className="h-3.5 w-3.5" />
                            <span>参加キャンセル</span>
                          </>
                        ) : (
                          <>
                            <UserPlus className="h-3.5 w-3.5" />
                            <span>マルチに参加する</span>
                          </>
                        )}
                      </button>
                    </div>

                  </div>

                </div>
              </motion.div>
            </motion.div>
          );
        })()}

        {/* Modal 2: Manual Event Creation Form Drawer */}
        {showManualForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-zinc-950/90 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setShowManualForm(false)}
            id="manual_form_modal"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-zinc-950 border border-zinc-800/80 rounded-2xl p-6 shadow-2xl max-w-md w-full relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-white text-base">
                  {formEvent.id ? "イベントを編集する" : "新規ゲームセッション作成"}
                </h3>
                <button
                  onClick={() => setShowManualForm(false)}
                  className="p-1 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveManual} className="space-y-4 text-sm" id="manual_creation_form">
                
                {/* Title */}
                <div>
                  <label className="text-xs text-zinc-400 font-medium block mb-1">イベントタイトル *</label>
                  <input
                    type="text"
                    value={formEvent.title || ""}
                    onChange={(e) => setFormEvent({ ...formEvent, title: e.target.value })}
                    placeholder="例: Apexカスタム練習、FF14レイド1層攻略"
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-lg px-3 py-2 text-sm text-white"
                    required
                  />
                </div>

                {/* Game Tag, Server & Max slots */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs text-zinc-400 font-medium block">ゲーム</label>
                      <button
                        type="button"
                        onClick={() => setIsCustomGame(!isCustomGame)}
                        className="text-[9px] text-violet-400 hover:text-violet-300 font-bold underline cursor-pointer select-none"
                      >
                        {isCustomGame ? "一覧から選択" : "直接入力"}
                      </button>
                    </div>
                    {isCustomGame ? (
                      <input
                        type="text"
                        value={formEvent.game_tag || ""}
                        onChange={(e) => setFormEvent({ ...formEvent, game_tag: e.target.value as any })}
                        placeholder="ゲーム名を入力"
                        className="w-full bg-zinc-900 border border-zinc-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-lg px-2.5 py-2 text-xs text-white"
                        required
                      />
                    ) : (
                      <select
                        value={GAME_TAGS.includes(formEvent.game_tag as any) ? formEvent.game_tag : "General"}
                        onChange={(e) => setFormEvent({ ...formEvent, game_tag: e.target.value as any })}
                        className="w-full bg-zinc-900 border border-zinc-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-lg px-2.5 py-2 text-xs text-white"
                      >
                        {GAME_TAGS.map((tag) => (
                          <option key={tag} value={tag}>
                            {tag}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div>
                    <label className="text-xs text-zinc-400 font-medium block mb-1">グループ</label>
                    <select
                      value={formEvent.server || (joinedGroups[0] || "")}
                      onChange={(e) => setFormEvent({ ...formEvent, server: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-lg px-2.5 py-2 text-xs text-white"
                    >
                      {joinedGroups.map((srv) => (
                        <option key={srv} value={srv}>
                          {srv}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-zinc-400 font-medium block mb-1">募集枠数</label>
                    <input
                      type="number"
                      value={formEvent.max_participants === null ? "" : formEvent.max_participants}
                      onChange={(e) =>
                        setFormEvent({
                          ...formEvent,
                          max_participants: e.target.value === "" ? null : parseInt(e.target.value)
                        })
                      }
                      placeholder="無制限"
                      className="w-full bg-zinc-900 border border-zinc-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-lg px-2.5 py-2 text-xs text-white"
                    />
                  </div>
                </div>

                {/* Timing */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <MiniDateTimePicker
                    label="開始日時 (Start)"
                    value={formEvent.start_time || "2026-06-24 20:00"}
                    onChange={(val) => setFormEvent({ ...formEvent, start_time: val })}
                  />

                  <MiniDateTimePicker
                    label="終了日時 (End)"
                    value={formEvent.end_time || "2026-06-24 21:00"}
                    onChange={(val) => setFormEvent({ ...formEvent, end_time: val })}
                    allowTBD
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="text-xs text-zinc-400 font-medium block mb-1">詳細説明・メモ</label>
                  <textarea
                    value={formEvent.description || ""}
                    onChange={(e) => setFormEvent({ ...formEvent, description: e.target.value })}
                    placeholder="Discord通話部屋の案内、募集条件、集合場所など"
                    className="w-full h-24 bg-zinc-900 border border-zinc-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-lg p-3 text-xs text-white resize-none"
                  />
                </div>

                {/* Submit row */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowManualForm(false)}
                    className="flex-1 py-2 rounded-xl text-xs font-semibold bg-zinc-850 hover:bg-zinc-800 text-zinc-300 transition-colors"
                  >
                    キャンセル
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/15 hover:shadow-violet-600/30 transition-all"
                  >
                    保存する
                  </button>
                </div>

              </form>
            </motion.div>
          </motion.div>
        )}

        {/* Group Settings Configuration Modal */}
        {showGroupSettingsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-zinc-950/85 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setShowGroupSettingsModal(null)}
            id="group_settings_modal"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-zinc-950 border border-zinc-800/80 rounded-2xl p-6 shadow-2xl max-w-sm w-full relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-900">
                <div className="flex items-center gap-2">
                  <Settings className="h-4.5 w-4.5 text-violet-400" />
                  <h3 className="font-bold text-white text-sm">グループ詳細設定</h3>
                </div>
                <button
                  onClick={() => setShowGroupSettingsModal(null)}
                  className="p-1 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                {/* Edit Group Name */}
                <div>
                  <label className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">グループ名</label>
                  <input
                    type="text"
                    value={settingsGroupName}
                    onChange={(e) => setSettingsGroupName(e.target.value)}
                    placeholder="グループ名を入力"
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-lg px-3 py-2 text-xs text-white outline-none"
                    maxLength={20}
                  />
                  <p className="text-[9px] text-zinc-500 mt-1">※グループ名を変更すると、このグループに属するすべての予定のグループ指定も自動で更新されます。</p>
                </div>

                {/* Manage Invitation Code */}
                <div className="bg-zinc-900/60 p-3 rounded-xl border border-zinc-850">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">グループ招待コード</span>
                  <div className="flex items-center justify-between gap-2 mt-1.5">
                    <span className="font-mono text-sm font-bold text-violet-400 tracking-wider">
                      {groupInviteCodes[showGroupSettingsModal] || "GC-SHARED"}
                    </span>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          const code = groupInviteCodes[showGroupSettingsModal] || "GC-SHARED";
                          navigator.clipboard.writeText(code);
                          setToast({ message: "共有コードをクリップボードにコピーしました！", type: "success" });
                        }}
                        className="p-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                        title="コードをコピー"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setConfirmModal({
                            title: "招待コードの再生成",
                            message: "招待コードを再生成すると、古いコードでは他のメンバーが参加できなくなります。再生成しますか？",
                            onConfirm: () => {
                              const newCode = generateInviteCode(settingsGroupName || showGroupSettingsModal);
                              setGroupInviteCodes({
                                ...groupInviteCodes,
                                [showGroupSettingsModal]: newCode
                              });
                              setToast({ message: `招待コードを新しく「${newCode}」に更新しました！`, type: "success" });
                            }
                          });
                        }}
                        className="p-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-violet-400 hover:text-violet-300 transition-colors cursor-pointer text-[10px] font-bold"
                      >
                        再生成
                      </button>
                    </div>
                  </div>
                  <p className="text-[9px] text-zinc-500 mt-2">このコードをコピーして他のゲーマーに共有すれば、同じ予定表を共有できます。</p>
                </div>

                {/* Submit Row */}
                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowGroupSettingsModal(null)}
                    className="flex-1 py-2 rounded-lg text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
                  >
                    キャンセル
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const trimmedNew = settingsGroupName.trim();
                      if (!trimmedNew) return;
                      const oldName = showGroupSettingsModal;
                      
                      if (trimmedNew !== oldName && joinedGroups.includes(trimmedNew)) {
                        setToast({ message: "すでに同じ名前のグループが存在します。", type: "error" });
                        return;
                      }

                      // Update state recursively
                      setJoinedGroups(joinedGroups.map(g => g === oldName ? trimmedNew : g));
                      setCreatedGroups(createdGroups.map(g => g === oldName ? trimmedNew : g));
                      
                      const currentCode = groupInviteCodes[oldName] || generateInviteCode(trimmedNew);
                      const updatedCodes = { ...groupInviteCodes };
                      delete updatedCodes[oldName];
                      updatedCodes[trimmedNew] = currentCode;
                      setGroupInviteCodes(updatedCodes);

                      // Propagate group name changes to events
                      setEvents(events.map(evt => evt.server === oldName ? { ...evt, server: trimmedNew } : evt));

                      if (selectedServer === oldName) {
                        setSelectedServer(trimmedNew);
                      }

                      setShowGroupSettingsModal(null);
                      setToast({ message: `グループ名を「${trimmedNew}」に変更しました。`, type: "success" });
                    }}
                    className="flex-1 py-2 rounded-lg text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/10 hover:shadow-violet-600/25 transition-all cursor-pointer"
                  >
                    変更を保存
                  </button>
                </div>

              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Discord OAuth Login Modal */}
        {showDiscordLoginModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm"
            id="discord_oauth_modal"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-[#36393f] rounded-lg max-w-md w-full overflow-hidden shadow-2xl text-[#dcddde] border border-zinc-800"
            >
              {/* Discord Top Banner styling */}
              <div className="bg-[#2f3136] p-6 flex flex-col items-center gap-4 text-center border-b border-[#202225]">
                {/* Simulated Discord Icon and Connection logo */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#5865F2] rounded-full flex items-center justify-center shadow-md">
                    <svg className="w-7 h-7 fill-white" viewBox="0 0 127.14 96.36">
                      <path d="M107.7,8.07A105.15,105.15,0,0,0,77.26,0a77.19,77.19,0,0,0-3.3,6.83A96.67,96.67,0,0,0,53.22,6.83,77.19,77.19,0,0,0,49.88,0,105.15,105.15,0,0,0,19.44,8.07C3.66,31.58-1.86,54.65,1,77.53A105.73,105.73,0,0,0,32,96.36a77.7,77.7,0,0,0,6.63-10.85,68.43,68.43,0,0,1-10.5-5c.88-.65,1.72-1.34,2.51-2a75.58,75.58,0,0,0,73,0c.79.71,1.63,1.4,2.52,2a68.11,68.11,0,0,1-10.5,5,78.37,78.37,0,0,0,6.63,10.85,105.73,105.73,0,0,0,31.06-18.83C129.81,49.8,123.36,27,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53S36.18,40.36,42.45,40.36,53.9,46,53.9,53,48.72,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.24,60,73.24,53S78.41,40.36,84.69,40.36,96.14,46,96.14,53,91,65.69,84.69,65.69Z" />
                    </svg>
                  </div>
                  <div className="text-zinc-500 font-bold text-xl">⇄</div>
                  <div className="w-12 h-12 bg-violet-600 rounded-2xl flex items-center justify-center shadow-md">
                    <Gamepad2 className="w-6 h-6 text-white" />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white leading-tight">
                    Discordアカウントの連携要求
                  </h3>
                  <p className="text-xs text-[#b9bbbe]">
                    外部アプリケーション <strong className="text-white">PartyUp!</strong> があなたのアカウントとの連携を要求しています。
                  </p>
                </div>
              </div>

              {/* Form customizer */}
              <div className="p-6 space-y-5 bg-[#36393f] text-sm">
                
                <div className="space-y-3">
                  <span className="text-[11px] font-bold text-[#b9bbbe] uppercase tracking-wider block">
                    1. ニックネームを設定
                  </span>
                  <input
                    type="text"
                    value={discordLoginName}
                    onChange={(e) => setDiscordLoginName(e.target.value)}
                    placeholder="ニックネームを入力 (例: Hiro, ApexKing)"
                    className="w-full bg-[#202225] border border-[#202225] focus:border-[#5865F2] rounded p-2.5 text-xs text-white outline-none font-medium"
                    maxLength={15}
                  />
                </div>

                <div className="space-y-3">
                  <span className="text-[11px] font-bold text-[#b9bbbe] uppercase tracking-wider block">
                    2. アバター色を選択
                  </span>
                  <div className="flex gap-3 justify-center">
                    {[
                      { url: "https://cdn.discordapp.com/embed/avatars/0.png", color: "bg-[#5865F2]" },
                      { url: "https://cdn.discordapp.com/embed/avatars/1.png", color: "bg-[#43b581]" },
                      { url: "https://cdn.discordapp.com/embed/avatars/2.png", color: "bg-[#4f545c]" },
                      { url: "https://cdn.discordapp.com/embed/avatars/3.png", color: "bg-[#f04747]" },
                      { url: "https://cdn.discordapp.com/embed/avatars/4.png", color: "bg-[#faa61a]" }
                    ].map((av) => {
                      const isSel = selectedDiscordAvatar === av.url;
                      return (
                        <button
                          key={av.url}
                          type="button"
                          onClick={() => setSelectedDiscordAvatar(av.url)}
                          className={`w-10 h-10 rounded-full ${av.color} flex items-center justify-center overflow-hidden border-2 transition-all cursor-pointer ${
                            isSel ? "ring-2 ring-white scale-110 border-[#5865F2]" : "border-transparent opacity-60 hover:opacity-100"
                          }`}
                        >
                          <img
                            src={av.url}
                            alt="discord avatar preset"
                            className="w-8 h-8 object-contain"
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Requested Permissions list */}
                <div className="bg-[#2f3136] rounded-md p-3 text-xs space-y-2 text-[#b9bbbe] border border-[#202225]">
                  <span className="font-bold text-white text-[10px] uppercase tracking-wider block pb-1 border-b border-zinc-800">
                    アクセスを許可する項目:
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-500 font-bold">✔</span>
                    <span>ユーザー名とハッシュタグの取得</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-500 font-bold">✔</span>
                    <span>アバター画像およびステータスの同期</span>
                  </div>
                </div>

              </div>

              {/* Actions row */}
              <div className="bg-[#2f3136] px-6 py-4 flex gap-3 justify-end items-center border-t border-[#202225]">
                <button
                  type="button"
                  onClick={() => setShowDiscordLoginModal(false)}
                  className="px-4 py-2 text-xs font-semibold hover:underline text-[#b9bbbe] hover:text-white transition-all cursor-pointer"
                >
                  キャンセル
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const finalName = discordLoginName.trim() || "Hiro";
                    const randomTag = Math.floor(1000 + Math.random() * 9000).toString();
                    setDiscordUserAndPersist({
                      name: finalName,
                      avatarUrl: selectedDiscordAvatar,
                      tag: randomTag
                    });
                    setShowDiscordLoginModal(false);
                    setToast({ message: `Discordアカウント「${finalName}#${randomTag}」と連携しました！`, type: "success" });
                  }}
                  className="px-6 py-2 rounded text-xs font-bold bg-[#5865F2] hover:bg-[#4752C4] text-white transition-all cursor-pointer"
                >
                  承認する (Authorize)
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}

        {/* Custom Confirmation Modal */}
        {confirmModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-zinc-950/85 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setConfirmModal(null)}
            id="custom_confirm_modal"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-[#121214] border border-zinc-800 rounded-2xl p-6 shadow-2xl max-w-sm w-full relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-2 text-rose-500 mb-3">
                <HelpCircle className="h-5 w-5" />
                <h3 className="font-extrabold text-sm text-zinc-100">{confirmModal.title}</h3>
              </div>

              <p className="text-xs text-zinc-400 leading-relaxed mb-6 whitespace-pre-line">
                {confirmModal.message}
              </p>

              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setConfirmModal(null)}
                  className="flex-1 py-2 rounded-lg text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
                >
                  キャンセル
                </button>
                <button
                  type="button"
                  onClick={() => {
                    confirmModal.onConfirm();
                    setConfirmModal(null);
                  }}
                  className="flex-1 py-2 rounded-lg text-xs font-extrabold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/10 hover:shadow-rose-600/25 transition-all cursor-pointer"
                >
                  確認
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
