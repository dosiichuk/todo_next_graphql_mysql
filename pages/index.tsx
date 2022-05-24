import { gql, useQuery } from '@apollo/client';
import Head from 'next/head';
import { initializeApollo } from '../lib/client';
import styles from '../styles/Home.module.css';

const TaskQueryDocument = gql`
  query Tasks {
    tasks {
      id
      title
    }
  }
`;

interface TasksQuery {
  tasks: {
    id: number;
    title: string;
    status: string;
  }[];
}

export default function Home() {
  const result = useQuery<TasksQuery>(TaskQueryDocument);
  const tasks = result.data?.tasks;
  return (
    <div className={styles.container}>
      <Head>
        <title>Tasks</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {tasks &&
        tasks.length &&
        tasks.map((task) => {
          return (
            <div key={task.id}>
              {task.title} {task.status}
            </div>
          );
        })}
    </div>
  );
}

export const getStatisProps = async () => {
  const apolloClient = initializeApollo();
  await apolloClient.query<TasksQuery>({
    query: TaskQueryDocument,
  });
  return {
    props: {
      initialApolloState: apolloClient.cache.extract(),
    },
  };
};
