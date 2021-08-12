import { useRouter } from 'next/router';
import { usePermissions } from '../hooks/usePermissions';
import { EFuncAction, EResource } from '../types/global';

export default function Test() {
  const permission = usePermissions();
  const router = useRouter();

  if (!permission.permissionCheck('yourface', EFuncAction.CREATE, EResource.AUHTORITY_RECORDS).granted) {
    router.push(`/Unauthenticated`);
  }

  return <div>Test</div>;
}
