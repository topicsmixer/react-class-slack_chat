import React from "react";
import { Comment, Segment } from "semantic-ui-react";
import MessageForm from "./MessageForm";
import MessagesHeader from "./MessagesHeader";
import firebase from "../../firebase";
import Message from "./Message";
import {connect} from 'react-redux'
import {setUserPosts} from '../../action'

class Messages extends React.Component {
  state = {
    privateChannel: this.props.isPrivateChannel,
    privateMessagesRef : firebase.database().ref('privateMessages'),
    messagesRef: firebase.database().ref("messages"),
    channel: this.props.currentChannel, 
    isChannelStarred:false,
    messages: [],
    messagesLoading: true,
    user: this.props.currentUser,
    usersRef:firebase.database().ref("users"),
    progressBar: false,
    numUniqueUsers: "",
    searchTerm: "",
    searchLoading: false,
    searchResults: [],
  };

  componentDidMount() {
    const { channel, user } = this.state;

    if (channel && user) {
      this.addListeners(channel.id);
      this.addUserStarsListner(channel.id,user.uid);  
    }
  }

  addListeners = (channelId) => {
    this.addMessageListner(channelId);
  };

  addMessageListner = (channelId) => {
    let loadedMessages = [];
    const ref= this.getMessagesRef();
    // this.state.messagesRef
    ref.child(channelId).on("child_added", (snap) => {
      loadedMessages.push(snap.val());
      this.setState({
        messages: loadedMessages,
        messagesLoading: false,
      });
      this.countUniqueUsers(loadedMessages);
      this.countUserPosts(loadedMessages);
    });
  };

  addUserStarsListner = (channelId,userId)=>{
    this.state.usersRef
    .child(userId)
    .child('starred')
    .once('value')
    .then(data=>{
      if(data.val() !== null){
        const channelIds = Object.keys(data.val())
        const prevStarred = channelIds.includes(channelId);
        this.setState({ isChannelStarred : prevStarred});
      }
    })

  }

  getMessagesRef =()=>{
    const {messagesRef,privateMessagesRef,privateChannel} = this.state;
    return privateChannel ? privateMessagesRef : messagesRef;
  }


  handleStar =()=>{
    this.setState(prevState=>({
      isChannelStarred : !prevState.isChannelStarred
    }),()=> this.starChannel())
  }

  starChannel = ()=>{
    if(this.state.isChannelStarred){
      this.state.usersRef
      .child(`${this.state.user.uid}/starred`)
      .update({
        [this.state.channel.id]:{
          name:this.state.channel.name,
          details:this.state.channel.details,
          createdBy:{
            name:this.state.channel.createdBy.name, 
            avatar:this.state.channel.createdBy.avatar
          }
        }
      })
    }else{
      // console.log('unStar');
      this.state.usersRef
      .child(`${this.state.user.uid}/starred`)
      .child(this.state.channel.id)
      .remove(err =>{
        if(err !== null){
          console.error(err)
        }
      })  
    }
  }


  handleSearchChange = (event) => {
    this.setState(
      {
        searchTerm: event.target.value,
        searchLoading: true,
      },
      () => this.handleSearchMessages()
    );
  };

  handleSearchMessages = () => {
    const channelMessages = [...this.state.messages];
    const regex = new RegExp(this.state.searchTerm, "gi");
    //globally and case sensitive
    const searchResults = channelMessages.reduce((acc, message) => {
      if (
        (message.content && message.content.match(regex)) ||
        message.user.name.match(regex)
      ) {
        acc.push(message);
      }
      return acc;
    }, []);
    this.setState({ searchResults });
    setTimeout(() => {
      this.setState({ searchLoading: false });
    }, 1000);
  };

  countUniqueUsers = (messages) => {
    const uniqueUsers = messages.reduce((acc, message) => {
      if (!acc.includes(message.user.name)) {
        acc.push(message.user.name);
      }
      return acc;
    }, []);
    const plural = uniqueUsers.length > 1 || uniqueUsers.length === 0;
    const numUniqueUsers = `${uniqueUsers.length} User${plural ? "s" : ""}`;
    this.setState({ numUniqueUsers });
  };

  countUserPosts = messages =>{
    // ecumalator for the reduce initially set to Empty Object Not and Empty Array
    let userPosts = messages.reduce((acc,message)=>{
      if(message.user.name in acc){
        acc[message.user.name].count +=1;
      }else{
        acc[message.user.name]={
          avatar:message.user.avatar,
          count:1
        }
      }
      return acc;
    },{})

    this.props.setUserPosts(userPosts);

  }

  displayMessages = (messages) =>
    messages.length > 0 &&
    messages.map((message) => (
      <Message
        key={message.timestamp}
        message={message}
        user={this.state.user}
      />
    ));

  isProgressBarVisible = (percent) => {
    if (percent > 0) {
      this.setState({ progressBar: true });
    }
  };
  // channel ? `#${channel.name}` : ""
  displayChannelName = (channel) => {
    return channel
      ? `${this.state.privateChannel ? "@" : "#"}${channel.name}`
      : "";
  };

  render() {
    // prettier-ignore
    const { messagesRef, messages, channel, user,progressBar,
      numUniqueUsers,searchTerm,searchResults,searchLoading,privateChannel,isChannelStarred} = this.state;

    return (
      <>
        <MessagesHeader
          channelName={this.displayChannelName(channel)}
          numUniqueUsers={numUniqueUsers}
          handleSearchChange={this.handleSearchChange}
          searchLoading={searchLoading}
          isPrivateChannel={privateChannel}
          handleStar={this.handleStar}
          isChannelStarred={isChannelStarred}
        />
        <Segment>
          <Comment.Group
            className={progressBar ? "message__progress" : "messages"}
          >
            {/* Message */}
            {/* {this.displayMessages(messages)} */}
            {searchTerm
              ? this.displayMessages(searchResults)
              : this.displayMessages(messages)}
          </Comment.Group>
        </Segment>

        <MessageForm
          messagesRef={messagesRef}
          currentChannel={channel}
          currentUser={user}
          isProgressBarVisible={this.isProgressBarVisible}
          isPrivateChannel={privateChannel}
          getMessagesRef={this.getMessagesRef}
        />
      </>
    );
  }
}

export default connect(null,{setUserPosts})(Messages);
