export const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

export async function api(
  path: string,
  {
    method = "GET",
    body,
    userId,
  }: { method?: string; body?: any; userId?: string | number } = {}
) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(userId ? { "X-User": String(userId) } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  if (!res.ok) {
    let msg = `${res.status} ${res.statusText}`;
    try {
      const j = await res.json();
      msg = (j && (j.detail || j.message)) || JSON.stringify(j);
    } catch {}
    throw new Error(msg);
  }
  try {
    return await res.json();
  } catch {
    return null;
  }
}
