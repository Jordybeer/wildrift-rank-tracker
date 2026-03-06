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
  created_at: string;
  cumulativeLp?: number;
};

export default function Dashboard() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [statusType, setStatusType] = useState<'error' | 'success' | ''>('');

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

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploading(true);
    setStatus('');
    setStatusType('');

    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onloadend = async () => {
      try {
        const result = reader.result?.toString();
        const base64Data = result?.split(',')[1];

        if (!base64Data) {
          setStatus('Could not read screenshot as base64.');
          setStatusType('error');
          setUploading(false);
          return;
        }

        const res = await fetch('/api/parse-match', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: base64Data,
            mimeType: file.type || 'image/jpeg',
          }),
        });

        const payload = await res.json();

        if (!res.ok) {
          setStatus(payload.error || 'Parsing failed for an unknown reason.');
          setStatusType('error');
          setUploading(false);
          return;
        }

        setStatus(`Logged ${payload.match.champion} successfully.`);
        setStatusType('success');
        await fetchMatches();
      } catch (error: any) {
        setStatus(error?.message || 'Unexpected upload error.');
        setStatusType('error');
      } finally {
        setUploading(false);
      }
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-5xl mx-auto font-sans">
      <h1 className="text-3xl font-bold mb-8 text-blue-400">Wild Rift Tracker & Coach</h1>

      <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 mb-8">
        <h2 className="text-xl mb-4 font-semibold">Upload Post-Match Screenshot</h2>
        <input
          type="file"
          accept="image/*"
          onChange={handleUpload}
          disabled={uploading}
          className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
        />
        {uploading && <p className="text-blue-400 mt-4 animate-pulse">Analyzing screenshot with AI...</p>}
        {status && (
          <p className={`mt-4 text-sm ${statusType === 'error' ? 'text-red-400' : 'text-green-400'}`}>
            {status}
          </p>
        )}
      </div>

      <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 mb-8 h-96">
        <h2 className="text-xl mb-4 font-semibold">LP Progression</h2>
        {matches.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-500">No data yet. Upload a screenshot!</div>
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
          {matches.slice().reverse().map((m, i) => (
            <div key={i} className={`p-4 rounded-lg border ${m.win ? 'border-green-800 bg-green-900/20' : 'border-red-800 bg-red-900/20'} flex justify-between items-center`}>
              <div>
                <span className="font-bold text-lg">{m.champion}</span>
                <span className="text-gray-400 ml-2 capitalize">({m.role})</span>
                <div className="text-sm text-gray-500 mt-1">{new Date(m.created_at).toLocaleString()}</div>
              </div>
              <div className="text-right">
                <div className="font-mono text-lg">{m.k_d_a}</div>
                <div className={`font-bold ${m.lp_delta > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {m.lp_delta > 0 ? '+' : ''}{m.lp_delta} LP
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
