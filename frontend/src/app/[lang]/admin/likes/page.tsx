import LikeManager from '@/components/admin/likes/LikeManager';

export default function AdminLikesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Like Management</h1>
        <p className="text-muted-foreground">
          Manage user likes and engagement across all articles.
        </p>
      </div>
      <LikeManager />
    </div>
  );
} 