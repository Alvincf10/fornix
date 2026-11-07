import { describe, expect, it } from 'vitest';

const API = process.env.API_BASE_URL ?? 'http://localhost:3000/api/v1';

async function register(email: string) {
  const res = await fetch(`${API}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      displayName: 'Authz Tester',
      password: 'password123',
    }),
  });
  expect(res.status).toBeLessThan(300);
  return res.json() as Promise<{ accessToken: string; user: { id: string } }>;
}

describe('authorization ownership (live API)', () => {
  it('blocks cross-owner research access', async () => {
    const stamp = Date.now();
    const ownerA = await register(`owner_a_${stamp}@example.com`);
    const ownerB = await register(`owner_b_${stamp}@example.com`);

    const create = await fetch(`${API}/research`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${ownerA.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Private research',
        description: 'owner A only',
        category: 'Firmware',
      }),
    });
    expect(create.status).toBeLessThan(300);
    const research = (await create.json()) as { _id: string };

    const denied = await fetch(`${API}/research/${research._id}`, {
      headers: { Authorization: `Bearer ${ownerB.accessToken}` },
    });
    expect(denied.status).toBe(404);

    const allowed = await fetch(`${API}/research/${research._id}`, {
      headers: { Authorization: `Bearer ${ownerA.accessToken}` },
    });
    expect(allowed.status).toBe(200);
  });

  it('rejects unauthenticated research list', async () => {
    const res = await fetch(`${API}/research`);
    expect(res.status).toBe(401);
  });
});
