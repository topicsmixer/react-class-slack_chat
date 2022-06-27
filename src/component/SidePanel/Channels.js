import React from "react";
import { Button, Form, Icon, Input, Menu,  Modal } from "semantic-ui-react";
import firebase from "../../firebase";
import {setCurrentChannel} from '../../action'
import { connect } from "react-redux";

class Channels extends React.Component {
  state = {
    activeChannel: '', 
    user: this.props.currentUser,
    channels: [],
    channelName: "",
    channelDetails: "",
    modal: false,
    channelsRef: firebase.database().ref("channels"),
    firstLoad : true
  };

  componentDidMount(){
    this.addListeners();
  }

  componentWillUnmount(){
    this.removeListners()
  }

  addListeners =()=>{
    let loadChannels =[];
    this.state.channelsRef.on('child_added',snap=>{
      loadChannels.push(snap.val())
      this.setState({channels : loadChannels},()=>this.setFirstChannel())
    })
  }

  removeListners =()=>{
    this.state.channelsRef.off()
  }

  setFirstChannel=()=>{

    const firstChannel = this.state.channels[0]

    if(this.state.firstLoad && this.state.channels.length  > 0){
      this.props.setCurrentChannel(firstChannel)
      this.setActiveChannel(firstChannel) 
    }

    this.setState({firstLoad : false })
  }

  addChannel = () => {
    const { channelsRef, channelName, channelDetails, user } = this.state;

    const key = channelsRef.push().key;

    const newChannel = {
      id: key,
      name: channelName,
      details: channelDetails,
      createdBy: {
        name: user.displayName,
        avatar: user.photoURL,
      },
    };

    channelsRef
      .child(key)
      .update(newChannel)
      .then(() => {
        this.setState({ channelName: "", channelDetails: "" });
        this.closeModal();
        console.log("channel Added");
      })
      .catch((err) => {
        console.log(err);
      });
  };

  handleSubmit = (event) => {
    event.preventDefault();
    if (this.isFormValid(this.state)) {
      this.addChannel();
    }
  };

  closeModal = () => this.setState({ modal: false });

  openModal = () => this.setState({ modal: true });

  isFormValid = ({ channelName, channelDetails }) =>
    channelName && channelDetails;

  handleChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  changeChannel = channel =>{
    this.setActiveChannel(channel)
    this.props.setCurrentChannel(channel);
  }

  setActiveChannel= channel =>{
     this.setState({activeChannel : channel.id})
  }

  displayChannel=channels=>{
    return channels.length > 0  && channels.map(channel=>(
      <Menu.Item
      key={channel.id}
      onClick={()=>this.changeChannel(channel)}
      name={channel.name}
      style={{opacity : 0.7}}
      active={channel.id === this.state.activeChannel}
      >
        # {channel.name}
      </Menu.Item>
    ))
  }

  render() {
    const { channels, modal } = this.state;

    return (
      <>
        <Menu.Menu style={{ paddingBottom: "2em" }}>
          <Menu.Item>
            <span>
              <Icon name="exchange" /> CHANNELS
            </span>{" "}
            ({channels.length}) <Icon name="add" onClick={this.openModal} />
          </Menu.Item>
          {/* All the channels */}
          {
            this.displayChannel(channels)
          }
        </Menu.Menu>

        {/* Add Channel Modal */}
        <Modal basic open={modal} onClose={this.closeModal}>
          <Modal.Header>Add a Channel</Modal.Header>
          <Modal.Content>
            <Form onSubmit={this.handleSubmit}>
              <Form.Field>
                <Input
                  fluid
                  label="Name of Channel"
                  name="channelName"
                  onChange={this.handleChange}
                />
              </Form.Field>
              <Form.Field>
                <Input
                  fluid
                  label="About the Channel"
                  name="channelDetails"
                  onChange={this.handleChange}
                />
              </Form.Field>
            </Form>
          </Modal.Content>
          <Modal.Actions>
            <Button color="green" inverted onClick={this.handleSubmit}>
              <Icon name="checkmark" /> Add
            </Button>
            <Button color="red" inverted onClick={this.closeModal}>
              <Icon name="remove" /> Cancel
            </Button>
          </Modal.Actions>
        </Modal>
      </>
    );
  }
}

export default connect(null , {setCurrentChannel})(Channels);
