global.outputBestProgram = () => {
  // select the best-performing candidate
  global.candidateResults.sort((a, b) => {
    return a.result.execTime - b.result.execTime
  })
  var bestResult = global.candidateResults[0]

  // output the program
  if (bestResult) {
    console.error('selected', bestResult.program.filepaths)
    console.error('measured exec time %d ms', bestResult.result.execTime / 1e6)
    console.log(bestResult.program.code)
  }
}