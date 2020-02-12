import * as React from "react";
import Auth from "../auth/Auth";
import {History} from "history";
import {Button, Form, Icon, Input, InputOnChangeData, Modal, TextArea, TextAreaProps} from "semantic-ui-react";

interface ModalProps {
  auth: Auth
  history: History
  addNewJob: any
  initialName: string
  initialDesc: string
  initialId: string
}

interface DetailState {
  showCreateDialog: boolean
  newJobName: string
  newJobDesc: string
  hasError: boolean
  jobId: string
}

export class JobDetail extends React.PureComponent<ModalProps, DetailState> {
  state: DetailState = {
    showCreateDialog: false,
    newJobDesc: '',
    newJobName: '',
    hasError: false,
    jobId: ''
  }

  constructor(props: ModalProps) {
    super(props);
    const {initialDesc, initialId, initialName} = props;
    if (initialId) {
      this.state.jobId = initialId;
    }
    if (initialDesc) {
      this.state.newJobDesc = initialDesc;
    }
    if (initialName) {
      this.state.newJobName = initialName;
    }
  }

  showCreateDialog = () => {
    this.setState({showCreateDialog: true});
  }

  closeCreateDialog = () => {
    this.setState({showCreateDialog: false});
  }

  clearForm = () => {
    this.setState({newJobName: '', newJobDesc: ''});
  }

  clearThenCloseDialog = () => {
    this.clearForm()
    this.closeCreateDialog()
  }

  addNewJobThenClose = () => {
    this.setState((prevState, props) => {
      const {addNewJob} = props;
      const {newJobDesc, newJobName} = prevState;
      if (addNewJob) {
        addNewJob(newJobName, newJobDesc);
      }
      return {showCreateDialog: false, newJobDesc: '', newJobName: ''};
    })
  }

  // @ts-ignore
  handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, {name, value}: InputOnChangeData | TextAreaProps) => this.setState({[name]: value})

  render = () => {
    const {showCreateDialog, newJobName, newJobDesc, jobId} = this.state;
    const hasError = !newJobName || newJobName == '';
    const isEditMode = jobId && jobId != '';
    const iconName = isEditMode ? 'pencil' : 'plus circle';
    const triggerButton = isEditMode ? (
      <Button icon color='blue' onClick={this.showCreateDialog}>
        <Icon name={iconName}/>
      </Button>
    ) : (<Button icon labelPosition='left' color='orange' onClick={this.showCreateDialog}>
      <Icon name={iconName}/>
      Post a New Job
    </Button>);
    const header = isEditMode ? `Update Job Post ${newJobName}` : `Post a New Job`;

    return (<Modal trigger={triggerButton} closeOnEscape={false} closeOnDimmerClick={false} open={showCreateDialog}>
      <Modal.Header>{header}</Modal.Header>
      <Modal.Content>
        <Form error={hasError}>
          <Form.Field required>
            <label>Name</label>
            <Input placeholder='Provide a name' name='newJobName' fluid value={newJobName}
                   onChange={this.handleChange}/>
          </Form.Field>
          <Form.Field>
            <label>Job Description</label>
            <TextArea placeholder='Tell us your job description' name='newJobDesc' rows={5} value={newJobDesc}
                      onChange={this.handleChange}/>
          </Form.Field>
        </Form>
      </Modal.Content>
      <Modal.Actions>
        <Button color='red' onClick={this.clearThenCloseDialog}>
          <Icon name='remove'/> Cancel
        </Button>
        <Button color='green' disabled={hasError} onClick={this.addNewJobThenClose}>
          <Icon name='checkmark'/> {isEditMode ? 'Update' : 'Post'}
        </Button>
      </Modal.Actions>
    </Modal>);
  }
}
