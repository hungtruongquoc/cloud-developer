import React, {Component} from 'react'
import {Link, Route, Router, Switch} from 'react-router-dom'
import {Grid, Menu, MenuItemProps, Segment} from 'semantic-ui-react'

import Auth from './auth/Auth'
import {EditTodo} from './components/EditTodo'
import {LogIn} from './components/LogIn'
import {NotFound} from './components/NotFound'
import {Todos} from './components/Todos'
import {Jobs} from "./components/Jobs";

export interface AppProps {
}

export interface AppProps {
  auth: Auth
  history: any
}

export interface AppState {
  activeItem: any
}

export default class App extends Component<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props)

    this.handleLogin = this.handleLogin.bind(this)
    this.handleLogout = this.handleLogout.bind(this)
    this.state = {
      activeItem: 'home'
    };
  }

  handleLogin() {
    this.props.auth.login()
  }

  handleLogout() {
    this.props.auth.logout()
  }

  // @ts-ignore
  handleMenuItemClicked = (e: MouseEvent<MouseEvent>, {name}: MenuItemProps) => {
    this.setState({activeItem: name});
  };

  render() {
    return (
      <div>
        <Segment style={{padding: '8em 0em'}} vertical>
          <Grid container stackable verticalAlign="middle">
            <Grid.Row>
              <Grid.Column width={16}>
                <Router history={this.props.history}>
                  {this.generateMenu()}
                  {this.generateCurrentPage()}
                </Router>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Segment>
      </div>
    )
  }

  generateMenu() {
    return (
      <Menu>
        <Menu.Item name="home">
          <Link to="/">ToDos</Link>
        </Menu.Item>
        {this.generateJobMenu()}
        <Menu.Menu position="right">{this.logInLogOutButton()}</Menu.Menu>
      </Menu>
    )
  }

  logInLogOutButton() {
    if (this.props.auth.isAuthenticated()) {
      return (
        <Menu.Item name="logout" onClick={this.handleLogout}>
          Log Out
        </Menu.Item>
      )
    } else {
      return (
        <Menu.Item name="login" onClick={this.handleLogin}>
          Log In
        </Menu.Item>
      )
    }
  }

  generateJobMenu = () => {
    const {auth} = this.props;
    const {activeItem} = this.state;
    if (auth.isAuthenticated()) {
      return (
        <Menu.Item name="jobs" onClick={this.handleMenuItemClicked} active={activeItem == 'jobs'}>
          <Link to="/jobs">Jobs</Link>
        </Menu.Item>
      );
    }
    return null;
  };

  generateCurrentPage() {
    if (!this.props.auth.isAuthenticated()) {
      return <LogIn auth={this.props.auth}/>
    }

    return (
      <Switch>
        <Route
          path="/"
          exact
          render={props => {
            return <Todos {...props} auth={this.props.auth}/>
          }}
        />

        <Route
          path="/todos/:todoId/edit"
          exact
          render={props => {
            return <EditTodo {...props} auth={this.props.auth}/>
          }}
        />

        <Route
          path="/jobs"
          exact
          render={props => (
            <Jobs auth={this.props.auth} {...props}/>
          )}
        />

        <Route component={NotFound}/>
      </Switch>
    )
  }
}
