import { headers } from 'next/headers';

import { createCaller } from '@/server/router';
import { createTRPCContext } from '@/server/trpc';
import 'server-only';

import 'server-only';

/**
 * This wraps the `createTRPCContext` helper and provides the required context
 * for the tRPC API when handling a tRPC call from a React Server Component.
 */
const createContext = () => {
  const heads = new Headers(headers());
  heads.set('x-trpc-source', 'rsc');

  return createTRPCContext({
    headers: heads,
  });
};

export const api = createCaller(createContext);
