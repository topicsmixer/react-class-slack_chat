import React from "react";
import { Comment, Segment } from "semantic-ui-react";
import MessageForm from "./MessageForm";
import MessagesHeader from "./MessagesHeader";

class Messages extends React.Component {
  render() {
    return (
      <>
        <MessagesHeader />
        <Segment>
          <Comment.Group className="messages">
            {/* Message */}

          </Comment.Group>
        </Segment>

        <MessageForm />
      </>
    );
  }
}

export default Messages;
