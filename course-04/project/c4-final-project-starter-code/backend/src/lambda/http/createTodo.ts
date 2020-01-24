import 'source-map-support/register'
import * as middy from 'middy'
import {cors} from 'middy/middlewares'
import { APIGatewayProxyHandler, APIGatewayProxyResult, APIGatewayProxyEvent } from 'aws-lambda'
import {createLogger} from '../../utils/logger'
import {CreateTodoRequest} from "../../requests/CreateTodoRequest";
import {getUserId} from "../../utils/jwtToken";
import {createToDo} from "../../businessLogic/todo";
// import {Todo} from "../../dataLayer/todo";
// import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
const logger = createLogger('todo-create')

export const handler: APIGatewayProxyHandler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Create request', event)
  const newTodoItem: CreateTodoRequest = JSON.parse(event.body)
  logger.info('New to do: ', newTodoItem)
  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]
  const user = getUserId(jwtToken)
  const newTodo: CreateTodoRequest = JSON.parse(event.body)

  const result = await createToDo(newTodo, user);
  return {
    statusCode: 200,
    body: JSON.stringify({item: result})
  }
})

// @ts-ignore
handler.use(cors({credentials: true}))
