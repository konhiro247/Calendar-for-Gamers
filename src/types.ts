export type GameTag =
  | "Apex Legends"
  | "FF14"
  | "Valorant"
  | "League of Legends"
  | "Monster Hunter"
  | "Overwatch"
  | "Minecraft"
  | "General";

export interface GameEvent {
  id: string;
  title: string;
  game_tag: GameTag;
  start_time: string; // YYYY-MM-DD HH:mm
  end_time: string;   // YYYY-MM-DD HH:mm
  description: string;
  max_participants: number | null;
  participants: string[];
  is_ai_extracted: boolean;
  raw_text_source?: string;
  server?: string;    // e.g. "Asia", "NA", "EU", "Oceania", "Other"
}

export interface ExtractionResult {
  title: string;
  game_tag: string;
  start_time: string;
  end_time: string;
  description: string;
  max_participants: number | null;
  server?: string;
}
