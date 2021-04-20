import React from 'react';
import { TrackingItem }from '@prisma/client';

type Props = {
  item: TrackingItem
  deleteUser?: (id: number) => void
}

const TrackingItemDebug: React.FC<Props> = ({item}) => {
  return (
    <div>
      <div>
        <p>{item.title}</p>
      </div>
    </div>
  )
}

export default TrackingItemDebug