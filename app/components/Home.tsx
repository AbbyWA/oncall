import React, { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Chip from '@material-ui/core/Chip';
import { makeStyles } from '@material-ui/core/styles';
import client from '../client';
import styles from './Home.css';
import { VisitorStatus } from '../constants';
// import routes from '../constants/routes.json';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
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

  useEffect(() => {
    client.emit('pull-leader-list');
    client.emit('pull-visitor-list');

    client.on('push-leader-list', (payload) => {
      setLeaderList(payload);
      setSelected(payload[0].name);
    });
    client.on('push-visitor-list', (payload) => {
      // eslint-disable-next-line no-console
      console.log(payload);
      setVisitors(payload);
    });
  }, []);

  return (
    <div className={styles.container} data-tid="container">
      <Grid container spacing={3}>
        <Grid item xs={3}>
          <Paper className={classes.paper}>
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
        <Grid item xs={9}>
          <Paper
            className={classes.paper}
            style={{ paddingTop: '20px', textAlign: 'left' }}
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
            <List component="nav" aria-label="secondary mailbox folder">
              {(visitors[selected] || []).map(
                ({ name, summary, time, status }, index) => (
                  <ListItem key={`${name} ${summary} ${time}`}>
                    <Chip
                      label={status}
                      variant="outlined"
                      color={
                        // eslint-disable-next-line no-nested-ternary
                        status === 'resolve'
                          ? 'primary'
                          : status === 'reject'
                          ? 'secondary'
                          : ''
                      }
                      style={{ marginRight: '10px' }}
                    />
                    <ListItemText
                      primary={`[${new Date(
                        time
                      ).toLocaleString()}] ${name} ${summary}`}
                    />

                    <Button
                      variant="contained"
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
    </div>
  );
}
