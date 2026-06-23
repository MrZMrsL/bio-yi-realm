export interface FeedbackType {
  id: string
  label: string
}

export const FEEDBACK_TYPES: FeedbackType[] = [
  { id: 'bug', label: 'Bug反馈' },
  { id: 'suggest', label: '功能建议' },
  { id: 'consult', label: '游戏咨询' },
  { id: 'balance', label: '平衡性' },
  { id: 'other', label: '其他' },
]
