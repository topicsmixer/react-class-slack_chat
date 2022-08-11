import React from "react";
import AvatarEditor from "react-avatar-editor";
//prettier-ignore
import { Grid, Header, Icon, Dropdown, Image,Modal,Input,Button } from "semantic-ui-react";
import firebase from "../../firebase";
// import {connect} from 'react-redux';

class UserPanel extends React.Component {
  state = {
    user: this.props.currentUser,
    modal: false,
    previewImage: "",
    croppedImage: "",
    blob: "",
    uploadCroppedImage:'',
    storageRef: firebase.storage().ref(),
    userRef: firebase.auth().currentUser,
    usersRef:firebase.database().ref('users'),
    metadata:{
      contentType:'image/jpeg',
    }
  };

  // componentDidMount(){
  //   this.setState({user:this.props.currentUser})
  // }

  // componentWillReceiveProps(nextProps){
  //   this.setState({user : nextProps.currentUser})
  // }

  openModal = () => this.setState({ modal: true });
  closeModal = () => this.setState({ modal: false });

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
      text: <span onClick={this.openModal}>Change Avatar</span>,
    },
    {
      key: "signout",
      text: <span onClick={this.handleSignout}>Sign Out</span>,
    },
  ];

  //we uploaded the image to the firebase as an image blob

  uploadCroppedImage=()=>{
    const {storageRef,userRef,blob,metadata} = this.state;

    storageRef
    .child(`avatars/user-${userRef.uid}`)
    .put(blob,metadata)
    .then(snap=>{
      snap.ref.getDownloadURL().then(downloadURL=>{
        this.setState({uploadCroppedImage :downloadURL},()=>this.changeAvatar())
      })
    })
    
  }

  changeAvatar=()=>{
    this.state.userRef
    .updateProfile({
      photoURL:this.state.uploadCroppedImage
    })
    .then(()=>{
      console.log("PhotoURL Updated");
      this.closeModal()
    })
    .catch(err=>console.error(err))

    //change the data in the firebase 
    this.state.usersRef
      .child(this.state.user.uid)
      .update({avatar:this.state.uploadCroppedImage})
      .then(()=>{
        console.log('User Avatar Updated');
      }).catch(err=>{
        console.error(err)
      })
  }

  handleChange = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    if (file) {
      reader.readAsDataURL(file);
      reader.addEventListener("load", () => {
        this.setState({ previewImage: reader.result });
      });
    }
  };

  handleCropImage = () => {
    if (this.avatarEditor) {
      // getImageScaledToCanvas it will do the cropping of the image
      this.avatarEditor.getImageScaledToCanvas().toBlob((blob) => {
        let imageUrl = URL.createObjectURL(blob);
        this.setState({
          croppedImage: imageUrl,
          //croppedImage is for another preview of the image that we are selected from the avatar editor component
          //blob is for neccessary sending the image file over to the firebase storage
          blob,
        });
      });
    }
  };

  handleSignout = () => {
    firebase
      .auth()
      .signOut()
      .then(() => console.log(""))
      .catch((error) => console.log(error));
  };

  render() {
    const { user, modal, previewImage, croppedImage } = this.state;

    const { primaryColor } = this.props;

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
          {/* Change User Avatar Modal */}
          <Modal basic open={modal} onClose={this.closeModal}>
            <Modal.Header>Change Avatar</Modal.Header>
            <Modal.Content>
              <Input
                onChange={this.handleChange}
                fluid
                type="file"
                label="New Avatar"
                name="previewImage"
              />
              <Grid centered stackable columns={2}>
                <Grid.Row centered>
                  <Grid.Column className="ui center aligned grid">
                    {/* Image Preview */}
                    {
                      previewImage && (
                        <AvatarEditor
                          ref={(node) => (this.avatarEditor = node)}
                          image={previewImage}
                          width={120}
                          height={120}
                          border={50}
                          scale={1.5}
                        />
                      )
                      //scale to make it zoom litle bit more
                    }
                  </Grid.Column>
                  <Grid.Column>
                    {/* Cropped Image Preview */}
                    {croppedImage && (
                      <Image
                        style={{ margin: "3.5em auto" }}
                        width={100}
                        height={100}
                        src={croppedImage}
                      />
                    )}
                  </Grid.Column>
                </Grid.Row>
              </Grid>
            </Modal.Content>
            <Modal.Actions>
              {croppedImage && (
                <Button color="green" inverted  
                onClick={this.uploadCroppedImage}
                >
                  <Icon name="save" /> Change Avatar
                </Button>
              )}

              <Button color="green" inverted onClick={this.handleCropImage}>
                <Icon name="image" /> Preview
              </Button>

              <Button color="red" inverted onClick={this.closeModal}>
                <Icon name="remove" /> Cancel
              </Button>
            </Modal.Actions>
          </Modal>
        </Grid.Column>
      </Grid>
    );
  }
}

// const mapStateToProps=state=>({
//   currentUser :state.user.currentUser,
// })

export default UserPanel;
