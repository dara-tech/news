import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import NewsTableActions from './NewsTableActions';
import { NewsArticle } from '@/types/news';

interface NewsTableProps {
  articles: NewsArticle[];
  onDelete: (id: string) => void;
}

const NewsTable = ({ articles, onDelete }: NewsTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead className="hidden md:table-cell">Category</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="hidden sm:table-cell">Flags</TableHead>
          <TableHead className="hidden md:table-cell">Created</TableHead>
          <TableHead>
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {articles.map((article) => (
          <TableRow key={article._id}>
            <TableCell className="font-medium">{article.title.en}</TableCell>
            <TableCell className="hidden md:table-cell">{article.category}</TableCell>
            <TableCell>
              <Badge variant={article.status === 'published' ? 'default' : 'outline'}>
                {article.status}
              </Badge>
            </TableCell>
            <TableCell className="hidden sm:table-cell">
              <div className="flex items-center gap-2">
                {article.isFeatured && <Badge variant="secondary">Featured</Badge>}
                {article.isBreaking && <Badge variant="destructive">Breaking</Badge>}
              </div>
            </TableCell>
            <TableCell className="hidden md:table-cell">
              {new Date(article.createdAt).toLocaleDateString()}
            </TableCell>
            <TableCell>
              <NewsTableActions articleId={article._id} onDelete={onDelete} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default NewsTable;
