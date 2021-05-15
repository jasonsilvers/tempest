/* eslint-disable react/jsx-props-no-spreading */
// spreading is needed for svgs
import React, { SVGProps } from 'react';

const SvgrMock = React.forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
  (props, ref) => <svg ref={ref} {...props} />
);

SvgrMock.displayName = 'SvgrMock';

export const ReactComponent = SvgrMock;
export default SvgrMock;
