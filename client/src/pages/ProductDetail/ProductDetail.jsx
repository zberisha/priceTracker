import { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { fetchProductById, fetchPriceHistory, scrapeNow, updateProduct, clearCurrentProduct } from '@/store/slices/productSlice';
import { fetchCompetitors } from '@/store/slices/competitorSlice';
import { fetchCategories } from '@/store/slices/categorySlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import { ArrowLeft, ExternalLink, RefreshCw, Pencil, Trash2, ChevronsUpDown, Check as CheckIcon, Download } from 'lucide-react';
import { formatPrice } from '@/utils/formatPrice';
import { platformLogo } from '@/utils/platformLogo';
import API from '@/services/api';

const emptyForm = { name: '', category: '', brand: '', sourceUrls: [{ platform: 'amazon', url: '' }] };

function CategoryCombobox({ value, onChange }) {
  const { t } = useTranslation();
  const { items: categories } = useSelector((s) => s.categories);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search) return categories;
    const q = search.toLowerCase();
    return categories.filter((c) => c.name.toLowerCase().includes(q));
  }, [categories, search]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        <span className={value ? 'text-foreground' : 'text-muted-foreground'}>
          {value || t('common.selectCategory')}
        </span>
        <ChevronsUpDown className="h-3.5 w-3.5 opacity-50" />
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover p-1 shadow-md">
          <div className="px-1 pb-1">
            <Input
              placeholder={t('common.searchCategory')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 text-xs"
              autoFocus
            />
          </div>
          <div className="max-h-48 overflow-y-auto">
            {value && (
              <button
                type="button"
                className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-xs hover:bg-accent cursor-pointer text-muted-foreground italic"
                onClick={() => { onChange(''); setOpen(false); setSearch(''); }}
              >
                {t('categories.noCategories').split('.')[0]}
              </button>
            )}
            {filtered.length === 0 ? (
              <p className="px-2 py-3 text-xs text-muted-foreground text-center">{t('categories.noResults')}</p>
            ) : (
              filtered.map((cat) => (
                <button
                  key={cat._id}
                  type="button"
                  className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent cursor-pointer"
                  onClick={() => { onChange(cat.name); setOpen(false); setSearch(''); }}
                >
                  {value === cat.name && <CheckIcon className="h-3.5 w-3.5 text-primary" />}
                  {value !== cat.name && <span className="w-3.5" />}
                  {cat.name}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function SourceUrlRows({ urls, onChange }) {
  const { t } = useTranslation();
  const update = (i, field, value) => {
    const next = [...urls];
    next[i] = { ...next[i], [field]: value };
    onChange(next);
  };
  const remove = (i) => onChange(urls.filter((_, idx) => idx !== i));
  const add = () => onChange([...urls, { platform: 'amazon', url: '' }]);

  return (
    <div className="space-y-2">
      <Label>{t('common.sourceUrls')}</Label>
      {urls.map((src, i) => (
        <div key={i} className="flex items-center gap-2">
          <img src={platformLogo(src.platform)} alt="" className="h-5 w-5 rounded-sm shrink-0" />
          <Select value={src.platform} onValueChange={(v) => update(i, 'platform', v)}>
            <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="amazon">Amazon</SelectItem>
              <SelectItem value="walmart">Walmart</SelectItem>
              <SelectItem value="ebay">eBay</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          <Input type="url" placeholder="https://..." value={src.url} onChange={(e) => update(i, 'url', e.target.value)} required />
          {urls.length > 1 && (
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive" onClick={() => remove(i)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={add}>{t('common.addUrl')}</Button>
    </div>
  );
}

const ProductDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { current: product, priceHistory, loading, scraping } = useSelector((s) => s.products);
  const { items: competitors } = useSelector((s) => s.competitors);
  const subscription = useSelector((s) => s.subscription.current);
  const hasCompetitorAccess = subscription?.features?.competitorTracking === true;
  const hasExportAccess = subscription?.features?.exportData === true;
  const [showEdit, setShowEdit] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });

  useEffect(() => {
    dispatch(fetchProductById(id));
    dispatch(fetchPriceHistory({ id }));
    if (hasCompetitorAccess) dispatch(fetchCompetitors(id));
    dispatch(fetchCategories());
    return () => dispatch(clearCurrentProduct());
  }, [dispatch, id, hasCompetitorAccess]);

  const handleScrape = async () => {
    await dispatch(scrapeNow(id));
    dispatch(fetchPriceHistory({ id }));
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const { data } = await API.get(`/products/${id}/prices/export`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([data], { type: 'text/csv' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${product.name.replace(/[^a-zA-Z0-9]/g, '_')}_price_history.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      // error handled by axios interceptor
    } finally {
      setExporting(false);
    }
  };

  const openEdit = () => {
    setForm({
      name: product.name,
      category: product.category || '',
      brand: product.brand || '',
      sourceUrls: product.sourceUrls?.length ? product.sourceUrls.map((s) => ({ platform: s.platform, url: s.url })) : [{ platform: 'amazon', url: '' }],
    });
    setShowEdit(true);
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    await dispatch(updateProduct({ id, updates: form }));
    setShowEdit(false);
    dispatch(fetchProductById(id));
  };

  if (loading || !product) {
    return <p className="text-sm text-muted-foreground text-center py-12">{t('common.loading')}</p>;
  }

  const PALETTE = [
    '#FF9900', '#0071CE', '#E53238', '#8B5CF6', '#10B981',
    '#F43F5E', '#3B82F6', '#F59E0B', '#6366F1', '#EC4899',
  ];

  const domainOf = (url) => {
    try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return url; }
  };

  const sourceCurrencyMap = {};
  const sourceColorMap = {};
  let colorIdx = 0;
  priceHistory.forEach((p) => {
    const key = domainOf(p.url || '') || p.platform;
    if (!sourceColorMap[key]) {
      sourceColorMap[key] = PALETTE[colorIdx % PALETTE.length];
      colorIdx++;
    }
    sourceCurrencyMap[key] = p.currency || product.currency || 'USD';
  });
  const sources = Object.keys(sourceCurrencyMap);

  const dateMap = {};
  priceHistory.forEach((p) => {
    const key = domainOf(p.url || '') || p.platform;
    const date = new Date(p.scrapedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    if (!dateMap[date]) dateMap[date] = { date };
    dateMap[date][key] = p.price;
  });
  const chartData = Object.values(dateMap);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Link to="/products" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="h-4 w-4" /> {t('productDetail.backToProducts')}
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={openEdit}>
            <Pencil className="h-4 w-4 mr-2" /> {t('common.edit')}
          </Button>
          <Button onClick={handleScrape} disabled={scraping}>
            <RefreshCw className={`h-4 w-4 mr-2 ${scraping ? 'animate-spin' : ''}`} />
            {scraping ? t('productDetail.scraping') : t('productDetail.scrapeNow')}
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{product.name}</h1>
          <div className="flex gap-1.5 mt-2">
            {product.category && <Badge variant="secondary">{product.category}</Badge>}
            {product.brand && <Badge variant="outline">{product.brand}</Badge>}
          </div>
        </div>
        <div className="flex gap-3">
          <Card className="text-center px-5 py-3">
            <p className="text-xs text-muted-foreground">{t('productDetail.current')}</p>
            <p className="text-lg font-bold">{formatPrice(product.currentPrice, product.currency)}</p>
          </Card>
          <Card className="text-center px-5 py-3">
            <p className="text-xs text-muted-foreground">{t('productDetail.lowest')}</p>
            <p className="text-lg font-bold text-emerald-600">{formatPrice(product.lowestPrice, product.currency)}</p>
          </Card>
          <Card className="text-center px-5 py-3">
            <p className="text-xs text-muted-foreground">{t('productDetail.highest')}</p>
            <p className="text-lg font-bold text-destructive">{formatPrice(product.highestPrice, product.currency)}</p>
          </Card>
        </div>
      </div>

      {/* Price Chart */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">{t('productDetail.priceHistory')}</CardTitle>
          {hasExportAccess && priceHistory.length > 0 && (
            <Button variant="outline" size="sm" onClick={handleExport} disabled={exporting}>
              <Download className={`h-4 w-4 mr-2 ${exporting ? 'animate-pulse' : ''}`} />
              {exporting ? t('productDetail.exporting') : t('productDetail.exportCsv')}
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
                <defs>
                  {sources.map((s) => (
                    <linearGradient key={s} id={`gradient-${s.replace(/\./g, '-')}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={sourceColorMap[s]} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={sourceColorMap[s]} stopOpacity={0.02} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.15} />
                <XAxis dataKey="date" fontSize={11} tick={{ fill: 'currentColor', className: 'text-muted-foreground' }} tickLine={false} axisLine={false} stroke="currentColor" />
                <YAxis fontSize={11} tick={{ fill: 'currentColor', className: 'text-muted-foreground' }} tickLine={false} axisLine={false} stroke="currentColor" width={50} />
                <ReTooltip
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '13px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
                  labelStyle={{ fontWeight: 600, marginBottom: 4 }}
                  formatter={(val, name) => {
                    const cur = sourceCurrencyMap[name] || 'USD';
                    return [formatPrice(val, cur), name];
                  }}
                />
                <Legend verticalAlign="top" height={36} formatter={(value) => <span className="text-xs font-medium">{value}</span>} />
                {sources.map((s) => (
                  <Area
                    key={s} type="monotone" dataKey={s} name={s}
                    stroke={sourceColorMap[s]} strokeWidth={2.5}
                    fill={`url(#gradient-${s.replace(/\./g, '-')})`}
                    dot={{ r: 4, fill: sourceColorMap[s], strokeWidth: 2, stroke: 'hsl(var(--card))' }}
                    activeDot={{ r: 6, strokeWidth: 2, stroke: 'hsl(var(--card))' }}
                    connectNulls
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">{t('productDetail.noPriceHistory')}</p>
          )}
        </CardContent>
      </Card>

      {/* Source URLs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('productDetail.sourceUrls')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {product.sourceUrls?.map((s, i) => (
            <a key={i} href={s.url} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-lg border p-3 text-sm hover:bg-muted/50 transition-colors">
              <img src={platformLogo(s.platform)} alt="" className="h-5 w-5 rounded-sm shrink-0" />
              <Badge variant="secondary" className="capitalize">{s.platform}</Badge>
              <span className="flex-1 truncate text-muted-foreground">{s.url}</span>
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </a>
          ))}
        </CardContent>
      </Card>

      {/* Competitors */}
      {hasCompetitorAccess && competitors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('productDetail.competitors')}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('common.name')}</TableHead>
                  <TableHead>{t('common.platform')}</TableHead>
                  <TableHead>{t('common.price')}</TableHead>
                  <TableHead>{t('productDetail.lastChecked')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {competitors.map((c) => (
                  <TableRow key={c._id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell><Badge variant="outline" className="capitalize">{c.platform}</Badge></TableCell>
                    <TableCell>{formatPrice(c.currentPrice, c.currency || product.currency)}</TableCell>
                    <TableCell className="text-muted-foreground">{c.lastChecked ? new Date(c.lastChecked).toLocaleDateString() : t('common.never')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Edit dialog */}
      <Dialog open={showEdit} onOpenChange={(open) => !open && setShowEdit(false)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('productDetail.editProduct')}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="space-y-2">
              <Label>{t('common.productName')}</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>{t('common.category')}</Label>
                <CategoryCombobox value={form.category} onChange={(v) => setForm({ ...form, category: v })} />
              </div>
              <div className="space-y-2">
                <Label>{t('common.brand')}</Label>
                <Input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
              </div>
            </div>
            <SourceUrlRows urls={form.sourceUrls} onChange={(urls) => setForm({ ...form, sourceUrls: urls })} />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowEdit(false)}>{t('common.cancel')}</Button>
              <Button type="submit">{t('common.save')}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductDetail;
