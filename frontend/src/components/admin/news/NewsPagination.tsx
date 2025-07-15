import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

interface NewsPaginationProps {
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
  indexOfFirstArticle: number;
  indexOfLastArticle: number;
  totalArticles: number;
}

const NewsPagination = ({
  currentPage,
  totalPages,
  setCurrentPage,
  indexOfFirstArticle,
  indexOfLastArticle,
  totalArticles,
}: NewsPaginationProps) => {
  return (
    <div className="flex justify-between items-center">
      <div className="text-xs text-muted-foreground">
        Showing <strong>{indexOfFirstArticle + 1}-{Math.min(indexOfLastArticle, totalArticles)}</strong> of <strong>{totalArticles}</strong> articles
      </div>
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setCurrentPage(Math.max(currentPage - 1, 1));
              }}
              className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
            />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setCurrentPage(Math.min(currentPage + 1, totalPages));
              }}
              className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};

export default NewsPagination;
