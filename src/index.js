import React from "react";
import ReactDOM from "react-dom/client";
import App from "./component/App";
import reportWebVitals from "./reportWebVitals";

import {
  BrowserRouter as Router,
  Switch,
  Route,
  withRouter,
} from "react-router-dom";
import Login from "./component/Auth/Login";
import Register from "./component/Auth/Register";
import firebase from "./firebase";

import { createStore } from "redux";
import { Provider,connect } from "react-redux";
import { composeWithDevTools } from "redux-devtools-extension";
import rootReducer from "./reducer";
import {setUser,clearUser} from './action'
import Spinner from "./Spinner";

const store = createStore(rootReducer, composeWithDevTools());
 
class Root extends React.Component {
  componentDidMount() {
    // console.log(this.props.isLoading)  
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        // console.log(user)
        this.props.setUser(user)
        this.props.history.push("/");
      }else{
        this.props.history.push('/login');
        this.props.clearUser();
      }
    });
  }

  render() {
    return this.props.isLoading ? <Spinner/> : (
      <Switch>
        <Route exact path="/" component={App} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
      </Switch>
    );
  }
}

const mapStateFromProps =state=>({
 isLoading:state.user.isLoading,
})

//mapdispatchtoprops

const RootWithAuth = withRouter(connect(mapStateFromProps,{setUser,clearUser})(Root));

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  // <React.StrictMode>
  <Provider store={store}> 
    <Router>
      <RootWithAuth />
    </Router>
  </Provider>
  // </React.StrictMode>
);

reportWebVitals();
