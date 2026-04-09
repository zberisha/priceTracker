import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TrendingUp, Sun, Moon, Monitor, Languages } from 'lucide-react';

/** Classical mobile menu icon: two horizontal bars (not three). */
function TwoLineMenuIcon({ className = '' }) {
  return (
    <span
      className={`inline-flex flex-col justify-center gap-[5px] w-[22px] ${className}`}
      aria-hidden
    >
      <span className="block h-0.5 w-full rounded-full bg-current" />
      <span className="block h-0.5 w-full rounded-full bg-current" />
    </span>
  );
}

const AuthNavbar = ({ logoTo = '/' }) => {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const { t, i18n } = useTranslation();

  const nextLang = i18n.language === 'fr' ? 'en' : 'fr';
  const themeIcon = theme === 'dark'
    ? <Moon className="h-4 w-4" />
    : theme === 'light'
      ? <Sun className="h-4 w-4" />
      : <Monitor className="h-4 w-4" />;

  const closeMenu = () => setOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto flex items-center justify-between h-16 px-4 sm:px-6">
        <Link to={logoTo} className="flex items-center gap-2 hover:opacity-80 transition-opacity min-w-0">
          <TrendingUp className="h-6 w-6 text-primary shrink-0" />
          <span className="text-lg font-bold truncate">PriceTracker</span>
        </Link>

        {/* Desktop: full controls */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
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

        {/* Mobile: two-stripe menu → sheet */}
        <div className="flex md:hidden items-center shrink-0">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-10 w-10"
                aria-label={t('nav.navigation')}
              >
                <TwoLineMenuIcon />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="flex h-full w-full flex-col gap-0 border-l p-0 sm:max-w-sm"
            >
              <SheetHeader className="flex flex-col gap-1 space-y-0 border-b p-0 px-6 pb-4 pt-14 text-center sm:text-left">
                <SheetTitle className="text-lg font-semibold leading-none tracking-tight">
                  {t('nav.navigation')}
                </SheetTitle>
                <SheetDescription className="sr-only">
                  {t('nav.menuDescription')}
                </SheetDescription>
              </SheetHeader>

              <nav
                className="flex flex-1 flex-col overflow-y-auto overscroll-contain px-6 py-6"
                aria-label={t('nav.navigation')}
              >
                <div className="mx-auto flex w-full max-w-[280px] flex-col gap-6">
                  <section className="space-y-2">
                    <p className="text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      {t('home.language')}
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-11 w-full justify-center gap-2 font-normal"
                      onClick={() => { i18n.changeLanguage(nextLang); closeMenu(); }}
                    >
                      <Languages className="h-4 w-4 shrink-0" />
                      <span>{nextLang === 'fr' ? 'Français' : 'English'}</span>
                    </Button>
                  </section>

                  <Separator />

                  <section className="space-y-2">
                    <p className="text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      {t('home.theme')}
                    </p>
                    <div className="flex flex-col gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-11 w-full justify-center gap-2 font-normal"
                        onClick={() => { setTheme('light'); closeMenu(); }}
                      >
                        <Sun className="h-4 w-4 shrink-0" />
                        {t('home.light')}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-11 w-full justify-center gap-2 font-normal"
                        onClick={() => { setTheme('dark'); closeMenu(); }}
                      >
                        <Moon className="h-4 w-4 shrink-0" />
                        {t('home.dark')}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-11 w-full justify-center gap-2 font-normal"
                        onClick={() => { setTheme('system'); closeMenu(); }}
                      >
                        <Monitor className="h-4 w-4 shrink-0" />
                        {t('home.system')}
                      </Button>
                    </div>
                  </section>
                </div>
              </nav>

              <SheetFooter className="mt-auto flex-col gap-3 border-t bg-background p-0 px-6 py-6 sm:flex-col">
                {user ? (
                  <Button asChild className="mx-auto w-full max-w-[280px]">
                    <Link to="/dashboard" onClick={closeMenu}>{t('home.dashboard')}</Link>
                  </Button>
                ) : (
                  <div className="mx-auto flex w-full max-w-[280px] flex-col gap-3">
                    <Button asChild variant="outline" className="w-full">
                      <Link to="/login" onClick={closeMenu}>{t('home.signIn')}</Link>
                    </Button>
                    <Button asChild className="w-full">
                      <Link to="/register" onClick={closeMenu}>{t('home.getStarted')}</Link>
                    </Button>
                  </div>
                )}
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default AuthNavbar;
