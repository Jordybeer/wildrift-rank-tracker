"use client";
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

type Match = {
  champion: string;
  role: string;
  win: boolean;
  k_d_a: string;
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
  objective_participation?: number;
  dragons_taken?: number;
  barons_taken?: number;
  heralds_taken?: number;
  notes?: string;
  cumulativeMarks?: number;
};

const ADC_CHAMPIONS = [
  'Ashe',
  'Caitlyn',
  'Draven',
  'Ezreal',
  'Jhin',
  'Jinx',
  "Kai'Sa",
  'Kalista',
  'Lucian',
  'Miss Fortune',
  'Samira',
  'Sivir',
  'Smolder',
  'Tristana',
  'Twitch',
  'Varus',
  'Vayne',
  'Xayah',
  'Zeri',
];

const SUPPORT_CHAMPIONS = [
  'Alistar',
  'Bard',
  'Blitzcrank',
  'Braum',
  'Janna',
  'Karma',
  'Leona',
  'Lulu',
  'Lux',
  'Morgana',
  'Nami',
  'Nautilus',
  'Pyke',
  'Rakan',
  'Senna',
  'Seraphine',
  'Sona',
  'Soraka',
  'Tahm Kench',
  'Thresh',
  'Yuumi',
  'Zilean',
];

const TOP_CHAMPIONS = [
  'Aatrox',
  'Camille',
  'Darius',
  'Fiora',
  'Garen',
  'Gragas',
  'Gwen',
  'Irelia',
  'Jax',
  'Jayce',
  'Kennen',
  'Malphite',
  'Nasus',
  'Olaf',
  'Pantheon',
  'Renekton',
  'Riven',
  'Sett',
  'Shen',
  'Teemo',
  'Wukong',
  'Yasuo',
];

const JUNGLE_CHAMPIONS = [
  'Amumu',
  'Diana',
  'Ekko',
  'Evelynn',
  'Graves',
  'Jarvan IV',
  'Kha\'Zix',
  'Lee Sin',
  'Master Yi',
  'Nunu',
  'Rammus',
  'Rek\'Sai',
  'Rengar',
  'Shyvana',
  'Vi',
  'Warwick',
  'Wukong',
  'Xin Zhao',
];

const MID_CHAMPIONS = [
  'Ahri',
  'Akali',
  'Akshan',
  'Annie',
  'Aurelion Sol',
  'Brand',
  'Cassiopeia',
  'Diana',
  'Fizz',
  'Galio',
  'Katarina',
  'LeBlanc',
  'Lux',
  'Orianna',
  'Syndra',
  'Twisted Fate',
  'Veigar',
  'Viktor',
  'Yasuo',
  'Zed',
  'Ziggs',
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

function getMaxMarks(tier: string): number {
  return RANK_TIERS.find((t) => t.value === tier)?.marks || 5;
}

function friendlySupabaseMessage(message: string) {
  if (message.includes("Could not find the table 'public.matches'")) {
    return 'Supabase table missing. Run the updated supabase/schema.sql in SQL Editor, then disable RLS on the matches table.';
  }
  if (message.includes("column") && message.includes("does not exist")) {
    return 'Database schema is outdated. Drop the matches table and run the new supabase/schema.sql again, or manually add missing columns via Table Editor.';
  }
  return message;
}

function StatStepper({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (next: number) => void;
}) {
  return (
    <div className="wr-stepper">
      <span className="wr-label">{label}</span>
      <div className="wr-stepperControls">
        <button type="button" className="wr-stepperButton" onClick={() => onChange(Math.max(0, value - 1))}>
          −
        </button>
        <input
          type="number"
          inputMode="numeric"
          min={0}
          value={value}
          onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
          className="wr-stepperValue"
        />
        <button type="button" className="wr-stepperButton" onClick={() => onChange(value + 1)}>
          +
        </button>
      </div>
    </div>
  );
}

function generateSessionId() {
  return crypto.randomUUID();
}

function exportMatchForAI(match: Match) {
  const data = {
    prompt: `You are a Diamond-level Wild Rift coach. Analyze this ADC match and provide:
1. **Performance Summary**: Overall assessment (2-3 sentences)
2. **Strengths**: What went well (bullet points)
3. **Areas for Improvement**: Key mistakes or missed opportunities (bullet points)
4. **Tactical Feedback**: Specific actionable advice for next game

Match data:
- Champion: ${match.champion}
- Result: ${match.win ? 'Victory' : 'Defeat'}
- KDA: ${match.k_d_a}
- Duration: ${match.game_duration ? `${match.game_duration} minutes` : 'not recorded'}
- Rank: ${RANK_TIERS.find(t => t.value === match.rank_tier)?.label}
${match.my_support ? `- My support: ${match.my_support}` : ''}
${match.enemy_adc || match.enemy_support ? `- Enemy lane: ${match.enemy_adc || '?'} + ${match.enemy_support || '?'}` : ''}
${match.first_blood !== null && match.first_blood !== undefined ? `- First blood: ${match.first_blood ? 'Got it' : 'Gave it away'}` : ''}
${match.turret_kills ? `- Turrets destroyed: ${match.turret_kills}` : ''}
${match.vision_score ? `- Vision score: ${match.vision_score}` : ''}
${match.cs_at_10 ? `- CS at 10 min: ${match.cs_at_10}` : ''}
${match.gold_earned ? `- Gold earned: ${match.gold_earned}k` : ''}
${match.damage_dealt ? `- Damage dealt: ${match.damage_dealt}k` : ''}
${match.damage_taken ? `- Damage taken: ${match.damage_taken}k` : ''}
${match.dragons_taken ? `- Dragons secured: ${match.dragons_taken}` : ''}
${match.barons_taken ? `- Barons secured: ${match.barons_taken}` : ''}
${match.heralds_taken ? `- Heralds secured: ${match.heralds_taken}` : ''}
${match.objective_participation ? `- Objective participation: ${match.objective_participation}` : ''}
${match.premade_with ? `- Playing with: ${match.premade_with}` : ''}
${match.notes ? `- Player notes: ${match.notes}` : ''}

Provide honest, constructive feedback focused on improvement.`,
    match_data: {
      champion: match.champion,
      result: match.win ? 'Victory' : 'Defeat',
      kda: match.k_d_a,
      rank: RANK_TIERS.find(t => t.value === match.rank_tier)?.label,
      game_duration: match.game_duration,
      first_blood: match.first_blood,
      my_support: match.my_support,
      enemy_lane: {
        adc: match.enemy_adc,
        support: match.enemy_support,
      },
      enemy_team: {
        top: match.enemy_top,
        jungle: match.enemy_jungle,
        mid: match.enemy_mid,
      },
      stats: {
        turret_kills: match.turret_kills,
        vision_score: match.vision_score,
        cs_at_10: match.cs_at_10,
        gold_earned: match.gold_earned,
        damage_dealt: match.damage_dealt,
        damage_taken: match.damage_taken,
        objective_participation: match.objective_participation,
      },
      objectives: {
        dragons_taken: match.dragons_taken,
        barons_taken: match.barons_taken,
        heralds_taken: match.heralds_taken,
      },
      premade_with: match.premade_with,
      notes: match.notes,
      timestamp: match.created_at,
    },
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `match-${match.champion}-${new Date(match.created_at).toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Dashboard() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState('');
  const [statusType, setStatusType] = useState<'error' | 'success' | ''>('');

  const [champion, setChampion] = useState('');
  const [win, setWin] = useState(true);
  const [kills, setKills] = useState(0);
  const [deaths, setDeaths] = useState(0);
  const [assists, setAssists] = useState(0);
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
  const [goldEarned, setGoldEarned] = useState(0);
  const [damageDealt, setDamageDealt] = useState(0);
  const [damageTaken, setDamageTaken] = useState(0);
  const [csAt10, setCsAt10] = useState(0);
  const [objectiveParticipation, setObjectiveParticipation] = useState(0);
  const [dragonsTaken, setDragonsTaken] = useState(0);
  const [baronsTaken, setBaronsTaken] = useState(0);
  const [heraldsTaken, setHeraldsTaken] = useState(0);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchMatches();
  }, []);

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
      supportWinRates.set(key, {
        wins: current.wins + (m.win ? 1 : 0),
        total: current.total + 1,
      });
    });

    const withEnemy = matches.filter((m) => m.enemy_adc || m.enemy_support);
    const enemyWinRates = new Map<string, { wins: number; total: number }>();
    withEnemy.forEach((m) => {
      const key = `${m.enemy_adc || '?'} + ${m.enemy_support || '?'}`;
      const current = enemyWinRates.get(key) || { wins: 0, total: 0 };
      enemyWinRates.set(key, {
        wins: current.wins + (m.win ? 1 : 0),
        total: current.total + 1,
      });
    });

    return {
      supportWinRates: Array.from(supportWinRates.entries())
        .map(([name, stats]) => ({
          name,
          winRate: Math.round((stats.wins / stats.total) * 100),
          games: stats.total,
        }))
        .sort((a, b) => b.games - a.games),
      enemyWinRates: Array.from(enemyWinRates.entries())
        .map(([name, stats]) => ({
          name,
          winRate: Math.round((stats.wins / stats.total) * 100),
          games: stats.total,
        }))
        .sort((a, b) => b.games - a.games),
    };
  }, [matches]);

  const fetchMatches = async () => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return;

    const { data, error } = await supabase.from('matches').select('*').order('created_at', { ascending: true });

    if (error) {
      setStatus(friendlySupabaseMessage(error.message));
      setStatusType('error');
      return;
    }

    if (data && data.length > 0) {
      let cumulativeMarks = 0;
      const chartData = data.map((m) => {
        cumulativeMarks = m.marks_in_division;
        return { ...m, cumulativeMarks };
      });
      setMatches(chartData);
      const latest = data[data.length - 1];
      setCurrentRank(latest.rank_tier);
      setCurrentMarks(latest.marks_in_division);
      if (latest.session_id) {
        setSessionId(latest.session_id);
      }
    }
  };

  const handleStartSession = () => {
    const newSessionId = generateSessionId();
    setSessionId(newSessionId);
    setStatus('New session started!');
    setStatusType('success');
    setTimeout(() => {
      setStatus('');
      setStatusType('');
    }, 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus('');
    setStatusType('');

    try {
      if (!champion) {
        setStatus('Pick your ADC champion first.');
        setStatusType('error');
        setSubmitting(false);
        return;
      }

      const maxMarks = getMaxMarks(currentRank);
      let newMarks = currentMarks + (win ? 1 : -1);

      if (newMarks < 0) {
        setStatus('You would demote. Change your rank tier manually first, then log the match.');
        setStatusType('error');
        setSubmitting(false);
        return;
      }

      if (newMarks > maxMarks) {
        setStatus(`You would rank up. Change your rank tier to the next division first, then log the match.`);
        setStatusType('error');
        setSubmitting(false);
        return;
      }

      const { error } = await supabase.from('matches').insert([
        {
          champion,
          role: 'adc',
          win,
          k_d_a: `${kills}/${deaths}/${assists}`,
          rank_tier: currentRank,
          marks_in_division: newMarks,
          my_support: mySupport || null,
          enemy_adc: enemyAdc || null,
          enemy_support: enemySupport || null,
          enemy_top: enemyTop || null,
          enemy_jungle: enemyJungle || null,
          enemy_mid: enemyMid || null,
          session_id: sessionId,
          game_duration: gameDuration || null,
          first_blood: firstBlood,
          turret_kills: turretKills || null,
          vision_score: visionScore || null,
          premade_with: premadeWith || null,
          gold_earned: goldEarned || null,
          damage_dealt: damageDealt || null,
          damage_taken: damageTaken || null,
          cs_at_10: csAt10 || null,
          objective_participation: objectiveParticipation || null,
          dragons_taken: dragonsTaken || null,
          barons_taken: baronsTaken || null,
          heralds_taken: heraldsTaken || null,
          notes: notes || null,
        },
      ]);

      if (error) {
        setStatus(friendlySupabaseMessage(error.message));
        setStatusType('error');
        setSubmitting(false);
        return;
      }

      setStatus(`Logged ${champion} successfully. Marks: ${newMarks}/${maxMarks}`);
      setStatusType('success');
      setCurrentMarks(newMarks);
      setChampion('');
      setWin(true);
      setKills(0);
      setDeaths(0);
      setAssists(0);
      setMySupport('');
      setEnemyAdc('');
      setEnemySupport('');
      setEnemyTop('');
      setEnemyJungle('');
      setEnemyMid('');
      setGameDuration(0);
      setFirstBlood(null);
      setTurretKills(0);
      setVisionScore(0);
      setGoldEarned(0);
      setDamageDealt(0);
      setDamageTaken(0);
      setCsAt10(0);
      setObjectiveParticipation(0);
      setDragonsTaken(0);
      setBaronsTaken(0);
      setHeraldsTaken(0);
      setNotes('');
      await fetchMatches();
    } catch (error: any) {
      setStatus(error?.message || 'Unexpected error.');
      setStatusType('error');
    } finally {
      setSubmitting(false);
    }
  };

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
          <div className="wr-statCard">
            <span className="wr-statLabel">Matches</span>
            <strong>{stats.totalMatches}</strong>
          </div>
          <div className="wr-statCard">
            <span className="wr-statLabel">Win rate</span>
            <strong>{stats.winRate}%</strong>
          </div>
          <div className="wr-statCard">
            <span className="wr-statLabel">Current rank</span>
            <strong className="wr-rankDisplay">
              {RANK_TIERS.find((t) => t.value === currentRank)?.label}
              <span className="wr-marksDisplay">
                {currentMarks}/{maxMarks}
              </span>
            </strong>
          </div>
        </div>
        {sessionId && (
          <div className="wr-sessionBanner">
            <span>🎮 Session active</span>
            <span className="wr-sessionRecord">
              {stats.sessionWins}W - {stats.sessionLosses}L
            </span>
          </div>
        )}
      </section>

      <section className="wr-card">
        <div className="wr-cardHeader">
          <div>
            <h2>Quick log</h2>
            <p>Tap a champ, set result, done.</p>
          </div>
          <div className="wr-rolePill">Role locked: ADC</div>
        </div>

        {!sessionId && (
          <button type="button" onClick={handleStartSession} className="wr-secondaryButton">
            Start gaming session
          </button>
        )}

        <form onSubmit={handleSubmit} className="wr-form">
          <div>
            <label className="wr-label">Current rank &amp; marks</label>
            <div className="wr-rankPicker">
              <select value={currentRank} onChange={(e) => setCurrentRank(e.target.value)} className="wr-select">
                {RANK_TIERS.map((tier) => (
                  <option key={tier.value} value={tier.value}>
                    {tier.label}
                  </option>
                ))}
              </select>
              <div className="wr-marksInput">
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={maxMarks}
                  value={currentMarks}
                  onChange={(e) => setCurrentMarks(Math.min(maxMarks, Math.max(0, Number(e.target.value) || 0)))}
                  className="wr-input"
                />
                <span className="wr-marksLabel">/ {maxMarks} marks</span>
              </div>
            </div>
          </div>

          <div>
            <label className="wr-label">ADC champions</label>
            <div className="wr-chipGrid">
              {ADC_CHAMPIONS.map((name) => (
                <button
                  key={name}
                  type="button"
                  className={`wr-chip ${champion === name ? 'is-selected' : ''}`}
                  onClick={() => setChampion(name)}
                  aria-pressed={champion === name}
                >
                  <span className={`wr-check ${champion === name ? 'is-selected' : ''}`}>✓</span>
                  {name}
                </button>
              ))}
            </div>
          </div>

          <div className="wr-segmentWrap">
            <span className="wr-label">Result</span>
            <div className="wr-segment">
              <button type="button" className={`wr-segmentButton ${win ? 'is-selected' : ''}`} onClick={() => setWin(true)}>
                Victory
              </button>
              <button type="button" className={`wr-segmentButton ${!win ? 'is-selected' : ''}`} onClick={() => setWin(false)}>
                Defeat
              </button>
            </div>
          </div>

          <div className="wr-stepperGrid">
            <StatStepper label="Kills" value={kills} onChange={setKills} />
            <StatStepper label="Deaths" value={deaths} onChange={setDeaths} />
            <StatStepper label="Assists" value={assists} onChange={setAssists} />
          </div>

          <details className="wr-details">
            <summary className="wr-label">Game timing & performance</summary>
            <div className="wr-detailsContent">
              <StatStepper label="Duration (min)" value={gameDuration} onChange={setGameDuration} />
              
              <div className="wr-segmentWrap">
                <span className="wr-label">First blood</span>
                <div className="wr-segment wr-segmentThree">
                  <button type="button" className={`wr-segmentButton ${firstBlood === true ? 'is-selected' : ''}`} onClick={() => setFirstBlood(true)}>
                    Got it
                  </button>
                  <button type="button" className={`wr-segmentButton ${firstBlood === false ? 'is-selected' : ''}`} onClick={() => setFirstBlood(false)}>
                    Gave it
                  </button>
                  <button type="button" className={`wr-segmentButton ${firstBlood === null ? 'is-selected' : ''}`} onClick={() => setFirstBlood(null)}>
                    —
                  </button>
                </div>
              </div>

              <div className="wr-stepperGrid">
                <StatStepper label="Turrets" value={turretKills} onChange={setTurretKills} />
                <StatStepper label="Vision" value={visionScore} onChange={setVisionScore} />
                <StatStepper label="CS@10" value={csAt10} onChange={setCsAt10} />
              </div>

              <div className="wr-stepperGrid">
                <StatStepper label="Dragons" value={dragonsTaken} onChange={setDragonsTaken} />
                <StatStepper label="Barons" value={baronsTaken} onChange={setBaronsTaken} />
                <StatStepper label="Heralds" value={heraldsTaken} onChange={setHeraldsTaken} />
              </div>

              <StatStepper label="Obj participation" value={objectiveParticipation} onChange={setObjectiveParticipation} />
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
                <input
                  type="text"
                  value={premadeWith}
                  onChange={(e) => setPremadeWith(e.target.value)}
                  placeholder="Friend's name or 'solo'"
                  className="wr-input"
                />
              </div>

              <div>
                <label className="wr-label">My support</label>
                <select value={mySupport} onChange={(e) => setMySupport(e.target.value)} className="wr-select">
                  <option value="">—</option>
                  {SUPPORT_CHAMPIONS.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="wr-label">Enemy bot lane</label>
                <div className="wr-enemyLane">
                  <select value={enemyAdc} onChange={(e) => setEnemyAdc(e.target.value)} className="wr-select">
                    <option value="">ADC</option>
                    {ADC_CHAMPIONS.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                  <select value={enemySupport} onChange={(e) => setEnemySupport(e.target.value)} className="wr-select">
                    <option value="">Support</option>
                    {SUPPORT_CHAMPIONS.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="wr-label">Enemy team (optional)</label>
                <div className="wr-enemyTeam">
                  <select value={enemyTop} onChange={(e) => setEnemyTop(e.target.value)} className="wr-select">
                    <option value="">Top</option>
                    {TOP_CHAMPIONS.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                  <select value={enemyJungle} onChange={(e) => setEnemyJungle(e.target.value)} className="wr-select">
                    <option value="">Jungle</option>
                    {JUNGLE_CHAMPIONS.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                  <select value={enemyMid} onChange={(e) => setEnemyMid(e.target.value)} className="wr-select">
                    <option value="">Mid</option>
                    {MID_CHAMPIONS.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </details>

          <details className="wr-details">
            <summary className="wr-label">Notes</summary>
            <div className="wr-detailsContent">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g., 'tilted', 'hard carry', 'afk teammate'"
                className="wr-textarea"
                rows={3}
              />
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
          <div className="wr-cardHeader compact">
            <div>
              <h2>Mark progression</h2>
              <p>Your mark count over time.</p>
            </div>
          </div>
          <div className="wr-chartWrap">
            {matches.length === 0 ? (
              <div className="wr-emptyState">No matches yet.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={matches}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#263041" opacity={0.35} />
                  <XAxis dataKey="created_at" tickFormatter={(str) => new Date(str).toLocaleDateString()} stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 16,
                      color: '#e2e8f0',
                    }}
                  />
                  <Line type="monotone" dataKey="cumulativeMarks" stroke="#60a5fa" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="wr-card">
          <div className="wr-cardHeader compact">
            <div>
              <h2>Win rate with support</h2>
              <p>How you perform with each support.</p>
            </div>
          </div>
          <div className="wr-laneStatsList">
            {laneStats.supportWinRates.length === 0 ? (
              <div className="wr-emptyState">Log matches with support data first.</div>
            ) : (
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
          <div className="wr-cardHeader compact">
            <div>
              <h2>Win rate vs enemy lane</h2>
              <p>Your matchups against enemy duos.</p>
            </div>
          </div>
          <div className="wr-laneStatsList">
            {laneStats.enemyWinRates.length === 0 ? (
              <div className="wr-emptyState">Log matches with enemy lane data first.</div>
            ) : (
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
          <div className="wr-cardHeader compact">
            <div>
              <h2>Recent matches</h2>
              <p>Latest entries first.</p>
            </div>
          </div>
          <div className="wr-historyList">
            {matches.length === 0 ? (
              <div className="wr-emptyState">No matches logged yet.</div>
            ) : (
              matches
                .slice()
                .reverse()
                .map((match, index) => (
                  <article key={index} className={`wr-matchCard ${match.win ? 'is-win' : 'is-loss'}`}>
                    <div
                      className="wr-championBanner"
                      style={{
                        backgroundImage: `url(https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-splashes/${match.champion.toLowerCase().replace(/[^a-z]/g, '')}/0.jpg)`,
                      }}
                    />
                    <div className="wr-matchContent">
                      <div>
                        <div className="wr-matchTop">
                          <strong>{match.champion}</strong>
                          <span className="wr-roleTag">ADC</span>
                          {match.game_duration && <span className="wr-durationTag">{match.game_duration}m</span>}
                        </div>
                        {match.my_support && (
                          <div className="wr-matchLane">
                            w/ {match.my_support}
                            {(match.enemy_adc || match.enemy_support) && (
                              <>
                                {' '}vs {match.enemy_adc || '?'} + {match.enemy_support || '?'}
                              </>
                            )}
                          </div>
                        )}
                        {match.notes && <div className="wr-matchNotes">{match.notes}</div>}
                        <div className="wr-matchMeta">{new Date(match.created_at).toLocaleString()}</div>
                      </div>
                      <div className="wr-matchRight">
                        <div className="wr-kda">{match.k_d_a}</div>
                        {match.first_blood !== null && match.first_blood !== undefined && (
                          <div className={`wr-firstBlood ${match.first_blood ? 'is-positive' : 'is-negative'}`}>
                            {match.first_blood ? '🩸 FB' : '💀 Gave FB'}
                          </div>
                        )}
                        <div className="wr-marks">
                          {match.marks_in_division}/{getMaxMarks(match.rank_tier)}
                        </div>
                        <button
                          type="button"
                          onClick={() => exportMatchForAI(match)}
                          className="wr-exportButton"
                          title="Export for AI analysis"
                        >
                          🤖 Get AI feedback
                        </button>
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
