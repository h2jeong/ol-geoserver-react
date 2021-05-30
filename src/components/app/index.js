import { Suspense, lazy } from 'react';
import React, { BrowserRouter, Route, Switch } from 'react-router-dom';
import { Spin } from 'antd';
import Auth from '../../hoc/Auth';

const LoginPage = lazy(() => import('../views/login'));
const RegisterPage = lazy(() => import('../views/register'));
const DashBoardPage = lazy(() => import('../views/dashboard'));
const JourneyPage = lazy(() => import('../views/journey'));
const JourneyTablePage = lazy(() => import('../views/journeyTablePage'));
const ReportsPage = lazy(() => import('../views/reports'));
const EquipmentPage = lazy(() => import('../views/equipment'));
const ProjectPage = lazy(() => import('../views/projects'));
const UsersPage = lazy(() => import('../views/users'));
const ProgramInfoPage = lazy(() => import('../views/programInfo'));
const ProjectDetailPage = lazy(() => import('../views/projectDetail'));
const ReferenceLinkPage = lazy(() => import('../views/referenceLink'));

export default function App() {
  return (
    <BrowserRouter>
      <Suspense
        fallback={
          <div className="loading">
            <Spin />
          </div>
        }>
        <Switch>
          <Route exact path="/" component={Auth(DashBoardPage, true, false)} />
          <Route path="/login" component={Auth(LoginPage, false)} />
          <Route path="/register" component={Auth(RegisterPage, false)} />
          <Route
            exact
            path="/journey"
            component={Auth(JourneyPage, true, false)}
          />
          <Route
            path="/journey/:id"
            component={Auth(ReportsPage, true, false)}
          />
          <Route
            path="/journeyList"
            component={Auth(JourneyTablePage, true, false)}
          />
          <Route
            path="/equipment"
            component={Auth(EquipmentPage, true, true)}
          />
          <Route
            exact
            path="/projects"
            component={Auth(ProjectPage, true, true)}
          />
          <Route
            path="/projects/:id"
            component={Auth(ProjectDetailPage, true, true)}
          />
          <Route path="/users" component={Auth(UsersPage, true, true)} />
          <Route
            path="/programInfo"
            component={Auth(ProgramInfoPage, true, false)}
          />
          <Route
            path="/referenceLink"
            component={Auth(ReferenceLinkPage, true, false)}
          />
        </Switch>
      </Suspense>
    </BrowserRouter>
  );
}
