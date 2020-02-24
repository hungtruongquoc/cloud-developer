import * as React from "react";
import Auth from "../auth/Auth";
import {History} from "history";
import {Button, Icon, Modal, Loader} from "semantic-ui-react";

interface ModalProps {
  auth: Auth
  history: History
  onDeleteClick: any
  name: string
}

interface ModalState {
  showDeleteDialog: boolean,
  isLoading: boolean
}

export class JobDeleteModal extends React.PureComponent<ModalProps, ModalState> {
  state: ModalState = {
    showDeleteDialog: false,
    isLoading: false
  }

  showDeleteDialog = () => {
    this.setState({showDeleteDialog: true})
  }

  closeDeleteDialog = () => {
    this.setState({showDeleteDialog: false})
  }

  onDeleteClicked = () => {
    this.setState({isLoading: true}, () => {
      const {onDeleteClick} = this.props;
      const result = onDeleteClick();
      setTimeout(() => {
        this.setState({isLoading: false}, () => {
          if (!result) {
            alert('Failed to delete selected job. Try again.')
          }
        });
      }, 1000);
    });
  }

  render = () => {
    const {name} = this.props;
    const {showDeleteDialog, isLoading} = this.state;

    return (<Modal trigger={<Button icon color="red" onClick={this.showDeleteDialog}>
      <Icon name="trash alternate"/>
    </Button>} closeOnEscape={false} closeOnDimmerClick={false} open={showDeleteDialog}>
      <Modal.Header>Delete A Job Post</Modal.Header>
      <Modal.Content>
        Do you really want to delete "{name}"?
      </Modal.Content>
      <Modal.Actions>
        <Button color='green' onClick={this.closeDeleteDialog} disabled={isLoading}>
          <Icon name='remove'/> No
        </Button>
        <Button color='red' onClick={this.onDeleteClicked} loading={isLoading}>
          <Icon name='trash alternate'/> Yes
        </Button>
      </Modal.Actions>
    </Modal>);
  }
}
