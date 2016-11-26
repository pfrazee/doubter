var vm = require('vm')
var path = require('path')
var fs = require('fs')

var aJsPath = path.join(process.cwd(), 'mp3/test-fixtures/a/a.js')
var aJs = (!global.isInASimulation) ? fs.readFileSync(aJsPath, 'utf8') : ''

function TestsFailure (msg) {
  this.name = 'TestsFailure'
  this.msg = msg
}

function runTests (script) {
  var defaultContext = { 
    require,
    global: { isInASimulation: true },
    process: { argv: [null, null], cwd: process.cwd, hrtime: process.hrtime }, 
    console: { log: (()=>{}), error: (()=>{}) }
  }

  if (global.isInASimulation) {
    SimulationEnvTests.forEach(test => test(script, Object.assign({}, defaultContext)))
  } else {
    ExecutorEnvTests.forEach(test => test(script, Object.assign({}, defaultContext)))
  }
}

const SimulationEnvTests = [
  // TODO no tests should be run within the simulation, for now
]

const ExecutorEnvTests = [
  function (script, context) {
    // assert that one input results in a === output
    //

    var generated = false
    context.process.argv.push('mp3/test-fixtures/a/a.js')
    context.console.log = output => {
      // console.error('sublog', output)
      generated = true
      if (output !== ('// '+aJsPath+'\n\n'+aJs)) throw new TestsFailure('Incorrect output')
    }
    // context.console.error = console.error.bind(console, 'suberr')
    script.runInNewContext(context)
    if (!generated) throw new TestsFailure("Did not generate")
  }
]

function runProgram (program) {
  // TODO improve the collected metrics (eg execution time)

  // parse
  var script = new vm.Script(program.code)
  try {
    // run the test suite on the script
    var start = process.hrtime()
    runTests(script)
    var execTime = process.hrtime(start)

    // success, return information about the execution
    return {
      correct: true,
      execTime: execTime[0] * 1e9 + execTime[1],
      error: null
    }
  } catch (error) {
    // failure, return information about the execution
    // if (error.name === 'TestsFailure') {
    //   console.error('testing', program.filepaths)
    //   console.error('error', error)
    // }
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
    var result = runProgram(program)

    // add success to the potential outputs
    if (result.correct) {
      global.candidateResults.push({ program, result })
    }
  })
  console.error('%d programs found correct', global.candidateResults.length)
}