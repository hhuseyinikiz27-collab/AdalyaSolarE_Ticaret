import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Clock, ChevronRight, Tag, ArrowLeft, User, Calendar, BookOpen } from 'lucide-react';
import { blogPosts } from '@/data/blog';
import ReadingProgress from './ReadingProgress';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5207';

export const dynamic = 'force-dynamic';

interface ApiBlogPost {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  authorTitle: string;
  date: string;
  readTime: number;
  imageUrl: string;
  tags: string;
}

interface NormalizedPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string[];
  category: string;
  author: string;
  authorTitle: string;
  date: string;
  readTime: number;
  imageUrl: string;
  tags: string[];
}

function parseJsonArray(raw: string): string[] {
  try { return JSON.parse(raw); } catch { return []; }
}

function normalizeApiPost(p: ApiBlogPost): NormalizedPost {
  return {
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    content: parseJsonArray(p.content),
    category: p.category,
    author: p.author,
    authorTitle: p.authorTitle,
    date: p.date,
    readTime: p.readTime,
    imageUrl: p.imageUrl,
    tags: parseJsonArray(p.tags),
  };
}

async function getPost(slug: string): Promise<NormalizedPost | null> {
  try {
    const res = await fetch(`${BASE_URL}/api/blogs/${encodeURIComponent(slug)}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) throw new Error();
    const data = await res.json() as ApiBlogPost;
    return normalizeApiPost(data);
  } catch {
    const found = blogPosts.find((p) => p.slug === slug);
    return found ?? null;
  }
}

async function getRelated(currentSlug: string, category: string): Promise<NormalizedPost[]> {
  try {
    const res = await fetch(`${BASE_URL}/api/blogs`, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error();
    const data = await res.json() as ApiBlogPost[];
    const all = data.map(normalizeApiPost);
    const sameCat = all.filter((p) => p.slug !== currentSlug && p.category === category);
    const others = all.filter((p) => p.slug !== currentSlug && p.category !== category);
    return [...sameCat, ...others].slice(0, 3);
  } catch {
    const sameCat = blogPosts.filter((p) => p.slug !== currentSlug && p.category === category);
    const others = blogPosts.filter((p) => p.slug !== currentSlug && p.category !== category);
    return [...sameCat, ...others].slice(0, 3);
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};
  return {
    title: `${post.title} | Adalya Solar Blog`,
    description: post.excerpt,
  };
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const related = await getRelated(slug, post.category);

  return (
    <>
      <ReadingProgress />
      <main>
        {/* Hero image */}
        <div className="relative h-72 sm:h-[440px] w-full overflow-hidden">
          {post.imageUrl ? (
            <Image
              src={post.imageUrl}
              alt={post.title}
              fill
              className="object-cover"
              sizes="100vw"
              priority
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#1B3A6B] to-[#2d5282] flex items-center justify-center">
              <BookOpen size={80} className="text-white/20" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
          <div className="absolute bottom-0 left-0 right-0 px-4 pb-8 max-w-4xl mx-auto">
            <span className="inline-block bg-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full mb-4 shadow">
              {post.category}
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight drop-shadow-md">
              {post.title}
            </h1>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1 text-sm text-gray-400 mb-8 flex-wrap">
            <Link href="/" className="hover:text-orange-500 transition-colors">Home</Link>
            <ChevronRight size={13} />
            <Link href="/blog" className="hover:text-orange-500 transition-colors">Blog</Link>
            <ChevronRight size={13} />
            <span className="text-orange-500 line-clamp-1">{post.title}</span>
          </nav>

          {/* Meta bar */}
          <div className="flex flex-wrap items-center gap-5 mb-8 pb-8 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#1B3A6B] to-[#2d5282] rounded-full flex items-center justify-center text-white font-bold shrink-0 shadow">
                <User size={16} />
              </div>
              <div>
                <p className="font-bold text-gray-800 text-sm">{post.author}</p>
                <p className="text-xs text-gray-400">{post.authorTitle}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4 ml-auto text-xs text-gray-400">
              <span className="flex items-center gap-1.5">
                <Calendar size={13} className="text-orange-400" />
                {new Date(post.date).toLocaleDateString('en-US', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={13} className="text-orange-400" />
                {post.readTime} min read
              </span>
            </div>
          </div>

          {/* Excerpt highlight */}
          <div className="bg-orange-50 border-l-4 border-orange-400 rounded-r-2xl px-6 py-5 mb-10">
            <p className="text-base text-gray-700 leading-relaxed font-medium italic">
              {post.excerpt}
            </p>
          </div>

          {/* Content */}
          <article className="space-y-6">
            {post.content.map((paragraph, i) => (
              <p key={i} className="text-gray-700 leading-8 text-base">
                {paragraph}
              </p>
            ))}
          </article>

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="mt-12 pt-8 border-t border-gray-100">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-1">Tags:</span>
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-orange-50 border border-orange-200 text-orange-600 text-xs font-semibold px-3 py-1.5 rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Author card */}
          <div className="mt-10 bg-gradient-to-br from-gray-50 to-orange-50/30 rounded-2xl p-6 border border-gray-100 flex items-start gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-[#1B3A6B] to-[#2d5282] rounded-2xl flex items-center justify-center text-white font-extrabold text-lg shrink-0 shadow">
              {post.author.split(' ').map((n) => n[0]).join('')}
            </div>
            <div>
              <p className="font-extrabold text-[#1B3A6B] mb-0.5">{post.author}</p>
              <p className="text-sm text-orange-500 font-semibold mb-2">{post.authorTitle}</p>
              <p className="text-sm text-gray-500 leading-relaxed">
                A member of Adalya Solar Energy&apos;s expert team specializing in solar energy systems.
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-10 bg-gradient-to-br from-[#1B3A6B] to-[#2d5282] rounded-2xl p-8 text-white text-center shadow-lg">
            <h3 className="text-xl font-extrabold mb-2">Want to Install a Solar Energy System?</h3>
            <p className="text-gray-300 text-sm mb-6">
              Get a free site survey and personalized quote from our expert team.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link
                href="/iletisim"
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-2.5 rounded-xl transition-colors text-sm shadow"
              >
                Get a Free Quote
              </Link>
              <Link
                href="/hesaplayici"
                className="bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm"
              >
                Calculate Savings
              </Link>
              <Link
                href="/urunler"
                className="bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm"
              >
                Browse Products
              </Link>
            </div>
          </div>

          {/* Back link */}
          <div className="mt-10">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-gray-500 hover:text-orange-500 font-semibold text-sm transition-colors group"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              Back to all posts
            </Link>
          </div>
        </div>

        {/* Related posts */}
        {related.length > 0 && (
          <section className="bg-gray-50 border-t border-gray-100 py-14 px-4">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-extrabold text-[#1B3A6B] flex items-center gap-2">
                  <BookOpen size={20} className="text-orange-500" />
                  Also Read
                </h2>
                <Link href="/blog" className="text-orange-500 hover:text-orange-600 text-sm font-semibold flex items-center gap-1 transition-colors">
                  All Posts <ChevronRight size={15} />
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {related.map((rel) => (
                  <Link
                    key={rel.slug}
                    href={`/blog/${rel.slug}`}
                    className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col"
                  >
                    <div className="relative h-44 overflow-hidden bg-gray-100">
                      {rel.imageUrl ? (
                        <Image
                          src={rel.imageUrl}
                          alt={rel.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-700"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1B3A6B]/10 to-orange-50">
                          <BookOpen size={32} className="text-gray-300" />
                        </div>
                      )}
                      <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-orange-600 text-xs font-bold px-2.5 py-1 rounded-full">
                        {rel.category}
                      </span>
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                      <h3 className="font-bold text-[#1B3A6B] text-sm group-hover:text-orange-500 transition-colors leading-snug line-clamp-2 flex-1 mb-3">
                        {rel.title}
                      </h3>
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>{rel.author}</span>
                        <span className="flex items-center gap-1">
                          <Clock size={11} /> {rel.readTime} min
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </>
  );
}
