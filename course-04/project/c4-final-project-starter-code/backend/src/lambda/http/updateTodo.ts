import 'source-map-support/register'

import {APIGatewayProxyHandler, APIGatewayProxyResult, APIGatewayProxyEvent} from 'aws-lambda'

import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import * as middy from 'middy'
import {cors} from 'middy/middlewares'
import {createLogger} from "../../utils/logger";
import {updateToDo} from "../../businessLogic/todo";
import {getUserId} from "../../utils/jwtToken";

const logger = createLogger('todo-update')

export const handler: APIGatewayProxyHandler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
	const todoId = event.pathParameters.todoId
	const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
	const authorization = event.headers.Authorization
	const split = authorization.split(' ')
	const jwtToken = split[1]
	const user = getUserId(jwtToken)
  logger.info('Update item: ', {todoId, updatedTodo});
	const result = await updateToDo(user, todoId, updatedTodo)
	logger.info('Update result: ', {result})
	return {
	  statusCode: 200,
    body: JSON.stringify({item: result})
  }
})
// @ts-ignore
handler.use(cors({credentials: true}));
