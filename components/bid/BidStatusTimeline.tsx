import { formatDate } from '@/lib/formatters';
import { Check, Clock, XCircle } from 'lucide-react';
import type { Bid } from '@/types';

interface BidStatusTimelineProps {
  bid: Bid;
}

export function BidStatusTimeline({ bid }: BidStatusTimelineProps) {
  const statuses = [
    { key: 'DRAFT', label: 'Draft Created', icon: Clock },
    { key: 'SUBMITTED', label: 'Submitted', icon: Check },
    { key: 'UNDER_REVIEW', label: 'Under Review', icon: Clock },
    { key: 'ACCEPTED', label: 'Accepted', icon: Check },
  ];

  const currentStatusIndex = statuses.findIndex((s) => s.key === bid.status);
  const isRejected = bid.status === 'REJECTED';
  const isWithdrawn = bid.status === 'WITHDRAWN';

  if (isRejected || isWithdrawn) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
        <XCircle className="h-5 w-5 text-red-600 dark:text-red-500" />
        <div>
          <p className="font-medium text-red-900 dark:text-red-200">
            {isRejected ? 'Bid Rejected' : 'Bid Withdrawn'}
          </p>
          <p className="text-sm text-red-700 dark:text-red-300">
            {bid.updatedAt && formatDate(bid.updatedAt)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {statuses.map((status, index) => {
        const isCompleted = index <= currentStatusIndex;
        const isCurrent = index === currentStatusIndex;
        const Icon = status.icon;

        return (
          <div key={status.key} className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                isCompleted
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
              }`}
            >
              {isCompleted ? (
                <Check className="h-4 w-4" />
              ) : (
                <Icon className="h-4 w-4" />
              )}
            </div>
            <div className="flex-1">
              <p
                className={`text-sm font-medium ${
                  isCompleted ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                {status.label}
              </p>
              {isCurrent && bid.submittedAt && (
                <p className="text-xs text-muted-foreground">
                  {formatDate(bid.submittedAt)}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
