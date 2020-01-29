import 'source-map-support/register'
import {APIGatewayProxyResult, APIGatewayProxyHandler, APIGatewayProxyEvent} from 'aws-lambda'
import * as middy from 'middy'
import {cors} from 'middy/middlewares'
import {deleteToDo} from "../../businessLogic/todo";
import {createLogger} from "../../utils/logger";
import {getUserId} from "../../utils/jwtToken";
const logger = createLogger('todo-create')

export const handler: APIGatewayProxyHandler = middy(async (
		event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
	const todoId = event.pathParameters.todoId
	const authorization = event.headers.Authorization
	const split = authorization.split(' ')
	const jwtToken = split[1]
	const user = getUserId(jwtToken)
  const deleteId = await deleteToDo(user, todoId)
	logger.info('Deleted item: ', {deleteId})
	return {
	  statusCode: 200,
    body: JSON.stringify({todoId: deleteId})
  }
})

// @ts-ignore
handler.use(cors({credentials: true}));
