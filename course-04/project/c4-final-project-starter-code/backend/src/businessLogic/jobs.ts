import {createLogger} from "../utils/logger";
import {Jobs} from "../dataLayer/jobs";
import * as uuid from 'uuid'

const logger = createLogger('job-get')
const dbJobs = new Jobs()

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

export async function getAllJobs(user: string, next, limit): Promise<Object> {
	logger.info('In jobs business logic: ')
	const result = await dbJobs.getAllJobs(user, next, limit)
	return {
		items: result.Items,
		nextKey: encodeNextKey(result.LastEvaluatedKey)
	}
}

export async function createJob(
		createJobRequest: any,
		user: string
): Promise<any> {
	logger.info('In business logic of create a job: ', {createJobRequest, user})
	//@ts-ignore
	const item: any = {...createJobRequest, attachmentUrl: ' '};
	item.jobId = uuid.v4();
	item.userId = user;
	item.createdAt = (new Date()).toUTCString();
	return await dbJobs.createJob(item);
}

export async function deleteJob(user, jobId: string): Promise<string> {
	return await dbJobs.deleteJob(user, jobId);
}

export async function updateJob(user, jobId: string, newData: any) {
	return await dbJobs.updateJob(user, jobId, newData);
}
