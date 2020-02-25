import 'source-map-support/register'

import {APIGatewayProxyHandler, APIGatewayProxyResult, APIGatewayProxyEvent} from 'aws-lambda'

import * as middy from 'middy'
import {cors} from 'middy/middlewares'
import {createLogger} from "../../utils/logger";
import {updateJobAttachment} from "../../businessLogic/jobs";
import {getUserId} from "../../utils/jwtToken";

const logger = createLogger('job-update')

export const handler: APIGatewayProxyHandler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
	const {jobId} = event.pathParameters
	const updatedJob: any = JSON.parse(event.body)
	const authorization = event.headers.Authorization
	const split = authorization.split(' ')
	const jwtToken = split[1]
	const user = getUserId(jwtToken)
	logger.info('Update item: ', {jobId, updatedJob});
	const result = await updateJobAttachment(user, jobId, updatedJob)
	logger.info('Update result: ', {result})
	return {
		statusCode: 200,
		body: JSON.stringify({item: result})
	}
})
// @ts-ignore
handler.use(cors({credentials: true}));
