import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import {DocumentClient} from 'aws-sdk/clients/dynamodb'
import {createLogger} from "../utils/logger";

const XAWS = AWSXRay.captureAWS(AWS)
const logger = createLogger('jobs-data-layer')

function createDynamoDBClient() {
	if (process.env.IS_OFFLINE) {
		console.log('Creating a local DynamoDB instance')
		return new XAWS.DynamoDB.DocumentClient({
			region: 'localhost',
			endpoint: 'http://localhost:8000'
		})
	}

	return new XAWS.DynamoDB.DocumentClient()
}

export class Jobs {
	constructor(
			private readonly docClient: DocumentClient = createDynamoDBClient(),
			private readonly jobTable = process.env.JOBS_TABLE) {
	}

	async getAllJobs(user: string, nextKey, limit): Promise<AWS.DynamoDB.QueryOutput> {

		logger.info('In get Jobs DB Layer: ')

		// Scan operation parameters
		const scanParams = {
			TableName: this.jobTable,
			Limit: limit,
			ExclusiveStartKey: nextKey,
			KeyConditionExpression: "userId = :id",
			ExpressionAttributeValues: {
				":id": user
			}
		}

		return await this.docClient.query(scanParams).promise()
	}

	async createJob(item): Promise<any> {
		await this.docClient.put({TableName: this.jobTable, Item: item}).promise()
		return item
	}

	async  deleteJob(user, jobId: string): Promise<string> {
		await this.docClient.delete({TableName: this.jobTable, Key: {userId: user, jobId}}).promise()
		return jobId;
	}

	async updateJob(user: string, jobId: string, newData: any): Promise<Object> {
		// Builds the expressions for update
		let updateExpression = 'set #name = :n, description = :d';
		let attributeValues = {
			':n': newData.name,
			':d': newData.description
		}

		if (newData.attachmentUrl) {
			updateExpression += ', attachmentUrl = :url'
			attributeValues[':url'] = newData.attachmentUrl
		}
		const updatedItem = await this.docClient.update({
			TableName: this.jobTable,
			Key: {userId: user, jobId},
			UpdateExpression: updateExpression,
			ExpressionAttributeValues: attributeValues,
			ExpressionAttributeNames: {
				'#name': 'name'
			}
		}).promise()
		logger.info('update result: ', {...updatedItem})
		return {jobId, ...newData}
	}
}
