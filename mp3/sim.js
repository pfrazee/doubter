var vm = require('vm')
var path = require('path')
var fs = require('fs')

var onefileJsPath = path.join(process.cwd(), 'mp3/test-fixtures/onefile.js')
var onefileJs = (!global.isInASimulation) ? fs.readFileSync(onefileJsPath, 'utf8') : ''
var twofilesAJsPath = path.join(process.cwd(), 'mp3/test-fixtures/twofiles-a.js')
var twofilesBJsPath = path.join(process.cwd(), 'mp3/test-fixtures/twofiles-b.js')

function TestsFailure (msg) {
  this.name = 'TestsFailure'
  this.msg = msg
}

function runTests (script) {
  const genContext = () => ({ 
    require,
    global: { isInASimulation: true },
    process: { argv: [null, null], cwd: process.cwd, hrtime: process.hrtime }, 
    console: { log: (()=>{}), error: (()=>{}) }
  })

  if (global.isInASimulation) {
    SimulationEnvTests.forEach(test => test(script, genContext()))
  } else {
    ExecutorEnvTests.forEach(test => test(script, genContext()))
  }
}

const SimulationEnvTests = [
  function (script, context) {
    // make sure that it evaluates correctly
    //

    script.runInNewContext(context) // will throw on evaluation error
  }
]

const ExecutorEnvTests = [
  function (script, context) {
    // assert that one input results in a === output
    //

    var generated = false
    context.process.argv.push('mp3/test-fixtures/onefile.js')
    context.console.log = output => {
      generated = true
      if (output !== ('// '+onefileJsPath+'\n\n'+onefileJs)) throw new TestsFailure('Incorrect output')
    }
    script.runInNewContext(context)
    if (!generated) throw new TestsFailure("Did not generate")
  },
  function (script, context) {
    // assert that two inputs are output in the correct order
    //

    var generated = false
    var generatedCorrectly = false
    context.process.argv.push('mp3/test-fixtures/twofiles-a.js')
    context.process.argv.push('mp3/test-fixtures/twofiles-b.js')
    context.console.log = output => {
      generated = true
    }
    context.console.error = (...args) => {
      output = args.join(' ')
      if (output.indexOf(`selected ${twofilesAJsPath} ${twofilesBJsPath}`) >= 0) {
        generatedCorrectly = true
      }
    }
    script.runInNewContext(context)
    if (!generated) throw new TestsFailure("Did not generate")
    if (!generatedCorrectly) throw new TestsFailure("Did not generate in the correct order")
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