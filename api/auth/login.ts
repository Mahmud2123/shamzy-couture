import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma, ok, err, setCors, generateToken } from '../_helpers.js';

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export default async function handler(req: any, res: any) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return err(res, 'Method not allowed', 405);

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return err(res, parsed.error.errors[0].message);

  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return err(res, 'Invalid email or password', 401);

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return err(res, 'Invalid email or password', 401);

  const token = generateToken(user);
  return ok(res, {
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone },
  });
}
