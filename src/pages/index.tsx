import { useUser } from '@tron/nextjs-auth-p1';
import { useRouter } from 'next/router';
import { Link } from '../components/Navigation/Navigation';
import { LoggedInUser } from '../repositories/userRepo';

function LandingPage() {
  const userQuery = useUser<LoggedInUser>();
  const router = useRouter();

  if (!userQuery.user && !userQuery.isLoading) {
    router.push('/Unauthenticated');
  }

  return (
    <div>
      Welcome to Cascade
      <div>
        <Link goToUrl="/Tempest/">
          <div role="navigation" aria-label="Tempest">
            Tempest
          </div>
        </Link>
      </div>
    </div>
  );
}

export default LandingPage;
