import {apiEndpoint} from '../config'
import Axios from 'axios'
import {Todo} from "../types/Todo";

function buildHeaderConfig(token: string) {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
}

export async function getJobs(idToken: string): Promise<any[]> {
  console.log('Fetching todos')

  const response = await Axios.get(`${apiEndpoint}/jobs`, {
    headers: buildHeaderConfig(idToken),
  })
  return response.data.items
}

export async function createJob(idToken: string, newJob: any): Promise<Todo> {
  const response = await Axios.post(`${apiEndpoint}/jobs`, JSON.stringify(newJob), {
    headers: buildHeaderConfig(idToken),
  })
  console.log('Job created', response);
  return response.data.item
}

export async function deleteJob(idToken: string, jobId: string): Promise<void> {
  await Axios.delete(`${apiEndpoint}/jobs/${jobId}`, {
    headers: buildHeaderConfig(idToken),
  })
}

export async function updateJob(token: string, {id, name, description}: any): Promise<Boolean> {
  const data = JSON.stringify({name, description});
  const result = await Axios.patch(`${apiEndpoint}/jobs/${id}`, data, {headers: buildHeaderConfig(token)});
  return 200 == result.status
}

export async function updateJobAttachment(token: string, {id, attachmentUrl}: any): Promise<Boolean> {
  const payload = JSON.stringify({attachmentUrl});
  const result = await Axios.patch(`${apiEndpoint}/jobs/${id}/attachment`, payload, {headers: buildHeaderConfig(token)});
  return 200 == result.status
}

export function getUploadUrl(token: string, id: string): Promise<any> {
  return Axios.get(`${apiEndpoint}/jobs/${id}/attachment`, {
    headers: buildHeaderConfig(token),
  });
}

export async function uploadFile(uploadUrl: string, file: Buffer): Promise<void> {
  await Axios.put(uploadUrl, file)
}
