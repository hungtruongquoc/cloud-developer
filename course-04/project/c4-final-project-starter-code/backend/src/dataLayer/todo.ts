import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import {DocumentClient} from 'aws-sdk/clients/dynamodb'
import {createLogger} from "../utils/logger";
import {TodoItem} from "../models/TodoItem";

const XAWS = AWSXRay.captureAWS(AWS)
const logger = createLogger('todo-get')

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

export class Todo {
	constructor(
			private readonly docClient: DocumentClient = createDynamoDBClient(),
			private readonly todoTable = process.env.TODOS_TABLE) {
	}

	async getAllToDos(nextKey, limit): Promise<AWS.DynamoDB.ScanOutput> {

		logger.info('In get Database Layer: ')

		console.log('Getting all groups')

		// Scan operation parameters
		const scanParams = {
			TableName: this.todoTable,
			Limit: limit,
			ExclusiveStartKey: nextKey
		}

		return await this.docClient.scan(scanParams).promise()
	}

	async createToDo(item): Promise<TodoItem> {
		await this.docClient.put({TableName: this.todoTable, Item: item}).promise()
		return item
	}

	async deleteToDo(todoId: string): Promise<string> {
		await this.docClient.delete({TableName: this.todoTable, Key: {todoId}}).promise()
		return todoId;
	}
}
