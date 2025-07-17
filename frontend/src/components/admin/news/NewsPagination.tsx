import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
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
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    // Always show the first page
    if (totalPages > 0) pageNumbers.push(1);

    // Ellipsis after the first page if needed
    if (currentPage > 3) {
      pageNumbers.push('...');
    }

    // Pages around the current page
    for (let i = currentPage - 1; i <= currentPage + 1; i++) {
      if (i > 1 && i < totalPages) {
        pageNumbers.push(i);
      }
    }

    // Ellipsis before the last page if needed
    if (currentPage < totalPages - 2) {
      pageNumbers.push('...');
    }

    // Always show the last page
    if (totalPages > 1) pageNumbers.push(totalPages);

    return pageNumbers.map((page, index) => (
      <PaginationItem key={`${page}-${index}`}>
        {typeof page === 'number' ? (
          <PaginationLink
            href="#"
            isActive={currentPage === page}
            onClick={(e) => {
              e.preventDefault();
              handlePageChange(page);
            }}
          >
            {page}
          </PaginationLink>
        ) : (
          <PaginationEllipsis />
        )}
      </PaginationItem>
    ));
  };

  if (totalPages <= 1) {
    return (
      <div className="flex justify-end items-center mt-4 px-6 pb-4">
        <div className="text-xs text-muted-foreground">
          Showing <strong>{totalArticles}</strong> of <strong>{totalArticles}</strong> articles
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-between items-center mt-4 px-6 pb-4">
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
                handlePageChange(currentPage - 1);
              }}
              className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
            />
          </PaginationItem>
          {renderPageNumbers()}
          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handlePageChange(currentPage + 1);
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
