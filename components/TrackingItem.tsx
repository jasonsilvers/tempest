import { TrackingItem } from '@prisma/client';
import axios from 'axios';
import React, { useState, FC, useRef } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import tw from 'twin.macro';

type OrganizationTrainingPick = Pick<TrackingItem, 'title' | 'organizationId' | 'id'>;

interface ITrackingItemState extends OrganizationTrainingPick {
  organization: string
  requirement: string 
}

const initialTrackingItem: ITrackingItemState = {
  title: '',
  organizationId: undefined,
  id: undefined,
  requirement: '',
  organization: '',
}

const TrackingItemInput: FC = () => {
  const [trackingItem, setTrackingItem] = useState<ITrackingItemState>(initialTrackingItem)
  const queryClient = useQueryClient();
  const itemInput = useRef(null)
  const handleClick = () => {
    if(itemInput.current)
    itemInput.current.focus()
  }
  const mutation = useMutation(
    (newItem: TrackingItem) => axios.post('/api/training', newItem),
    {
      onMutate: async (newItem) => {
        await queryClient.cancelQueries('items');

        const previousState = queryClient.getQueryData('items');

        queryClient.setQueryData('items', (old: TrackingItem[]) => [...old, newItem]);

        return {previousState}
      },
      onError: (err, newItem, context: {previousState: TrackingItem[]}) => {
        queryClient.setQueryData('items', context.previousState);
      },
      onSettled: () => {
        queryClient.invalidateQueries('items')
      },
    }
  );
  
  const addNewItem = async (e) => {
    e.preventDefault();
    const {id, title} = trackingItem;
    const item: TrackingItem ={
      id,
      title,
      organizationId: 1,
    };
    mutation.mutate(item);
  };

  return(
    <form onSubmit={(e)=> addNewItem(e)}>
      <h1>Tracking Item</h1>
      <div tw="my-2">
        <div tw="space-x-2">
          <label>Training Type</label>
          <input
          ref={itemInput}
            onChange={(e) =>
            setTrackingItem({...trackingItem, title: e.target.value})
            }
            onReset={addNewItem}
            value={trackingItem.title}
            placeholder="Enter Training" 
            type="text"/>
        </div>
        <div tw="space-x-2">
          <label>Organization</label>
          <input
          ref={itemInput}
            onChange={(e) =>
            setTrackingItem({...trackingItem, organization: e.target.value})
            }
            onReset={addNewItem}
            value={trackingItem.organization}
            placeholder="Enter Organization" 
            type="text"/>
        </div>
      </div>
      <div tw="my-2">
        <button onClick={handleClick} type="submit">
          Add Training
        </button>
      </div>
    </form>
  )


}

export default TrackingItemInput