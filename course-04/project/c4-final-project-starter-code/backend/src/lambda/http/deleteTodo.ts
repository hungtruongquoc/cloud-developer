import 'source-map-support/register'
import {APIGatewayProxyResult, APIGatewayProxyHandler, APIGatewayProxyEvent} from 'aws-lambda'
import * as middy from 'middy'
import {cors} from 'middy/middlewares'
import {deleteToDo} from "../../businessLogic/todo";

export const handler: APIGatewayProxyHandler = middy(async (
		event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
	const todoId = event.pathParameters.todoId
  const deleteId = await deleteToDo(todoId)

	return {
	  statusCode: 200,
    body: JSON.stringify({todoId: deleteId})
  }
})

// @ts-ignore
handler.use(cors({credentials: true}));
