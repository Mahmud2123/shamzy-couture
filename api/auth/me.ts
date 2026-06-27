import { prisma, requireAuth, ok, err, setCors } from '../_helpers.js';

export default async function handler(req: any, res: any) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return err(res, 'Method not allowed', 405);

  const authUser = requireAuth(req, res);
  if (!authUser) return;

  const user = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
  });

  if (!user) return err(res, 'User not found', 404);
  return ok(res, user);
}
