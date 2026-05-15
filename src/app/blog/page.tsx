import Image from 'next/image';
import Link from 'next/link';
import { Clock, Tag, ChevronRight, BookOpen, TrendingUp } from 'lucide-react';
import { blogPosts as staticPosts, blogCategories } from '@/data/blog';
import NewsletterForm from '@/components/NewsletterForm';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5207';

export const metadata = { title: 'Blog | Adalya Solar Energy' };

export const dynamic = 'force-dynamic';

interface ApiBlogPost {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  authorTitle: string;
  date: string;
  readTime: number;
  imageUrl: string;
  tags: string;
}

function parseTags(raw: string): string[] {
  try { return JSON.parse(raw); } catch { return []; }
}

async function getPosts(category?: string): Promise<ApiBlogPost[]> {
  try {
    const qs = category ? `?category=${encodeURIComponent(category)}` : '';
    const res = await fetch(`${BASE_URL}/api/blogs${qs}`, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error();
    const data = await res.json() as ApiBlogPost[];
    if (data.length > 0) return data;
    throw new Error('empty');
  } catch {
    // Fallback to static data
    const posts = category ? staticPosts.filter((p) => p.category === category) : staticPosts;
    return posts.map((p) => ({
      id: 0, slug: p.slug, title: p.title, excerpt: p.excerpt,
      category: p.category, author: p.author, authorTitle: p.authorTitle,
      date: p.date, readTime: p.readTime, imageUrl: p.imageUrl,
      tags: JSON.stringify(p.tags),
    }));
  }
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ kategori?: string }>;
}) {
  const { kategori } = await searchParams;
  const posts = await getPosts(kategori);
  const allPosts = await getPosts();

  const allTags = Array.from(new Set(allPosts.flatMap((p) => parseTags(p.tags))));
  const categories = Array.from(new Set(allPosts.map((p) => p.category))).filter(Boolean);
  const categoryList = categories.length > 0 ? categories : blogCategories;

  const featured = posts[0];
  const rest = posts.slice(1);
  const totalReadTime = allPosts.reduce((a, p) => a + p.readTime, 0);

  return (
    <main>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1B3A6B] via-[#2d5282] to-[#1B3A6B] text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block bg-orange-500/20 border border-orange-400/30 text-orange-300 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
            Adalya Solar Blog
          </span>
          <h1 className="text-4xl font-extrabold mb-3">Solar Energy Guide</h1>
          <p className="text-gray-300 max-w-xl mx-auto text-sm leading-relaxed mb-8">
            Explore the world of solar energy with installation guides, product reviews,
            industry news, and money-saving tips.
          </p>
          <div className="flex flex-wrap justify-center gap-8">
            {[
              { icon: BookOpen, value: `${allPosts.length}`, label: 'Articles' },
              { icon: TrendingUp, value: `${totalReadTime}+`, label: 'Min of Content' },
              { icon: Tag, value: `${categoryList.length}`, label: 'Categories' },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <Icon size={16} className="text-orange-400" />
                  <span className="text-2xl font-extrabold text-white">{value}</span>
                </div>
                <span className="text-xs text-gray-400">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-10">
          <Link
            href="/blog"
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
              !kategori ? 'bg-[#1B3A6B] text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-orange-100 hover:text-orange-600'
            }`}
          >
            All ({allPosts.length})
          </Link>
          {categoryList.map((cat) => {
            const count = allPosts.filter((p) => p.category === cat).length;
            return (
              <Link
                key={cat}
                href={`/blog?kategori=${encodeURIComponent(cat)}`}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                  kategori === cat ? 'bg-orange-500 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-orange-100 hover:text-orange-600'
                }`}
              >
                {cat} ({count})
              </Link>
            );
          })}
        </div>

        {posts.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <BookOpen size={48} className="mx-auto mb-4 text-gray-200" />
            <p className="font-semibold">No posts found in this category.</p>
          </div>
        )}

        {/* Featured post */}
        {featured && (
          <Link href={`/blog/${featured.slug}`} className="group block mb-12">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-0 rounded-3xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300">
              <div className="relative lg:col-span-3 h-64 lg:h-auto min-h-80">
                {featured.imageUrl ? (
                  <Image
                    src={featured.imageUrl}
                    alt={featured.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    priority
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#1B3A6B] to-[#2d5282] flex items-center justify-center">
                    <BookOpen size={64} className="text-white/30" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                <span className="absolute top-4 left-4 bg-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow">
                  Featured
                </span>
              </div>
              <div className="lg:col-span-2 bg-white p-8 flex flex-col justify-center">
                <span className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-3">{featured.category}</span>
                <h2 className="text-2xl font-extrabold text-[#1B3A6B] mb-3 group-hover:text-orange-500 transition-colors leading-tight">{featured.title}</h2>
                <p className="text-gray-500 text-sm leading-relaxed mb-6">{featured.excerpt}</p>
                <div className="flex items-center gap-3 text-xs text-gray-400 mb-6">
                  <div className="w-7 h-7 bg-[#1B3A6B] rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {featured.author.slice(0, 1)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-600">{featured.author}</p>
                    <p>
                      {new Date(featured.date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                      {' · '}{featured.readTime} min read
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-orange-50 hover:bg-orange-100 text-orange-500 font-bold text-sm px-4 py-2.5 rounded-xl w-fit transition-colors">
                  Read More <ChevronRight size={16} />
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* Post grid */}
        {rest.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rest.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
              >
                <div className="relative h-48 overflow-hidden bg-gray-100">
                  {post.imageUrl ? (
                    <Image
                      src={post.imageUrl}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1B3A6B]/10 to-orange-50">
                      <BookOpen size={36} className="text-gray-300" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-orange-600 text-xs font-bold px-2.5 py-1 rounded-full">
                    {post.category}
                  </span>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-extrabold text-[#1B3A6B] mb-2 group-hover:text-orange-500 transition-colors leading-snug line-clamp-2 text-base">{post.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-2 flex-1">{post.excerpt}</p>
                  <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-50">
                    <span className="font-medium text-gray-500">{post.author}</span>
                    <div className="flex items-center gap-1"><Clock size={12} />{post.readTime} min</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Tags cloud */}
        {allTags.length > 0 && (
          <div className="mt-16 bg-gradient-to-br from-orange-50 to-amber-50 rounded-3xl p-8 border border-orange-100">
            <h3 className="text-lg font-extrabold text-[#1B3A6B] mb-4 flex items-center gap-2">
              <Tag size={18} className="text-orange-500" /> Popular Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag) => (
                <span key={tag} className="bg-white border border-orange-200 text-orange-600 text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-colors cursor-default shadow-sm">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Newsletter CTA */}
        <div className="mt-10 bg-[#1B3A6B] rounded-3xl p-8 text-center text-white">
          <h3 className="text-xl font-extrabold mb-2">Stay Updated on New Posts</h3>
          <p className="text-gray-300 text-sm mb-5">Get solar energy news, guides, and campaigns delivered to your inbox.</p>
          <div className="max-w-sm mx-auto"><NewsletterForm /></div>
        </div>
      </div>
    </main>
  );
}
