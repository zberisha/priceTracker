import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { fetchTrackings, createTracking, deleteTracking } from '@/store/slices/trackingSlice';
import { fetchProducts } from '@/store/slices/productSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, TrendingUp } from 'lucide-react';
import { formatPrice } from '@/utils/formatPrice';

const Tracking = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { items, loading } = useSelector((s) => s.tracking);
  const { items: products } = useSelector((s) => s.products);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ product: '', frequency: 'daily', notes: '' });

  useEffect(() => {
    dispatch(fetchTrackings());
    dispatch(fetchProducts({ limit: 100 }));
  }, [dispatch]);

  const handleCreate = async (e) => {
    e.preventDefault();
    await dispatch(createTracking(form));
    setShowModal(false);
    setForm({ product: '', frequency: 'daily', notes: '' });
  };

  const frequencyLabel = (f) => {
    const map = { hourly: t('tracking.hourly'), daily: t('tracking.daily'), weekly: t('tracking.weekly') };
    return map[f] || f;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold tracking-tight">{t('tracking.title')}</h1>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="h-4 w-4 mr-2" /> {t('tracking.trackProduct')}
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground text-center py-12">{t('common.loading')}</p>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-muted-foreground">
          <TrendingUp className="h-12 w-12 mb-3" />
          <p>{t('tracking.noTracking')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {items.map((tr) => (
            <Card key={tr._id} className="flex flex-col justify-between">
              <CardContent className="pt-6 space-y-3">
                <Link to={`/products/${tr.product?._id}`} className="text-sm font-semibold hover:text-primary transition-colors line-clamp-1">
                  {tr.product?.name || t('tracking.unknownProduct')}
                </Link>
                <div className="flex items-baseline gap-3">
                  <span className="text-xl font-bold">{formatPrice(tr.product?.currentPrice, tr.product?.currency)}</span>
                  {tr.product?.lowestPrice > 0 && (
                    <span className="text-xs text-emerald-600 font-medium">{t('products.low', { price: formatPrice(tr.product.lowestPrice, tr.product.currency) })}</span>
                  )}
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  <Badge variant="secondary" className="text-xs">{frequencyLabel(tr.frequency)}</Badge>
                  <Badge variant="outline" className="text-xs">
                    {t('tracking.last', { date: tr.lastChecked ? new Date(tr.lastChecked).toLocaleDateString() : t('common.never') })}
                  </Badge>
                </div>
                {tr.notes && <p className="text-xs text-muted-foreground">{tr.notes}</p>}
              </CardContent>
              <div className="flex justify-end px-6 pb-4">
                <Button variant="destructive" size="sm" onClick={() => dispatch(deleteTracking(tr._id))}>
                  <Trash2 className="h-3.5 w-3.5 mr-1.5" /> {t('common.stop')}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('tracking.trackProduct')}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label>{t('common.product')}</Label>
              <Select value={form.product} onValueChange={(v) => setForm({ ...form, product: v })}>
                <SelectTrigger><SelectValue placeholder={t('common.selectProduct')} /></SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p._id} value={p._id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('tracking.checkFrequency')}</Label>
              <Select value={form.frequency} onValueChange={(v) => setForm({ ...form, frequency: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">{t('tracking.hourly')}</SelectItem>
                  <SelectItem value="daily">{t('tracking.daily')}</SelectItem>
                  <SelectItem value="weekly">{t('tracking.weekly')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('tracking.notes')}</Label>
              <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>{t('common.cancel')}</Button>
              <Button type="submit">{t('tracking.startTracking')}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Tracking;
