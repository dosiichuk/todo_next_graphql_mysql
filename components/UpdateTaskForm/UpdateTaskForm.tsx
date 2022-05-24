import { isApolloError } from '@apollo/client';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { useUpdateTaskMutation } from '../../generated/graphql-frontend';

interface Values {
  title: string;
}

interface Props {
  id: number;
  initialValues: Values;
}

const UpdateTaskForm: React.FC<Props> = ({ id, initialValues }) => {
  const router = useRouter();
  const [values, setValues] = useState<Values>(initialValues);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues((preValues) => ({ ...preValues, [name]: value }));
  };
  const [updateTask, { loading, error }] = useUpdateTaskMutation();
  const submitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const result = await updateTask({
        variables: {
          input: {
            id,
            title: values.title,
          },
        },
      });
      if (result.data?.updateTask) {
        router.push('/');
      }
    } catch (err) {}
  };
  return (
    <form onSubmit={submitHandler}>
      {error && <p>{error.message}</p>}
      <p>
        <label className="field-label">Title: </label>
        <input
          type="text"
          name="title"
          className="text-input"
          value={values.title}
          onChange={handleChange}
        />
      </p>
      <p>
        <button className="button" type="submit" disabled={loading}>
          {loading ? 'Loading' : 'Save'}
        </button>
      </p>
    </form>
  );
};

export default UpdateTaskForm;
