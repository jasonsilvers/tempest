import { QueryClient, useQuery } from 'react-query';
import { getTrackingItems } from '../prisma/repositories/training';
import { dehydrate } from 'react-query/hydration';
import TrackingItemDebug from '../components/TrackingItemDebug';
import { TrackingItem } from '@prisma/client';
import { fetchItems } from '../queries/fetchItems';
import TrackingItemInput from '../components/TrackingItem';

export default function TrackingItemPage(){
const { data: items } = useQuery<TrackingItem[]>('items', fetchItems)
return(
<div>
  <h4>Created Training</h4>
<TrackingItemInput />
<select>
  {items.map(trackingItem => (
    <option key={trackingItem.title}>{trackingItem.title} : {trackingItem.organizationId}</option>
    // <TrackingItemDebug key={trackingItem.id} item={trackingItem} />
    ))} 

</select>
</div>
)

}
export async function getServerSideProps() {
  const queryClient = new QueryClient()
  await queryClient.prefetchQuery('items', getTrackingItems)
  
  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    }
  }
}