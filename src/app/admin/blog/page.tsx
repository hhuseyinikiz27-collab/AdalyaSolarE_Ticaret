'use client';

import { useState, useEffect } from 'react';
import { api, ApiBlogPost } from '@/lib/api';
import { Plus, Pencil, Trash2, Eye, EyeOff, BookOpen, Calendar, Clock, Globe } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

const BLOG_CATEGORIES = [
  'Installation Guide',
  'Product Reviews',
  'Technology',
  'Saving Tips',
  'Industry News',
];

const empty = {
  slug: '', title: '', excerpt: '', content: '', category: BLOG_CATEGORIES[0],
  author: '', authorTitle: '', date: new Date().toISOString().slice(0, 10),
  readTime: 5, imageUrl: '', tags: '', isPublished: true,
};

function parseTags(raw: string): string[] {
  try { return JSON.parse(raw); } catch { return []; }
}

function tagsToInput(raw: string): string {
  try { return JSON.parse(raw).join(', '); } catch { return ''; }
}

function inputToTags(input: string): string {
  return JSON.stringify(input.split(',').map((t) => t.trim()).filter(Boolean));
}

function contentToInput(raw: string): string {
  try { return JSON.parse(raw).join('\n\n'); } catch { return raw; }
}

function inputToContent(input: string): string {
  const paragraphs = input.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
  return JSON.stringify(paragraphs.length > 0 ? paragraphs : [input.trim()]);
}

export default function AdminBlogPage() {
  const { error: toastError, success: toastSuccess } = useToast();
  const [posts, setPosts] = useState<ApiBlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState<ApiBlogPost | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const load = () => {
    setLoading(true);
    api.blog.adminGetAll()
      .then(setPosts)
      .catch(() => toastError('Failed to load blog posts.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(empty);
    setShowForm(true);
  };

  const openEdit = (p: ApiBlogPost) => {
    setEditing(p);
    setForm({
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      content: contentToInput(p.content ?? '[]'),
      category: p.category,
      author: p.author,
      authorTitle: p.authorTitle,
      date: p.date ? p.date.slice(0, 10) : new Date().toISOString().slice(0, 10),
      readTime: p.readTime,
      imageUrl: p.imageUrl,
      tags: tagsToInput(p.tags),
      isPublished: p.isPublished ?? true,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toastError('Title is required.'); return; }
    if (!form.author.trim()) { toastError('Author is required.'); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        content: inputToContent(form.content),
        tags: inputToTags(form.tags),
        date: form.date,
      };
      if (editing) {
        await api.blog.update(editing.id, payload);
        toastSuccess('Blog post updated.');
      } else {
        await api.blog.create(payload);
        toastSuccess('Blog post created.');
      }
      setShowForm(false);
      load();
    } catch (err: unknown) {
      toastError(err instanceof Error ? err.message : 'Could not save.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    setDeletingId(id);
    try {
      await api.blog.delete(id);
      setPosts((prev) => prev.filter((p) => p.id !== id));
      toastSuccess('Post deleted.');
    } catch {
      toastError('Could not delete.');
    } finally {
      setDeletingId(null);
    }
  };

  const togglePublish = async (p: ApiBlogPost) => {
    try {
      await api.blog.update(p.id, {
        slug: p.slug, title: p.title, excerpt: p.excerpt, content: p.content ?? '[]',
        category: p.category, author: p.author, authorTitle: p.authorTitle,
        date: p.date, readTime: p.readTime, imageUrl: p.imageUrl,
        tags: p.tags, isPublished: !p.isPublished,
      });
      setPosts((prev) => prev.map((x) => x.id === p.id ? { ...x, isPublished: !x.isPublished } : x));
    } catch {
      toastError('Update failed.');
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1B3A6B]">Blog Management</h1>
          <p className="text-sm text-gray-400 mt-0.5">{posts.length} posts</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-2.5 rounded-xl transition-colors"
        >
          <Plus size={18} /> New Post
        </button>
      </div>

      {/* Post list */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-2xl h-20 animate-pulse" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center text-gray-400">
          <BookOpen size={40} className="mx-auto mb-3 text-gray-200" />
          <p className="font-semibold">No blog posts yet.</p>
          <button onClick={openCreate} className="mt-4 text-orange-500 font-semibold text-sm hover:underline">
            Create the first post
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((p) => (
            <div key={p.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4">
              {p.imageUrl ? (
                <img src={p.imageUrl} alt={p.title} className="w-16 h-16 rounded-xl object-cover shrink-0" />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                  <BookOpen size={22} className="text-gray-300" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${p.isPublished ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                    {p.isPublished ? 'Published' : 'Draft'}
                  </span>
                  <span className="text-xs text-orange-500 font-semibold">{p.category}</span>
                </div>
                <p className="font-bold text-[#1B3A6B] truncate">{p.title}</p>
                <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                  <span className="flex items-center gap-1"><Calendar size={11} />{new Date(p.date).toLocaleDateString('tr-TR')}</span>
                  <span className="flex items-center gap-1"><Clock size={11} />{p.readTime} min</span>
                  <span>{p.author}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => togglePublish(p)}
                  title={p.isPublished ? 'Move to Draft' : 'Publish'}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#1B3A6B] transition-colors"
                >
                  {p.isPublished ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                <a
                  href={`/blog/${p.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-orange-500 transition-colors"
                  title="View"
                >
                  <Globe size={16} />
                </a>
                <button
                  onClick={() => openEdit(p)}
                  className="p-2 rounded-lg hover:bg-orange-50 text-gray-400 hover:text-orange-500 transition-colors"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
                  disabled={deletingId === p.id}
                  className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl my-8 shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-extrabold text-[#1B3A6B]">{editing ? 'Edit Post' : 'New Post'}</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">×</button>
            </div>

            <div className="px-6 py-5 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Title *</label>
                <input
                  value={form.title}
                  onChange={(e) => {
                    const title = e.target.value;
                    const slug = title.toLowerCase()
                      .replace(/ğ/g,'g').replace(/ü/g,'u').replace(/ş/g,'s')
                      .replace(/ı/g,'i').replace(/ö/g,'o').replace(/ç/g,'c')
                      .replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-').trim();
                    setForm((f) => ({ ...f, title, slug }));
                  }}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-400"
                  placeholder="Blog post title"
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Slug (URL)</label>
                <input
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-400 font-mono"
                  placeholder="auto-generated"
                />
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Excerpt</label>
                <textarea
                  value={form.excerpt}
                  onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
                  rows={2}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-400 resize-none"
                  placeholder="Short description"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Content <span className="text-gray-400 font-normal">(separate paragraphs with a blank line)</span></label>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                  rows={10}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-400 resize-y"
                  placeholder="First paragraph...&#10;&#10;Second paragraph...&#10;&#10;Third paragraph..."
                />
              </div>

              {/* Category + Author row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-400"
                  >
                    {BLOG_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Read Time (min)</label>
                  <input
                    type="number"
                    value={form.readTime}
                    onChange={(e) => setForm((f) => ({ ...f, readTime: parseInt(e.target.value) || 5 }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-400"
                    min={1}
                  />
                </div>
              </div>

              {/* Author */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Author Name *</label>
                  <input
                    value={form.author}
                    onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-400"
                    placeholder="John Smith"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Author Title</label>
                  <input
                    value={form.authorTitle}
                    onChange={(e) => setForm((f) => ({ ...f, authorTitle: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-400"
                    placeholder="Solar Energy Expert"
                  />
                </div>
              </div>

              {/* Date + ImageUrl */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Date</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Cover Image URL</label>
                  <input
                    value={form.imageUrl}
                    onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-400"
                    placeholder="https://..."
                  />
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Tags <span className="text-gray-400 font-normal">(separate with commas)</span></label>
                <input
                  value={form.tags}
                  onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-400"
                  placeholder="solar panel, savings, installation"
                />
              </div>

              {/* Published */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isPublished}
                  onChange={(e) => setForm((f) => ({ ...f, isPublished: e.target.checked }))}
                  className="w-4 h-4 accent-orange-500"
                />
                <span className="text-sm font-semibold text-gray-700">Publish immediately</span>
              </label>
            </div>

            <div className="flex items-center gap-3 px-6 py-4 border-t border-gray-100 justify-end">
              <button onClick={() => setShowForm(false)} className="px-5 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white font-bold text-sm transition-colors"
              >
                {saving ? 'Saving...' : editing ? 'Update' : 'Publish'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
