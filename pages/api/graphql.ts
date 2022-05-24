import { ApolloServer, gql, UserInputError } from 'apollo-server-micro';
import mysql from 'serverless-mysql';
import { OkPacket } from 'mysql';
import { Resolvers } from '../../generated/graphql-backend';
import { TaskStatus } from '../../generated/graphql-backend';

const typeDefs = gql`
  enum TaskStatus {
    active
    completed
  }

  type Task {
    id: Int!
    title: String!
    status: TaskStatus!
  }

  input CreateTaskInput {
    title: String!
  }

  input UpdateTaskInput {
    id: Int!
    title: String
    status: TaskStatus
  }

  type Query {
    tasks(status: TaskStatus): [Task!]!
    task(id: Int!): Task
  }

  type Mutation {
    createTask(input: CreateTaskInput!): Task
    updateTask(input: UpdateTaskInput!): Task
    deleteTask(id: Int!): Task
  }
`;

interface ApolloContext {
  db: mysql.ServerlessMysql;
}

interface Task {
  id: number;
  title: string;
  status: TaskStatus;
}

interface TaskDbRow {
  id: number;
  title: string;
  status: TaskStatus;
}

type TasksDbQueryResult = TaskDbRow[];

type TaskDbQueryResult = TaskDbRow[];

const getTaskById = async (id: number, db: mysql.ServerlessMysql) => {
  const tasks = await db.query<TaskDbQueryResult>('SELECT id, title, status FROM tasks WHERE id= ? ',
    [id]);
  return tasks.length ? { id: tasks[0].id, title: tasks[0].title, status: tasks[0].status }
    : null;
}

const resolvers: Resolvers<ApolloContext> = {
  Query: {
    async tasks(parent, args, context) {
      const { status } = args;
      let query = 'SELECT id, title, status FROM tasks'
      const queryParams: string[] = [];
      if (status) {
        query = query + ' WHERE status = ?';
        queryParams.push(status);
      }
      const tasks = await context.db.query<TasksDbQueryResult>(
        query, queryParams
      );
      await db.end();
      return tasks.map(({ id, title, status }) => ({ id, title, status }));
    },
    async task(parent, args, context) {
      return await getTaskById(args.id, context.db);
    },
  },
  Mutation: {
    async createTask(parent, args, context) {
      const result = await context.db.query<OkPacket>('INSERT INTO tasks (title, status) VALUES (?, ?)', [args.input.title, TaskStatus.Active])
      return {
        id: result.insertId,
        title: args.input.title,
        status: TaskStatus.Active
      };
    },
    async updateTask(parent, args, context) {
      const columns: string[] = [];
      const sqlParams: any[] = [];
      if (args.input.title) {
        columns.push('title = ?');
        sqlParams.push(args.input.title)
      }
      if (args.input.status) {
        columns.push('status = ?');
        sqlParams.push(args.input.status)
      }
      sqlParams.push(args.input.id);
      await context.db.query(`UPDATE tasks SET ${columns.join(', ')} WHERE id = ?`,
        sqlParams);
      const updatedTask = await getTaskById(args.input.id, context.db);
      return updatedTask;
    },
    async deleteTask(parent, args, context) {
      const task = await getTaskById(args.id, context.db);
      if (!task) {
        throw new UserInputError('Could not find the task')
      }
      await context.db.query('DELETE FROM tasks WHERE id = ?', [args.id])
      return task;
    },
  },
};

const db = mysql({
  config: {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    database: process.env.MYSQL_DATABASE,
    password: process.env.MYSQL_PASSWORD,
  },
});

const apolloServer = new ApolloServer({ typeDefs, resolvers, context: { db } });

export const config = {
  api: {
    bodyParser: false,
  },
};

export default apolloServer.createHandler({ path: '/api/graphql' });
