import { AccessControl } from 'accesscontrol';
import { ERole } from '../const/enums';

export const extendACRoles = (ac: AccessControl) => {
  ac.grant(ERole.MONITOR).extend(ERole.MEMBER);
  ac.grant(ERole.PROGRAM_MANAGER).extend(ERole.MONITOR);
  ac.grant(ERole.ADMIN).extend([ERole.PROGRAM_MANAGER]);
};
