import { SvgIcon } from '@material-ui/core';
import DoneAllIcon from '@material-ui/icons/DoneAll';
import DeleteIcon from '@material-ui/icons/Delete';
import DoneIcon from '@material-ui/icons/Done';
import SecurityIcon from '@material-ui/icons/Security';
import React from 'react';

function SignatureButtonIcon(props) {
  return (
    <SvgIcon {...props}>
      <path d="M7.73006 0V1.725C6.88139 1.3125 5.97137 1.1 5.06135 1.1C3.23108 1.1 1.40082 1.95 0 3.6625L3.40491 7.825H4.53988V9.2125C5.41922 10.2875 6.56442 10.85 7.71984 10.9125V13.75H4.66258V17.5C4.66258 18.875 5.58282 20 6.70757 20H16.9325C18.6299 20 20 18.325 20 16.25V0H7.73006ZM6.59509 8.0125V5.325H4.2638L3.20041 4.025C3.78323 3.75 4.41718 3.6 5.06135 3.6C6.43149 3.6 7.70961 4.25 8.68098 5.425L10.1227 7.1875L9.9182 7.4375C9.39673 8.075 8.70143 8.4375 7.95501 8.4375C7.47444 8.4375 7.00409 8.2875 6.59509 8.0125ZM17.955 16.25C17.955 16.9375 17.4949 17.5 16.9325 17.5C16.3701 17.5 15.91 16.9375 15.91 16.25V13.75H9.77505V10.5125C10.3579 10.225 10.8998 9.8 11.3701 9.225L11.5746 8.975L14.4683 12.5H15.91V10.7375L9.77505 3.275V2.5H17.955V16.25Z" />
    </SvgIcon>
  );
}

export { SignatureButtonIcon, DoneAllIcon, DeleteIcon, DoneIcon, SecurityIcon };
