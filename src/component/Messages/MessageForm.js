import React from "react";
import { Button, Input, Segment } from "semantic-ui-react";
import firebase from "../../firebase";
import FileModal from "./FileModal";
import { v4 as uuidv4 } from "uuid";
import ProgressBar from "./ProgressBar";

class MessageForm extends React.Component {
  state = {
    storageRef: firebase.storage().ref(),
    uploadTask: null,
    uploadState: "",
    message: "",
    channel: this.props.currentChannel,
    user: this.props.currentUser,
    percentUploaded: 0,
    loading: false,
    errors: [],
    modal: false,
  };

  openModal = () => this.setState({ modal: true });
  closeModal = () => this.setState({ modal: false });

  createMessage = (fileUrl = null) => {
    const message = {
      timestamp: firebase.database.ServerValue.TIMESTAMP,
      user: {
        id: this.state.user.uid,
        name: this.state.user.displayName,
        avatar: this.state.user.photoURL,
      },
      // content: this.state.message,
    };
    if (fileUrl !== null) {
      message["image"] = fileUrl;
    } else {
      message["content"] = this.state.message;
    }
    return message;
  };

  handleChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };
  sendMessage = () => {
    // const { messagesRef } = this.props;
    const { getMessagesRef } = this.props;
    const { message, channel } = this.state;

    if (message) {
      this.setState({ loading: true });
      //you have to provide the channel id that
      // which specify which channel message have
      // messagesRef
      getMessagesRef()
        .child(channel.id)
        .push()
        .set(this.createMessage())
        .then(() => {
          this.setState({ loading: false, message: "", errors: [] });
        })
        .catch((err) => {
          console.log(err);
          this.setState({
            loading: false,
            errors: this.state.errors.concat(err),
          });
        });
    } else {
      this.setState({
        errors: this.state.errors.concat({ message: "add a message" }),
      });
    }
  };

  getPath =()=>{
    if(this.props.isPrivateChannel){
      return `chat/private-${this.state.channel.id}`;
    }else{
      return 'chat/public';
    }
  }

  uploadFile = (file, metedata) => {
    const pathToUpload = this.state.channel.id;
    // const ref = this.props.messagesRef;
    const ref = this.props.getMessagesRef();
    // const filePath = `chat/public/${uuidv4()}.jpg`;
    const filePath = `${this.getPath()}/${uuidv4()}.jpg`;

    // console.log(file,metedata)
    this.setState(
      {
        uploadState: "uploading",
        uploadTask: this.state.storageRef.child(filePath).put(file, metedata),
      },
      // callback
      () => {
        this.state.uploadTask.on(
          "state_changed",
          (snap) => {
            const percentUploaded = Math.round(
              (snap.bytesTransferred / snap.totalBytes) * 100
            );
            this.props.isProgressBarVisible(percentUploaded)
            this.setState({ percentUploaded });
          },
          (err) => {
            console.log(err);

            this.setState({
              error: this.state.errors.concat(err),
              uploadState: "error",
              uploadTask: null,
            });
          },
          () => {
            this.state.uploadTask.snapshot.ref
              .getDownloadURL()
              .then((downloadUrl) => {
                this.sendFileMessage(downloadUrl, ref, pathToUpload);
              })
              .catch((err) => {
                console.log(err);

                this.setState({
                  error: this.state.errors.concat(err),
                  uploadState: "error",
                  uploadTask: null,
                });
              });
          }
        );
      }
    );
  };

  sendFileMessage = (fileUrl, ref, pathToUpload) => {
    ref
      .child(pathToUpload)
      .push()
      .set(this.createMessage(fileUrl))
      .then(() => {
        this.setState({ uploadState: "done" });
      })
      .catch((err) => {
        console.log(err);
        this.setState({
          errors: this.state.errors.concat(err),
        });
      });
  };

  render() {
    //prettier-ignore
    const { errors, message, loading, modal,uploadState,percentUploaded } = this.state;

    return (
      <>
        <Segment className="message__form">
          <Input
            fluid
            name="message"
            value={message}
            onChange={this.handleChange}
            style={{ marginBottom: "0.7em" }}
            label={<Button icon={"add"} />}
            labelPosition="left"
            placeholder="write your message"
            className={
              errors.some((error) => error.message.includes("message"))
                ? "error"
                : ""
            }
          />
          <Button.Group icon widths="2">
            <Button
              onClick={this.sendMessage}
              disabled={loading}
              color="orange"
              content="Add Reply"
              labelPosition="left"
              icon="edit"
            />
            <Button
              color="teal"
              disabled={uploadState === "uploading"}
              onClick={this.openModal}
              content="Upload Media"
              labelPosition="right"
              icon="cloud upload"
            />
          
          </Button.Group>
          <FileModal
              modal={modal}
              closeModal={this.closeModal}
              uploadFile={this.uploadFile}
            />
            <ProgressBar
              uploadState={uploadState}
              percentUploaded={percentUploaded} 
            />
        </Segment>
      </>
    );
  }
}

export default MessageForm;
