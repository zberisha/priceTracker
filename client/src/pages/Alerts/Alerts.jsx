import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { fetchAlerts, createAlert, markAlertRead, markAllAlertsRead, deleteAlert } from '@/store/slices/alertSlice';
import { fetchProducts } from '@/store/slices/productSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Check, CheckCircle, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';

const typeBadgeVariant = {
  price_drop: 'default',
  price_target: 'secondary',
  back_in_stock: 'outline',
  competitor_change: 'destructive',
};

const Alerts = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { items, loading, total } = useSelector((s) => s.alerts);
  const { items: products } = useSelector((s) => s.products);
  const subscription = useSelector((s) => s.subscription.current);
  const maxAlerts = subscription?.maxAlerts ?? Infinity;
  const atLimit = total >= maxAlerts;
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ product: '', type: 'price_drop', targetPrice: '', percentageThreshold: '5' });

  useEffect(() => {
    dispatch(fetchAlerts({}));
    dispatch(fetchProducts({ limit: 100 }));
  }, [dispatch]);

  const handleCreate = async (e) => {
    e.preventDefault();
    const data = {
      product: form.product,
      type: form.type,
      targetPrice: form.targetPrice ? Number(form.targetPrice) : null,
      percentageThreshold: form.percentageThreshold ? Number(form.percentageThreshold) : null,
    };
    await dispatch(createAlert(data));
    setShowModal(false);
    setForm({ product: '', type: 'price_drop', targetPrice: '', percentageThreshold: '5' });
  };

  const typeLabel = (type) => {
    const map = {
      price_drop: t('alerts.priceDrop'),
      price_target: t('alerts.priceTarget'),
      back_in_stock: t('alerts.backInStock'),
      competitor_change: t('alerts.competitorChange'),
    };
    return map[type] || type.replace(/_/g, ' ');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">{t('alerts.title')} ({total})</h1>
          {subscription && (
            <Badge variant={atLimit ? 'destructive' : 'secondary'} className="text-xs">
              {total} / {maxAlerts}
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => dispatch(markAllAlertsRead())}>
            <CheckCircle className="h-4 w-4 mr-2" /> {t('alerts.markAllRead')}
          </Button>
          {atLimit && (
            <Link to="/subscription" className="text-xs text-destructive hover:underline font-medium self-center">
              {t('products.upgradePlan')}
            </Link>
          )}
          <Button onClick={() => setShowModal(true)} disabled={atLimit}>
            <Plus className="h-4 w-4 mr-2" /> {t('alerts.newAlert')}
          </Button>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground text-center py-12">{t('common.loading')}</p>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-muted-foreground">
          <Bell className="h-12 w-12 mb-3" />
          <p>{t('alerts.noAlerts')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((alert) => (
            <Card key={alert._id} className={`transition-colors ${!alert.isRead ? 'border-l-4 border-l-primary bg-primary/[0.02]' : ''}`}>
              <CardContent className="flex items-center justify-between py-4">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={typeBadgeVariant[alert.type] || 'secondary'} className="text-xs">
                      {typeLabel(alert.type)}
                    </Badge>
                    {alert.isTriggered && <Badge variant="destructive" className="text-xs">{t('alerts.triggered')}</Badge>}
                  </div>
                  <p className={`text-sm ${!alert.isRead ? 'font-semibold' : 'font-medium'}`}>{alert.product?.name || t('common.product')}</p>
                  {alert.message && <p className="text-xs text-muted-foreground">{alert.message}</p>}
                  <p className="text-xs text-muted-foreground">
                    {alert.targetPrice && t('alerts.target', { price: alert.targetPrice })}
                    {alert.percentageThreshold && ` | ${t('alerts.threshold', { percent: alert.percentageThreshold })}`}
                  </p>
                </div>
                <div className="flex gap-1.5 flex-shrink-0 ml-4">
                  {!alert.isRead && (
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => dispatch(markAlertRead(alert._id))}>
                      <Check className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => dispatch(deleteAlert(alert._id))}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('alerts.createAlert')}</DialogTitle>
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
              <Label>{t('alerts.alertType')}</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="price_drop">{t('alerts.priceDrop')}</SelectItem>
                  <SelectItem value="price_target">{t('alerts.priceTarget')}</SelectItem>
                  <SelectItem value="back_in_stock">{t('alerts.backInStock')}</SelectItem>
                  <SelectItem value="competitor_change">{t('alerts.competitorChange')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {form.type === 'price_target' && (
              <div className="space-y-2">
                <Label>{t('alerts.targetPrice')}</Label>
                <Input type="number" step="0.01" value={form.targetPrice} onChange={(e) => setForm({ ...form, targetPrice: e.target.value })} />
              </div>
            )}
            {form.type === 'price_drop' && (
              <div className="space-y-2">
                <Label>{t('alerts.percentageThreshold')}</Label>
                <Input type="number" value={form.percentageThreshold} onChange={(e) => setForm({ ...form, percentageThreshold: e.target.value })} />
              </div>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>{t('common.cancel')}</Button>
              <Button type="submit">{t('alerts.createAlert')}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Alerts;
