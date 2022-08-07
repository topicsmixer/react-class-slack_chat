import React from "react";
import { Grid, Header, Icon, Dropdown, Image } from "semantic-ui-react";
import firebase from "../../firebase";
// import {connect} from 'react-redux';

class UserPanel extends React.Component {
  state = {
    user: this.props.currentUser,
  };

  // componentDidMount(){
  //   this.setState({user:this.props.currentUser})
  // }

  // componentWillReceiveProps(nextProps){
  //   this.setState({user : nextProps.currentUser})
  // }

  dropdownOptions = () => [
    {
      key: "user",
      text: (
        <span>
          Signed in as &nbsp;<strong>{this.state.user.displayName}</strong>
        </span>
      ),
      disabled: true,
    },
    {
      key: "avatar",
      text: <span>Change Avatar</span>,
    },
    {
      key: "signout",
      text: <span onClick={this.handleSignout}>Sign Out</span>,
    },
  ];

  handleSignout = () => {
    firebase
      .auth()
      .signOut()
      .then(() => console.log(""))
      .catch((error) => console.log(error));
  };

  render() {
    const { user } = this.state;

    const {primaryColor} = this.props;

    return (
      <Grid style={{ background: primaryColor }}>
        <Grid.Column>
          <Grid.Row style={{ padding: "1.2rem", margin: 0 }}>
            {/* App header */}
            <Header inverted floated="left" as="h2">
              <Icon name="code" />
              <Header.Content>DevChart</Header.Content>
            </Header>
            {/* User DropDown */}
            <Header style={{ padding: "0.25rem" }} as="h4" inverted>
              <Dropdown
                trigger={
                  <span>
                    <Image src={user.photoURL} spaced="right" avatar />
                    &nbsp;
                    {user.displayName}
                  </span>
                }
                options={this.dropdownOptions()}
              />
            </Header>
          </Grid.Row>
        </Grid.Column>
      </Grid>
    );
  }
}

// const mapStateToProps=state=>({
//   currentUser :state.user.currentUser,
// })

export default UserPanel;
