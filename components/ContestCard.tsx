import Link from 'next/link';

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { parseFutureDate, parseOldDate } from '@/lib/time';
import { Edit } from 'lucide-react';
import { PrimaryButton } from './LinkButton';

interface ContestCardParams {
  title: string;
  id: string;
  endTime: Date;
  startTime: Date;
  isAdmin: boolean;
}

export function ContestCard({
  title,
  id,
  startTime,
  endTime,
  isAdmin,
}: ContestCardParams) {
  const duration = `${
    Math.round(
      ((new Date(endTime).getTime() - new Date(startTime).getTime()) /
        (1000 * 60 * 60)) *
        10
    ) / 10
  } hours`;
  const isActive =
    startTime.getTime() < Date.now() && endTime.getTime() > Date.now();

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between">
          <CardTitle>{title}</CardTitle>
          {isAdmin && (
            <Link href={`/contests/${id}`}>
              <Edit />
            </Link>
          )}
        </div>
        <div>
          {startTime.getTime() < Date.now() &&
          endTime.getTime() < Date.now() ? (
            <div className="text-red-500">Ended</div>
          ) : null}
          {isActive ? <div className="text-green-500">Active</div> : null}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 dark:text-gray-400">
              {startTime.getTime() < Date.now() ? 'Started' : 'Starts in'}
            </p>
            <p>
              {startTime.getTime() < Date.now()
                ? parseOldDate(new Date(startTime))
                : parseFutureDate(new Date(startTime))}
            </p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">Duration</p>
            <p>{duration}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <PrimaryButton href={`/contest/${id}`}>
          {isActive ? 'Participate' : 'View Contest'}
        </PrimaryButton>
      </CardFooter>
    </Card>
  );
}
