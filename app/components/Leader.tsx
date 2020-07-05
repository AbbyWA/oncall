/* eslint-disable */
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

import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Alert from '@material-ui/lab/Alert';
import CheckIcon from '@material-ui/icons/Check';
import Switch from '@material-ui/core/Switch';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import { Scrollbars } from 'react-custom-scrollbars';

import { makeStyles } from '@material-ui/core/styles';
import client from '../client';
import useToday from './useToday';
import { VisitorStatus, LeaderStatus } from '../constants';

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

function SimpleDialog({ onClose, open, onItemClick }) {
  const rejectReaseon = ['下午再来', '明天再来'];

  return (
    <Dialog aria-labelledby="simple-dialog-title" onClose={onClose} open={open}>
      <DialogTitle id="simple-dialog-title">拒绝理由：</DialogTitle>
      <List style={{ width: '500px' }}>
        {rejectReaseon.map((item) => (
          <ListItem
            key={item}
            button
            onClick={() => {
              onItemClick(item);
              onClose();
            }}
          >
            <ListItemText primary={item} />
          </ListItem>
        ))}
      </List>
    </Dialog>
  );
}

export default function Leader(): JSX.Element {
  const classes = useStyles();
  const [leaderList, setLeaderList] = useState([]);
  const [visitors, setVisitors] = useState({});
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [selectedIndex, setSelectedIndex] = React.useState(-1);
  const [unavailable, setUnavailable] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [today] = useToday();

  useEffect(() => {
    client.emit('pull-leader-list');
    client.emit('pull-visitor-list');

    client.on('push-leader-list', (payload) => {
      console.log(payload);
      setLeaderList(payload);
    });
    client.on('push-visitor-list', (payload) => {
      // eslint-disable-next-line no-console
      console.log(payload);
      setVisitors(payload);
    });
  }, []);

  useEffect(() => {
    if (!name) {
      document.title = `Hello!`;
    } else {
      document.title = `Hello, ${name}!`;
    }
  }, [name]);

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
              const name = e.target.value;
              client.emit('change-leader-status', {
                index: leaderList.indexOf(
                  leaderList.filter((item) => item.name === name)[0]
                ),
                newStatus: LeaderStatus.ONLINE,
              });
              setName(name);
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
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events
    <div
      data-tid="container"
      onClick={() => {
        setSelectedIndex(-1);
      }}
    >
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

            <FormGroup
              style={{
                position: 'absolute',
                right: '210px',
                top: '26px',
              }}
            >
              <FormControlLabel
                control={
                  <Switch
                    checked={unavailable}
                    onChange={(event) => {
                      const checked = event.target.checked;
                      client.emit('change-leader-status', {
                        index: leaderList.indexOf(
                          leaderList.filter((item) => item.name === name)[0]
                        ),
                        newStatus: checked
                          ? LeaderStatus.UNAVAILABLE
                          : LeaderStatus.ONLINE,
                      });
                      setUnavailable(checked);
                    }}
                  />
                }
                label="暂停会客"
              />
            </FormGroup>
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
                client.emit('change-leader-status', {
                  index: leaderList.indexOf(
                    leaderList.filter((item) => item.name === name)[0]
                  ),
                  newStatus: LeaderStatus.OFFLINE,
                });
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
          <Scrollbars
            autoHide
            style={{
              height: 'calc(100%  -  96px)',
            }}
          >
            {(visitors[name] || []).length === 0 ? (
              <div>暂时没有访客~</div>
            ) : (
              <List component="nav" aria-label="secondary mailbox folder">
                {(visitors[name] || []).map(
                  // eslint-disable-next-line no-shadow
                  ({ name: visitorName, summary, time, status }, index) => (
                    <ListItem
                      key={`${visitorName} ${summary} ${time}`}
                      button
                      selected={selectedIndex === index}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedIndex(index);
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
                          'hh:mm:ss'
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
                              visitorName,
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
                          setOpen(true);
                        }}
                      >
                        拒绝
                      </Button>
                    </ListItem>
                  )
                )}
              </List>
            )}
          </Scrollbars>
          <SimpleDialog
            open={open}
            onClose={() => {
              setOpen(false);
            }}
            onItemClick={(reason) => {
              debugger;
              client.emit('add-message', {
                type: 'reject',
                payload: {
                  name,
                  visitorIndex: selectedIndex,
                  visitorName: visitors[name][selectedIndex].name,
                  reason,
                },
              });
              showMessage('已通知秘书，请稍等！');
            }}
          />
        </Paper>
      </Grid>
    </div>
  );
}
