export enum EScanningStatus {
  SCANNED = 'scanned',
  SCANNING = 'scanning',
  SKIPPED = 'skipped',
  WAITING = 'waiting',
}

export const FriendlyStatusMessages = {
  [EScanningStatus.SCANNED]: 'Scanning Completed',
  [EScanningStatus.SCANNING]: 'Scanning In Progress...',
  [EScanningStatus.SKIPPED]: 'Scanning Skipped',
  [EScanningStatus.WAITING]: 'Waiting for scan to start...',
};