import {Todo} from "../dataLayer/todo";
import {createLogger} from "../utils/logger";
import {CreateTodoRequest} from '../requests/CreateTodoRequest'
import * as uuid from 'uuid'
import {TodoItem} from "../models/TodoItem";

const logger = createLogger('todo-get')
const dbTodo = new Todo()

/**
 * Encode last evaluated key using
 *
 * @param {Object} lastEvaluatedKey a JS object that represents last evaluated key
 *
 * @return {string} URI encoded last evaluated key
 */
function encodeNextKey(lastEvaluatedKey) {
	if (!lastEvaluatedKey) {
		return null
	}

	return encodeURIComponent(JSON.stringify(lastEvaluatedKey))
}

export async function getAllTodoItems(next, limit): Promise<Object> {
	logger.info('In business logic: ')
	const result = await dbTodo.getAllToDos(next, limit)
	return {
		items: result.Items,
		nextKey: encodeNextKey(result.LastEvaluatedKey)
	}
}

export async function createToDo(
		createToDoRequest: CreateTodoRequest,
		user: string
): Promise<TodoItem> {
	logger.info('In business logic of create: ', {createToDoRequest, user})
	//@ts-ignore
	const item: TodoItem = {...createToDoRequest};
	item.todoId = uuid.v4();
	item.userId = user;
	item.createdAt = (new Date()).toUTCString();
	item.done = false;
	return await dbTodo.createToDo(item);
}
