/* eslint-disable import/prefer-default-export */
export enum VisitorStatus {
  PENDING = '等待',
  REJECT = '拒绝',
  RESOLVE = '接见',
}

export enum LeaderStatus {
  ONLINE = '在线',
  OFFLINE = '离线',
  UNAVAILABLE = '暂停会客',
}
