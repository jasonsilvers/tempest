import { MemberTrackingRecord } from '@prisma/client';
import axios from 'axios';
import React, { useState, FC } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import tw from 'twin.macro';

type MemberTrainingPick = Pick<MemberTrackingRecord, 'trackingItemId' | 'traineeId' | 'completedDate' |'id'>;

interface IMemberTrackingTrainingState extends MemberTrainingPick {
  title: string
  member: string 
}

const initialMemberTrackingTraining: IMemberTrackingTrainingState = {
  title: '',
  trackingItemId: undefined,
  id: undefined,
  completedDate: undefined,
  member: '',
  traineeId:undefined,
}

const memberTrackingTraining: FC = () => {
  const [currentMemberTrackingTraining, setMemberTrackingTraining] = useState<IMemberTrackingTrainingState>(initialMemberTrackingTraining)
  const queryClient = useQueryClient();
  const mutation = useMutation(
    (newTraining: MemberTrackingRecord) => axios.post('/api/training', newTraining),
    {
      onMutate: async (newTraining) => {
        await queryClient.cancelQueries('trainings');

        const previousState = queryClient.getQueryData('trainings');

        queryClient.setQueryData('trainings', (old: MemberTrackingRecord[]) => [...old, newTraining]);

        return {previousState}
      },
      onError: (err, newItem, context: {previousState: MemberTrackingRecord[]}) => {
        queryClient.setQueryData('trainings', context.previousState);
      },
      onSettled: () => {
        queryClient.invalidateQueries('trainings')
      },
    }
  );
  
  const newRecord = async (e) => {
    e.preventDefault();
    const {id, completedDate, trackingItemId, traineeId} = currentMemberTrackingTraining;
    const training: MemberTrackingRecord ={
      id,
      completedDate,
      trackingItemId,
      traineeSignedDate: null,
      traineeId,
      authoritySignedDate: null,
      authorityId: null,
      successorId: null,
    };
    mutation.mutate(training);
  };

  return(
    <div>
      <h1>Member Training</h1>
      <div tw="my-2">
        <div tw="space-x-2">
          <h4>(setMemberTrackingTraining={newRecord})</h4>
      </div>
      </div>
          
      </div>
  )


}

export default memberTrackingTraining