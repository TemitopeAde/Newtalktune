import type { Metadata } from "next";
import BlogPostContent from "./BlogPostContent";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3001";
  try {
    const res = await fetch(`${baseUrl}/api/blogs/${slug}`, {
      next: { revalidate: 3600 },
    });
    const data = await res.json();
    const blog = data?.data;
    if (!blog) return { title: "Blog Post" };
    return {
      title: blog.title,
      description: blog.summary || blog.content?.slice(0, 160),
      openGraph: {
        title: blog.title,
        description: blog.summary || blog.content?.slice(0, 160),
        url: `https://talktune.pro/blogs/${slug}`,
        images: blog.coverImage ? [{ url: blog.coverImage }] : [],
        type: "article",
      },
      alternates: { canonical: `https://talktune.pro/blogs/${slug}` },
    };
  } catch {
    return { title: "Blog Post" };
  }
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  return <BlogPostContent slug={slug} />;
}
