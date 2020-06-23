import React, { useState, useEffect } from 'react';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Chip from '@material-ui/core/Chip';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import { makeStyles } from '@material-ui/core/styles';
import client from '../client';
import styles from './Home.css';
import { VisitorStatus } from '../constants';

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
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
}));

export default function Leader(): JSX.Element {
  const classes = useStyles();
  const [selected, setSelected] = useState();
  const [leaderList, setLeaderList] = useState([]);
  const [visitors, setVisitors] = useState({});
  const [newVisitor, setNewVisitor] = useState({
    name: '',
    summary: '',
  });
  const [name, setName] = useState();

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

  if (!name) {
    return (
      <div className={styles.container} data-tid="container">
        <Paper className={classes.paper}>
          <FormControl className={classes.formControl}>
            <InputLabel id="name-select-label">请选择用户</InputLabel>
            <Select
              labelId="name-select-label"
              id="name-select"
              value={name}
              onChange={setName}
            >
              {
                // eslint-disable-next-line no-shadow
                leaderList.map(({ name }) => (
                  <MenuItem value={name} key="name">
                    {name}
                  </MenuItem>
                ))
              }
            </Select>
          </FormControl>
        </Paper>
      </div>
    );
  }

  return (
    <div className={styles.container} data-tid="container">
      <Grid container spacing={3}>
        <Paper
          className={classes.paper}
          style={{ paddingTop: '20px', textAlign: 'left' }}
        >
          <Button variant="contained" color="primary" onClick={() => {}}>
            呼叫秘书
          </Button>
          <List component="nav" aria-label="secondary mailbox folder">
            {(visitors[selected] || []).map(
              // eslint-disable-next-line no-shadow
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
    </div>
  );
}
