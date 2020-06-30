import React, { useState, useEffect } from 'react';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Button from '@material-ui/core/Button';
import Chip from '@material-ui/core/Chip';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Alert from '@material-ui/lab/Alert';
import CheckIcon from '@material-ui/icons/Check';
import { makeStyles } from '@material-ui/core/styles';
import client from '../client';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    width: '100%',
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
  const [name, setName] = useState();
  const [showMessage, setShowMessage] = useState(false);

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
      <div data-tid="container">
        <Paper className={classes.paper}>
          <FormControl className={classes.formControl}>
            <InputLabel id="name-select-label">请选择用户</InputLabel>
            <Select
              labelId="name-select-label"
              id="name-select"
              value={name}
              onChange={(e) => setName(e.target.value)}
            >
              {
                // eslint-disable-next-line no-shadow
                leaderList.map(({ name }) => (
                  <MenuItem value={name} key={name}>
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
    <div data-tid="container">
      <Grid container spacing={3}>
        <Paper
          className={classes.paper}
          style={{ paddingTop: '20px', textAlign: 'left' }}
        >
          <Alert
            icon={<CheckIcon fontSize="inherit" />}
            severity="success"
            style={{
              marginBottom: '10px',
              display: showMessage ? 'flex' : 'none',
            }}
          >
            已呼叫 — 请稍等!
          </Alert>
          <Button
            variant="contained"
            color="primary"
            disabled={showMessage}
            onClick={() => {
              client.emit('add-message', { type: 'call', payload: { name } });
              setShowMessage(true);
              setTimeout(() => {
                setShowMessage(false);
              }, 2000);
            }}
          >
            呼叫秘书
          </Button>
          <List component="nav" aria-label="secondary mailbox folder">
            {(visitors[selected] || []).map(
              // eslint-disable-next-line no-shadow
              ({ name: visitorName, summary, time, status }, index) => (
                <ListItem key={`${visitorName} ${summary} ${time}`}>
                  <Chip
                    label={status}
                    variant="outlined"
                    color={
                      // eslint-disable-next-line no-nested-ternary
                      status === 'resolve'
                        ? 'primary'
                        : status === 'reject'
                        ? 'secondary'
                        : 'default'
                    }
                    style={{ marginRight: '10px' }}
                  />
                  <ListItemText
                    primary={`[${new Date(
                      time
                    ).toLocaleString()}] ${visitorName} ${summary}`}
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    style={{ marginRight: '10px' }}
                    onClick={() => {
                      client.emit('add-message', {
                        type: 'resolve',
                        payload: {
                          name,
                          visitorIndex: index,
                        },
                      });
                    }}
                  >
                    接见
                  </Button>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => {
                      client.emit('add-message', {
                        type: 'reject',
                        payload: {
                          name,
                          visitorIndex: index,
                        },
                      });
                    }}
                  >
                    拒绝
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
