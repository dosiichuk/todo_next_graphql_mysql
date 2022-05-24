import { GetServerSideProps } from 'next';
import Error from 'next/error';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useRef } from 'react';
import CreateTaskForm from '../components/CreateTaskForm/CreateTaskForm';
import TaskFilter from '../components/TaskFilter/TaskFilter';
import TaskList from '../components/TaskList/TaskList';
import {
  TasksDocument,
  TasksQuery,
  useTasksQuery,
  TaskStatus,
} from '../generated/graphql-frontend';
import { initializeApollo } from '../lib/client';

const isTaskStatus = (value: string): value is TaskStatus => {
  return Object.values(TaskStatus).includes(value as TaskStatus);
};

export default function Home() {
  const router = useRouter();
  const status =
    Array.isArray(router.query.status) && router.query.status.length
      ? router.query.status[0]
      : undefined;
  if (status !== undefined && !isTaskStatus(status)) {
    return <Error statusCode={404} />;
  }
  const prevStatus = useRef(status);
  useEffect(() => {
    prevStatus.current = status;
  }, [status]);
  const result = useTasksQuery({
    variables: {
      status,
    },
    fetchPolicy:
      prevStatus.current === status ? 'cache-first' : 'cache-and-network',
  });
  const tasks = result.data?.tasks;
  return (
    <div>
      <Head>
        <title>Tasks</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <CreateTaskForm onSuccess={result.refetch} />
      {result.loading && !tasks ? (
        <p>Loading ...</p>
      ) : result.error ? (
        <p>An error occured.</p>
      ) : tasks && tasks.length ? (
        <TaskList tasks={tasks} />
      ) : (
        <p className="no-tasks-message">There are no tasks!</p>
      )}
      <TaskFilter />
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const status =
    typeof context.params?.status === 'string'
      ? context.params.status
      : undefined;
  if (status === undefined || isTaskStatus(status)) {
    const apolloClient = initializeApollo();
    await apolloClient.query<TasksQuery>({
      query: TasksDocument,
      variables: {
        status,
      },
      fetchPolicy: 'no-cache',
    });
    return {
      props: {
        initialApolloState: apolloClient.cache.extract(),
      },
    };
  }
  return { props: {} };
};
