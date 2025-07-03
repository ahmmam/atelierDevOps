// frontend/src/App.jsx
import { useEffect, useState } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || '';

export default function App() {
  const [scores, setScores] = useState({ messi: 0, cruyff: 0 });

  // --- Helpers -------------------------------------------------------------
  const fetchScores = async () => {
    try {
      const res = await fetch(`${API_BASE}/scores`);
      if (res.ok) {
        setScores(await res.json());
      }
    } catch (err) {
      console.error(err);
    }
  };

  const vote = async (player) => {
    try {
      await fetch(`${API_BASE}/vote/${player}`, { method: 'POST' });
      fetchScores();
    } catch (err) {
      console.error(err);
    }
  };

  // --- Effects --------------------------------------------------------------
  useEffect(() => {
    fetchScores();
    const id = setInterval(fetchScores, 5000);
    return () => clearInterval(id);
  }, []);

  // --- Derived data ---------------------------------------------------------
  const total = scores.messi + scores.cruyff;
  const pctMessi = total ? (scores.messi / total) * 100 : 0;
  const pctCruyff = 100 - pctMessi;

  // --- Styles ---------------------------------------------------------------
  const container = {
    height: '100vh',
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    fontFamily: 'system-ui, sans-serif',
    background: '#000',
    color: '#fff',
    userSelect: 'none',
  };

  const headline = {
    textAlign: 'center',
    fontSize: '3rem',
    fontWeight: 700,
    margin: '1rem 0',
  };

  const barContainer = {
    width: '100%',
    height: '25px',
    display: 'flex',
    borderRadius: '8px',
    overflow: 'hidden',
    background: '#333',
  };

  const barMessi = {
    background: '#2563eb',
    width: `${pctMessi}%`,
    transition: 'width 0.4s ease',
  };

  const barCruyff = {
    background: '#dc2626',
    width: `${pctCruyff}%`,
    transition: 'width 0.4s ease',
  };

  const counts = {
    textAlign: 'center',
    margin: '0.5rem 0 1rem',
    fontSize: '1rem',
    letterSpacing: '0.5px',
  };

  const photosWrapper = {
    flex: 1,
    display: 'flex',
  };

  const photoBtn = (imgUrl) => ({
    flex: 1,
    background: `url('${imgUrl}') center/cover no-repeat`,
    border: 'none',
    outline: 'none',
    cursor: 'pointer',
    transition: 'filter 0.2s ease',
  });

  // --- JSX ------------------------------------------------------------------
  return (
    <div style={container}>
      <h1 style={headline}>Who is the GOAT&nbsp;?</h1>

      {/* Progress bar */}
      <div style={barContainer} aria-label="Current vote distribution">
        <div style={barMessi} />
        <div style={barCruyff} />
      </div>
      <div style={counts}>
        {total === 0 ? 'Be the first to vote!' : `${scores.messi} · Messi   |   ${scores.cruyff} · Cruyff`}
      </div>

      {/* Photos (voting buttons) */}
      <div style={photosWrapper}>
        <button
          aria-label="Vote for Messi"
          style={photoBtn('/messi.jpg')}
          onClick={() => vote('messi')}
        />
        <button
          aria-label="Vote for Cruyff"
          style={photoBtn('/cruyff.jpg')}
          onClick={() => vote('cruyff')}
        />
      </div>
    </div>
  );
}
