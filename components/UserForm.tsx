import { User } from '@prisma/client';
import axios from 'axios';
import React, { useState, FC, useRef } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import tw from 'twin.macro';

type UserPick = Pick<User, 'firstName' | 'lastName' | 'email' | 'dodId' | 'id'>;

interface IFormState extends UserPick {
  organization: string;
}

const initFormData: IFormState = {
  dodId: undefined,
  id: undefined,
  firstName: '',
  lastName: '',
  email: '',
  organization: '',
};

const UserForm: FC = () => {
  const [formData, setFormData] = useState<IFormState>(initFormData);
  const queryClient = useQueryClient();
  const textInput = useRef(null);
  const handleClick = () => {
    if (textInput.current)
    textInput.current.focus();
  };
  const mutation = useMutation(
    (newUser: User) => axios.post('/api/user', newUser),
    {
      onMutate: async (newUser) => {
        await queryClient.cancelQueries('users');

        // Snap shot of users
        const previousState = queryClient.getQueryData('users');

        queryClient.setQueryData('users', (old: User[]) => [...old, newUser]);

        return { previousState };
      },
      onError: (err, newUser, context: { previousState: User[] }) => {
        queryClient.setQueryData('users', context.previousState);
      },
      onSettled: () => {
        queryClient.invalidateQueries('users');
      },
    }
  );

  const addNewUser = async (e) => {
    e.preventDefault();
    const { id, firstName, lastName, dodId, email } = formData;
    const user: User = {
      id,
      firstName,
      lastName,
      dodId,
      createdAt: undefined,
      updatedAt: undefined,
      email,
      roleId: null,
      organizationId: null,
      // organization: formData.organization,
    };
    // addToUserList((currentState) => [...currentState, user]);
    mutation.mutate(user);
  };

  return (
    <form onSubmit={(e) => addNewUser(e)}>
      <h1>Welcome to the MDG Saftey Rep Form</h1>
      <div tw="my-2">
        <div tw="space-x-2">
          <label>First Name</label>
          <input
            ref={textInput}
            onChange={(e) =>
              setFormData({ ...formData, firstName: e.target.value })
            }
            onReset={addNewUser}
            value={formData.firstName}
            placeholder="Enter First Name"
            type="text"
          />
        </div>
        <div tw="space-x-2">
          <label>Last Name</label>
          <input
            onChange={(e) =>
              setFormData({ ...formData, lastName: e.target.value })
            }
            value={formData.lastName}
            placeholder="Enter Last Name"
            type="text"
          />
        </div>
        <div tw="space-x-2">
          <label>DOD ID</label>
          <input
            onChange={(e) =>
              setFormData({ ...formData, dodId: e.target.value })
            }
            value={formData.dodId}
            placeholder="Enter DOD ID"
            type="text"
          />
        </div>
        <div tw="space-x-2">
          <label>Email</label>
          <input
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            value={formData.email}
            placeholder="Enter Email"
            type="email"
          />
        </div>
        <div tw="space-x-2">
          <label>Pick your Organization</label>
          <select
            onChange={(e) =>
              setFormData({ ...formData, organization: e.target.value })
            }
            value={formData.organization}
          >
            <option value="default">Pick your Organization</option>
            <option value="355th MDG">355th MDG</option>
            <option value="64th MDG">64th MDG</option>
          </select>
        </div>
      </div>
      <div tw="my-2">
        <button onClick={handleClick} type="submit">
          Create New Account
        </button>
      </div>
    </form>
  );
};

export default UserForm;
