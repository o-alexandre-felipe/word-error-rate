export const createHashArray = (s: string) => {
  return s.toLowerCase()
    .split(/\s+/);
}

function concatenatedMatch(a: string[], b: string[], ai: number, bi: number, limit?: number): [number, number] {
  let as = a[ai-1]
  let bs = b[bi-1]
  let aj = ai - 1, bj = bi - 1;
  let iter = 1
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
      as = a[--aj] + as
    }else if(as !== ''){
      if(bj == 0){
        break; // no left word to concatenate
      }
      bs = b[--bj] + bs
    }else{
      // concatenated sequence (possibly 1 word) mathced
      return [aj, bj]
    }
    ++iter;
  }
  return [ai, bi]
}

export const calculateEditDistance = (b: string, a: string, concatenateLimit: number = 1): number => {
  const bh = createHashArray(b)
  const ah = createHashArray(a);
  const [nb, na] = [bh.length, ah.length];
  const dp = initializeArray(nb, na)
  for (let ib = 1; ib <= nb; ib++) {
    for (let ia = 1; ia <= na; ia++) {
      dp[ib][ia] = Math.min(
        dp[ib][ia-1], // delete
        dp[ib-1][ia], // insert 
        dp[ib-1][ia-1] // substitute
      ) + 1
      const [jb, ja] = concatenatedMatch(bh, ah, ib, ia, concatenateLimit);
      dp[ib][ia] = Math.min(dp[ib][ia], dp[jb][ja])
    }
  }
  return dp[nb][na]
}
/**
 * Initialize a 2D array of size (length+1) x (height+1) to hold
 * with boundary conditions `dp[i][0] = i`, and `dp[0][i] = i`
 * @param nb 
 * @param na 
 * @returns 
 */
const initializeArray = (nb: number, na: number) => {
  let dp: number[][] = new Array(nb+1).fill(undefined);
  dp[0] = new Array(na+1).fill(undefined)
  for(let i = 0; i <= na; ++i){
    dp[0][i] = i;
  }
  for (let i = 1; i <= nb; i++) {
    dp[i] = new Array(na+1).fill(undefined)
    dp[i][0] = i;
  }
  
  return dp;
}

export const wordErrorRate = (incoming: string, expected: string, concatenateLimit: number=1) => {
  const editDistance = calculateEditDistance(incoming, expected, concatenateLimit);
  const score = editDistance / Math.max(createHashArray(incoming).length, createHashArray(expected).length);
  return score;
}
