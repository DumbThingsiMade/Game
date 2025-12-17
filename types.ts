
export interface GameState {
  balance: number; // -100 to 100
  score: number;
  isGameOver: boolean;
  gameTime: number; // seconds survived
  difficulty: number;
  status: 'START' | 'PLAYING' | 'GAMEOVER';
}

export interface IncidentReport {
  summary: string;
  corporateLingo: string;
  funnyCause: string;
}
