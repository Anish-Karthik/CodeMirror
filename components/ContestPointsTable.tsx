'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { ContestPoints, User } from '@prisma/client';
import { useSession } from 'next-auth/react';

export function ContestPointsTable({
  contestPoints,
}: {
  contestPoints: (Partial<ContestPoints> & { user: Partial<User> })[];
}) {
  const session = useSession();

  function getClassName(
    contestPoint: Partial<ContestPoints> & { user: Partial<User> }
  ) {
    return `${
      session.data?.user.id === contestPoint.user.id
        ? 'text-extrabold text-green-500'
        : 'text-gray-500'
    }`;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Rank</TableHead>
          <TableHead>User</TableHead>
          <TableHead>Points</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {contestPoints.map((contestPoint) => (
          <TableRow key={`contest-points-${contestPoint.id}`}>
            <TableCell className={getClassName(contestPoint)}>
              {contestPoint.rank}
            </TableCell>
            <TableCell className={getClassName(contestPoint)}>
              {contestPoint.user.name}
            </TableCell>
            <TableCell className={getClassName(contestPoint)}>
              {contestPoint.points}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
