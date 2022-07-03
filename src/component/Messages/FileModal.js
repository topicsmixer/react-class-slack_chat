import React from "react";
import { Button, Icon, Input, Modal } from "semantic-ui-react";

class FileModal extends React.Component {
  state = {
    file: null,
    authorized: ["image/jpeg", "image/png"],
  };

  addFile = (event) => {
    const file = event.target.files[0];

    if (file) {
      this.setState({ file });
    }
  };
  isValidFileUploaded = (file) => {
    const validExtensions = ["jpeg", "png"];
    const fileExtension = file.type.split("/")[1];
    return validExtensions.includes(fileExtension);
  };

  sendFile = () => {
    const { file } = this.state;
    const { uploadFile, closeModal } = this.props;

    if (file !== null) {
      // if (this.isAuthorized(file.name)) {
      if (this.isValidFileUploaded(file)) {
        //send File
        const metadata = { contentType: file.name };
        // {contentType : mime.lookup(file.name)};
        uploadFile(file, metadata);
        closeModal();
        this.clearFile();
      }
      // }
    }
  };

  // isAuthorized = filename=>this.state.authorized.includes(mime.lookup(filename))

  clearFile = () => this.setState({ file: null });

  render() {
    const { modal, closeModal } = this.props;

    return (
      <Modal basic open={modal} onClose={closeModal}>
        <Modal.Header>Select an Image Files</Modal.Header>
        <Modal.Content>
          <Input
            onChange={this.addFile}
            fluid
            label="File Types: jpg, png"
            name="file"
            type="file"
          />
        </Modal.Content>
        <Modal.Actions>
          <Button onClick={this.sendFile} color="green" inverted>
            <Icon name="checkmark" />
            Send
          </Button>
          <Button color="red" inverted onClick={closeModal}>
            <Icon name="remove" />
            Cancel
          </Button>
        </Modal.Actions>
      </Modal>
    );
  }
}

export default FileModal;
