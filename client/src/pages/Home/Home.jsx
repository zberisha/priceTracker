import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  TrendingUp,
  Search,
  Bell,
  BarChart3,
  Users,
  ShieldCheck,
  Zap,
  ArrowRight,
  Package,
  Globe,
  Clock,
  Sun,
  Moon,
  Monitor,
  Languages,
} from 'lucide-react';

const Home = () => {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const { t, i18n } = useTranslation();

  const features = [
    { icon: Search, title: t('home.feature1Title'), description: t('home.feature1Desc') },
    { icon: BarChart3, title: t('home.feature2Title'), description: t('home.feature2Desc') },
    { icon: Bell, title: t('home.feature3Title'), description: t('home.feature3Desc') },
    { icon: Users, title: t('home.feature4Title'), description: t('home.feature4Desc') },
    { icon: Clock, title: t('home.feature5Title'), description: t('home.feature5Desc') },
    { icon: Zap, title: t('home.feature6Title'), description: t('home.feature6Desc') },
  ];

  const howItWorks = [
    { step: '01', icon: Package, title: t('home.step1Title'), description: t('home.step1Desc') },
    { step: '02', icon: TrendingUp, title: t('home.step2Title'), description: t('home.step2Desc') },
    { step: '03', icon: Bell, title: t('home.step3Title'), description: t('home.step3Desc') },
    { step: '04', icon: BarChart3, title: t('home.step4Title'), description: t('home.step4Desc') },
  ];

  const themeIcon = theme === 'dark'
    ? <Moon className="h-4 w-4" />
    : theme === 'light'
      ? <Sun className="h-4 w-4" />
      : <Monitor className="h-4 w-4" />;

  const nextLang = i18n.language === 'fr' ? 'en' : 'fr';

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between h-16 px-4 sm:px-6">
          <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <TrendingUp className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold">PriceTracker</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => i18n.changeLanguage(nextLang)}
            >
              <Languages className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  {themeIcon}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme('light')}>
                  <Sun className="h-4 w-4 mr-2" /> {t('home.light')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('dark')}>
                  <Moon className="h-4 w-4 mr-2" /> {t('home.dark')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('system')}>
                  <Monitor className="h-4 w-4 mr-2" /> {t('home.system')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {user ? (
              <Button asChild>
                <Link to="/dashboard">{t('home.dashboard')}</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/login">{t('home.signIn')}</Link>
                </Button>
                <Button asChild>
                  <Link to="/register">{t('home.getStarted')}</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-indigo-950/20 dark:via-background dark:to-purple-950/20" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-24 sm:py-32 text-center">
          <Badge variant="secondary" className="mb-6 text-sm px-4 py-1.5">
            <Globe className="h-3.5 w-3.5 mr-1.5" />
            {t('home.heroBadge')}
          </Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight max-w-3xl mx-auto leading-tight">
            {t('home.heroTitle1')}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600"> {t('home.heroTitle2')} </span>
            {t('home.heroTitle3')}
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('home.heroDescription')}
          </p>
          <div className="mt-10 flex items-center justify-center gap-4 flex-wrap">
            <Button size="lg" asChild>
              <Link to="/register">
                {t('home.startTracking')} <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="#how-it-works">{t('home.seeHow')}</a>
            </Button>
          </div>
          <div className="mt-14 flex items-center justify-center gap-8 text-sm text-muted-foreground flex-wrap">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              {t('home.freeTier')}
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-500" />
              {t('home.automatedChecks')}
            </div>
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-indigo-500" />
              {t('home.instantAlerts')}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold tracking-tight">{t('home.featuresTitle')}</h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            {t('home.featuresSubtitle')}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map(({ icon: Icon, title, description }) => (
            <Card key={title} className="group hover:shadow-md transition-shadow">
              <CardContent className="pt-6 space-y-3">
                <div className="inline-flex rounded-lg bg-primary/10 p-2.5">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator className="max-w-6xl mx-auto" />

      {/* How it works */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold tracking-tight">{t('home.howTitle')}</h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            {t('home.howSubtitle')}
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {howItWorks.map(({ step, icon: Icon, title, description }) => (
            <div key={step} className="relative text-center">
              <div className="inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground h-12 w-12 text-sm font-bold mb-4">
                {step}
              </div>
              <div className="inline-flex rounded-xl bg-muted p-3 mb-3">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <Separator className="max-w-6xl mx-auto" />

      {/* Pricing tiers */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold tracking-tight">{t('home.plansTitle')}</h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            {t('home.plansSubtitle')}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { name: 'Free', products: 5, alerts: 10, frequency: 'Daily', highlight: false },
            { name: 'Basic', products: 25, alerts: 50, frequency: 'Hourly', highlight: true },
            { name: 'Premium', products: 100, alerts: 200, frequency: 'Real-time', highlight: false },
          ].map((plan) => (
            <Card key={plan.name} className={`relative ${plan.highlight ? 'ring-2 ring-primary' : ''}`}>
              {plan.highlight && <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2">{t('home.popular')}</Badge>}
              <CardContent className="pt-8 pb-6 text-center space-y-4">
                <h3 className="text-xl font-bold">{plan.name}</h3>
                <ul className="text-sm text-muted-foreground space-y-1.5">
                  <li>{t('home.upToProducts', { count: plan.products })}</li>
                  <li>{t('home.upToAlerts', { count: plan.alerts })}</li>
                  <li>{t('home.priceChecks', { frequency: plan.frequency })}</li>
                </ul>
                <Button className="w-full" variant={plan.highlight ? 'default' : 'outline'} asChild>
                  <Link to="/register">{t('home.getStarted')}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-br from-indigo-600 to-violet-700 text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20 text-center">
          <h2 className="text-3xl font-bold tracking-tight">{t('home.ctaTitle')}</h2>
          <p className="mt-4 text-indigo-100 max-w-lg mx-auto">
            {t('home.ctaDescription')}
          </p>
          <div className="mt-8 flex justify-center gap-4 flex-wrap">
            <Button size="lg" variant="secondary" asChild>
              <Link to="/register">{t('home.createFreeAccount')}</Link>
            </Button>
            <Button size="lg" variant="secondary" asChild>
              <Link to="/login">{t('home.signIn')}</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span className="font-medium text-foreground">PriceTracker</span>
          </div>
          <p>&copy; {new Date().getFullYear()} PriceTracker. {t('common.allRightsReserved')}</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
