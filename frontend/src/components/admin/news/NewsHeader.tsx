import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import {
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface NewsHeaderProps {
  searchTerm: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const NewsHeader = ({ searchTerm, onSearchChange }: NewsHeaderProps) => (
  <CardHeader>
    <div className="flex items-center justify-between gap-4">
      <div>
        <CardTitle>News Articles</CardTitle>
        <CardDescription>Manage, search, and filter all articles in the system.</CardDescription>
      </div>
      <div className="flex items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by title..."
            className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px] bg-background"
            value={searchTerm}
            onChange={onSearchChange}
          />
        </div>
        <Link href="/admin/news/create">
          <Button>Create Article</Button>
        </Link>
      </div>
    </div>
  </CardHeader>
);

export default NewsHeader;
