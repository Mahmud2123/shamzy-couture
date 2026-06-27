import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma, requireAuth, ok, err, setCors } from '../_helpers.js';

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  address: z.object({
    line1: z.string(),
    city: z.string(),
    state: z.string().optional(),
    country: z.string(),
    postalCode: z.string().optional(),
  }).optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6).optional(),
});

export default async function handler(req: any, res: any) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'PUT') return err(res, 'Method not allowed', 405);

  const authUser = requireAuth(req, res);
  if (!authUser) return;

  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) return err(res, parsed.error.errors[0].message);

  const { currentPassword, newPassword, ...rest } = parsed.data;

  const user = await prisma.user.findUnique({ where: { id: authUser.id } });
  if (!user) return err(res, 'User not found', 404);

  const updateData: any = { ...rest };

  if (newPassword) {
    if (!currentPassword) return err(res, 'Current password required to change password');
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return err(res, 'Current password is incorrect', 401);
    updateData.password = await bcrypt.hash(newPassword, 12);
  }

  const updated = await prisma.user.update({
    where: { id: authUser.id },
    data: updateData,
    select: { id: true, name: true, email: true, phone: true, role: true, address: true },
  });

  return ok(res, updated);
}
