import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { fetchCompetitors, createCompetitor, deleteCompetitor } from '@/store/slices/competitorSlice';
import { fetchProducts } from '@/store/slices/productSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, Lock } from 'lucide-react';
import { formatPrice } from '@/utils/formatPrice';

const Competitors = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { items, loading } = useSelector((s) => s.competitors);
  const { items: products } = useSelector((s) => s.products);
  const subscription = useSelector((s) => s.subscription.current);
  const [showModal, setShowModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState({ name: '', platform: 'amazon', baseUrl: '', product: '' });

  const hasCompetitorAccess = subscription?.features?.competitorTracking === true;

  useEffect(() => {
    if (hasCompetitorAccess) {
      dispatch(fetchCompetitors());
      dispatch(fetchProducts({ limit: 100 }));
    }
  }, [dispatch, hasCompetitorAccess]);

  if (subscription && !hasCompetitorAccess) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Lock className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-bold mb-2">{t('competitors.locked')}</h2>
        <p className="text-muted-foreground mb-6 max-w-md">{t('competitors.lockedDescription')}</p>
        <Button asChild>
          <Link to="/subscription">{t('products.upgradePlan')}</Link>
        </Button>
      </div>
    );
  }

  const handleCreate = async (e) => {
    e.preventDefault();
    await dispatch(createCompetitor(form));
    setShowModal(false);
    setForm({ name: '', platform: 'amazon', baseUrl: '', product: '' });
  };

  const handleDelete = () => {
    if (deleteTarget) {
      dispatch(deleteCompetitor(deleteTarget));
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold tracking-tight">{t('competitors.title')}</h1>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="h-4 w-4 mr-2" /> {t('competitors.addCompetitor')}
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground text-center py-12">{t('common.loading')}</p>
      ) : items.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p>{t('competitors.noCompetitors')}</p>
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('common.name')}</TableHead>
                  <TableHead>{t('common.platform')}</TableHead>
                  <TableHead>{t('common.product')}</TableHead>
                  <TableHead>{t('common.price')}</TableHead>
                  <TableHead>{t('competitors.lastChecked')}</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((c) => (
                  <TableRow key={c._id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell><Badge variant="outline" className="capitalize">{c.platform}</Badge></TableCell>
                    <TableCell className="text-muted-foreground">{c.product?.name || '-'}</TableCell>
                    <TableCell>{formatPrice(c.currentPrice, c.currency)}</TableCell>
                    <TableCell className="text-muted-foreground">{c.lastChecked ? new Date(c.lastChecked).toLocaleDateString() : t('common.never')}</TableCell>
                    <TableCell>
                      <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => setDeleteTarget(c._id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('competitors.addCompetitor')}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label>{t('competitors.competitorName')}</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
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
              <Label>{t('common.platform')}</Label>
              <Select value={form.platform} onValueChange={(v) => setForm({ ...form, platform: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="amazon">Amazon</SelectItem>
                  <SelectItem value="walmart">Walmart</SelectItem>
                  <SelectItem value="ebay">eBay</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('competitors.url')}</Label>
              <Input type="url" value={form.baseUrl} onChange={(e) => setForm({ ...form, baseUrl: e.target.value })} required />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>{t('common.cancel')}</Button>
              <Button type="submit">{t('common.create')}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('competitors.removeTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('competitors.removeDescription')}</AlertDialogDescription>
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

export default Competitors;
