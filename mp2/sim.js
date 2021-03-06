var vm = require('vm')

global.runProgram = program => {
  // TODO improve the collected metrics (eg execution time)

  var script = new vm.Script(program.code)
  var context = { require, global: {}, process: { argv: [], cwd: process.cwd }, console: { log: ()=>{}, error: ()=>{} } }
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
    console.error('Execution failed, all is lost', error)
    process.exit(1) // this early in the bootstrap, a failure means the entire system is dead
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