import 'source-map-support/register'
import * as middy from 'middy'
import {cors} from 'middy/middlewares'
import { APIGatewayProxyHandler, APIGatewayProxyResult, APIGatewayProxyEvent } from 'aws-lambda'
import {createLogger} from '../../utils/logger'
import {getUserId} from "../../utils/jwtToken";
import {createJob} from "../../businessLogic/jobs";
const logger = createLogger('job-create')

export const handler: APIGatewayProxyHandler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
	logger.info('Create new job', event)
	const newJobItem: any = JSON.parse(event.body)
	logger.info('New job: ', newJobItem)
	const authorization = event.headers.Authorization
	const split = authorization.split(' ')
	const jwtToken = split[1]
	const user = getUserId(jwtToken)

	const result = await createJob(newJobItem, user);
	return {
		statusCode: 200,
		body: JSON.stringify({item: result})
	}
})

// @ts-ignore
handler.use(cors({credentials: true}))
