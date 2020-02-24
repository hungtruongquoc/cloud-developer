import {History} from 'history'
import * as React from 'react'
import {
  Divider,
  Grid,
  Header,
  Icon,
  Loader,
} from 'semantic-ui-react'

import Auth from '../auth/Auth'
import {Fragment, SyntheticEvent} from "react";
import {JobDeleteModal} from "./JobDeleteModal";
import {JobDetail} from "./JobDetail";
import {getJobs, createJob, deleteJob, updateJob} from "../api/jobs-api";
import {JobAttachment} from "./JobAttachment";

interface JobProps {
  auth: Auth
  history: History
}

interface JobState {
  jobs: Array<any>,
  loadingJobs: boolean,
  showCreateDialog: boolean,
  newJobName: string,
  newJobDesc: string,
  showDeleteDialog: boolean
}

export class Jobs extends React.PureComponent<JobProps, JobState> {
  state: JobState = {
    jobs: [],
    loadingJobs: false,
    showCreateDialog: false,
    newJobDesc: '',
    newJobName: '',
    showDeleteDialog: false
  }

  get authToken() {
    return this.props.auth.getIdToken();
  }

  deleteJob = (job: any) => {
    return async (event: SyntheticEvent, buttonData: any): Promise<Boolean> => {
      try {
        await deleteJob(this.authToken, job.jobId);
        this.loadJobs();
        return true;
      } catch (e) {
        console.error('Failed to delete job: ', e);
        return false;
      }
    }
  }

  addNewJob = async (name: string, description: string) => {
    const newJob = {name, description, createdAt: new Date()};
    try {
      const result = await createJob(this.authToken, newJob)
      if (result) {
        this.loadJobs();
      }
    } catch (e) {
      console.error('Failed to create new job: ', e);
    }
  }

  updateJob = async (id: string, description: string, name: string) => {
    try {
      const result = await updateJob(this.authToken, {id, description, name});
      if (result) {
        this.loadJobs();
      }
    } catch (e) {
      console.error(`Failed to update the job ${name}`, e)
    }
  }

  componentDidMount() {
    this.setState({loadingJobs: true}, this.loadJobs);
  }

  loadJobs = () => {
    this.setState({loadingJobs: true}, async () => {
      try {
        const jobs = await getJobs(this.authToken)
        this.setState({
          jobs,
          loadingJobs: false
        })
      } catch (e) {
        alert(`Failed to fetch todos: ${e.message}`)
      }
    })
  }

  renderJobList() {
    const {jobs} = this.state;
    const {auth, history} = this.props;
    return (
      <Fragment>
        <Grid.Row style={{borderBottom: '1px solid black'}}>
          <Grid.Column width={7}>
            <h5>Name - Description</h5>
          </Grid.Column>
          <Grid.Column width={2}>
            <h5 style={{textAlign: 'center'}}>Attachment</h5>
          </Grid.Column>
          <Grid.Column width={4}>
            <h5 style={{textAlign: 'center'}}>Created At</h5>
          </Grid.Column>
          <Grid.Column width={3}>
            <h5>Actions</h5>
          </Grid.Column>
        </Grid.Row>
        {
          Array.isArray(jobs) && jobs.length > 0 ? jobs.map(({name, description, createdAt, jobId, attachmentUrl}: any, index) => (
            <Grid.Row key={jobId}>
              <Grid.Column width={7}>
                <strong>{name}</strong>
                <p>{description}</p>
              </Grid.Column>
              <Grid.Column width={2}>
                {
                  attachmentUrl && attachmentUrl != ' '? (<p style={{textAlign: 'center'}}>
                    <a href={attachmentUrl}><Icon name="attach"/></a>
                  </p>) : null
                }
              </Grid.Column>
              <Grid.Column width={4}>
                <p style={{textAlign: 'center'}}>{createdAt ? createdAt.toLocaleString() : '-'}</p>
              </Grid.Column>
              <Grid.Column width={3}>
                <JobDetail auth={auth} history={history} initialDesc={description} updateJob={this.updateJob}
                           initialName={name} initialId={jobId}/>
                <JobAttachment auth={auth} history={history} jobId={jobId} name={name} afterUploadDone={this.loadJobs}/>
                <JobDeleteModal auth={auth} history={history}
                                onDeleteClick={this.deleteJob({jobId, name, description, createdAt})} name={name}/>
              </Grid.Column>
            </Grid.Row>
          )) : <Grid.Column width={16}>
            <h5 style={{textAlign: 'center'}}>
              <Icon color='yellow' name='warning circle'/>No job found
            </h5>
          </Grid.Column>
        }
      </Fragment>
    )
      ;
  }

  render() {
    const {loadingJobs} = this.state;
    const {auth, history} = this.props;
    return (
      <div>
        <div className={'header'} style={{display: 'flex', flexFlow: 'row nowrap'}}>
          <Header as="h1" style={{flex: '1 1 100%'}}>JOBS</Header>
          <div className={'button-bar'} style={{flex: '0 0 300px', textAlign: 'right'}}>
            <JobDetail auth={auth} history={history} addNewJob={this.addNewJob} initialDesc={''} initialName={''}
                       initialId={''}/>
          </div>
        </div>
        <Divider horizontal>Job List</Divider>
        <Grid container>
          {loadingJobs ?
            <Loader active indeterminate inline="centered" content="Loading job list ..."/> : this.renderJobList()}
        </Grid>
      </div>
    )
  }
}
