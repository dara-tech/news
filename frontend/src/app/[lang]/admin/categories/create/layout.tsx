import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create Category - Admin Dashboard',
  description: 'Create a new news category.',
};

export default function CreateCategoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
