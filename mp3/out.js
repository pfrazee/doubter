global.outputBestProgram = () => {
  // select the best-performing candidate
  global.candidateResults.sort((a, b) => {
    return 1 // TODO look at result metrics
  })
  var bestResult = global.candidateResults[0]

  // output the program
  if (bestResult) {
    console.error('selected', bestResult.program.filepaths)
    console.log(bestResult.program.code)
  }
}