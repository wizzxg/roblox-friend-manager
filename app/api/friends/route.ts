import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(req: Request) {
  // Get cookie from request headers instead of VS Code .env
  const cookie = req.headers.get('x-roblox-cookie')?.replace(/^"|"$/g, '') || "";
  if (!cookie) return NextResponse.json({ error: "No Cookie Provided" }, { status: 401 });

  const filePath = path.join(process.cwd(), 'blacklist.json');
  let blacklistedIds = new Set<string>();
  
  if (fs.existsSync(filePath)) {
    try {
      const fileData = fs.readFileSync(filePath, 'utf8');
      const json = JSON.parse(fileData);
      const rawData = Array.isArray(json) ? json : (json.ids || []);
      rawData.forEach((item: any) => {
        const id = item?.id || item?.senderId || item; 
        if (id) blacklistedIds.add(id.toString().trim());
      });
    } catch (e) { console.error("Blacklist error"); }
  }

  try {
    const res = await fetch(`https://friends.roproxy.com/v1/my/friends/requests?limit=100`, {
      headers: { 'Cookie': `.ROBLOSECURITY=${cookie}` },
      cache: 'no-store'
    });

    const data = await res.json();
    if (!data.data) return NextResponse.json({ requests: [] });

    // Filter against your 610+ blacklist
    const filteredRequests = data.data.filter((item: any) => {
      const senderId = (item.friendRequest?.senderId || item.id || "").toString().trim();
      return !blacklistedIds.has(senderId);
    });

    return NextResponse.json({ requests: filteredRequests });
  } catch (error) {
    return NextResponse.json({ error: "Fetch failed" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const { userId, cookie: userCookie } = await req.json();
  const cookie = userCookie?.replace(/^"|"$/g, '') || "";

  // Get CSRF Token using the provided cookie
  const tokenFetch = await fetch("https://auth.roproxy.com/v2/logout", {
    method: "POST", 
    headers: { "Cookie": `.ROBLOSECURITY=${cookie}` }
  });
  const csrfToken = tokenFetch.headers.get("x-csrf-token") || "";

  const acceptRes = await fetch(`https://friends.roproxy.com/v1/users/${userId}/accept-friend-request`, {
    method: 'POST',
    headers: { 
      'Cookie': `.ROBLOSECURITY=${cookie}`, 
      'Content-Type': 'application/json', 
      'X-CSRF-TOKEN': csrfToken 
    }
  });

  return acceptRes.ok ? NextResponse.json({ success: true }) : NextResponse.json({ error: "Failed" }, { status: 400 });
}