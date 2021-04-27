import {status} from '../../../src/components/Profile/MemberRecordTracker'
import dayjs from 'dayjs'


test('Should return completed when interval is greater than 60 days completed Date before due Date', () => {
  const completedDate = dayjs().toDate()
  const interval = 365
  const result = status(completedDate, interval)
  
  expect(result).toBe('Completed')
})

test('Should return completed when interval is greater than 60 days completed Date before due Date', () => {
  const completedDate = dayjs('2020-05-28').toDate()
  const interval = 365
  const result = status(completedDate, interval)
  
  expect(result).toBe('Completed')
})

test('Should return Upcoming when interval is greater than 60 days and completed date is 30 days before due date ', () => {
  const completedDate = dayjs('2020-05-27').toDate()
  const interval = 365
  const result = status(completedDate, interval)
  
  expect(result).toBe('Upcoming')
})

test('Should return Upcoming when interval is greater than 60 days and completed date is 30 days before due date ', () => {
  const completedDate = dayjs('2020-04-28').toDate()
  const interval = 365
  const result = status(completedDate, interval)
  
  expect(result).toBe('Upcoming')
})

test('Should return Overdue when interval is greater than 60 days and completed date is 30 days before due date ', () => {
  const completedDate = dayjs('2020-04-27').toDate()
  const interval = 365
  const result = status(completedDate, interval)
  
  expect(result).toBe('Overdue')
})

//

test('Should return completed when interval is 60 days and completed Date before due Date', () => {
  const completedDate = dayjs().toDate()
  const interval = 60
  const result = status(completedDate, interval)
  
  expect(result).toBe('Completed')
})

test('Should return completed when interval is 60 days and completed Date before due Date', () => {
  const completedDate = dayjs('2021-04-13').toDate()
  const interval = 60
  const result = status(completedDate, interval)
  
  expect(result).toBe('Completed')
})

test('Should return Upcoming when interval is 60 days and completed date is 30 days before due date --Left ', () => {
  const completedDate = dayjs('2021-03-12').toDate()
  const interval = 60
  const result = status(completedDate, interval)
  
  expect(result).toBe('Upcoming')
})

test('Should return Upcoming when interval is 60 days and completed date is 30 days before due date --Right', () => {
  const completedDate = dayjs('2021-02-28').toDate()
  const interval = 60
  const result = status(completedDate, interval)
  
  expect(result).toBe('Upcoming')
})

test('Should return Overdue when interval is 60 days and completed date is 30 days before due date ', () => {
  const completedDate = dayjs('2021-02-26').toDate()
  const interval = 60
  const result = status(completedDate, interval)
  
  expect(result).toBe('Overdue')
})