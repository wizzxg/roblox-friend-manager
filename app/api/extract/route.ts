import { NextResponse } from 'next/server';

export async function GET() {
  let cookie = process.env.ROBLOX_COOKIE || "";
  cookie = cookie.replace(/^"|"$/g, ''); 

  try {
    let allIds: string[] = [];
    let cursor = "";
    
    // Scan up to 10 pages of requests
    for (let i = 0; i < 10; i++) { 
      const url = `https://friends.roproxy.com/v1/my/friends/requests?limit=100&cursor=${cursor}`;
      const res = await fetch(url, {
        headers: { 'Cookie': `.ROBLOSECURITY=${cookie}` },
        cache: 'no-store'
      });
      if (!res.ok) break;
      const data = await res.json();
      if (data.data) {
        data.data.forEach((user: any) => allIds.push(`"${user.id}"`));
      }
      if (data.nextPageCursor) cursor = data.nextPageCursor; else break;
      await new Promise(r => setTimeout(r, 100)); 
    }

    // This creates a simple HTML page with a Copy Button
    const html = `
      <html>
        <body style="background: #111; color: white; font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh;">
          <h2>Found ${allIds.length} Friend Request IDs</h2>
          <textarea id="idList" style="width: 80%; height: 200px; background: #222; color: #0f0; border: 1px solid #444; padding: 10px; margin-bottom: 20px;">${allIds.join(",\n")}</textarea>
          <button onclick="copyIds()" style="padding: 15px 30px; font-size: 18px; cursor: pointer; background: #0070f3; color: white; border: none; border-radius: 8px;">📋 Copy for Blacklist.json</button>
          
          <script>
            function copyIds() {
              const textArea = document.getElementById('idList');
              textArea.select();
              document.execCommand('copy');
              alert('Copied! Now paste this into the "ids": [ ] section of your blacklist.json');
            }
          </script>
        </body>
      </html>
    `;

    return new Response(html, {
      headers: { 'Content-Type': 'text/html' },
    });

  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}