/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { PATCH } from '../route';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

jest.mock('@/auth', () => ({
  auth: jest.fn(),
}));

jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      update: jest.fn(),
    },
  },
}));

describe('PATCH /api/admin/users/[id]/role', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fails if the user is not authenticated', async () => {
    (auth as jest.Mock).mockResolvedValue(null);

    const req = new NextRequest('http://localhost:3000/api/admin/users/1/role', {
      method: 'PATCH',
      body: JSON.stringify({ role: 'ADMIN' }),
    });

    const res = await PATCH(req, { params: Promise.resolve({ id: '1' }) });
    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.error).toBe('Unauthorized');
  });

  it('fails if the user is not an ADMIN', async () => {
    (auth as jest.Mock).mockResolvedValue({ user: { id: '2', role: 'REGISTRANT' } });

    const req = new NextRequest('http://localhost:3000/api/admin/users/1/role', {
      method: 'PATCH',
      body: JSON.stringify({ role: 'ADMIN' }),
    });

    const res = await PATCH(req, { params: Promise.resolve({ id: '1' }) });
    expect(res.status).toBe(403);
  });

  it('fails if invalid role is provided', async () => {
    (auth as jest.Mock).mockResolvedValue({ user: { id: '2', role: 'ADMIN' } });

    const req = new NextRequest('http://localhost:3000/api/admin/users/1/role', {
      method: 'PATCH',
      body: JSON.stringify({ role: 'SUPERADMIN' }),
    });

    const res = await PATCH(req, { params: Promise.resolve({ id: '1' }) });
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Invalid role');
  });

  it('fails if the admin tries to change their own role', async () => {
    (auth as jest.Mock).mockResolvedValue({ user: { id: '1', role: 'ADMIN' } });

    const req = new NextRequest('http://localhost:3000/api/admin/users/1/role', {
      method: 'PATCH',
      body: JSON.stringify({ role: 'REGISTRANT' }),
    });

    const res = await PATCH(req, { params: Promise.resolve({ id: '1' }) });
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Cannot change your own role');
  });

  it('successfully updates a users role to ADMIN', async () => {
    (auth as jest.Mock).mockResolvedValue({ user: { id: '2', role: 'ADMIN' } });

    const mockUpdatedUser = { id: '1', role: 'ADMIN' };
    (prisma.user.update as jest.Mock).mockResolvedValue(mockUpdatedUser);

    const req = new NextRequest('http://localhost:3000/api/admin/users/1/role', {
      method: 'PATCH',
      body: JSON.stringify({ role: 'ADMIN' }),
    });

    const res = await PATCH(req, { params: Promise.resolve({ id: '1' }) });
    expect(res.status).toBe(200);
    const json = await res.json();
    
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: '1' },
      data: { role: 'ADMIN' },
    });
    expect(json).toEqual(mockUpdatedUser);
  });
});
