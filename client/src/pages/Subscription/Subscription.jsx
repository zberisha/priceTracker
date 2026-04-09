import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation, Trans } from 'react-i18next';
import { fetchSubscription, fetchPlans, updateSubscription } from '@/store/slices/subscriptionSlice';
import { fetchProducts } from '@/store/slices/productSlice';
import { fetchAlerts } from '@/store/slices/alertSlice';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Check, X } from 'lucide-react';

const Subscription = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { current, plans, loading } = useSelector((s) => s.subscription);
  const { total: productCount } = useSelector((s) => s.products);
  const { total: alertCount } = useSelector((s) => s.alerts);
  const [switchTarget, setSwitchTarget] = useState(null);

  useEffect(() => {
    dispatch(fetchSubscription());
    dispatch(fetchPlans());
    dispatch(fetchProducts({ page: 1, limit: 1 }));
    dispatch(fetchAlerts({}));
  }, [dispatch]);

  const handleUpgrade = () => {
    if (switchTarget) {
      dispatch(updateSubscription(switchTarget));
      setSwitchTarget(null);
    }
  };

  if (loading) return <p className="text-sm text-muted-foreground text-center py-12">{t('common.loading')}</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">{t('subscription.title')}</h1>

      {current && (
        <Card className="bg-gradient-to-br from-indigo-600 to-violet-700 text-white border-0">
          <CardContent className="pt-6 space-y-4">
            <div>
              <p className="text-sm opacity-80">{t('subscription.currentPlan')}</p>
              <h2 className="text-2xl font-bold capitalize mt-1">{current.plan}</h2>
              <p className="text-sm opacity-80 mt-1 capitalize">{t('subscription.scrape', { frequency: current.scrapeFrequency })}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="opacity-80">{t('subscription.productsUsage')}</span>
                  <span className="font-medium">{productCount ?? 0} / {current.maxProducts}</span>
                </div>
                <Progress value={Math.min(((productCount ?? 0) / current.maxProducts) * 100, 100)} className="h-2 bg-white/20 [&>div]:bg-white" />
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="opacity-80">{t('subscription.alertsUsage')}</span>
                  <span className="font-medium">{alertCount ?? 0} / {current.maxAlerts}</span>
                </div>
                <Progress value={Math.min(((alertCount ?? 0) / current.maxAlerts) * 100, 100)} className="h-2 bg-white/20 [&>div]:bg-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((plan) => (
          <Card key={plan.name} className={`relative ${current?.plan === plan.name ? 'ring-2 ring-primary' : ''}`}>
            {current?.plan === plan.name && (
              <Badge className="absolute -top-2.5 right-4">{t('subscription.current')}</Badge>
            )}
            <CardHeader>
              <CardTitle className="capitalize text-lg">{plan.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2.5 text-sm">
                <li className="text-muted-foreground">{t('subscription.upToProducts', { count: plan.maxProducts })}</li>
                <li className="text-muted-foreground">{t('subscription.upToAlerts', { count: plan.maxAlerts })}</li>
                <li className="text-muted-foreground capitalize">{t('subscription.scrapeFrequency', { frequency: plan.scrapeFrequency })}</li>
                <Separator />
                <li className="flex items-center gap-2">
                  {plan.features.competitorTracking ? <Check className="h-4 w-4 text-emerald-500" /> : <X className="h-4 w-4 text-destructive" />}
                  <span className="text-muted-foreground">{t('subscription.competitorTracking')}</span>
                </li>
                <li className="flex items-center gap-2">
                  {plan.features.emailAlerts ? <Check className="h-4 w-4 text-emerald-500" /> : <X className="h-4 w-4 text-destructive" />}
                  <span className="text-muted-foreground">{t('subscription.emailAlerts')}</span>
                </li>
                <li className="flex items-center gap-2">
                  {plan.features.priceHistory ? <Check className="h-4 w-4 text-emerald-500" /> : <X className="h-4 w-4 text-destructive" />}
                  <span className="text-muted-foreground">{t('subscription.priceHistory')}</span>
                </li>
                <li className="flex items-center gap-2">
                  {plan.features.exportData ? <Check className="h-4 w-4 text-emerald-500" /> : <X className="h-4 w-4 text-destructive" />}
                  <span className="text-muted-foreground">{t('subscription.exportData')}</span>
                </li>
              </ul>
              {current?.plan === plan.name ? (
                <Button variant="outline" className="w-full" disabled>{t('subscription.currentPlanBtn')}</Button>
              ) : (
                <Button className="w-full" onClick={() => setSwitchTarget(plan.name)}>
                  {t('subscription.switchTo', { plan: plan.name })}
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog open={!!switchTarget} onOpenChange={(open) => !open && setSwitchTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('subscription.switchTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              <Trans i18nKey="subscription.switchDescription" values={{ plan: switchTarget }} components={{ strong: <span className="font-semibold capitalize" /> }} />
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleUpgrade}>
              {t('common.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Subscription;
