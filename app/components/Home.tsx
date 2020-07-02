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

import { makeStyles } from '@material-ui/core/styles';
import client from '../client';
import { VisitorStatus } from '../constants';
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
              overflowY: 'auto',
              overflowX: 'hidden',
              boxSizing: 'border-box',
            }}
          >
            <List component="nav" aria-label="secondary mailbox folder">
              {leaderList.map(({ name }) => (
                <ListItem
                  key={name}
                  button
                  selected={selected === name}
                  onClick={() => {
                    setSelected(name);
                  }}
                >
                  <ListItemText primary={name} />
                </ListItem>
              ))}
            </List>
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
                id="outlined-name"
                label="来访者姓名"
                value={newVisitor.name}
                onChange={(event) => {
                  setNewVisitor({ ...newVisitor, name: event.target.value });
                }}
                variant="outlined"
                style={{ marginRight: '20px' }}
              />
              <TextField
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
            </div>
            <List
              component="nav"
              aria-label="secondary mailbox folder"
              style={{
                height: 'calc(100%  -  56px)',
                overflowY: 'auto',
                overflowX: 'hidden',
              }}
            >
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
                        'MM-dd hh:mm:ss'
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
          </Paper>
        </Grid>
      </Grid>
      <Paper
        className={classes.paper}
        style={{
          marginTop: '20px',
          height: '24%',
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        <List component="nav" aria-label="secondary mailbox folder">
          {messages.map((message, index) => (
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
          ))}
        </List>
      </Paper>
    </div>
  );
}
