"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

type Match = {
  champion: string;
  role: string;
  win: boolean;
  k_d_a: string;
  lp_delta: number;
  rank_tier: string;
  created_at: string;
  cumulativeLp?: number;
};

export default function Dashboard() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [statusType, setStatusType] = useState<'error' | 'success' | ''>('');

  const [champion, setChampion] = useState('');
  const [role, setRole] = useState('mid');
  const [win, setWin] = useState(true);
  const [kills, setKills] = useState('');
  const [deaths, setDeaths] = useState('');
  const [assists, setAssists] = useState('');
  const [lpDelta, setLpDelta] = useState('');
  const [rankTier, setRankTier] = useState('');

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return;

    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      setStatus(`Supabase read failed: ${error.message}`);
      setStatusType('error');
      return;
    }

    if (data) {
      let currentLp = 0;
      const chartData = data.map((m) => {
        currentLp += m.lp_delta || 0;
        return { ...m, cumulativeLp: currentLp };
      });
      setMatches(chartData);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus('');
    setStatusType('');

    try {
      const kda = `${kills}/${deaths}/${assists}`;
      const parsedLpDelta = parseInt(lpDelta, 10);

      if (isNaN(parsedLpDelta)) {
        setStatus('LP Delta must be a number (e.g., 15 or -12).');
        setStatusType('error');
        setSubmitting(false);
        return;
      }

      if (!champion.trim()) {
        setStatus('Champion name is required.');
        setStatusType('error');
        setSubmitting(false);
        return;
      }

      const { data, error } = await supabase
        .from('matches')
        .insert([
          {
            champion: champion.trim(),
            role,
            win,
            k_d_a: kda,
            lp_delta: parsedLpDelta,
            rank_tier: rankTier.trim() || 'Unranked',
          },
        ])
        .select();

      if (error) {
        setStatus(`Failed to log match: ${error.message}`);
        setStatusType('error');
        setSubmitting(false);
        return;
      }

      setStatus(`✓ ${champion} logged successfully`);
      setStatusType('success');

      setChampion('');
      setKills('');
      setDeaths('');
      setAssists('');
      setLpDelta('');
      setRankTier('');

      await fetchMatches();
    } catch (error: any) {
      setStatus(error?.message || 'Unexpected error.');
      setStatusType('error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent mb-2">
            Wild Rift Tracker
          </h1>
          <p className="text-slate-400 text-sm">Track your ranked journey, visualize your progress</p>
        </div>

        <div className="backdrop-blur-xl bg-slate-900/50 border border-slate-800/50 rounded-2xl p-6 md:p-8 mb-8 shadow-2xl">
          <h2 className="text-2xl font-bold text-slate-100 mb-6">Log Match</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Champion</label>
                <input
                  type="text"
                  value={champion}
                  onChange={(e) => setChampion(e.target.value)}
                  placeholder="e.g., Ahri"
                  className="w-full px-4 py-3 bg-slate-800/80 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800/80 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
                >
                  <option value="top">Top</option>
                  <option value="jungle">Jungle</option>
                  <option value="mid">Mid</option>
                  <option value="adc">ADC</option>
                  <option value="support">Support</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Kills</label>
                <input
                  type="number"
                  value={kills}
                  onChange={(e) => setKills(e.target.value)}
                  placeholder="0"
                  className="w-full px-4 py-3 bg-slate-800/80 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Deaths</label>
                <input
                  type="number"
                  value={deaths}
                  onChange={(e) => setDeaths(e.target.value)}
                  placeholder="0"
                  className="w-full px-4 py-3 bg-slate-800/80 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Assists</label>
                <input
                  type="number"
                  value={assists}
                  onChange={(e) => setAssists(e.target.value)}
                  placeholder="0"
                  className="w-full px-4 py-3 bg-slate-800/80 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Result</label>
                <select
                  value={win ? 'win' : 'loss'}
                  onChange={(e) => setWin(e.target.value === 'win')}
                  className="w-full px-4 py-3 bg-slate-800/80 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
                >
                  <option value="win">✓ Victory</option>
                  <option value="loss">✗ Defeat</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">LP Change</label>
                <input
                  type="text"
                  value={lpDelta}
                  onChange={(e) => setLpDelta(e.target.value)}
                  placeholder="15 or -12"
                  className="w-full px-4 py-3 bg-slate-800/80 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Rank</label>
                <input
                  type="text"
                  value={rankTier}
                  onChange={(e) => setRankTier(e.target.value)}
                  placeholder="Diamond II"
                  className="w-full px-4 py-3 bg-slate-800/80 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-600 hover:via-blue-700 hover:to-purple-700 disabled:from-slate-700 disabled:to-slate-700 text-white font-bold py-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-cyan-500/25 disabled:shadow-none"
            >
              {submitting ? 'Logging...' : 'Log Match'}
            </button>

            {status && (
              <div className={`px-4 py-3 rounded-xl text-sm font-medium ${statusType === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'}`}>
                {status}
              </div>
            )}
          </form>
        </div>

        <div className="backdrop-blur-xl bg-slate-900/50 border border-slate-800/50 rounded-2xl p-6 md:p-8 mb-8 shadow-2xl">
          <h2 className="text-2xl font-bold text-slate-100 mb-6">LP Progression</h2>
          <div className="h-80">
            {matches.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500">
                <div className="text-6xl mb-4">📊</div>
                <p className="text-lg">No matches yet. Log your first game!</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={matches}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                  <XAxis 
                    dataKey="created_at" 
                    tickFormatter={(str) => new Date(str).toLocaleDateString()} 
                    stroke="#64748b" 
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0f172a', 
                      borderColor: '#1e293b', 
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.3)'
                    }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="cumulativeLp" 
                    stroke="#06b6d4" 
                    strokeWidth={3} 
                    dot={{ r: 5, fill: '#06b6d4', strokeWidth: 2, stroke: '#0f172a' }} 
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="backdrop-blur-xl bg-slate-900/50 border border-slate-800/50 rounded-2xl p-6 md:p-8 shadow-2xl">
          <h2 className="text-2xl font-bold text-slate-100 mb-6">Recent Matches</h2>
          <div className="space-y-3">
            {matches.length === 0 ? (
              <div className="text-center py-16 text-slate-500">
                <div className="text-6xl mb-4">🎮</div>
                <p className="text-lg">No matches logged yet.</p>
              </div>
            ) : (
              matches
                .slice()
                .reverse()
                .map((m, i) => (
                  <div
                    key={i}
                    className={`p-5 rounded-xl border backdrop-blur-sm transition-all hover:scale-[1.01] ${
                      m.win 
                        ? 'border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10' 
                        : 'border-rose-500/30 bg-rose-500/5 hover:bg-rose-500/10'
                    } flex flex-col md:flex-row justify-between items-start md:items-center gap-3`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-bold text-xl text-slate-100">{m.champion}</span>
                        <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wide rounded-full bg-slate-800/80 text-slate-300">
                          {m.role}
                        </span>
                      </div>
                      <div className="text-sm text-slate-500">{new Date(m.created_at).toLocaleString()}</div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">KDA</div>
                        <div className="font-mono text-lg font-bold text-slate-200">{m.k_d_a}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">LP</div>
                        <div className={`font-bold text-2xl ${
                          m.lp_delta > 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}>
                          {m.lp_delta > 0 ? '+' : ''}{m.lp_delta}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
