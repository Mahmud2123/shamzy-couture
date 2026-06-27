import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma, ok, err, setCors, generateToken } from '../_helpers.js';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional(),
});

export default async function handler(req: any, res: any) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return err(res, 'Method not allowed', 405);

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return err(res, parsed.error.errors[0].message);

  const { name, email, password, phone } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return err(res, 'Email already registered', 409);

  const hashed = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { name, email, password: hashed, phone },
  });

  const token = generateToken(user);
  return ok(
    res,
    { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } },
    201
  );
}
