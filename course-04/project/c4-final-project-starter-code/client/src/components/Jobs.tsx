import dateFormat from 'dateformat'
import {History} from 'history'
import update from 'immutability-helper'
import * as React from 'react'

import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader,
  Dimmer,
  Modal,
  List,
  Form,
  TextArea, InputOnChangeData, TextAreaProps
} from 'semantic-ui-react'

import Auth from '../auth/Auth'
import {Fragment, SyntheticEvent} from "react";
import {JobDeleteModal} from "./JobDeleteModal";
import {JobDetail} from "./JobDetail";
import {getJobs, createJob} from "../api/jobs-api";

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
  showDeleteDialog: boolean,
  isDeleteLoading: boolean
}

export class Jobs extends React.PureComponent<JobProps, JobState> {
  state: JobState = {
    jobs: [],
    loadingJobs: false,
    showCreateDialog: false,
    newJobDesc: '',
    newJobName: '',
    showDeleteDialog: false,
    isDeleteLoading: false
  }

  deleteJob = (job: any) => {
    return (event: SyntheticEvent, buttonData: any) => {
      this.setState((prevState, props) => {
        const {jobs: oldJobs} = prevState;
        const jobs = oldJobs.filter(item => item.name != job.name);
        return {jobs}
      });
    }
  }

  addNewJob = async (name: string, description: string) => {
    const newJob = {name, description, createdAt: new Date()};
    try {
      const result = await createJob(this.props.auth.getIdToken(), newJob)
      if (result) {
        this.loadJobs();
      }
    }
    catch(e) {
      console.error('Failed to create new job: ', e);
    }
  }

  componentDidMount() {
    this.setState({loadingJobs: true}, this.loadJobs);
  }

  async loadJobs() {
    try {
      const jobs = await getJobs(this.props.auth.getIdToken())
      this.setState({
        jobs,
        loadingJobs: false
      })
    } catch (e) {
      alert(`Failed to fetch todos: ${e.message}`)
    }
  }

  renderJobList() {
    const {jobs} = this.state;
    const {auth, history} = this.props;
    return (
      <Fragment>
        <Grid.Row style={{borderBottom: '1px solid black'}}>
          <Grid.Column width={4}>
            <h5>Name</h5>
          </Grid.Column>
          <Grid.Column width={5}>
            <h5>Description</h5>
          </Grid.Column>
          <Grid.Column width={4}>
            <h5 style={{textAlign: 'center'}}>Created At</h5>
          </Grid.Column>
          <Grid.Column width={3}>
            <h5>Actions</h5>
          </Grid.Column>
        </Grid.Row>
        {
          Array.isArray(jobs) && jobs.length > 0 ? jobs.map(({name, description, createdAt}: any, index) => (
            <Grid.Row key={name}>
              <Grid.Column width={4}>
                <strong>{name}</strong>
              </Grid.Column>
              <Grid.Column width={5}>
                <p>{description}</p>
              </Grid.Column>
              <Grid.Column width={4}>
                <p style={{textAlign: 'center'}}>{createdAt.toLocaleString()}</p>
              </Grid.Column>
              <Grid.Column width={3}>
                <JobDetail auth={auth} history={history} addNewJob={() => {
                }} initialDesc={name} initialName={description}
                           initialId={index.toString()}/>
                <Button icon color='blue'>
                  <Icon name='attach'/>
                </Button>
                <JobDeleteModal auth={auth} history={history}
                                onDeleteClick={this.deleteJob({name, description, createdAt})} name={name}/>
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
