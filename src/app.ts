export const createHashArray = (s: string | string[]) => {
  return typeof s === 'string' ? s.split(/\s+/) : s;
}

function concatenatedMatch(a: string[], b: string[], ai: number, bi: number, limit?: number): [number, number] {
  let as = a[ai-1]
  let bs = b[bi-1]
  let aj = ai - 1, bj = bi - 1;
  let iter = 0
  while(
    // Partial matched
    as.slice(-bs.length) === bs.slice(-as.length) && iter <= limit
  )
  {
    const r = Math.min(as.length, bs.length)
    as = as.slice(0, -r)
    bs = bs.slice(0, -r)
    if(bs !== ''){
      if(aj == 0){
        break; // no left word to concatenate
      }
      as = a[--aj]
    }else if(as !== ''){
      if(bj == 0){
        break; // no left word to concatenate
      }
      bs = b[--bj]
    }else{
      // concatenated sequence (possibly 1 word) mathced
      return [aj, bj]
    }
    ++iter;
  }
  return [ai, bi]
}

/**
 * Compute the distance matrix `tp[i][j]` being the cost of transforming
 * `bh.slice(0, i)` to `ah.slice(0, j)`
 * 
 * @param bh input array of tokens
 * @param ah input array of tokens
 * @param c number of token concatenations to perform
 */
function calculateEditDistanceTable(bh: string[], ah: string[], c?: number): number[][] { 
  const [nb, na] = [bh.length, ah.length];
  const dp = initializeArray(nb, na)
  for (let ib = 1; ib <= nb; ib++) {
    for (let ia = 1; ia <= na; ia++) {
      dp[ib][ia] = Math.min(
        dp[ib][ia-1] + 1, // delete
        dp[ib-1][ia] + 1, // insert 
        dp[ib-1][ia-1] + (bh[ib-1] !== ah[ia-1] ? 1: 0) // substitute
      )
      if(c){
        const [jb, ja] = concatenatedMatch(bh, ah, ib, ia, c);
        dp[ib][ia] = Math.min(dp[ib][ia], dp[jb][ja])
      }
    }
  }
  return dp;
}
/**
 * Computes the word error rate, possibly performing concatenations of multiple words
 * counting e.g. 
 * error `rate` = `errorrate` with one concatenation
 * `this isa text` = `thisis atext`, with three concatenations
 * 
 * @param b one version of the text
 * @param a another version of the text
 * @param c number of concatenations to attempt to match match two versions
 * @returns 
 */
export const calculateEditDistance = (b: string | string[], a: string | string[], c: number = 0): number => {
  const bh = createHashArray(b);
  const ah = createHashArray(a);
  const dp = calculateEditDistanceTable(bh, ah, c);
  return dp[bh.length][ah.length]
}

export const alignText = (b: string | string[], a: string | string[], c: number = 0): [string, string][] => {
  const bh = createHashArray(b);
  const ah = createHashArray(a);
  const dp = calculateEditDistanceTable(bh, ah, c);
  const pairs: [string, string][] = []
  let ia = ah.length;
  let ib = bh.length
  while(ia > 0 && ib > 0){
    const [jb,ja] = concatenatedMatch(bh, ah, ib, ia, c);
    if(ja !== ia){
      pairs.push([bh.slice(jb, ib).join(' '), ah.slice(ja, ia).join(' ')])
      ib = jb; ia = ja;
    }else{
      if(dp[ib-1][ia-1] + 1 === dp[ib][ia]){
        pairs.push([bh[--ib], ah[--ia]])
      }else if(dp[ib-1][ia] + 1 === dp[ib][ia]){
        pairs.push([bh[--ib], null])
      }else if(dp[ib][ia-1] + 1 === dp[ib][ia]){
        pairs.push([null, ah[--ia]])
      }
    }
  }
  while(ia > 0){
    pairs.push([null, ah[--ia]]);
  }
  while(ib > 0){
    pairs.push([bh[--ib], null])
  }
  return pairs.reverse()
}

/**
 * Initialize a 2D array of size (length+1) x (height+1) to hold
 * with boundary conditions `dp[i][0] = i`, and `dp[0][i] = i`
 * @param nb 
 * @param na 
 * @returns 
 */
const initializeArray = (nb: number, na: number) => {
  let dp: number[][] = [];
  dp[0] = []
  for(let i = 0; i <= na; ++i){
    dp[0][i] = i;
  }
  for(let i = 1; i <= nb; ++i){
    dp[i] = [i]
  }
  
  return dp;
}

/**
 * Computes the word error rate, possibly performing concatenations of multiple words
 * counting e.g. 
 * error `rate` = `errorrate` with one concatenation
 * `this isa text` = `thisis atext`, with three concatenations
 * @param b one version of the text
 * @param a another version of the text
 * @param c number of concatenations to attempt to match match two versions
 * @returns 
 */
export const wordErrorRate = (a: string, b: string, c: number=0) => {
  const ah = createHashArray(a)
  const bh = createHashArray(b)
  const editDistance = calculateEditDistance(ah, bh, c);
  const score = editDistance / Math.max(ah.length, bh.length);
  return score;
}
