'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { SlidersHorizontal, X, ChevronDown, LayoutGrid, List } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import ProductListRow from '@/components/ProductListRow';
import { categories as staticCategories } from '@/data/products';
import { api, ApiCategory } from '@/lib/api';
import { Product } from '@/types';
import { toProduct } from '@/lib/productMapper';

const sortOptions = [
  { label: 'Featured', value: 'featured' },
  { label: 'Price (Low to High)', value: 'price-asc' },
  { label: 'Price (High to Low)', value: 'price-desc' },
  { label: 'Newest', value: 'new' },
];

function ProductsContent() {
  const searchParams = useSearchParams();

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>(staticCategories as unknown as ApiCategory[]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>(
    searchParams.get('kategori') || 'all'
  );
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(0);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [stockOnly, setStockOnly] = useState(false);
  const [newOnly, setNewOnly] = useState(false);
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [sortBy, setSortBy] = useState('featured');
  const [filterOpen, setFilterOpen] = useState(false);
  const [search, setSearch] = useState(searchParams.get('ara') || '');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    const loadAll = () => {
      api.products.getAll().then((data) => {
        setAllProducts(data.map(toProduct));
        setLoading(false);
      }).catch(() => {});
      api.categories.getAll().then((data) => {
        if (data.length > 0) setCategories(data);
      }).catch(() => {});
    };
    loadAll();
    const interval = setInterval(loadAll, 60_000);
    window.addEventListener('product-changed', loadAll);
    window.addEventListener('category-changed', loadAll);
    return () => {
      clearInterval(interval);
      window.removeEventListener('product-changed', loadAll);
      window.removeEventListener('category-changed', loadAll);
    };
  }, []);

  useEffect(() => {
    const cat = searchParams.get('kategori');
    const ara = searchParams.get('ara');
    setSelectedCategory(cat || 'all');
    setSearch(ara || '');
  }, [searchParams]);

  const brands = useMemo(() => {
    const catProducts = selectedCategory === 'all'
      ? allProducts
      : allProducts.filter(p => (p.category as string) === selectedCategory);
    return [...new Set(catProducts.map(p => p.brand))].filter(Boolean).sort();
  }, [allProducts, selectedCategory]);

  const maxPrice = useMemo(() => Math.max(...allProducts.map(p => p.price), 0), [allProducts]);

  const toggleBrand = (brand: string) =>
    setSelectedBrands(prev => prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]);

  const clearFilters = () => {
    setSelectedCategory('all'); setPriceMin(0); setPriceMax(0);
    setSelectedBrands([]); setStockOnly(false); setNewOnly(false);
    setFeaturedOnly(false); setSearch('');
  };

  const hasActiveFilters = selectedCategory !== 'all' || priceMin > 0 || (priceMax > 0 && priceMax < maxPrice)
    || selectedBrands.length > 0 || stockOnly || newOnly || featuredOnly || search.trim();

  const filteredProducts = useMemo(() => {
    let result = [...allProducts];

    if (selectedCategory !== 'all')
      result = result.filter(p => (p.category as string) === selectedCategory);

    if (priceMin > 0)
      result = result.filter(p => p.price >= priceMin);
    if (priceMax > 0)
      result = result.filter(p => p.price <= priceMax);

    if (selectedBrands.length > 0)
      result = result.filter(p => selectedBrands.includes(p.brand));

    if (stockOnly)
      result = result.filter(p => p.stock > 0);
    if (newOnly)
      result = result.filter(p => p.isNew);
    if (featuredOnly)
      result = result.filter(p => p.isFeatured);

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.shortDescription.toLowerCase().includes(q)
      );
    }

    switch (sortBy) {
      case 'price-asc': result.sort((a, b) => a.price - b.price); break;
      case 'price-desc': result.sort((a, b) => b.price - a.price); break;
      case 'new': result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0)); break;
    }

    return result;
  }, [allProducts, selectedCategory, priceMin, priceMax, selectedBrands, stockOnly, newOnly, featuredOnly, sortBy, search]);

  const activeCategory = selectedCategory !== 'all' ? categories.find(c => c.slug === selectedCategory) : null;

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <div className="text-sm text-gray-500 mb-6">
        <span>Home</span> / <span className="text-orange-500">Products</span>
        {activeCategory && <span> / <span className="text-orange-500">{activeCategory.name}</span></span>}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Filters */}
        <aside className={`lg:w-64 shrink-0 ${filterOpen ? 'block' : 'hidden lg:block'}`}>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sticky top-24 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-[#1B3A6B] flex items-center gap-2">
                <SlidersHorizontal size={18} />
                Filters
              </h2>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1">
                  <X size={12} />Clear
                </button>
              )}
            </div>

            {/* Search */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Search Products</label>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Product or brand..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-400"
              />
            </div>

            {/* Category */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Category</label>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedCategory === 'all' ? 'bg-orange-500 text-white font-semibold' : 'hover:bg-orange-50 text-gray-700'}`}
                >
                  All Categories
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.slug}
                    onClick={() => { setSelectedCategory(cat.slug as string); setSelectedBrands([]); }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${selectedCategory === cat.slug ? 'bg-orange-500 text-white font-semibold' : 'hover:bg-orange-50 text-gray-700'}`}
                  >
                    <span>{cat.icon}</span>{cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Price Range (₺)</label>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  min={0}
                  value={priceMin || ''}
                  onChange={e => setPriceMin(Number(e.target.value))}
                  placeholder="Min"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-400"
                />
                <span className="text-gray-400 shrink-0">—</span>
                <input
                  type="number"
                  min={0}
                  value={priceMax || ''}
                  onChange={e => setPriceMax(Number(e.target.value))}
                  placeholder="Max"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-400"
                />
              </div>
            </div>

            {/* Brand */}
            {brands.length > 0 && (
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Brand</label>
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {brands.map(brand => (
                    <label key={brand} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={selectedBrands.includes(brand)}
                        onChange={() => toggleBrand(brand)}
                        className="accent-orange-500 rounded"
                      />
                      <span className="text-sm text-gray-700 group-hover:text-orange-500 transition-colors">{brand}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Status */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Status</label>
              <div className="space-y-1.5">
                {[
                  { label: 'In Stock', state: stockOnly, set: setStockOnly },
                  { label: 'New Arrivals', state: newOnly, set: setNewOnly },
                  { label: 'Featured', state: featuredOnly, set: setFeaturedOnly },
                ].map(({ label, state, set }) => (
                  <label key={label} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={state}
                      onChange={e => set(e.target.checked)}
                      className="accent-orange-500 rounded"
                    />
                    <span className="text-sm text-gray-700 group-hover:text-orange-500 transition-colors">{label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setFilterOpen(!filterOpen)}
                className="lg:hidden flex items-center gap-2 border border-gray-200 rounded-lg px-4 py-2 text-sm hover:border-orange-400 transition-colors"
              >
                <SlidersHorizontal size={16} />
                Filter
              </button>
              <p className="text-sm text-gray-500">
                {search.trim() ? (
                  <><span className="text-orange-500 font-medium">&ldquo;{search.trim()}&rdquo;</span> — <span className="font-semibold text-[#1B3A6B]">{filteredProducts.length}</span> products found</>
                ) : activeCategory ? (
                  <><span className="text-orange-500 font-medium">{activeCategory.name}</span> — <span className="font-semibold text-[#1B3A6B]">{filteredProducts.length}</span> products found</>
                ) : (
                  <><span className="font-semibold text-[#1B3A6B]">{filteredProducts.length}</span> products found</>
                )}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* View mode toggle */}
              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  title="Grid view"
                  className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-orange-500 text-white' : 'text-gray-400 hover:bg-gray-50'}`}
                >
                  <LayoutGrid size={16} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  title="List view"
                  className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-orange-500 text-white' : 'text-gray-400 hover:bg-gray-50'}`}
                >
                  <List size={16} />
                </button>
              </div>

              <span className="text-sm text-gray-500 hidden sm:block">Sort:</span>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="appearance-none border border-gray-200 rounded-lg px-4 py-2 pr-8 text-sm outline-none focus:border-orange-400 bg-white cursor-pointer"
                >
                  {sortOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => <div key={i} className="bg-gray-100 rounded-2xl h-72 animate-pulse" />)}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">No products found</h3>
              <p className="text-gray-500 mb-4">Try adjusting your filters and searching again</p>
              <button onClick={clearFilters} className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors">
                Clear Filters
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredProducts.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredProducts.map(p => <ProductListRow key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
