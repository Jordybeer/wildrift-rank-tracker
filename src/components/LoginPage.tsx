'use client';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

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
      <div className="wr-loginBg" />
      <div className="wr-loginContent">
        <div className="wr-loginHero">
          <div className="wr-loginBadge">ADC Performance Tracker</div>
          <h1 className="wr-loginTitle">Wild Rift Tracker</h1>
          <p className="wr-loginSubtitle">
            Track your rank progression, analyze matches with AI coaching, and level up your bot lane game.
          </p>
        </div>

        <div className="wr-loginCard">
          <div className="wr-loginCardInner">
            <div className="wr-lottieContainer">
              <dotlottie-player
                src="https://lottie.host/5d8e3c8a-7f8e-4f3e-9c5e-8f3e7f8e9c5e/8K3f9J3f9K.json"
                background="transparent"
                speed="1"
                style={{ width: '200px', height: '200px' }}
                loop
                autoplay
              />
            </div>
            <h2 className="wr-loginCardTitle">Sign in to continue</h2>
            <p className="wr-loginCardText">
              Secure authentication via GitHub OAuth. Your match data is private and only accessible by you.
            </p>
            <button
              onClick={handleGitHubLogin}
              disabled={loading}
              className="wr-githubButton"
            >
              <svg className="wr-githubIcon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              {loading ? 'Connecting...' : 'Sign in with GitHub'}
            </button>
          </div>
        </div>

        <footer className="wr-loginFooter">
          <p>Built for ADC mains who grind ranked and want real coaching insights.</p>
        </footer>
      </div>
    </div>
  );
}
