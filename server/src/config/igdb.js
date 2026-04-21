import axios from 'axios';

let tokenCache = null;

export const getAccessToken = async () => {
  if (tokenCache && tokenCache.expiresAt > Date.now()) return tokenCache.token;

  const { data } = await axios.post(
    'https://id.twitch.tv/oauth2/token',
    null,
    {
      params: {
        client_id:     process.env.IGDB_CLIENT_ID,
        client_secret: process.env.IGDB_CLIENT_SECRET,
        grant_type:    'client_credentials',
      },
    }
  );

  tokenCache = {
    token:     data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  };

  console.log('✅ IGDB token refreshed');
  return tokenCache.token;
};

export const igdbClient = async (endpoint, body) => {
  console.log("CLIENT ID:", process.env.IGDB_CLIENT_ID);
  const token = await getAccessToken();

  const { data } = await axios.post(
    `https://api.igdb.com/v4/${endpoint}`,
    body,
    {
      headers: {
        'Client-ID':     process.env.IGDB_CLIENT_ID,
        'Authorization': `Bearer ${token}`,
        'Content-Type':  'text/plain',
      },
    }
  );

  console.log("IGDB RESPONSE:", data);

  return data;
};