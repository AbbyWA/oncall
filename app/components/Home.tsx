import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ExposurePlus1Icon from '@material-ui/icons/ExposurePlus1';
import { makeStyles } from '@material-ui/core/styles';
import client from '../client';
import styles from './Home.css';
import routes from '../constants/routes.json';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  paper: {
    // padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
}));

export default function Home(): JSX.Element {
  const classes = useStyles();
  const [selected, setSelected] = useState();
  const [leaderList, setLeaderList] = useState([]);
  const [visitorList, setVisitorList] = useState([]);

  const changeSelected = (name) => {
    setSelected(name);
  };

  useEffect(() => {
    client.emit('pull-leader-list');
    client.on('push-leader-list', (data) => {
      setLeaderList(data);
      changeSelected(data[0].name);
    });
  }, []);

  return (
    <div className={styles.container} data-tid="container">
      {/* <Link to={routes.COUNTER}>to Counter</Link> */}
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
          <Paper className={classes.paper}>
            <List component="nav" aria-label="secondary mailbox folder">
              <ListItem button onClick={() => {}}>
                <ListItemIcon>
                  <ExposurePlus1Icon />
                </ListItemIcon>
                <ListItemText primary="添加" />
              </ListItem>
              {visitorList.map(({ name }) => (
                <ListItem key={name}>
                  <ListItemText primary={name} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
}
