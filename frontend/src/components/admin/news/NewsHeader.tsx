import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const NewsHeader = () => (
  <CardHeader className="flex flex-row items-center justify-between">
    <div>
      <CardTitle>News Articles</CardTitle>
      <CardDescription>Manage all articles in the system.</CardDescription>
    </div>
    <Link href="/admin/news/create">
      <Button>Create Article</Button>
    </Link>
  </CardHeader>
);

export default NewsHeader;
