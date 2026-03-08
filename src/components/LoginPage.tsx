'use client';
import { supabase } from '@/lib/supabase';
import { useState } from 'react';
import Image from 'next/image';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  const handleGitHubLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}`,
      },
    });
    if (error) {
      console.error('GitHub login error:', error);
      setLoading(false);
    }
  };

  return (
    <div className="wr-loginShell">
      {/* Hextech animated background */}
      <div className="wr-loginBg">
        <div className="wr-hexPattern" />
      </div>

      {/* Main content */}
      <div className="wr-loginContent">
        {/* Glassmorphism card */}
        <div className="wr-loginCard">
          <div className="wr-loginBadge">Performance Tracker</div>
          
          {/* WR flame logo */}
          <div className="wr-logoWrap">
            <Image
              src="/wr-logo.png"
              alt="Wild Rift"
              width={200}
              height={200}
              priority
              className="wr-logo"
            />
          </div>

          <div className="wr-loginText">
            <h1 className="wr-loginTitle">Wild Rift Tracker</h1>
            <p className="wr-loginSubtitle">
              Track ranked progress, analyze matches with AI, and level up your ADC game.
            </p>
          </div>

          {/* Glass GitHub button */}
          <button
            onClick={handleGitHubLogin}
            disabled={loading}
            className="wr-githubButton"
          >
            <svg className="wr-githubIcon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            <span>{loading ? 'Connecting...' : 'Continue with GitHub'}</span>
          </button>

          <p className="wr-loginFooter">
            Secure OAuth • Private data • Built for ranked grinders
          </p>
        </div>
      </div>
    </div>
  );
}
