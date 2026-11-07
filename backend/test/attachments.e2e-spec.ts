import { describe, expect, it } from 'vitest';

const API = process.env.API_BASE_URL ?? 'http://localhost:3000/api/v1';

async function authToken() {
  const email = `file_${Date.now()}@example.com`;
  const res = await fetch(`${API}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      displayName: 'File Tester',
      password: 'password123',
    }),
  });
  const body = (await res.json()) as { accessToken: string };
  return body.accessToken;
}

describe('file security (live API)', () => {
  it('rejects disallowed upload extensions', async () => {
    const token = await authToken();

    const researchRes = await fetch(`${API}/research`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'File parent',
        description: 'upload target',
        category: 'Firmware',
      }),
    });
    const research = (await researchRes.json()) as { _id: string };

    const form = new FormData();
    form.append('parentType', 'research');
    form.append('parentId', research._id);
    form.append(
      'file',
      new Blob(['MZ'], { type: 'application/octet-stream' }),
      'malware.exe',
    );

    const upload = await fetch(`${API}/attachments`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
    expect(upload.status).toBe(400);
  });
});
