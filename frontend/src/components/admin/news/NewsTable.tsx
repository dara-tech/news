"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTable, SortableHeader, ActionDropdown } from '@/components/ui/data-table';
import { NewsArticle } from '@/types/news';
import NewsStatusChanger from './NewsStatusChanger';
import { ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

/**
 * Why is username still "Unknown" even when author is present?
 * 
 * In the NewsTable, the author column tries to display `article.author.username`.
 * If `author` is missing, not an object, or does not have a `username` property, it falls back to "Unknown".
 * 
 * If you see that `article.author` is an object, but `username` is still missing or undefined (even though the user schema requires it),
 * this is almost always because the backend is not populating the `username` field for the author.
 * 
 * For example, in Mongoose, if you use `.populate('author', 'email')`, only the `email` field is included, not `username`.
 * If you use `.populate('author', 'username')`, only `username` is included, not `email`.
 * 
 * If you want to see the username in the frontend, you must ensure the backend populates the `username` field:
 * 
 * Example (Mongoose):
 *   .populate('author', 'username')
 *   // or, if you want both username and email:
 *   .populate('author', 'username email')
 * 
 * See backend/models/User.mjs for the user schema: both `username` and `email` are required.
 * 
 * If you see "Unknown" in the Author column, but you know the user exists, your backend is not populating the `username` field.
 * 
 * Solution: Update your backend to always populate the `username` field for the author.
 */

interface NewsTableProps {
  articles: NewsArticle[];
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onStatusChange: (id: string, newStatus: 'draft' | 'published' | 'archived') => void;
  onAdd?: () => void;
  onExport?: () => void;
  onBulkDelete?: (articles: NewsArticle[]) => void;
}

const NewsTable = ({ 
  articles, 
  onDelete, 
  onDuplicate, 
  onStatusChange, 
  onAdd,
  onExport,
  onBulkDelete 
}: NewsTableProps) => {
  const router = useRouter();

  // Define columns for the advanced data table
  const columns: ColumnDef<NewsArticle>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="sm:scale-100 scale-90"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="sm:scale-100 scale-90"
        />
      ),
      enableSorting: false,
      enableHiding: false,
      size: 30,
    },
    {
      accessorKey: "title",
      header: ({ column }) => (
        <SortableHeader column={column}>Title</SortableHeader>
      ),
      cell: ({ row }) => {
        const article = row.original;
        return (
          <div className="flex flex-col space-y-1 min-w-[180px] sm:min-w-[200px] max-w-[280px] sm:max-w-[300px]">
            <div className="font-medium line-clamp-2 text-xs sm:text-sm md:text-base leading-tight">
              {article.title.en || article.title.kh || 'Untitled'}
            </div>
            <div className="text-[10px] sm:text-xs text-muted-foreground line-clamp-1">
              {article.description?.en || article.description?.kh || 'No description'}
            </div>
            {/* Mobile: Show compact category and status */}
            <div className="flex items-center gap-1 sm:hidden flex-wrap">
              <Badge variant="outline" className="text-[9px] px-1 py-0.5 h-auto">
                {typeof article.category === 'object' && article.category?.name?.en
                  ? article.category.name.en.substring(0, 8) + (article.category.name.en.length > 8 ? '...' : '')
                  : 'Uncat.'}
              </Badge>
              {article.isFeatured && (
                <Badge variant="secondary" className="text-[9px] px-1 py-0.5 h-auto">F</Badge>
              )}
              {article.isBreaking && (
                <Badge variant="destructive" className="text-[9px] px-1 py-0.5 h-auto">B</Badge>
              )}
            </div>
          </div>
        );
      },
      minSize: 180,
    },
    {
      accessorKey: "category",
      header: ({ column }) => (
        <SortableHeader column={column}>Category</SortableHeader>
      ),
      cell: ({ row }) => {
        const article = row.original;
        const categoryName = typeof article.category === 'object' && article.category?.name?.en
          ? article.category.name.en
          : 'Uncategorized';
        return (
          <Badge variant="outline" className="whitespace-nowrap text-[10px] sm:text-xs px-2 py-1">
            {categoryName.length > 12 ? categoryName.substring(0, 12) + '...' : categoryName}
          </Badge>
        );
      },
      filterFn: (row, id, value) => {
        const article = row.original;
        const categoryName = typeof article.category === 'object' && article.category?.name?.en
          ? article.category.name.en
          : 'Uncategorized';
        return categoryName.toLowerCase().includes(value.toLowerCase());
      },
      meta: {
        className: "hidden sm:table-cell"
      },
      size: 100,
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <SortableHeader column={column}>Status</SortableHeader>
      ),
      cell: ({ row }) => {
        const article = row.original;
        return (
          <div className="min-w-[80px] sm:min-w-[100px]">
            <NewsStatusChanger 
              articleId={article._id} 
              currentStatus={article.status} 
              onStatusChange={onStatusChange} 
            />
          </div>
        );
      },
      filterFn: (row, id, value) => {
        return row.getValue(id) === value;
      },
      size: 100,
    },
    {
      accessorKey: "flags",
      header: "Flags",
      cell: ({ row }) => {
        const article = row.original;
        return (
          <div className="flex items-center gap-1 flex-wrap min-w-[60px]">
            {article.isFeatured && (
              <Badge variant="secondary" className="text-[10px] sm:text-xs px-1 py-0.5">
                <span className="sm:hidden">F</span>
                <span className="hidden sm:inline">Featured</span>
              </Badge>
            )}
            {article.isBreaking && (
              <Badge variant="destructive" className="text-[10px] sm:text-xs px-1 py-0.5">
                <span className="sm:hidden">B</span>
                <span className="hidden sm:inline">Breaking</span>
              </Badge>
            )}
            {!article.isFeatured && !article.isBreaking && (
              <span className="text-muted-foreground text-xs sm:text-sm">—</span>
            )}
          </div>
        );
      },
      enableSorting: false,
      meta: {
        className: "hidden sm:table-cell"
      },
      size: 80,
    },
    {
      accessorKey: "views",
      header: ({ column }) => (
        <SortableHeader column={column}>Views</SortableHeader>
      ),
      cell: ({ row }) => {
        const views = row.getValue("views") as number;
        return (
          <div className="text-center font-medium text-xs sm:text-sm min-w-[50px]">
            {views ? (views >= 1000 ? `${(views/1000).toFixed(1)}k` : views.toLocaleString()) : 0}
          </div>
        );
      },
      meta: {
        className: "hidden md:table-cell"
      },
      size: 60,
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <SortableHeader column={column}>Created</SortableHeader>
      ),
      cell: ({ row }) => {
        const date = new Date(row.getValue("createdAt"));
        return (
          <div className="text-[10px] sm:text-xs min-w-[70px] sm:min-w-[80px]">
            <div>{date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' })}</div>
            <div className="text-muted-foreground hidden sm:block">
              {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        );
      },
      meta: {
        className: "hidden lg:table-cell"
      },
      size: 80,
    },
    {
      accessorKey: "author",
      header: "Author",
      cell: ({ row }) => {
        const article = row.original;
        // Only show username, not email. If username is missing, show "Unknown".
        let authorName = 'Unknown';
        if (article.author && typeof article.author === 'object') {
          if (typeof article.author.email === 'string' && article.author.email.trim() !== '') {
            authorName = article.author.email;
          }
        }
        // Truncate long emails for better display
        const displayName = authorName.length > 15 ? authorName.substring(0, 15) + '...' : authorName;
        return (
          <div className="text-[10px] sm:text-xs font-medium min-w-[60px] sm:min-w-[80px]" title={authorName}>
            {displayName}
          </div>
        );
      },
      enableSorting: false,
      meta: {
        className: "hidden xl:table-cell"
      },
      size: 80,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const article = row.original;
        return (
          <div className="flex items-center gap-0.5 sm:gap-1 min-w-[60px]">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="h-6 w-6 sm:h-8 sm:w-8 p-0"
            >
              <Link href={`/en/news/${article.slug || article._id}`} target="_blank">
                <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="sr-only">View article</span>
              </Link>
            </Button>
            <ActionDropdown
              onView={() => window.open(`/en/news/${article.slug || article._id}`, '_blank')}
              onEdit={() => router.push(`/en/admin/news/edit/${article._id}`)}
              onDuplicate={() => onDuplicate(article._id)}
              onDelete={() => onDelete(article._id)}
            />
          </div>
        );
      },
      enableSorting: false,
      enableHiding: false,
      size: 60,
    },
  ];

  // Filter options for the table
  const filterOptions = [
    {
      key: "status",
      label: "Status",
      options: [
        { label: "Draft", value: "draft" },
        { label: "Published", value: "published" },
        { label: "Archived", value: "archived" },
      ],
    },
    {
      key: "category",
      label: "Category",
      options: Array.from(
        new Set(
          articles.map(article => 
            typeof article.category === 'object' && article.category?.name?.en
              ? article.category.name.en
              : 'Uncategorized'
          )
        )
      ).map(category => ({ label: category, value: category })),
    },
  ];

  return (
    <div className="w-full overflow-hidden">
      <DataTable
        columns={columns}
        data={articles}
        searchPlaceholder="Search articles..."
        onAdd={onAdd}
        onExport={onExport}
        onBulkDelete={onBulkDelete}
        filterOptions={filterOptions}
      />
    </div>
  );
};

export default NewsTable;
