var path = require('path')
var fs = require('fs')
var vm = require('vm')

global.initialize = () => {
  global.candidatePrograms = []
  global.candidateResults = []
}

global.readSuggestions = () => {
  // read the files from paths passed as argvs
  var filepaths = process.argv.slice(2).map(name => path.join(process.cwd(), name))
  return filepaths.map(filepath => ({
    filepath,
    code: fs.readFileSync(filepath, 'utf8')
  }))
}

global.generatePrograms = () => {
  var suggestionFiles = global.readSuggestions()

  // produce candidate programs
  // TODO produce more permutations
  // for mp1 we're just going to use the ordering provided, so that prf can properly structure mp2 into multiple files
  var candidateProgram = { filepaths: [], code: '' }
  suggestionFiles.forEach(f => {
    candidateProgram.filepaths.push(f.filepath)
    candidateProgram.code += f.code
  })
  global.candidatePrograms.push(candidateProgram)
}

global.runProgram = program => {
  // TODO improve the collected metrics (eg execution time)

  var script = new vm.Script(program.code)
  var context = { require, global: {}, process: { argv: [] }, console }
  try {
    // run the script
    var resultValue = script.runInNewContext(context)

    // success, return information about the execution
    return {
      correct: true,
      error: null
    }
  } catch (error) {
    // failure, return information about the execution
    return {
      correct: false,
      error
    }
  }
}

global.simulate = () => {
  // iterate all possible permutations
  global.candidatePrograms.forEach(program => {
    // run the VM
    var result = global.runProgram(program)

    // add success to the potential outputs
    if (result.correct) {
      global.candidateResults.push({ program, result })
    }
  })
}

global.outputBestProgram = () => {
  // select the best-performing candidate
  global.candidateResults.sort((a, b) => {
    return 1 // TODO look at result metrics
  })
  var bestResult = global.candidateResults[0]

  // output the program
  if (bestResult) console.log(bestResult.program.code)
}

global.initialize()
global.generatePrograms()
global.simulate()
global.outputBestProgram()