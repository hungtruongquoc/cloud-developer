import 'source-map-support/register'
import {APIGatewayProxyResult, APIGatewayProxyHandler, APIGatewayProxyEvent} from 'aws-lambda'
import * as middy from 'middy'
import {cors} from 'middy/middlewares'
import {createLogger} from "../../utils/logger";
import {getUserId} from "../../utils/jwtToken";
import {deleteJob} from "../../businessLogic/jobs";
const logger = createLogger('job-delete')

export const handler: APIGatewayProxyHandler = middy(async (
		event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
	const todoId = event.pathParameters.jobId
	const authorization = event.headers.Authorization
	const split = authorization.split(' ')
	const jwtToken = split[1]
	const user = getUserId(jwtToken)
	const deleteId = await deleteJob(user, todoId)
	logger.info('Deleted job: ', {deleteId})
	return {
		statusCode: 200,
		body: JSON.stringify({jobId: deleteId})
	}
})

// @ts-ignore
handler.use(cors({credentials: true}));
