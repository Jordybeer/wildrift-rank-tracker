'use client';
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import LoginPage from '@/components/LoginPage';
import type { User } from '@supabase/supabase-js';

type Match = {
  champion: string;
  role: string;
  win: boolean;
  k_d_a: string;
  kill_participation?: number;
  performance_grade?: string;
  loss_reason?: string;
  rank_tier: string;
  marks_in_division: number;
  created_at: string;
  my_support?: string;
  enemy_adc?: string;
  enemy_support?: string;
  session_id?: string;
  game_duration?: number;
  first_blood?: boolean;
  turret_kills?: number;
  vision_score?: number;
  premade_with?: string;
  enemy_top?: string;
  enemy_jungle?: string;
  enemy_mid?: string;
  gold_earned?: number;
  damage_dealt?: number;
  damage_taken?: number;
  cs_at_10?: number;
  dragons_taken?: number;
  barons_taken?: number;
  heralds_taken?: number;
  notes?: string;
  cumulativeMarks?: number;
};

const ADC_CHAMPIONS = [
  'Ashe','Caitlyn','Draven','Ezreal','Jhin','Jinx',"Kai'Sa",'Kalista','Lucian',
  'Miss Fortune','Samira','Sivir','Smolder','Tristana','Twitch','Varus','Vayne','Xayah','Zeri',
];

const SUPPORT_CHAMPIONS = [
  'Alistar','Amumu','Bard','Blitzcrank','Brand','Braum','Galio','Janna','Karma','Kennen',
  'Leona','Lulu','Lux','Malphite','Morgana','Nami','Nautilus','Pyke','Rakan','Senna',
  'Seraphine','Sona','Soraka','Tahm Kench','Thresh',"Vel'Koz",'Yuumi','Zilean','Zyra',
];

const TOP_CHAMPIONS = [
  'Aatrox','Camille','Darius','Fiora','Garen','Gragas','Gwen','Irelia','Jax','Jayce',
  'Kennen','Malphite','Nasus','Olaf','Pantheon','Renekton','Riven','Sett','Shen','Teemo','Wukong','Yasuo',
];

const JUNGLE_CHAMPIONS = [
  'Amumu','Diana','Ekko','Evelynn','Graves','Jarvan IV',"Kha'Zix",'Lee Sin','Master Yi',
  'Nunu','Rammus',"Rek'Sai",'Rengar','Shyvana','Vi','Warwick','Wukong','Xin Zhao',
];

const MID_CHAMPIONS = [
  'Ahri','Akali','Akshan','Annie','Aurelion Sol','Brand','Cassiopeia','Diana','Fizz','Galio',
  'Katarina','LeBlanc','Lux','Orianna','Syndra','Twisted Fate','Veigar',"Vel'Koz",'Viktor','Yasuo','Zed','Ziggs',
];

const RANK_TIERS = [
  { value: 'IRON_IV', label: 'Iron IV', marks: 5 },
  { value: 'IRON_III', label: 'Iron III', marks: 5 },
  { value: 'IRON_II', label: 'Iron II', marks: 5 },
  { value: 'IRON_I', label: 'Iron I', marks: 5 },
  { value: 'BRONZE_IV', label: 'Bronze IV', marks: 5 },
  { value: 'BRONZE_III', label: 'Bronze III', marks: 5 },
  { value: 'BRONZE_II', label: 'Bronze II', marks: 5 },
  { value: 'BRONZE_I', label: 'Bronze I', marks: 5 },
  { value: 'SILVER_IV', label: 'Silver IV', marks: 5 },
  { value: 'SILVER_III', label: 'Silver III', marks: 5 },
  { value: 'SILVER_II', label: 'Silver II', marks: 5 },
  { value: 'SILVER_I', label: 'Silver I', marks: 5 },
  { value: 'GOLD_IV', label: 'Gold IV', marks: 5 },
  { value: 'GOLD_III', label: 'Gold III', marks: 5 },
  { value: 'GOLD_II', label: 'Gold II', marks: 5 },
  { value: 'GOLD_I', label: 'Gold I', marks: 5 },
  { value: 'EMERALD_IV', label: 'Emerald IV', marks: 5 },
  { value: 'EMERALD_III', label: 'Emerald III', marks: 5 },
  { value: 'EMERALD_II', label: 'Emerald II', marks: 5 },
  { value: 'EMERALD_I', label: 'Emerald I', marks: 5 },
  { value: 'DIAMOND_IV', label: 'Diamond IV', marks: 6 },
  { value: 'DIAMOND_III', label: 'Diamond III', marks: 6 },
  { value: 'DIAMOND_II', label: 'Diamond II', marks: 6 },
  { value: 'DIAMOND_I', label: 'Diamond I', marks: 6 },
  { value: 'MASTER', label: 'Master', marks: 8 },
  { value: 'GRANDMASTER', label: 'Grandmaster', marks: 8 },
  { value: 'CHALLENGER', label: 'Challenger', marks: 8 },
];

const GRADE_OPTIONS = [
  { value: '', label: '—' },
  { value: 'A', label: 'A' },
  { value: 'S', label: 'S' },
  { value: 'MVP', label: 'MVP' },
  { value: 'SVP', label: 'SVP' },
];

const LOSS_REASONS = [
  { value: '', label: '—' },
  { value: 'Lane diff', label: 'Lane' },
  { value: 'Jungle diff', label: 'Jungle' },
  { value: 'My mistake', label: 'My fault' },
  { value: 'Team', label: 'Team' },
  { value: 'Outscaled', label: 'Outscaled' },
];

const DDRAGON_KEY_OVERRIDES: Record<string, string> = {
  "Kai'Sa": 'Kaisa',
  'Miss Fortune': 'MissFortune',
  'Aurelion Sol': 'AurelionSol',
  'Jarvan IV': 'JarvanIV',
  "Kha'Zix": 'Khazix',
  'Lee Sin': 'LeeSin',
  'Master Yi': 'MasterYi',
  "Rek'Sai": 'RekSai',
  'Tahm Kench': 'TahmKench',
  'Twisted Fate': 'TwistedFate',
  "Vel'Koz": 'Velkoz',
  'Xin Zhao': 'XinZhao',
};

function getChampionSplashUrl(champion: string): string {
  const key = DDRAGON_KEY_OVERRIDES[champion] ?? champion.replace(/[^a-zA-Z]/g, '');
  return `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${key}_0.jpg`;
}

function getMaxMarks(tier: string): number {
  return RANK_TIERS.find((t) => t.value === tier)?.marks || 5;
}

function friendlySupabaseMessage(message: string) {
  if (message.includes("Could not find the table 'public.matches'")) {
    return 'Supabase table missing. Run the updated supabase/schema.sql in SQL Editor, then disable RLS on the matches table.';
  }
  if (message.includes('column') && message.includes('does not exist')) {
    return 'Database schema is outdated. Add the missing column via Supabase Table Editor, or drop the matches table and re-run supabase/schema.sql.';
  }
  return message;
}

function StatStepper({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) {
  return (
    <div className="wr-stepper">
      <span className="wr-label">{label}</span>
      <div className="wr-stepperControls">
        <button type="button" className="wr-stepperButton" onClick={() => onChange(Math.max(0, value - 1))}>−</button>
        <span className="wr-stepperValue">{value}</span>
        <button type="button" className="wr-stepperButton" onClick={() => onChange(value + 1)}>+</button>
      </div>
    </div>
  );
}

function generateSessionId() { return crypto.randomUUID(); }

function buildPrompt(match: Match): string {
  const csPerMin = match.cs_at_10 && match.game_duration ? (match.cs_at_10 / match.game_duration).toFixed(1) : null;
  const goldPerMin = match.gold_earned && match.game_duration ? ((match.gold_earned * 1000) / match.game_duration).toFixed(0) : null;

  return `You are a Diamond-level Wild Rift coach. Analyze this ADC match and provide:
1. **Performance Summary**: Overall assessment (2-3 sentences)
2. **Strengths**: What went well (bullet points)
3. **Areas for Improvement**: Key mistakes or missed opportunities (bullet points)
4. **Tactical Feedback**: Specific actionable advice for next game

Match data:
- Champion: ${match.champion}
- Result: ${match.win ? 'Victory' : 'Defeat'}
- KDA: ${match.k_d_a}${match.kill_participation != null ? `\n- Kill participation: ${match.kill_participation}%` : ''}${match.performance_grade ? `\n- Grade: ${match.performance_grade}` : ''}${!match.win && match.loss_reason ? `\n- Loss reason: ${match.loss_reason}` : ''}
- Duration: ${match.game_duration ? `${match.game_duration} minutes` : 'not recorded'}${match.cs_at_10 ? `\n- Total CS: ${match.cs_at_10}` : ''}${csPerMin ? ` (${csPerMin} CS/min)` : ''}${goldPerMin ? `\n- Gold per minute: ${goldPerMin}` : ''}
- Rank: ${RANK_TIERS.find(t => t.value === match.rank_tier)?.label}${match.my_support ? `\n- My support: ${match.my_support}` : ''}${match.enemy_adc || match.enemy_support ? `\n- Enemy lane: ${match.enemy_adc || '?'} + ${match.enemy_support || '?'}` : ''}${match.first_blood !== null && match.first_blood !== undefined ? `\n- First blood: ${match.first_blood ? 'Got it' : 'Gave it away'}` : ''}${match.turret_kills ? `\n- Turrets: ${match.turret_kills}` : ''}${match.vision_score ? `\n- Vision score: ${match.vision_score}` : ''}${match.damage_dealt ? `\n- Damage dealt: ${match.damage_dealt}k` : ''}${match.damage_taken ? `\n- Damage taken: ${match.damage_taken}k` : ''}${match.dragons_taken ? `\n- Dragons: ${match.dragons_taken}` : ''}${match.barons_taken ? `\n- Barons: ${match.barons_taken}` : ''}${match.heralds_taken ? `\n- Heralds: ${match.heralds_taken}` : ''}${match.premade_with ? `\n- Playing with: ${match.premade_with}` : ''}${match.notes ? `\n- Player notes: ${match.notes}` : ''}

Provide honest, constructive feedback focused on improvement.`;
}

function buildBatchPrompt(matches: Match[], count: number | 'all'): string {
  const selected = count === 'all' ? [...matches] : matches.slice(-count);
  const wins = selected.filter(m => m.win).length;
  const losses = selected.length - wins;
  const wr = selected.length ? Math.round((wins / selected.length) * 100) : 0;

  const kdaValues = selected.map(m => {
    const p = m.k_d_a.split('/').map(n => parseInt(n, 10) || 0);
    return { k: p[0] ?? 0, d: p[1] ?? 0, a: p[2] ?? 0 };
  });
  const totalK = kdaValues.reduce((s, v) => s + v.k, 0);
  const totalD = kdaValues.reduce((s, v) => s + v.d, 0);
  const totalA = kdaValues.reduce((s, v) => s + v.a, 0);
  const avgK = (totalK / selected.length).toFixed(1);
  const avgD = (totalD / selected.length).toFixed(1);
  const avgA = (totalA / selected.length).toFixed(1);
  const kdaRatio = totalD > 0 ? ((totalK + totalA) / totalD).toFixed(2) : 'Perfect';

  const kpValues = selected.filter(m => m.kill_participation != null).map(m => m.kill_participation!);
  const avgKP = kpValues.length ? Math.round(kpValues.reduce((s, v) => s + v, 0) / kpValues.length) : null;

  const durValues = selected.filter(m => m.game_duration).map(m => m.game_duration!);
  const avgDur = durValues.length ? Math.round(durValues.reduce((s, v) => s + v, 0) / durValues.length) : null;

  const fbMatches = selected.filter(m => m.first_blood !== null && m.first_blood !== undefined);
  const fbRate = fbMatches.length
    ? Math.round((fbMatches.filter(m => m.first_blood).length / fbMatches.length) * 100)
    : null;

  const csMatches = selected.filter(m => m.cs_at_10 && m.game_duration);
  const avgCS = csMatches.length ? Math.round(csMatches.reduce((s, m) => s + (m.cs_at_10 || 0), 0) / csMatches.length) : null;
  const avgCSPerMin = csMatches.length ? (csMatches.reduce((s, m) => s + ((m.cs_at_10 || 0) / (m.game_duration || 1)), 0) / csMatches.length).toFixed(1) : null;

  const goldMatches = selected.filter(m => m.gold_earned && m.game_duration);
  const avgGPM = goldMatches.length ? Math.round(goldMatches.reduce((s, m) => s + ((m.gold_earned! * 1000) / (m.game_duration || 1)), 0) / goldMatches.length) : null;

  const champMap = new Map<string, { wins: number; total: number }>();
  selected.forEach(m => {
    const c = champMap.get(m.champion) || { wins: 0, total: 0 };
    champMap.set(m.champion, { wins: c.wins + (m.win ? 1 : 0), total: c.total + 1 });
  });
  const champBreakdown = Array.from(champMap.entries())
    .sort((a, b) => b[1].total - a[1].total)
    .map(([name, s]) => `${name} ${s.total}G ${Math.round((s.wins / s.total) * 100)}%WR`)
    .join(' | ');

  const gradeMap = new Map<string, number>();
  selected.filter(m => m.performance_grade).forEach(m => {
    gradeMap.set(m.performance_grade!, (gradeMap.get(m.performance_grade!) || 0) + 1);
  });
  const gradeBreakdown = Array.from(gradeMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([g, n]) => `${g} x${n}`).join(' | ');

  const lrMap = new Map<string, number>();
  selected.filter(m => !m.win && m.loss_reason).forEach(m => {
    lrMap.set(m.loss_reason!, (lrMap.get(m.loss_reason!) || 0) + 1);
  });
  const lrBreakdown = Array.from(lrMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([r, n]) => `${r} x${n}`).join(', ');

  let streak = 0;
  const lastResult = selected[selected.length - 1]?.win;
  for (let i = selected.length - 1; i >= 0; i--) {
    if (selected[i].win === lastResult) streak++;
    else break;
  }
  const streakLabel = streak >= 2 ? ` | Currently: ${streak}-game ${lastResult ? 'win' : 'loss'} streak` : '';

  const dateFrom = new Date(selected[0].created_at).toLocaleDateString();
  const dateTo = new Date(selected[selected.length - 1].created_at).toLocaleDateString();

  const matchLines = [...selected].reverse().map((m, i) => {
    const cspm = m.cs_at_10 && m.game_duration ? (m.cs_at_10 / m.game_duration).toFixed(1) : null;
    const gpm = m.gold_earned && m.game_duration ? ((m.gold_earned * 1000) / m.game_duration).toFixed(0) : null;
    const parts = [
      `G${i + 1}`,
      m.champion,
      m.win ? '✓WIN' : '×LOSS',
      m.k_d_a + (m.kill_participation ? ` KP${m.kill_participation}%` : ''),
      m.performance_grade || '',
      m.game_duration ? `${m.game_duration}m` : '',
      cspm ? `${cspm}CS/m` : '',
      gpm ? `${gpm}GPM` : '',
      m.my_support ? `w/${m.my_support}` : '',
      (m.enemy_adc || m.enemy_support) ? `vs ${m.enemy_adc || '?'}+${m.enemy_support || '?'}` : '',
      !m.win && m.loss_reason ? `[${m.loss_reason}]` : '',
      m.notes ? `"${m.notes}"` : '',
    ].filter(Boolean);
    return parts.join(' | ');
  }).join('\n');

  return `You are a Diamond-level Wild Rift coach. Analyze these ${selected.length} ADC matches for deep multi-game patterns:

1. **Playstyle Profile**: What kind of ADC player am I based on this data?
2. **Recurring Patterns**: Consistent strengths and weaknesses across games
3. **Biggest Improvement Area**: Single highest-impact thing to work on
4. **Champion Pool Notes**: Patterns per champion — what to play more/less of?
5. **Actionable Goals**: 2-3 specific, concrete goals for the next session

AGGREGATE STATS (${selected.length} games — ${dateFrom} to ${dateTo}):
• Record: ${wins}W–${losses}L (${wr}% WR)${streakLabel}
• Avg KDA: ${avgK}/${avgD}/${avgA} (${kdaRatio} ratio)${avgKP !== null ? `  |  Avg KP: ${avgKP}%` : ''}${avgDur !== null ? `  |  Avg duration: ${avgDur}m` : ''}${fbRate !== null ? `  |  First blood rate: ${fbRate}%` : ''}${avgCS !== null && avgCSPerMin ? `\n• Avg CS: ${avgCS} (${avgCSPerMin} CS/min)` : ''}${avgGPM ? `  |  Avg GPM: ${avgGPM}` : ''}
• Champions: ${champBreakdown}${gradeBreakdown ? `\n• Grades: ${gradeBreakdown}` : ''}${lrBreakdown ? `\n• Loss causes: ${lrBreakdown}` : ''}

MATCH LOG (most recent → oldest):
${matchLines}

Focus on patterns across games, not individual match breakdowns.`;
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState<Match[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState('');
  const [statusType, setStatusType] = useState<'error' | 'success' | ''>('');
  const [copiedAt, setCopiedAt] = useState<string | null>(null);
  const [batchCopied, setBatchCopied] = useState(false);

  const [champion, setChampion] = useState('');
  const [win, setWin] = useState(true);
  const [kills, setKills] = useState(0);
  const [deaths, setDeaths] = useState(0);
  const [assists, setAssists] = useState(0);
  const [killParticipation, setKillParticipation] = useState(0);
  const [performanceGrade, setPerformanceGrade] = useState('');
  const [lossReason, setLossReason] = useState('');
  const [currentRank, setCurrentRank] = useState('DIAMOND_IV');
  const [currentMarks, setCurrentMarks] = useState(2);
  const [mySupport, setMySupport] = useState('');
  const [enemyAdc, setEnemyAdc] = useState('');
  const [enemySupport, setEnemySupport] = useState('');
  const [enemyTop, setEnemyTop] = useState('');
  const [enemyJungle, setEnemyJungle] = useState('');
  const [enemyMid, setEnemyMid] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [gameDuration, setGameDuration] = useState(0);
  const [firstBlood, setFirstBlood] = useState<boolean | null>(null);
  const [turretKills, setTurretKills] = useState(0);
  const [visionScore, setVisionScore] = useState(0);
  const [premadeWith, setPremadeWith] = useState('');
  const [totalCS, setTotalCS] = useState(0);
  const [goldEarned, setGoldEarned] = useState(0);
  const [damageDealt, setDamageDealt] = useState(0);
  const [damageTaken, setDamageTaken] = useState(0);
  const [dragonsTaken, setDragonsTaken] = useState(0);
  const [baronsTaken, setBaronsTaken] = useState(0);
  const [heraldsTaken, setHeraldsTaken] = useState(0);
  const [notes, setNotes] = useState('');

  const [selectedBatchCount, setSelectedBatchCount] = useState<5 | 10 | 20 | 'all'>(10);

  useEffect(() => {
    // Handle OAuth redirect hash
    const hash = window.location.hash;
    if (hash && hash.includes('access_token')) {
      supabase.auth.setSession({
        access_token: new URLSearchParams(hash.substring(1)).get('access_token')!,
        refresh_token: new URLSearchParams(hash.substring(1)).get('refresh_token')!,
      }).then(() => {
        window.location.hash = '';
        window.history.replaceState(null, '', window.location.pathname);
      });
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => { if (user) fetchMatches(); }, [user]);

  const stats = useMemo(() => {
    const totalMatches = matches.length;
    const wins = matches.filter((m) => m.win).length;
    const winRate = totalMatches ? Math.round((wins / totalMatches) * 100) : 0;
    const currentSessionMatches = sessionId ? matches.filter(m => m.session_id === sessionId) : [];
    const sessionWins = currentSessionMatches.filter(m => m.win).length;
    const sessionLosses = currentSessionMatches.length - sessionWins;
    return { totalMatches, wins, winRate, sessionWins, sessionLosses };
  }, [matches, sessionId]);

  const laneStats = useMemo(() => {
    const withSupport = matches.filter((m) => m.my_support);
    const supportWinRates = new Map<string, { wins: number; total: number }>();
    withSupport.forEach((m) => {
      const key = m.my_support!;
      const current = supportWinRates.get(key) || { wins: 0, total: 0 };
      supportWinRates.set(key, { wins: current.wins + (m.win ? 1 : 0), total: current.total + 1 });
    });
    const withEnemy = matches.filter((m) => m.enemy_adc || m.enemy_support);
    const enemyWinRates = new Map<string, { wins: number; total: number }>();
    withEnemy.forEach((m) => {
      const key = `${m.enemy_adc || '?'} + ${m.enemy_support || '?'}`;
      const current = enemyWinRates.get(key) || { wins: 0, total: 0 };
      enemyWinRates.set(key, { wins: current.wins + (m.win ? 1 : 0), total: current.total + 1 });
    });
    return {
      supportWinRates: Array.from(supportWinRates.entries())
        .map(([name, s]) => ({ name, winRate: Math.round((s.wins / s.total) * 100), games: s.total }))
        .sort((a, b) => b.games - a.games),
      enemyWinRates: Array.from(enemyWinRates.entries())
        .map(([name, s]) => ({ name, winRate: Math.round((s.wins / s.total) * 100), games: s.total }))
        .sort((a, b) => b.games - a.games),
    };
  }, [matches]);

  const reversedMatches = useMemo(() => matches.slice().reverse(), [matches]);

  const fetchMatches = async () => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return;
    const { data, error } = await supabase.from('matches').select('*').order('created_at', { ascending: true });
    if (error) { setStatus(friendlySupabaseMessage(error.message)); setStatusType('error'); return; }
    if (data && data.length > 0) {
      const chartData = data.map((m) => ({ ...m, cumulativeMarks: m.marks_in_division }));
      setMatches(chartData);
      const latest = data[data.length - 1];
      setCurrentRank(latest.rank_tier);
      setCurrentMarks(latest.marks_in_division);
      if (latest.session_id) setSessionId(latest.session_id);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const handleStartSession = () => {
    setSessionId(generateSessionId());
    setStatus('New session started!'); setStatusType('success');
    setTimeout(() => { setStatus(''); setStatusType(''); }, 2000);
  };

  const openInPerplexity = (match: Match) => {
    window.open(`https://www.perplexity.ai/search?q=${encodeURIComponent(buildPrompt(match))}`, '_blank');
  };

  const copyPrompt = async (match: Match) => {
    try {
      await navigator.clipboard.writeText(buildPrompt(match));
      setCopiedAt(match.created_at);
      setTimeout(() => setCopiedAt(null), 2000);
    } catch {
      setStatus('Could not access clipboard.'); setStatusType('error');
    }
  };

  const openBatchInPerplexity = () => {
    window.open(`https://www.perplexity.ai/search?q=${encodeURIComponent(buildBatchPrompt(matches, selectedBatchCount))}`, '_blank');
  };

  const copyBatchPrompt = async () => {
    try {
      await navigator.clipboard.writeText(buildBatchPrompt(matches, selectedBatchCount));
      setBatchCopied(true);
      setTimeout(() => setBatchCopied(false), 2000);
    } catch {
      setStatus('Could not access clipboard.'); setStatusType('error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true); setStatus(''); setStatusType('');
    try {
      if (!champion) {
        setStatus('Pick your ADC champion first.'); setStatusType('error'); setSubmitting(false); return;
      }
      const maxMarks = getMaxMarks(currentRank);
      const newMarks = currentMarks + (win ? 1 : -1);
      if (newMarks < 0) {
        setStatus('You would demote. Change your rank tier manually first, then log the match.'); setStatusType('error'); setSubmitting(false); return;
      }
      if (newMarks > maxMarks) {
        setStatus('You would rank up. Change your rank tier to the next division first, then log the match.'); setStatusType('error'); setSubmitting(false); return;
      }
      const kdaNorm = `${kills}/${deaths}/${assists}`;
      const { error } = await supabase.from('matches').insert([{
        user_id: user?.id,
        champion, role: 'adc', win,
        k_d_a: kdaNorm,
        kill_participation: killParticipation || null,
        performance_grade: performanceGrade || null,
        loss_reason: (!win && lossReason) ? lossReason : null,
        rank_tier: currentRank, marks_in_division: newMarks,
        my_support: mySupport || null, enemy_adc: enemyAdc || null, enemy_support: enemySupport || null,
        enemy_top: enemyTop || null, enemy_jungle: enemyJungle || null, enemy_mid: enemyMid || null,
        session_id: sessionId, game_duration: gameDuration || null, first_blood: firstBlood,
        turret_kills: turretKills || null, vision_score: visionScore || null, premade_with: premadeWith || null,
        cs_at_10: totalCS || null,
        gold_earned: goldEarned || null, damage_dealt: damageDealt || null, damage_taken: damageTaken || null,
        dragons_taken: dragonsTaken || null, barons_taken: baronsTaken || null, heralds_taken: heraldsTaken || null,
        notes: notes || null,
      }]);
      if (error) { setStatus(friendlySupabaseMessage(error.message)); setStatusType('error'); setSubmitting(false); return; }
      setStatus(`Logged ${champion} successfully. Marks: ${newMarks}/${maxMarks}`);
      setStatusType('success');
      setCurrentMarks(newMarks);
      setChampion(''); setWin(true); setKills(0); setDeaths(0); setAssists(0);
      setKillParticipation(0); setPerformanceGrade(''); setLossReason('');
      setMySupport(''); setEnemyAdc(''); setEnemySupport(''); setEnemyTop(''); setEnemyJungle(''); setEnemyMid('');
      setGameDuration(0); setFirstBlood(null); setTurretKills(0); setVisionScore(0); setTotalCS(0);
      setGoldEarned(0); setDamageDealt(0); setDamageTaken(0);
      setDragonsTaken(0); setBaronsTaken(0); setHeraldsTaken(0); setNotes('');
      await fetchMatches();
    } catch (err: any) {
      setStatus(err?.message || 'Unexpected error.'); setStatusType('error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="wr-loadingShell">
        <div className="wr-spinner" />
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  const maxMarks = getMaxMarks(currentRank);

  return (
    <main className="wr-shell">
      <section className="wr-hero">
        <div>
          <div className="wr-badge">ADC only · quick log</div>
          <h1 className="wr-title">Wild Rift Tracker</h1>
          <p className="wr-subtitle">Apple-style, mobile-first, and much faster to fill in.</p>
        </div>
        <div className="wr-statGrid">
          <div className="wr-statCard"><span className="wr-statLabel">Matches</span><strong>{stats.totalMatches}</strong></div>
          <div className="wr-statCard"><span className="wr-statLabel">Win rate</span><strong>{stats.winRate}%</strong></div>
          <div className="wr-statCard">
            <span className="wr-statLabel">Current rank</span>
            <strong className="wr-rankDisplay">
              {RANK_TIERS.find((t) => t.value === currentRank)?.label}
              <span className="wr-marksDisplay">{currentMarks}/{maxMarks}</span>
            </strong>
          </div>
        </div>
        {sessionId && (
          <div className="wr-sessionBanner">
            <span>🎮 Session active</span>
            <span className="wr-sessionRecord">{stats.sessionWins}W – {stats.sessionLosses}L</span>
          </div>
        )}
        <button onClick={handleSignOut} className="wr-signOutButton">Sign out</button>
      </section>

      <section className="wr-card">
        <div className="wr-cardHeader">
          <div><h2>Quick log</h2><p>Tap a champ, set result, done.</p></div>
          <div className="wr-rolePill">Role locked: ADC</div>
        </div>
        {!sessionId && (
          <button type="button" onClick={handleStartSession} className="wr-secondaryButton">Start gaming session</button>
        )}
        <form onSubmit={handleSubmit} className="wr-form">

          <div>
            <label className="wr-label">Current rank &amp; marks</label>
            <div className="wr-rankPicker">
              <select value={currentRank} onChange={(e) => setCurrentRank(e.target.value)} className="wr-select">
                {RANK_TIERS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              <div className="wr-marksInput">
                <input type="number" inputMode="numeric" min={0} max={maxMarks} value={currentMarks}
                  onChange={(e) => setCurrentMarks(Math.min(maxMarks, Math.max(0, Number(e.target.value) || 0)))}
                  className="wr-input" />
                <span className="wr-marksLabel">/ {maxMarks} marks</span>
              </div>
            </div>
          </div>

          <div>
            <label className="wr-label">ADC champions</label>
            <div className="wr-chipGrid">
              {ADC_CHAMPIONS.map((name) => (
                <button key={name} type="button"
                  className={`wr-chip ${champion === name ? 'is-selected' : ''}`}
                  onClick={() => setChampion(name)} aria-pressed={champion === name}>
                  <span className={`wr-check ${champion === name ? 'is-selected' : ''}`}>✓</span>
                  {name}
                </button>
              ))}
            </div>
          </div>

          <div className="wr-segmentWrap">
            <span className="wr-label">Result</span>
            <div className="wr-segment">
              <button type="button" className={`wr-segmentButton ${win ? 'is-selected' : ''}`} onClick={() => setWin(true)}>Victory</button>
              <button type="button" className={`wr-segmentButton ${!win ? 'is-selected' : ''}`} onClick={() => setWin(false)}>Defeat</button>
            </div>
          </div>

          <div>
            <label className="wr-label">KDA</label>
            <div className="wr-kdaGrid">
              <StatStepper label="Kills" value={kills} onChange={setKills} />
              <StatStepper label="Deaths" value={deaths} onChange={setDeaths} />
              <StatStepper label="Assists" value={assists} onChange={setAssists} />
            </div>
          </div>

          <div>
            <label className="wr-label">KP %</label>
            <input
              type="text" inputMode="numeric"
              value={killParticipation === 0 ? '' : String(killParticipation)}
              onChange={(e) => {
                const v = e.target.value;
                if (v === '') { setKillParticipation(0); return; }
                const n = parseInt(v, 10);
                if (!isNaN(n) && n >= 0 && n <= 100) setKillParticipation(n);
              }}
              placeholder="0" className="wr-input"
            />
          </div>

          <div className="wr-segmentWrap">
            <span className="wr-label">Performance</span>
            <div className="wr-segment wr-gradeSegment">
              {GRADE_OPTIONS.map((g) => (
                <button key={g.value} type="button"
                  className={`wr-segmentButton ${performanceGrade === g.value ? 'is-selected' : ''} ${g.value === 'MVP' ? 'is-mvp' : g.value === 'SVP' ? 'is-svp' : ''}`}
                  onClick={() => setPerformanceGrade(g.value)}>
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          {!win && (
            <div className="wr-segmentWrap">
              <span className="wr-label">Why did you lose?</span>
              <div className="wr-segment wr-lossReasonSegment">
                {LOSS_REASONS.map((r) => (
                  <button key={r.value} type="button"
                    className={`wr-segmentButton ${lossReason === r.value ? 'is-selected' : ''}`}
                    onClick={() => setLossReason(r.value)}>
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <details className="wr-details">
            <summary className="wr-label">Game timing &amp; performance</summary>
            <div className="wr-detailsContent">
              <StatStepper label="Duration (min)" value={gameDuration} onChange={setGameDuration} />
              <div className="wr-segmentWrap">
                <span className="wr-label">First blood</span>
                <div className="wr-segment wr-segmentThree">
                  <button type="button" className={`wr-segmentButton ${firstBlood === true ? 'is-selected' : ''}`} onClick={() => setFirstBlood(true)}>Got it</button>
                  <button type="button" className={`wr-segmentButton ${firstBlood === false ? 'is-selected' : ''}`} onClick={() => setFirstBlood(false)}>Gave it</button>
                  <button type="button" className={`wr-segmentButton ${firstBlood === null ? 'is-selected' : ''}`} onClick={() => setFirstBlood(null)}>—</button>
                </div>
              </div>
              <div className="wr-stepperGrid">
                <StatStepper label="Turrets" value={turretKills} onChange={setTurretKills} />
                <StatStepper label="Vision" value={visionScore} onChange={setVisionScore} />
                <StatStepper label="Total CS" value={totalCS} onChange={setTotalCS} />
              </div>
              <div className="wr-stepperGrid">
                <StatStepper label="Dragons" value={dragonsTaken} onChange={setDragonsTaken} />
                <StatStepper label="Barons" value={baronsTaken} onChange={setBaronsTaken} />
                <StatStepper label="Heralds" value={heraldsTaken} onChange={setHeraldsTaken} />
              </div>
            </div>
          </details>

          <details className="wr-details">
            <summary className="wr-label">Post-game stats (optional)</summary>
            <div className="wr-detailsContent">
              <div className="wr-stepperGrid">
                <StatStepper label="Gold (k)" value={goldEarned} onChange={setGoldEarned} />
                <StatStepper label="Dmg dealt (k)" value={damageDealt} onChange={setDamageDealt} />
                <StatStepper label="Dmg taken (k)" value={damageTaken} onChange={setDamageTaken} />
              </div>
            </div>
          </details>

          <details className="wr-details">
            <summary className="wr-label">Lane matchup (optional)</summary>
            <div className="wr-detailsContent">
              <div>
                <label className="wr-label">Premade with</label>
                <input type="text" value={premadeWith} onChange={(e) => setPremadeWith(e.target.value)} placeholder="Friend's name or 'solo'" className="wr-input" />
              </div>
              <div>
                <label className="wr-label">My support</label>
                <select value={mySupport} onChange={(e) => setMySupport(e.target.value)} className="wr-select">
                  <option value="">—</option>
                  {SUPPORT_CHAMPIONS.map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div>
                <label className="wr-label">Enemy bot lane</label>
                <div className="wr-enemyLane">
                  <select value={enemyAdc} onChange={(e) => setEnemyAdc(e.target.value)} className="wr-select">
                    <option value="">ADC</option>
                    {ADC_CHAMPIONS.map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                  <select value={enemySupport} onChange={(e) => setEnemySupport(e.target.value)} className="wr-select">
                    <option value="">Support</option>
                    {SUPPORT_CHAMPIONS.map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="wr-label">Enemy team (optional)</label>
                <div className="wr-enemyTeam">
                  <select value={enemyTop} onChange={(e) => setEnemyTop(e.target.value)} className="wr-select">
                    <option value="">Top</option>{TOP_CHAMPIONS.map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                  <select value={enemyJungle} onChange={(e) => setEnemyJungle(e.target.value)} className="wr-select">
                    <option value="">Jungle</option>{JUNGLE_CHAMPIONS.map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                  <select value={enemyMid} onChange={(e) => setEnemyMid(e.target.value)} className="wr-select">
                    <option value="">Mid</option>{MID_CHAMPIONS.map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </details>

          <details className="wr-details">
            <summary className="wr-label">Notes</summary>
            <div className="wr-detailsContent">
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g., 'tilted', 'hard carry', 'afk teammate'" className="wr-textarea" rows={3} />
            </div>
          </details>

          <button type="submit" disabled={submitting} className="wr-primaryButton">
            {submitting ? 'Saving match...' : 'Log match'}
          </button>
          {status && <div className={`wr-message ${statusType === 'error' ? 'is-error' : 'is-success'}`}>{status}</div>}
        </form>
      </section>

      <section className="wr-grid">
        <div className="wr-card">
          <div className="wr-cardHeader compact"><div><h2>Mark progression</h2><p>Your mark count over time.</p></div></div>
          <div className="wr-chartWrap">
            {matches.length === 0 ? <div className="wr-emptyState">No matches yet.</div> : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={matches}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#263041" opacity={0.35} />
                  <XAxis dataKey="created_at" tickFormatter={(str) => new Date(str).toLocaleDateString()} stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, color: '#e2e8f0' }} />
                  <Line type="monotone" dataKey="cumulativeMarks" stroke="#60a5fa" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="wr-card">
          <div className="wr-cardHeader compact"><div><h2>Win rate with support</h2><p>How you perform with each support.</p></div></div>
          <div className="wr-laneStatsList">
            {laneStats.supportWinRates.length === 0 ? <div className="wr-emptyState">Log matches with support data first.</div> : (
              laneStats.supportWinRates.map((stat) => (
                <div key={stat.name} className="wr-laneStatRow">
                  <span className="wr-laneStatName">{stat.name}</span>
                  <div className="wr-laneStatRight">
                    <span className="wr-laneStatGames">{stat.games}G</span>
                    <span className={`wr-laneStatWr ${stat.winRate >= 50 ? 'is-positive' : 'is-negative'}`}>{stat.winRate}%</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="wr-card">
          <div className="wr-cardHeader compact"><div><h2>Win rate vs enemy lane</h2><p>Your matchups against enemy duos.</p></div></div>
          <div className="wr-laneStatsList">
            {laneStats.enemyWinRates.length === 0 ? <div className="wr-emptyState">Log matches with enemy lane data first.</div> : (
              laneStats.enemyWinRates.map((stat) => (
                <div key={stat.name} className="wr-laneStatRow">
                  <span className="wr-laneStatName">{stat.name}</span>
                  <div className="wr-laneStatRight">
                    <span className="wr-laneStatGames">{stat.games}G</span>
                    <span className={`wr-laneStatWr ${stat.winRate >= 50 ? 'is-positive' : 'is-negative'}`}>{stat.winRate}%</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="wr-card">
          <div className="wr-cardHeader compact"><div><h2>Recent matches</h2><p>Latest entries first.</p></div></div>

          {matches.length >= 2 && (
            <div className="wr-batchExport">
              <div className="wr-batchExportHeader">
                <span className="wr-batchExportTitle">📊 Multi-game analysis</span>
                <span className="wr-batchExportSub">Identify trends &amp; playstyle patterns</span>
              </div>
              <div className="wr-batchCounts">
                {([5, 10, 20, 'all'] as const).map((n) => (
                  <button
                    key={String(n)}
                    type="button"
                    className={`wr-batchCount ${selectedBatchCount === n ? 'is-selected' : ''}`}
                    onClick={() => setSelectedBatchCount(n)}
                    disabled={n !== 'all' && matches.length < n}
                  >
                    {n === 'all' ? `All ${matches.length}` : `Last ${n}`}
                  </button>
                ))}
              </div>
              <div className="wr-actionButtons" style={{ justifyContent: 'flex-start' }}>
                <button type="button" onClick={openBatchInPerplexity} className="wr-perplexityButton">
                  🤖 Analyze in Perplexity
                </button>
                <button
                  type="button"
                  onClick={copyBatchPrompt}
                  className={`wr-copyButton ${batchCopied ? 'is-copied' : ''}`}
                >
                  {batchCopied ? '✓ Copied' : '📋 Copy prompt'}
                </button>
              </div>
            </div>
          )}

          <div className="wr-historyList">
            {matches.length === 0 ? <div className="wr-emptyState">No matches logged yet.</div> : (
              reversedMatches.map((match, index) => (
                <article key={index} className={`wr-matchCard ${match.win ? 'is-win' : 'is-loss'}`}>
                  <div className="wr-championBanner" style={{ backgroundImage: `url(${getChampionSplashUrl(match.champion)})` }} />
                  <div className="wr-matchContent">
                    <div className="wr-matchLeft">
                      <div className="wr-matchTop">
                        <strong>{match.champion}</strong>
                        <span className="wr-roleTag">ADC</span>
                        {match.game_duration && <span className="wr-durationTag">{match.game_duration}m</span>}
                        {match.performance_grade && (
                          <span className={`wr-gradeBadge ${
                            match.performance_grade === 'MVP' ? 'is-mvp'
                            : match.performance_grade === 'SVP' ? 'is-svp'
                            : match.performance_grade === 'S' ? 'is-s' : 'is-a'
                          }`}>{match.performance_grade}</span>
                        )}
                      </div>
                      {match.my_support && (
                        <div className="wr-matchLane">
                          w/ {match.my_support}
                          {(match.enemy_adc || match.enemy_support) && <> vs {match.enemy_adc || '?'} + {match.enemy_support || '?'}</>}
                        </div>
                      )}
                      {!match.win && match.loss_reason && (
                        <div className="wr-lossReasonTag">🟥 {match.loss_reason}</div>
                      )}
                      {match.notes && <div className="wr-matchNotes">{match.notes}</div>}
                      <div className="wr-matchMeta">{new Date(match.created_at).toLocaleString()}</div>
                    </div>
                    <div className="wr-matchRight">
                      <div className="wr-kda">{match.k_d_a}</div>
                      {match.kill_participation != null && match.kill_participation > 0 && (
                        <div className="wr-kpBadge">KP {match.kill_participation}%</div>
                      )}
                      {match.first_blood !== null && match.first_blood !== undefined && (
                        <div className={`wr-firstBlood ${match.first_blood ? 'is-positive' : 'is-negative'}`}>
                          {match.first_blood ? '🩸 FB' : '💀 Gave FB'}
                        </div>
                      )}
                      <div className="wr-marks">{match.marks_in_division}/{getMaxMarks(match.rank_tier)}</div>
                      <div className="wr-actionButtons">
                        <button type="button" onClick={() => openInPerplexity(match)} className="wr-perplexityButton" title="Open in Perplexity">
                          🤖 Ask AI
                        </button>
                        <button
                          type="button"
                          onClick={() => copyPrompt(match)}
                          className={`wr-copyButton ${copiedAt === match.created_at ? 'is-copied' : ''}`}
                          title="Copy prompt to clipboard"
                        >
                          {copiedAt === match.created_at ? '✓ Copied' : '📋 Copy'}
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
