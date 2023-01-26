import { calculateEditDistance, wordErrorRate } from "../src/app";
import {describe, expect, it} from '@jest/globals'

describe('default behavior', () => {
  it('calculateDistance', () => {
    expect(calculateEditDistance('one hen', 'won hen')).toEqual(1)
    expect(calculateEditDistance('one hen two docks', 'won hen too ducts')).toEqual(3)
    expect(calculateEditDistance('i like babies', 'i am like babies')).toEqual(1) // one insertion
    expect(calculateEditDistance('i will not go', 'i will go')).toEqual(1) // one deletion
  })
  
  it('wordErrorRate', () => {
    expect(wordErrorRate('one hen', 'won hen')).toEqual(0.5)
    expect(wordErrorRate('one hen two docks', 'won hen too ducts')).toEqual(0.75)
    // calculated with respect to the longer input
    expect(wordErrorRate('i like babies', 'i am like babies')).toEqual(0.25) 
    expect(wordErrorRate('i will not go', 'i will go')).toEqual(0.25) // one deletion
  })

  it('calculateDistance with controlled concatenation', () => {
    expect(calculateEditDistance('word', 'word')).toEqual(0)
    expect(calculateEditDistance('non smoker', 'nonsmoker')).toEqual(2)
    expect(calculateEditDistance('non smoker', 'nonsmoker', 2)).toEqual(0)
  })

  it('wordErrorRate with controlled concatenation', () => {
    expect(calculateEditDistance('word', 'word')).toEqual(0)
    expect(wordErrorRate('non smoker', 'nonsmoker')).toEqual(1.0)
    expect(wordErrorRate('non smoker', 'nonsmoker', 2)).toEqual(0)
  })
})