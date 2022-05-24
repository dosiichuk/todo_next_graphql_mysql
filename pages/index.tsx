import Head from 'next/head';
import CreateTaskForm from '../components/CreateTaskForm/CreateTaskForm';
import TaskList from '../components/TaskList/TaskList';
import {
  TasksDocument,
  TasksQuery,
  useTasksQuery,
} from '../generated/graphql-frontend';
import { initializeApollo } from '../lib/client';

export default function Home() {
  const result = useTasksQuery();
  const tasks = result.data?.tasks;

  return (
    <div>
      <Head>
        <title>Tasks</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <CreateTaskForm onSuccess={result.refetch} />
      {result.loading ? (
        <p>Loading ...</p>
      ) : result.error ? (
        <p>An error occured.</p>
      ) : tasks && tasks.length ? (
        <TaskList tasks={tasks} />
      ) : (
        <p className="no-tasks-message">There are no tasks!</p>
      )}
    </div>
  );
}

export const getStatisProps = async () => {
  const apolloClient = initializeApollo();
  await apolloClient.query<TasksQuery>({
    query: TasksDocument,
  });
  return {
    props: {
      initialApolloState: apolloClient.cache.extract(),
    },
  };
};
