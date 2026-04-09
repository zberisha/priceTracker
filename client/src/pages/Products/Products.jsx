import { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { fetchProducts, createProduct, updateProduct, deleteProduct } from '@/store/slices/productSlice';
import { fetchCategories } from '@/store/slices/categorySlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, ExternalLink, Search, Pencil, ChevronsUpDown, Check } from 'lucide-react';
import { formatPrice } from '@/utils/formatPrice';
import { platformLogo } from '@/utils/platformLogo';

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

  const selectedLabel = categories.find((c) => c.name === value)?.name || value;

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
                  {value === cat.name && <Check className="h-3.5 w-3.5 text-primary" />}
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
      <Button type="button" variant="outline" size="sm" onClick={add}>
        {t('common.addUrl')}
      </Button>
    </div>
  );
}

const Products = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { items, loading, total, page, pages } = useSelector((s) => s.products);
  const subscription = useSelector((s) => s.subscription.current);

  const maxProducts = subscription?.maxProducts ?? Infinity;
  const atLimit = total >= maxProducts;

  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ ...emptyForm });

  useEffect(() => {
    dispatch(fetchProducts({ search, page: 1 }));
  }, [dispatch, search]);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleCreate = async (e) => {
    e.preventDefault();
    await dispatch(createProduct(form));
    setShowCreate(false);
    setForm({ ...emptyForm });
  };

  const openEdit = (product) => {
    setForm({
      name: product.name,
      category: product.category || '',
      brand: product.brand || '',
      sourceUrls: product.sourceUrls?.length ? product.sourceUrls.map((s) => ({ platform: s.platform, url: s.url })) : [{ platform: 'amazon', url: '' }],
    });
    setEditTarget(product._id);
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    await dispatch(updateProduct({ id: editTarget, updates: form }));
    setEditTarget(null);
    setForm({ ...emptyForm });
    dispatch(fetchProducts({ search, page }));
  };

  const handleDelete = () => {
    if (deleteTarget) {
      dispatch(deleteProduct(deleteTarget));
      setDeleteTarget(null);
    }
  };

  const loadPage = (p) => dispatch(fetchProducts({ search, page: p }));
  const closeCreate = () => { setShowCreate(false); setForm({ ...emptyForm }); };
  const closeEdit = () => { setEditTarget(null); setForm({ ...emptyForm }); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">{t('products.title')}</h1>
          {subscription && (
            <Badge variant={atLimit ? 'destructive' : 'secondary'} className="text-xs">
              {total} / {maxProducts}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {atLimit && (
            <Link to="/subscription" className="text-xs text-destructive hover:underline font-medium">
              {t('products.upgradePlan')}
            </Link>
          )}
          <Button onClick={() => { setForm({ ...emptyForm }); setShowCreate(true); }} disabled={atLimit}>
            <Plus className="h-4 w-4 mr-2" /> {t('products.addProduct')}
          </Button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input className="pl-10" placeholder={t('products.search')} value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground text-center py-12">{t('common.loading')}</p>
      ) : items.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p>{t('products.noProducts')}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {items.map((product) => (
              <Card key={product._id} className="flex flex-col justify-between">
                <CardContent className="pt-6 space-y-3">
                  <Link to={`/products/${product._id}`} className="text-sm font-semibold hover:text-primary transition-colors line-clamp-1">
                    {product.name}
                  </Link>
                  <div className="flex gap-1.5 flex-wrap">
                    {product.category && <Badge variant="secondary" className="text-xs">{product.category}</Badge>}
                    {product.brand && <Badge variant="outline" className="text-xs">{product.brand}</Badge>}
                  </div>
                  <div className="flex items-baseline gap-3">
                    <span className="text-xl font-bold">{formatPrice(product.currentPrice, product.currency)}</span>
                    {product.lowestPrice > 0 && (
                      <span className="text-xs text-emerald-600 font-medium">{t('products.low', { price: formatPrice(product.lowestPrice, product.currency) })}</span>
                    )}
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    {product.sourceUrls?.map((s, i) => (
                      <a key={i} href={s.url} target="_blank" rel="noreferrer">
                        <Badge variant="secondary" className="gap-1.5 capitalize text-xs cursor-pointer hover:bg-accent">
                          <img src={platformLogo(s.platform)} alt="" className="h-3.5 w-3.5 rounded-sm" />
                          {s.platform} <ExternalLink className="h-2.5 w-2.5" />
                        </Badge>
                      </a>
                    ))}
                  </div>
                </CardContent>
                <div className="flex justify-end gap-2 px-6 pb-4">
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/products/${product._id}`}>{t('common.view')}</Link>
                  </Button>
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => openEdit(product)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => setDeleteTarget(product._id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {pages > 1 && (
            <div className="flex justify-center gap-1.5 pt-2">
              {Array.from({ length: pages }, (_, i) => (
                <Button key={i + 1} variant={page === i + 1 ? 'default' : 'outline'} size="icon" className="h-9 w-9" onClick={() => loadPage(i + 1)}>
                  {i + 1}
                </Button>
              ))}
            </div>
          )}
        </>
      )}

      {/* Create dialog */}
      <Dialog open={showCreate} onOpenChange={(open) => !open && closeCreate()}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('products.addProduct')}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
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
              <Button type="button" variant="outline" onClick={closeCreate}>{t('common.cancel')}</Button>
              <Button type="submit">{t('common.create')}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={!!editTarget} onOpenChange={(open) => !open && closeEdit()}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('products.editProduct')}</DialogTitle>
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
              <Button type="button" variant="outline" onClick={closeEdit}>{t('common.cancel')}</Button>
              <Button type="submit">{t('common.save')}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('products.removeTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('products.removeDescription')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Products;
