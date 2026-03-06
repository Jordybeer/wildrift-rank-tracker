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
    return 'Supabase table missing. Run the updated supabase/schema.sql in SQL Editor (not sandboxed query mode), then disable RLS on the matches table.';
  }
  if (message.includes("column") && message.includes("does not exist")) {
    return 'Database schema is outdated. Drop the matches table and run supabase/schema.sql again, or manually add missing columns via Table Editor.';
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

  useEffect(() => {
    fetchMatches();
  }, []);

  const stats = useMemo(() => {
    const totalMatches = matches.length;
    const wins = matches.filter((m) => m.win).length;
    const winRate = totalMatches ? Math.round((wins / totalMatches) * 100) : 0;
    return { totalMatches, wins, winRate };
  }, [matches]);

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
    }
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
      </section>

      <section className="wr-card">
        <div className="wr-cardHeader">
          <div>
            <h2>Quick log</h2>
            <p>Tap a champ, set result, done.</p>
          </div>
          <div className="wr-rolePill">Role locked: ADC</div>
        </div>

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
            <summary className="wr-label">Lane matchup (optional)</summary>
            <div className="wr-detailsContent">
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
                <label className="wr-label">Enemy ADC</label>
                <select value={enemyAdc} onChange={(e) => setEnemyAdc(e.target.value)} className="wr-select">
                  <option value="">—</option>
                  {ADC_CHAMPIONS.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="wr-label">Enemy support</label>
                <select value={enemySupport} onChange={(e) => setEnemySupport(e.target.value)} className="wr-select">
                  <option value="">—</option>
                  {SUPPORT_CHAMPIONS.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
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
                        <div className="wr-matchMeta">{new Date(match.created_at).toLocaleString()}</div>
                      </div>
                      <div className="wr-matchRight">
                        <div className="wr-kda">{match.k_d_a}</div>
                        <div className="wr-marks">
                          {match.marks_in_division}/{getMaxMarks(match.rank_tier)}
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
