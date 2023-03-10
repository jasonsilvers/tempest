import { withPageAuth } from '@tron/nextjs-auth-p1';

import { Link } from '../components/Navigation/Navigation';

function LandingPage() {
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

export default withPageAuth(LandingPage);
