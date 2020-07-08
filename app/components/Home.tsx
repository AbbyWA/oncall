/* eslint-disable */

import React, { useState, useEffect } from 'react';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Chip from '@material-ui/core/Chip';
import Alert from '@material-ui/lab/Alert';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import { Scrollbars } from 'react-custom-scrollbars';

import { makeStyles } from '@material-ui/core/styles';
import client from '../client';
import { VisitorStatus, LeaderStatus } from '../constants';
import useToday from './useToday';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
}));

const statusColor = {
  [LeaderStatus.ONLINE]: 'primary',
  [LeaderStatus.OFFLINE]: 'disabled',
  [LeaderStatus.UNAVAILABLE]: 'secondary',
};

function findLeaderByName(leaders, name) {
  if (!name) return{};
  return leaders.filter((item) => item.name === name)[0];
}

export default function Home(): JSX.Element {
  const classes = useStyles();
  const [selected, setSelected] = useState();
  const [leaderList, setLeaderList] = useState([]);
  const [visitors, setVisitors] = useState({});
  const [newVisitor, setNewVisitor] = useState({
    name: '',
    summary: '',
  });
  const [messages, setMessages] = useState([]);
  const [today] = useToday();

  useEffect(() => {
    client.emit('pull-leader-list');
    client.emit('pull-visitor-list');
    client.emit('pull-messages');

    client.on('push-leader-list', (payload) => {
      // eslint-disable-next-line no-console
      console.log(payload);
      setLeaderList(payload);
      setSelected(payload[0].name);
    });
    client.on('push-visitor-list', (payload) => {
      // eslint-disable-next-line no-console
      console.log(payload);
      setVisitors(payload);
    });
    client.on('push-messages', (payload) => {
      // eslint-disable-next-line no-console
      console.log(payload);
      if (payload.length > messages.length) {
        document.getElementById('message-audio').play();
      }
      setMessages(payload);
    });
  }, []);

  return (
    <div data-tid="container" style={{ height: '100vh', padding: '10px' }}>
      <Alert
        icon={false}
        severity="info"
        style={{
          marginBottom: '10px',
          backgroundColor: 'transparent',
        }}
      >
        {today}
      </Alert>
      <Grid container spacing={3} style={{ height: '60%' }}>
        <Grid item xs={3} style={{ height: '100%', boxSizing: 'border-box' }}>
          <Paper
            className={classes.paper}
            style={{
              height: '100%',
              boxSizing: 'border-box',
            }}
          >
            <Scrollbars autoHide>
              <List component="nav" aria-label="secondary mailbox folder">
                {leaderList.map(({ name, status }) => (
                  <ListItem
                    key={name}
                    button
                    selected={selected === name}
                    onClick={() => {
                      setSelected(name);
                    }}
                  >
                    <ListItemIcon>
                      <AccountCircleIcon color={statusColor[status]} />
                    </ListItemIcon>
                    <ListItemText primary={name} />
                  </ListItem>
                ))}
              </List>
            </Scrollbars>
          </Paper>
        </Grid>
        <Grid item xs={9} style={{ height: '100%', boxSizing: 'border-box' }}>
          <Paper
            className={classes.paper}
            style={{
              boxSizing: 'border-box',
              paddingTop: '20px',
              textAlign: 'left',
              height: '100%',
            }}
          >
            <div>
              <TextField
                disabled={
                  findLeaderByName(leaderList, selected).status !==
                  LeaderStatus.ONLINE
                }
                id="outlined-name"
                label="来访者姓名"
                value={newVisitor.name}
                onChange={(event) => {
                  setNewVisitor({ ...newVisitor, name: event.target.value });
                }}
                variant="outlined"
                style={{
                  marginRight: '20px',
                  width: '150px'
                }}
              />
              <TextField
                disabled={
                  findLeaderByName(leaderList, selected).status !==
                  LeaderStatus.ONLINE
                }
                id="outlined-summary"
                label="事由"
                value={newVisitor.summary}
                onChange={(event) => {
                  setNewVisitor({
                    ...newVisitor,
                    summary: event.target.value,
                  });
                }}
                variant="outlined"
                style={{ marginRight: '20px' }}
              />
              <Button
                variant="contained"
                color="primary"
                disabled={!newVisitor.name || !newVisitor.summary}
                onClick={() => {
                  client.emit('add-visitor-by-name', {
                    name: selected,
                    payload: {
                      ...newVisitor,
                      time: Date.now(),
                      status: VisitorStatus.PENDING,
                    },
                  });
                  setNewVisitor({ name: '', summary: '' });
                }}
              >
                添加
              </Button>
              <Button
                variant="contained"
                color="secondary"
                style={{ marginLeft: '160px' }}
                onClick={() => {
                  client.emit('clear-visitors',{});
                }}
            >
              一键清除
            </Button>
            </div>

            <Scrollbars
              autoHide
              style={{
                height: 'calc(100%  -  56px)',
              }}
            >
              <List component="nav" aria-label="secondary mailbox folder">
                {(visitors[selected] || []).map(
                  ({ name, summary, time, status }, index) => (
                    <ListItem key={`${name} ${summary} ${time}`}>
                      <Chip
                        label={status}
                        variant="default"
                        color={
                          // eslint-disable-next-line no-nested-ternary
                          status === VisitorStatus.RESOLVE
                            ? 'primary'
                            : status === VisitorStatus.REJECT
                            ? 'secondary'
                            : 'default'
                        }
                        style={{ marginRight: '10px' }}
                      />
                      <ListItemText
                        primary={`${new Date(time).pattern(
                          'hh:mm:ss'
                        )} ${name} ${summary}`}
                      />

                      <Button
                        // variant="contained"
                        color="secondary"
                        onClick={() => {
                          client.emit('delete-visitor-by-name', {
                            name: selected,
                            index,
                          });
                        }}
                      >
                        清除
                      </Button>
                    </ListItem>
                  )
                )}
              </List>
            </Scrollbars>
          </Paper>
        </Grid>
      </Grid>
      <Paper
        className={classes.paper}
        style={{
          marginTop: '20px',
          height: '24%',
        }}
      >
        <Scrollbars
          autoHide
          style={{
            height: '100%',
          }}
        >
          {messages.length === 0 ? (
            <div>暂时木有消息~</div>
          ) : (
            <List component="nav" aria-label="secondary mailbox folder">
              {messages.map(
                (
                  { type, payload: { name, visitorName, reason }, time },
                  index
                ) => {
                  let message = '';
                  if (type === 'call') {
                    message = `${name} 呼叫秘书`;
                  }
                  if (type === 'resolve') {
                    message = `${name} 需要接见 ${visitorName}`;
                  }
                  if (type === 'reject') {
                    message = `${name} 拒绝接见 ${visitorName} ${reason}`;
                  }
                  if(type === 'holdon') {
                    message = `${name} 拒绝接见 ${visitorName} ${reason}`;
                  }
                  message = `${new Date(time).pattern('hh:mm:ss')} ${message}`;
                  return (
                    <ListItem key={message}>
                      <ListItemText primary={message} />
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => {
                          client.emit('remove-message', index);
                        }}
                      >
                        知道了
                      </Button>
                    </ListItem>
                  );
                }
              )}
            </List>
          )}
        </Scrollbars>
      </Paper>
    </div>
  );
}
