import CommentManager from '@/components/admin/comments/CommentManager';

export default function AdminCommentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Comment Management</h1>
        <p className="text-muted-foreground">
          Moderate and manage user comments across all articles.
        </p>
      </div>
      <CommentManager />
    </div>
  );
} 