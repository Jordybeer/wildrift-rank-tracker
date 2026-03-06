"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

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

      setStatus(`Logged ${champion} successfully!`);
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
    <div className="max-w-5xl mx-auto font-sans">
      <h1 className="text-3xl font-bold mb-8 text-blue-400">Wild Rift Tracker & Coach</h1>

      <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 mb-8">
        <h2 className="text-xl mb-4 font-semibold">Log Match Manually</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Champion</label>
              <input
                type="text"
                value={champion}
                onChange={(e) => setChampion(e.target.value)}
                placeholder="e.g., Ahri"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="top">Top</option>
                <option value="jungle">Jungle</option>
                <option value="mid">Mid</option>
                <option value="adc">ADC</option>
                <option value="support">Support</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Kills</label>
              <input
                type="number"
                value={kills}
                onChange={(e) => setKills(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Deaths</label>
              <input
                type="number"
                value={deaths}
                onChange={(e) => setDeaths(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Assists</label>
              <input
                type="number"
                value={assists}
                onChange={(e) => setAssists(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Win/Loss</label>
              <select
                value={win ? 'win' : 'loss'}
                onChange={(e) => setWin(e.target.value === 'win')}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="win">Win</option>
                <option value="loss">Loss</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">LP Change</label>
              <input
                type="text"
                value={lpDelta}
                onChange={(e) => setLpDelta(e.target.value)}
                placeholder="e.g., 15 or -12"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Rank Tier</label>
              <input
                type="text"
                value={rankTier}
                onChange={(e) => setRankTier(e.target.value)}
                placeholder="e.g., Diamond II"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            {submitting ? 'Logging...' : 'Log Match'}
          </button>

          {status && (
            <p className={`text-sm ${statusType === 'error' ? 'text-red-400' : 'text-green-400'}`}>
              {status}
            </p>
          )}
        </form>
      </div>

      <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 mb-8 h-96">
        <h2 className="text-xl mb-4 font-semibold">LP Progression</h2>
        {matches.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-500">No data yet. Log your first match!</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={matches}>
              <XAxis dataKey="created_at" tickFormatter={(str) => new Date(str).toLocaleDateString()} stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: '#333', borderRadius: '8px' }} />
              <Line type="monotone" dataKey="cumulativeLp" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
        <h2 className="text-xl mb-4 font-semibold">Recent Matches</h2>
        <div className="space-y-4">
          {matches.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No matches logged yet.</p>
          ) : (
            matches
              .slice()
              .reverse()
              .map((m, i) => (
                <div
                  key={i}
                  className={`p-4 rounded-lg border ${
                    m.win ? 'border-green-800 bg-green-900/20' : 'border-red-800 bg-red-900/20'
                  } flex justify-between items-center`}
                >
                  <div>
                    <span className="font-bold text-lg">{m.champion}</span>
                    <span className="text-gray-400 ml-2 capitalize">({m.role})</span>
                    <div className="text-sm text-gray-500 mt-1">{new Date(m.created_at).toLocaleString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-lg">{m.k_d_a}</div>
                    <div className={`font-bold ${m.lp_delta > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {m.lp_delta > 0 ? '+' : ''}
                      {m.lp_delta} LP
                    </div>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
}
