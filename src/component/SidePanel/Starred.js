import React from "react";
import { connect } from "react-redux";
import firebase from "../../firebase";
import { setCurrentChannel, setPrivateChannel } from "../../action";
import { Menu, Icon } from "semantic-ui-react";

class Starred extends React.Component {
  state = {
    user: this.props.currentUser,
    usersRef: firebase.database().ref("users"),
    activeChannel: "",
    starredChannels: [],
  };

  componentDidMount(){
    if(this.state.user){
      this.addListeners(this.state.user.uid)
    }
  }

  componentWillUnmount(){
    this.removeListener();
  }

  removeListener=()=>{
    this.state.usersRef.child(`${this.state.user.uid}/starred`).off();
  }

  addListeners = userId =>{
    //when the channel get star
    this.state.usersRef
    .child(userId)
    .child('starred')
    .on('child_added',snap=>{
      const starredChannel = {id:snap.key,...snap.val()};
      this.setState({
        starredChannels:[...this.state.starredChannels,starredChannel]
      });
    });

    //when the channel get unstar
    this.state.usersRef
    .child(userId)
    .child('starred')
    .on('child_removed',snap=>{
      const channelToRemove = {id:snap.key,...snap.val()};
      const filterChannels = this.state.starredChannels.filter(channel=>{
        return channel.id  !== channelToRemove.id;
      });
      this.setState({starredChannels:filterChannels})
    })
  }

  setActiveChannel = (channel) => {
    this.setState({ activeChannel: channel.id });
  };

  changeChannel = (channel) => {
    this.setActiveChannel(channel);
    this.props.setCurrentChannel(channel);
    this.props.setPrivateChannel(false);
  };

  displayChannel = (starredChannels) => {
    return (
      starredChannels.length > 0 &&
      starredChannels.map((channel) => (
        <Menu.Item
          key={channel.id}
          onClick={() => this.changeChannel(channel)}
          name={channel.name}
          style={{ opacity: 0.7 }}
          active={channel.id === this.state.activeChannel}
        >
          # {channel.name}
        </Menu.Item>
      ))
    );
  };

  render() {
    const { starredChannels } = this.state;

    return (
      <Menu.Menu className="menu">
        <Menu.Item>
          <span>
            <Icon name="star" /> STARRED
          </span>{" "}
          ({starredChannels.length})
        </Menu.Item>

        {this.displayChannel(starredChannels)}
      </Menu.Menu>
    );
  }
}

// set map state to private and current channel
// destructure both setCurrentChannel,setPrivateChannel
// from map to dispatch both props

export default connect(null, { setCurrentChannel, setPrivateChannel })(Starred);
