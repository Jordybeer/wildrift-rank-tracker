'use client';
import { supabase } from '@/lib/supabase';
import { useState } from 'react';

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
          
          {/* WR flame badge */}
          <div className="wr-logoWrap">
            <img
              src="https://public.boxcloud.com/api/2.0/internal_files/2157593473715/versions/2385200423315/representations/png_paged_2048x2048/content/1.png?access_token=1!b16hnMfSQtOLMeWaBMuyGfEwt9KArTxCd0ojeDz-h5E5HsCJigEQh2923EeS7aJnnlhRvAXvezwNazBPEhm3FiE2p2I9m1sUg3X6UDMUWRzGp1m44hF1QsK_MqOTDyFNcBZxTl7cmbpRVj84QodWrsAvNK0TNiJXH4ZiJhm4pr8_-GGW7CnTXWvZ35JpM7tJxSqOau0vIXaH5wm02lW_4TPElvPZvJPY-0yMRs0pTR3ouDUn22TczGNy0lWG1Bx8GHP_xsAc0J3abzdMp_dZg6JsuLvI8wiAz9uz-5dcR27UGuodgayYIK1tM3eFQ9u02lmSY6jkfqbf3kf1E9YvHPWUvXIYsNaGawLzosz8QEzS3dU_6Qi0wTpccgMP3sZA_3aUle0YVY8z3yxYRNHxV-PxRtBtd0Hm0HzROgiK2c3T4QOU82-9T1dkFd08MWYjXDqzk64pyHyp_uXHFuglAfkNCucinRK-jOWrAO5fZgBIbp3-D78GeHm7AeGP1bkvQNwnasI02OhVLHpAbHr19yfIEl4AI4CoBH1GefSbM62g_6ZkdpjddpFcSgM235j0vJcYzzpMt2Gvi3Ebm0tSmuk3z4WaL7KTPWytW1bcTA0qXrIUDdP_cNXxcDsBJ5dVhOIGOjlMeKPxuzvw6v3hz2uDQDSjJQbywAfdhCFRerCazdHWqrwHqip6hns5mIV4bqK-4f2FR0cnUZ4nt0O7Tpt77War6Lrh-mf_BIcI1IQUaIeWXIpcM1KutuT6TO6za31K3Msjo0gBzP1X7Z8oLGcwnVwIL9Q4wg..&box_client_name=box-content-preview&box_client_version=3.23.0"
              alt="Wild Rift"
              className="wr-logo"
            />
          </div>

          <div className="wr-loginText">
            <h1 className="wr-loginTitle">Wild Rift Tracker</h1>
            <p className="wr-loginSubtitle">
              Track ranked progress to git gud.
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
            is only a game, why you have to be mad? • Built with 💜
          </p>
        </div>
      </div>
    </div>
  );
}
