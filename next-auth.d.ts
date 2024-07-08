import type { UserRole } from '@prisma/client';
import type { DefaultSession } from 'next-auth';

import 'next-auth';

export type ExtendedUser = DefaultSession['user'] & {
  isOAuth: boolean;
  role: UserRole;
};

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: ExtendedUser;
  }
}
