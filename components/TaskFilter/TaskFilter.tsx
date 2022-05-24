import Link from 'next/link';
import React from 'react';

interface Props {}

const TaskFilter: React.FC<Props> = ({}) => {
  return (
    <ul className="task-filter">
      <li>
        <Link href="/" scroll={false} shallow={true}>
          <a>All</a>
        </Link>
      </li>
      <li>
        <Link href="/[status]" as={`/active`} scroll={false} shallow={true}>
          <a>Active</a>
        </Link>
      </li>
      <li>
        <Link href="/[status]" as={`/completed`} scroll={false} shallow={true}>
          <a>Completed</a>
        </Link>
      </li>
    </ul>
  );
};

export default TaskFilter;
