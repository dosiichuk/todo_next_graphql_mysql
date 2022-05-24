import React, { useEffect } from 'react';
import Link from 'next/link';
import {
  Task,
  TaskStatus,
  useDeleteTaskMutation,
  useUpdateTaskMutation,
} from '../../generated/graphql-frontend';
import { Reference } from '@apollo/client';

interface Props {
  task: Task;
}

const TaskListItem: React.FC<Props> = ({ task }) => {
  const [deleteTask, { loading, error }] = useDeleteTaskMutation({
    variables: {
      id: task.id,
    },
    update: (cache, result) => {
      const deletedTask = result.data?.deleteTask;
      if (deletedTask) {
        cache.modify({
          fields: {
            tasks(taskRefs: Reference[], { readField }) {
              return taskRefs.filter((taskRef) => {
                return readField('id', taskRef) !== deletedTask.id;
              });
            },
          },
        });
      }
    },
  });
  useEffect(() => {
    if (error) {
      alert('An error has occured when deleting the task!');
    }
  }, [error]);
  const handleClick = async () => {
    try {
      await deleteTask();
    } catch (err) {}
  };
  const [updateTask] = useUpdateTaskMutation({ errorPolicy: 'all' });
  const handleStatusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStatus = e.target.checked
      ? TaskStatus.Completed
      : TaskStatus.Active;
    updateTask({ variables: { input: { id: task.id, status: newStatus } } });
  };
  return (
    <li className="task-list-item" key={task.id}>
      <label className="checkbox">
        <input
          type="checkbox"
          onChange={handleStatusChange}
          checked={task.status === TaskStatus.Completed}
        />
        <span className="checkbox-mark">&#10003;</span>
      </label>
      <Link href="/update/[id]" as={`/update/${task.id}`}>
        <a className="task-list-item-title">{task.title} </a>
      </Link>

      <button
        className="task-list-item-delete"
        onClick={handleClick}
        disabled={loading}
      >
        &times;
      </button>
    </li>
  );
};

export default TaskListItem;
