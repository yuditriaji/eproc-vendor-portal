import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, DollarSign, MapPin, Clock, Building2 } from 'lucide-react';
import { formatCurrency, formatDate, getDaysRemaining } from '@/lib/formatters';
import type { Tender } from '@/types';

interface TenderCardProps {
  tender: Tender;
}

export function TenderCard({ tender }: TenderCardProps) {
  const daysRemaining = getDaysRemaining(tender.closingDate);
  const isUrgent = daysRemaining <= 7 && daysRemaining > 0;
  const isClosed = daysRemaining <= 0;

  const statusColors: Record<string, string> = {
    PUBLISHED: 'bg-green-500/10 text-green-700 dark:text-green-400',
    DRAFT: 'bg-gray-500/10 text-gray-700 dark:text-gray-400',
    CLOSED: 'bg-red-500/10 text-red-700 dark:text-red-400',
    AWARDED: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
  };

  return (
    <Card className="hover:shadow-lg transition-all hover:-translate-y-1 flex flex-col">
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <Badge className={statusColors[tender.status] || 'bg-gray-500/10'}>
            {tender.status}
          </Badge>
          {isUrgent && !isClosed && (
            <Badge variant="destructive" className="text-xs">
              Closing Soon
            </Badge>
          )}
        </div>

        <div>
          <h3 className="font-semibold text-lg line-clamp-2 hover:text-primary transition-colors">
            <Link href={`/vendor/tenders/${tender.id}`}>
              {tender.title}
            </Link>
          </h3>
          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
            <Building2 className="h-3 w-3" />
            {tender.organization?.name || 'N/A'}
          </p>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {tender.description || 'No description available'}
        </p>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Closing:</span>
            <span className="font-medium">{formatDate(tender.closingDate)}</span>
          </div>

          {tender.estimatedValue && (
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Estimated Value:</span>
              <span className="font-medium">
                {formatCurrency(tender.estimatedValue, tender.currency)}
              </span>
            </div>
          )}

          {tender.location && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground line-clamp-1">{tender.location}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className={`font-medium ${
              isClosed ? 'text-red-600' : isUrgent ? 'text-orange-600' : 'text-muted-foreground'
            }`}>
              {isClosed ? 'Closed' : `${daysRemaining} days remaining`}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <Button asChild className="w-full">
          <Link href={`/vendor/tenders/${tender.id}`}>
            View Details
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
