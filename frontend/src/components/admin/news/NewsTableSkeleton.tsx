import {
  Table,  TableBody,  TableCell,  TableHead,  TableHeader,  TableRow,} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

const NewsTableSkeleton = () => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead><Skeleton className="h-4 w-24" /></TableHead>
          <TableHead className="hidden md:table-cell"><Skeleton className="h-4 w-20" /></TableHead>
          <TableHead><Skeleton className="h-4 w-16" /></TableHead>
          <TableHead className="hidden sm:table-cell"><Skeleton className="h-4 w-28" /></TableHead>
          <TableHead className="hidden md:table-cell"><Skeleton className="h-4 w-24" /></TableHead>
          <TableHead><span className="sr-only">Actions</span></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 5 }).map((_, index) => (
          <TableRow key={index}>
            <TableCell><Skeleton className="h-4 w-48" /></TableCell>
            <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-20" /></TableCell>
            <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
            <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
            <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
            <TableCell><Skeleton className="h-8 w-8" /></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default NewsTableSkeleton;
