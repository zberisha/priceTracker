import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  fetchKpis,
  fetchAdminUsers,
  fetchSubscriptionBreakdown,
  fetchScraperStatus,
  toggleUserStatus,
  changeUserPlan,
} from '@/store/slices/adminSlice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import {
  Users, Package, TrendingUp, Bell, Activity, Database,
  CheckCircle, XCircle, AlertTriangle, Search, RefreshCw, Clock,
} from 'lucide-react';

const PIE_COLORS = ['#6366F1', '#3B82F6', '#10B981'];

function KpiCard({ icon: Icon, label, value, sub, color = 'text-primary' }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold mt-1">{value ?? '—'}</p>
            {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
          </div>
          <div className={`h-12 w-12 rounded-full bg-muted flex items-center justify-center ${color}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function KpiSection({ kpis, t }) {
  if (!kpis) return null;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <KpiCard icon={Users} label={t('admin.totalUsers')} value={kpis.totalUsers} sub={`+${kpis.newUsersWeek} ${t('admin.thisWeek')}`} />
      <KpiCard icon={Package} label={t('admin.activeProducts')} value={kpis.activeProducts} sub={`${kpis.totalProducts} ${t('admin.total')}`} color="text-blue-500" />
      <KpiCard icon={Database} label={t('admin.pricePoints')} value={kpis.totalPricePoints.toLocaleString()} sub={`+${kpis.pricePointsToday} ${t('admin.today')}`} color="text-emerald-500" />
      <KpiCard icon={Bell} label={t('admin.alertsTriggered')} value={kpis.alertsTriggeredToday} sub={`${kpis.activeTrackings} ${t('admin.activeTrackings')}`} color="text-amber-500" />
    </div>
  );
}

function UserManagement({ users, dispatch, t }) {
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('all');

  const doSearch = () => {
    const q = { search };
    if (planFilter !== 'all') q.plan = planFilter;
    dispatch(fetchAdminUsers(q));
  };

  useEffect(() => {
    doSearch();
  }, [planFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = (e) => {
    e.preventDefault();
    doSearch();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t('admin.userManagement')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-3 items-end">
          <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-[200px]">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('admin.searchUsers')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button type="submit" variant="secondary" size="icon"><Search className="h-4 w-4" /></Button>
          </form>
          <Select value={planFilter} onValueChange={setPlanFilter}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('admin.allPlans')}</SelectItem>
              <SelectItem value="free">Free</SelectItem>
              <SelectItem value="basic">Basic</SelectItem>
              <SelectItem value="premium">Premium</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-md border overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('common.name')}</TableHead>
                <TableHead>{t('admin.email')}</TableHead>
                <TableHead>{t('admin.plan')}</TableHead>
                <TableHead>{t('admin.productsCount')}</TableHead>
                <TableHead>{t('admin.joined')}</TableHead>
                <TableHead>{t('admin.status')}</TableHead>
                <TableHead>{t('admin.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">{t('admin.noUsers')}</TableCell>
                </TableRow>
              ) : (
                users.items.map((u) => (
                  <TableRow key={u._id}>
                    <TableCell className="font-medium">{u.name}</TableCell>
                    <TableCell className="text-muted-foreground">{u.email}</TableCell>
                    <TableCell>
                      <Select
                        value={u.subscription?.plan || 'free'}
                        onValueChange={(plan) => dispatch(changeUserPlan({ userId: u._id, plan }))}
                      >
                        <SelectTrigger className="w-24 h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="free">Free</SelectItem>
                          <SelectItem value="basic">Basic</SelectItem>
                          <SelectItem value="premium">Premium</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>{u.productCount}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={u.isActive ? 'default' : 'destructive'} className="text-xs">
                        {u.isActive ? t('admin.active') : t('admin.inactive')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant={u.isActive ? 'outline' : 'default'}
                        size="sm"
                        className="text-xs"
                        onClick={() => dispatch(toggleUserStatus(u._id))}
                      >
                        {u.isActive ? t('admin.ban') : t('admin.unban')}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {users.pages > 1 && (
          <div className="flex justify-center gap-2 pt-2">
            {Array.from({ length: users.pages }, (_, i) => (
              <Button
                key={i}
                variant={users.page === i + 1 ? 'default' : 'outline'}
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => dispatch(fetchAdminUsers({ search, page: i + 1, ...(planFilter !== 'all' ? { plan: planFilter } : {}) }))}
              >
                {i + 1}
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ScraperMonitor({ status, dispatch, t }) {
  if (!status) return null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">{t('admin.scraperMonitoring')}</CardTitle>
        <Button variant="ghost" size="sm" onClick={() => dispatch(fetchScraperStatus())}>
          <RefreshCw className="h-4 w-4 mr-1" /> {t('admin.refresh')}
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="flex items-center gap-3">
            {status.healthy
              ? <CheckCircle className="h-8 w-8 text-emerald-500" />
              : <XCircle className="h-8 w-8 text-destructive" />
            }
            <div>
              <p className="text-sm font-medium">{t('admin.scraperService')}</p>
              <p className={`text-xs ${status.healthy ? 'text-emerald-500' : 'text-destructive'}`}>
                {status.healthy ? t('admin.online') : t('admin.offline')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Activity className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-sm font-medium">{t('admin.pricesToday')}</p>
              <p className="text-xs text-muted-foreground">{status.pricesToday}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-emerald-500" />
            <div>
              <p className="text-sm font-medium">{t('admin.pricesWeek')}</p>
              <p className="text-xs text-muted-foreground">{status.pricesWeek}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <AlertTriangle className={`h-8 w-8 ${status.staleProducts > 0 ? 'text-amber-500' : 'text-muted-foreground'}`} />
            <div>
              <p className="text-sm font-medium">{t('admin.staleProducts')}</p>
              <p className="text-xs text-muted-foreground">{status.staleProducts}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          {t('admin.scrapeInterval', { minutes: status.scrapeInterval })}
        </div>

        {status.hourlyData && (
          <>
            <Separator />
            <div>
              <p className="text-sm font-medium mb-3">{t('admin.scrapeActivity24h')}</p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={status.hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.15} />
                  <XAxis dataKey="hour" fontSize={10} tick={{ fill: 'currentColor', className: 'text-muted-foreground' }} tickLine={false} interval={2} />
                  <YAxis fontSize={10} tick={{ fill: 'currentColor', className: 'text-muted-foreground' }} tickLine={false} width={30} />
                  <ReTooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Bar dataKey="count" name={t('admin.pricePoints')} fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function SubscriptionBreakdown({ breakdown, t }) {
  if (!breakdown) return null;

  const data = [
    { name: 'Free', value: breakdown.free },
    { name: 'Basic', value: breakdown.basic },
    { name: 'Premium', value: breakdown.premium },
  ];
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t('admin.subscriptionBreakdown')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="w-full sm:w-1/2" style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {data.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i]} />
                  ))}
                </Pie>
                <ReTooltip
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3 flex-1">
            {data.map((d, i) => (
              <div key={d.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: PIE_COLORS[i] }} />
                  <span className="text-sm font-medium">{d.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold">{d.value}</span>
                  <span className="text-xs text-muted-foreground">
                    ({total > 0 ? ((d.value / total) * 100).toFixed(0) : 0}%)
                  </span>
                </div>
              </div>
            ))}
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{t('admin.total')}</span>
              <span className="text-sm font-bold">{total}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const Admin = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { kpis, users, subscriptionBreakdown, scraperStatus, loading } = useSelector((s) => s.admin);

  useEffect(() => {
    dispatch(fetchKpis());
    dispatch(fetchAdminUsers());
    dispatch(fetchSubscriptionBreakdown());
    dispatch(fetchScraperStatus());
  }, [dispatch]);

  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" />;
  }

  if (loading && !kpis) {
    return <p className="text-sm text-muted-foreground text-center py-12">{t('common.loading')}</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">{t('admin.title')}</h1>
        <Badge variant="outline" className="text-xs">{t('admin.adminOnly')}</Badge>
      </div>

      <KpiSection kpis={kpis} t={t} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ScraperMonitor status={scraperStatus} dispatch={dispatch} t={t} />
        <SubscriptionBreakdown breakdown={subscriptionBreakdown} t={t} />
      </div>

      <UserManagement users={users} dispatch={dispatch} t={t} />
    </div>
  );
};

export default Admin;
