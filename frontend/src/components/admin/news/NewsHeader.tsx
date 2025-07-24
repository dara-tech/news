import Link from 'next/link';
import { Button } from '@/components/ui/button';

import {
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';



const NewsHeader = () => (
  <CardHeader>
    <div className="flex items-center justify-between gap-4">
      <div>
        <CardTitle>News Articles</CardTitle>
        <CardDescription>Manage, search, and filter all articles in the system.</CardDescription>
      </div>
      <div className="flex items-center gap-2">
        
        <Link href="/admin/news/create">
          <Button>Create Article</Button>
        </Link>
      </div>
    </div>
  </CardHeader>
);

export default NewsHeader;
