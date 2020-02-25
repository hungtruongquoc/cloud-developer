import * as React from 'react'
import {Form, Button, Modal, Icon} from 'semantic-ui-react'
import Auth from '../auth/Auth'
import {getUploadUrl, uploadFile, updateJobAttachment} from '../api/jobs-api'
import {History} from "history";
import {Fragment} from 'react';

enum UploadState {
  NoUpload,
  FetchingPresignedUrl,
  UploadingFile,
  UploadSuccess
}

interface JobAttachmentProps {
  auth: Auth
  history: History
  jobId: string,
  name: string,
  afterUploadDone?: any
}

interface JobAttachmentState {
  file: any
  uploadState: UploadState,
  showDialog: boolean
}

export class JobAttachment extends React.PureComponent<JobAttachmentProps, JobAttachmentState> {
  state: JobAttachmentState = {
    file: undefined,
    uploadState: UploadState.NoUpload,
    showDialog: false
  }

  socket: any = null

  constructor(props: JobAttachmentProps) {
    super(props);
    this.socket = new WebSocket('wss://vevct0mqr5.execute-api.us-east-1.amazonaws.com/dev');
    const {jobId, afterUploadDone} = this.props;
    if (this.socket) {
      this.socket.onmessage = async ({data}: MessageEvent) => {
        try {
          const {fileName: attachmentUrl, id} = JSON.parse(data);
          if (id == jobId) {
            await updateJobAttachment(this.authToken, {id: jobId, attachmentUrl})
            this.setUploadState(UploadState.UploadSuccess)
            setTimeout(() => {
              this.closeDialog();
              if (afterUploadDone) {
                afterUploadDone()
              }
            }, 1500)
          }
          else {
            this.setUploadState(UploadState.NoUpload)
          }
        } catch (error) {
          console.error(error);
          this.setUploadState(UploadState.NoUpload)
        }
      }
    }
  }

  componentWillUnmount(): void {
    this.socket.close()
  }

  get authToken() {
    return this.props.auth.getIdToken();
  }

  handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    this.setState({
      file: files[0]
    })
  }

  handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault()
    const {jobId} = this.props;
    try {
      if (!this.state.file) {
        alert('File should be selected')
        return
      }

      this.setUploadState(UploadState.FetchingPresignedUrl)
      const {status, data: {url}} = await getUploadUrl(this.authToken, jobId)
      if (200 == status) {
        if (url) {
          this.setUploadState(UploadState.UploadingFile)
          await uploadFile(url, this.state.file)
        }
      }
    } catch (e) {
      alert('Could not upload a file: ' + e.message)
      this.setUploadState(UploadState.NoUpload)
    }
  }

  setUploadState(uploadState: UploadState) {
    this.setState({
      uploadState
    })
  }

  showDialog = () => {
    this.setState({showDialog: true})
  }

  closeDialog = () => {
    this.setState({showDialog: false})
  }

  render() {
    const {name} = this.props;
    const {showDialog} = this.state;

    return (
      <Modal trigger={<Button icon color="blue" onClick={this.showDialog}>
        <Icon name="upload"/>
      </Button>} open={showDialog}>
        <Modal.Header>
          Upload new document for job - {name}
        </Modal.Header>
        <Modal.Content>
          <Form onSubmit={this.handleSubmit}>
            <Form.Field>
              <label>File</label>
              <input type="file" accept="application/pdf"
                     placeholder="Upload additional document for the job. Only support PDF currently."
                     onChange={this.handleFileChange}/>
            </Form.Field>

            {this.renderButton()}
          </Form>
        </Modal.Content>
      </Modal>
    )
  }

  renderButton() {
    const {uploadState} = this.state;
    const isLoading = uploadState != UploadState.NoUpload && uploadState != UploadState.UploadSuccess;
    return (
      <Fragment>
        <Button type="submit" color="blue" onClick={this.closeDialog}
                labelPosition='left' icon>
          <Icon name="times"/> Cancel
        </Button>
        <Button loading={isLoading} type="submit" color="orange"
                labelPosition='left' icon>
          <Icon name="upload"/> Upload
        </Button>
        {this.state.uploadState === UploadState.FetchingPresignedUrl && <span>Uploading file metadata ...</span>}
        {this.state.uploadState === UploadState.UploadingFile && <span>Uploading file ...</span>}
        {this.state.uploadState === UploadState.UploadSuccess && <span>
          <Icon name="check circle"/>File Uploaded Successfully
        </span>}
      </Fragment>
    )
  }
}
