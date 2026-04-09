import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { fetchProducts } from '@/store/slices/productSlice';
import { fetchAlerts } from '@/store/slices/alertSlice';
import { fetchTrackings } from '@/store/slices/trackingSlice';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, Bell, TrendingUp, ArrowRight } from 'lucide-react';
import { formatPrice } from '@/utils/formatPrice';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { t } = useTranslation();
  const { items: products, total: productTotal } = useSelector((s) => s.products);
  const { items: alerts } = useSelector((s) => s.alerts);
  const { items: trackings } = useSelector((s) => s.tracking);

  useEffect(() => {
    dispatch(fetchProducts({ limit: 5 }));
    dispatch(fetchAlerts({ limit: 5 }));
    dispatch(fetchTrackings());
  }, [dispatch]);

  const unreadAlerts = alerts.filter((a) => !a.isRead).length;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">{t('dashboard.welcome', { name: user?.name })}</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-xl bg-violet-100 p-3 dark:bg-violet-900/30">
              <Package className="h-5 w-5 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{productTotal}</p>
              <p className="text-sm text-muted-foreground">{t('dashboard.products')}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-xl bg-amber-100 p-3 dark:bg-amber-900/30">
              <Bell className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{unreadAlerts}</p>
              <p className="text-sm text-muted-foreground">{t('dashboard.unreadAlerts')}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-xl bg-emerald-100 p-3 dark:bg-emerald-900/30">
              <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{trackings.length}</p>
              <p className="text-sm text-muted-foreground">{t('dashboard.trackedItems')}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">{t('dashboard.recentProducts')}</CardTitle>
            <Link to="/products" className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
              {t('dashboard.viewAll')} <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            {products.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                {t('dashboard.noProducts')}{' '}
                <Link to="/products" className="text-primary hover:underline">{t('dashboard.addOne')}</Link>
              </p>
            ) : (
              <div className="divide-y">
                {products.slice(0, 5).map((p) => (
                  <Link
                    key={p._id}
                    to={`/products/${p._id}`}
                    className="flex items-center justify-between py-3 hover:bg-muted/50 -mx-2 px-2 rounded-md transition-colors"
                  >
                    <span className="text-sm font-medium truncate">{p.name}</span>
                    <span className="text-sm font-semibold text-emerald-600">{formatPrice(p.currentPrice, p.currency)}</span>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">{t('dashboard.recentAlerts')}</CardTitle>
            <Link to="/alerts" className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
              {t('dashboard.viewAll')} <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            {alerts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">{t('dashboard.noAlerts')}</p>
            ) : (
              <div className="divide-y">
                {alerts.slice(0, 5).map((a) => (
                  <div
                    key={a._id}
                    className={`flex items-center justify-between py-3 ${!a.isRead ? 'font-semibold' : ''}`}
                  >
                    <span className="text-sm truncate">{a.product?.name || t('common.product')}</span>
                    <Badge variant="secondary" className="text-xs capitalize">
                      {a.type.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
