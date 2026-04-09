import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

const NotFound = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center py-24">
      <h1 className="text-6xl font-bold text-muted-foreground">{t('notFound.title')}</h1>
      <p className="text-muted-foreground mt-2 mb-6">{t('notFound.message')}</p>
      <Button asChild>
        <Link to="/dashboard">{t('notFound.goToDashboard')}</Link>
      </Button>
    </div>
  );
};

export default NotFound;
