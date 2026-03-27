'use client';
import { useEffect, useState } from 'react';

export default function AccountManager() {
  const [cookie, setCookie] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedCookie = localStorage.getItem('roblox_session');
    if (savedCookie) {
      setCookie(savedCookie);
      setIsLoggedIn(true);
      fetchData(savedCookie);
    }
  }, []);

  const handleConnect = () => {
    if (!cookie.includes('_|WARNING')) {
      alert("Invalid Cookie Format. Please include the full .ROBLOSECURITY string.");
      return;
    }
    localStorage.setItem('roblox_session', cookie);
    setIsLoggedIn(true);
    fetchData(cookie);
  };

  const handleLogout = () => {
    localStorage.removeItem('roblox_session');
    setCookie('');
    setIsLoggedIn(false);
    setRequests([]);
  };

  const fetchData = async (currentCookie: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/friends', {
        headers: { 'x-roblox-cookie': currentCookie }
      });
      const data = await res.json();
      
      const updated = await Promise.all((data.requests || []).map(async (item: any) => {
        const sid = item.friendRequest?.senderId || item.id;
        try {
          const userRes = await fetch(`https://users.roproxy.com/v1/users/${sid}`);
          const uData = await userRes.json();
          return { ...item, sid, username: uData.name, displayName: uData.displayName };
        } catch { 
          return { ...item, sid, username: "Unknown", displayName: "User" }; 
        }
      }));
      setRequests(updated);
    } catch (err) {
      console.error("Fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  const accept = async (id: string) => {
    const res = await fetch('/api/friends', {
      method: 'POST',
      body: JSON.stringify({ userId: id, cookie }),
    });
    if (res.ok) {
      setRequests(prev => prev.filter((u: any) => u.sid.toString() !== id.toString()));
    }
  };

  if (!isLoggedIn) {
    return (
      <div style={{ background: '#0a0a0a', color: '#fff', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ background: '#111', padding: '40px', borderRadius: '20px', border: '1px solid #333', textAlign: 'center', width: '450px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
          <h2 style={{ fontSize: '28px', marginBottom: '10px' }}>Cookie Connector</h2>
          <p style={{ color: '#888', marginBottom: '25px' }}>Paste your .ROBLOSECURITY to manage requests.</p>
          <textarea 
            value={cookie}
            onChange={(e) => setCookie(e.target.value)}
            style={{ width: '100%', height: '100px', background: '#1a1a1a', color: '#4ade80', border: '1px solid #444', borderRadius: '12px', padding: '15px', outline: 'none', fontSize: '12px', resize: 'none' }}
            placeholder="_|WARNING:-DO-NOT-SHARE-..."
          />
          <button onClick={handleConnect} style={{ width: '100%', marginTop: '25px', padding: '14px', background: '#0070f3', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s', fontSize: '16px' }}>
            Connect Account
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#050505', color: '#fff', minHeight: '100vh', padding: '50px', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '50px', borderBottom: '1px solid #222', paddingBottom: '20px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: '800' }}>Management Console</h1>
            <p style={{ color: '#666', marginTop: '5px' }}>{requests.length} Requests filtered</p>
          </div>
          <div style={{ display: 'flex', gap: '15px' }}>
            <button 
              onClick={() => fetchData(cookie)} 
              disabled={loading}
              style={{ padding: '12px 24px', background: '#1a1a1a', color: '#fff', border: '1px solid #333', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', opacity: loading ? 0.5 : 1 }}
            >
              {loading ? 'Refreshing...' : 'Refresh Requests'}
            </button>
            <button onClick={handleLogout} style={{ padding: '12px 24px', background: '#ff4d4d', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700' }}>
              Logout
            </button>
          </div>
        </header>

        {loading && <div style={{ textAlign: 'center', padding: '50px', fontSize: '20px', color: '#0070f3' }}>Scanning for bots...</div>}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '25px' }}>
          {!loading && requests.map((user: any) => (
            <div key={user.sid} style={{ background: '#111', padding: '30px', borderRadius: '18px', border: '1px solid #222', textAlign: 'center', transition: 'transform 0.2s hover' }}>
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <img 
                  src={`https://www.roblox.com/headshot-thumbnail/image?userId=${user.sid}&width=150&height=150&format=png`} 
                  style={{ width: '120px', height: '120px', borderRadius: '50%', marginBottom: '20px', border: '3px solid #0070f3', padding: '5px', background: '#000' }} 
                  alt="User"
                />
              </div>
              <div style={{ fontWeight: 'bold', fontSize: '18px', color: '#fff' }}>{user.displayName}</div>
              <div style={{ color: '#555', fontSize: '14px', marginBottom: '20px' }}>@{user.username}</div>
              
              <button 
                onClick={() => accept(user.sid)} 
                style={{ width: '100%', padding: '12px', background: '#0070f3', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}
              >
                Accept Friend
              </button>
            </div>
          ))}
        </div>

        {!loading && requests.length === 0 && (
          <div style={{ textAlign: 'center', marginTop: '100px', padding: '40px', background: '#111', borderRadius: '20px', border: '1px dashed #333' }}>
            <p style={{ color: '#666', fontSize: '18px' }}>Your request list is clean! All 610+ bots were filtered.</p>
          </div>
        )}
      </div>
    </div>
  );
}