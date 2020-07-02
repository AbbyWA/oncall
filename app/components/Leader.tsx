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
import useToday from './useToday';
import { VisitorStatus } from '../constants';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary,
    backgroundColor: 'rgba(255, 255, 255, 0)',
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
}));

export default function Leader(): JSX.Element {
  const classes = useStyles();
  const [leaderList, setLeaderList] = useState([]);
  const [visitors, setVisitors] = useState({});
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [selectedIndex, setSelectedIndex] = React.useState(-1);
  const [today] = useToday();

  useEffect(() => {
    client.emit('pull-leader-list');
    client.emit('pull-visitor-list');

    client.on('push-leader-list', (payload) => {
      setLeaderList(payload);
    });
    client.on('push-visitor-list', (payload) => {
      // eslint-disable-next-line no-console
      console.log(payload);
      setVisitors(payload);
    });
  }, []);

  if (!name) {
    return (
      <div
        data-tid="container"
        style={{
          height: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <FormControl
          className={classes.formControl}
          style={{ translateY: '50%' }}
        >
          <InputLabel id="name-select-label">请选择用户</InputLabel>
          <Select
            labelId="name-select-label"
            id="name-select"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
            }}
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
      </div>
    );
  }

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => {
      setMessage('');
    }, 2000);
  };

  return (
    <div data-tid="container">
      <Grid container spacing={3}>
        <Paper
          className={classes.paper}
          style={{ paddingTop: '20px', width: '100%', height: '100vh' }}
        >
          <Alert
            icon={false}
            // variant="outlined"
            severity="info"
            style={{
              marginBottom: '10px',
              backgroundColor: 'transparent',
            }}
          >
            <span>{today}</span>
            <Button
              variant="contained"
              color="primary"
              disabled={message !== ''}
              style={{
                position: 'absolute',
                right: '120px',
                top: '26px',
              }}
              onClick={() => {
                client.emit('add-message', { type: 'call', payload: { name } });
                showMessage('已呼叫，请稍等!');
              }}
            >
              呼叫秘书
            </Button>
            <Button
              variant="outlined"
              color="default"
              style={{
                position: 'absolute',
                right: '20px',
                top: '26px',
              }}
              onClick={() => {
                setName('');
              }}
            >
              退出登录
            </Button>
          </Alert>
          <Alert
            icon={<CheckIcon fontSize="inherit" />}
            severity="success"
            style={{
              marginBottom: '10px',
              display: message !== '' ? 'flex' : 'none',
            }}
          >
            {message}
          </Alert>
          <List component="nav" aria-label="secondary mailbox folder">
            {(visitors[name] || []).map(
              // eslint-disable-next-line no-shadow
              ({ name: visitorName, summary, time, status }, index) => (
                <ListItem
                  key={`${visitorName} ${summary} ${time}`}
                  button
                  selected={selectedIndex === index}
                  onClick={() => {
                    if (selectedIndex !== index) {
                      setSelectedIndex(index);
                    } else {
                      setSelectedIndex(-1);
                    }
                  }}
                >
                  <Chip
                    label={status}
                    variant="outlined"
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
                    )} ${visitorName} ${summary}`}
                  />
                  <Button
                    variant="outlined"
                    color="primary"
                    style={{
                      marginRight: '10px',
                      visibility:
                        selectedIndex === index &&
                        status === VisitorStatus.PENDING
                          ? 'visible'
                          : 'hidden',
                    }}
                    onClick={() => {
                      client.emit('add-message', {
                        type: 'resolve',
                        payload: {
                          name,
                          visitorIndex: index,
                        },
                      });
                      showMessage('已通知秘书，请稍等！');
                    }}
                  >
                    接见
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    style={{
                      visibility:
                        selectedIndex === index &&
                        status === VisitorStatus.PENDING
                          ? 'visible'
                          : 'hidden',
                    }}
                    onClick={() => {
                      client.emit('add-message', {
                        type: 'reject',
                        payload: {
                          name,
                          visitorIndex: index,
                        },
                      });
                      showMessage('已通知秘书，请稍等！');
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
