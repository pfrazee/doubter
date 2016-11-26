

;// /Users/paulfrazee/doubter/mp3/init.js

global.initialize = () => {
  global.candidatePrograms = []
  global.candidateResults = []
}

;// /Users/paulfrazee/doubter/mp3/permute.js

// taken from https://github.com/dankogai/js-combinatorics
// -prf

/*
 * $Id: combinatorics.js,v 0.25 2013/03/11 15:42:14 dankogai Exp dankogai $
 *
 *  Licensed under the MIT license.
 *  http://www.opensource.org/licenses/mit-license.php
 *
 *  References:
 *    http://www.ruby-doc.org/core-2.0/Array.html#method-i-combination
 *    http://www.ruby-doc.org/core-2.0/Array.html#method-i-permutation
 *    http://en.wikipedia.org/wiki/Factorial_number_system
 */

var P = function(m, n) {
    var p = 1;
    while (n--) p *= m--;
    return p;
};
var C = function(m, n) {
    if (n > m) {
        return 0;
    }
    return P(m, n) / P(n, n);
};
var factorial = function(n) {
    return P(n, n);
};
var factoradic = function(n, d) {
    var f = 1;
    if (!d) {
        for (d = 1; f < n; f *= ++d);
        if (f > n) f /= d--;
    } else {
        f = factorial(d);
    }
    var result = [0];
    for (; d; f /= d--) {
        result[d] = Math.floor(n / f);
        n %= f;
    }
    return result;
};
/* common methods */
var addProperties = function(dst, src) {
    Object.keys(src).forEach(function(p) {
        Object.defineProperty(dst, p, {
            value: src[p],
            configurable: p == 'next'
        });
    });
};
var hideProperty = function(o, p) {
    Object.defineProperty(o, p, {
        writable: true
    });
};
var toArray = function(f) {
    var e, result = [];
    this.init();
    while (e = this.next()) result.push(f ? f(e) : e);
    this.init();
    return result;
};
var common = {
    toArray: toArray,
    map: toArray,
    forEach: function(f) {
        var e;
        this.init();
        while (e = this.next()) f(e);
        this.init();
    },
    filter: function(f) {
        var e, result = [];
        this.init();
        while (e = this.next()) if (f(e)) result.push(e);
        this.init();
        return result;
    },
    lazyMap: function(f) {
        this._lazyMap = f;
        return this;
    },
    lazyFilter: function(f) {
        Object.defineProperty(this, 'next', {
            writable: true
        });
        if (typeof f !== 'function') {
            this.next = this._next;
        } else {
            if (typeof (this._next) !== 'function') {
                this._next = this.next;
            }
            var _next = this._next.bind(this);
            this.next = (function() {
                var e;
                while (e = _next()) {
                    if (f(e))
                        return e;
                }
                return e;
            }).bind(this);
        }
        Object.defineProperty(this, 'next', {
            writable: false
        });
        return this;
    }

};

/* combination */
var nextIndex = function(n) {
    var smallest = n & -n,
        ripple = n + smallest,
        new_smallest = ripple & -ripple,
        ones = ((new_smallest / smallest) >> 1) - 1;
    return ripple | ones;
};
var combination = function(ary, nelem, fun) {
    if (!nelem) nelem = ary.length;
    if (nelem < 1) throw new RangeError;
    if (nelem > ary.length) throw new RangeError;
    var first = (1 << nelem) - 1,
        size = C(ary.length, nelem),
        maxIndex = 1 << ary.length,
        sizeOf = function() {
            return size;
        },
        that = Object.create(ary.slice(), {
            length: {
                get: sizeOf
            }
        });
    hideProperty(that, 'index');
    addProperties(that, {
        valueOf: sizeOf,
        init: function() {
            this.index = first;
        },
        next: function() {
            if (this.index >= maxIndex) return;
            var i = 0,
                n = this.index,
                result = [];
            for (; n; n >>>= 1, i++) {
                if (n & 1) result[result.length] = this[i];
            }

            this.index = nextIndex(this.index);
            return (typeof (that._lazyMap) === 'function')?that._lazyMap(result):result;
        }
    });
    addProperties(that, common);
    that.init();
    return (typeof (fun) === 'function') ? that.map(fun) : that;
};
/* permutation */
var _permutation = function(ary) {
    var that = ary.slice(),
        size = factorial(that.length);
    that.index = 0;
    that.next = function() {
        if (this.index >= size) return;
        var copy = this.slice(),
            digits = factoradic(this.index, this.length),
            result = [],
            i = this.length - 1;
        for (; i >= 0; --i) result.push(copy.splice(digits[i], 1)[0]);
        this.index++;
        return (typeof (that._lazyMap) === 'function')?that._lazyMap(result):result;
    };
    return that;
};
// which is really a permutation of combination
var permutation = function(ary, nelem, fun) {
    if (!nelem) nelem = ary.length;
    if (nelem < 1) throw new RangeError;
    if (nelem > ary.length) throw new RangeError;
    var size = P(ary.length, nelem),
        sizeOf = function() {
            return size;
        },
        that = Object.create(ary.slice(), {
            length: {
                get: sizeOf
            }
        });
    hideProperty(that, 'cmb');
    hideProperty(that, 'per');
    addProperties(that, {
        valueOf: function() {
            return size;
        },
        init: function() {
            this.cmb = combination(ary, nelem);
            this.per = _permutation(this.cmb.next());
        },
        next: function() {
            var result = this.per.next();
            if (!result) {
                var cmb = this.cmb.next();
                if (!cmb) return;
                this.per = _permutation(cmb);
                return this.next();
            }
            return (typeof (that._lazyMap) === 'function')?that._lazyMap(result):result;
        }
    });
    addProperties(that, common);
    that.init();
    return (typeof (fun) === 'function') ? that.map(fun) : that;
};

var PC = function(m) {
    var total = 0;
    for (var n = 1; n <= m; n++) {
        var p = P(m,n);
        total += p;
    };
    return total;
};
// which is really a permutation of combination
var permutationCombination = function(ary, fun) {
    if (ary.length === 0) return ary
    // if (!nelem) nelem = ary.length;
    // if (nelem < 1) throw new RangeError;
    // if (nelem > ary.length) throw new RangeError;
    var size = PC(ary.length),
        sizeOf = function() {
            return size;
        },
        that = Object.create(ary.slice(), {
            length: {
                get: sizeOf
            }
        });
    hideProperty(that, 'cmb');
    hideProperty(that, 'per');
    hideProperty(that, 'nelem');
    addProperties(that, {
        valueOf: function() {
            return size;
        },
        init: function() {
            this.nelem = 1;
            // console.log("Starting nelem: " + this.nelem);
            this.cmb = combination(ary, this.nelem);
            this.per = _permutation(this.cmb.next());
        },
        next: function() {
            var result = this.per.next();
            if (!result) {
                var cmb = this.cmb.next();
                if (!cmb) {
                    this.nelem++;
                    // console.log("increment nelem: " + this.nelem + " vs " + ary.length);
                    if (this.nelem > ary.length) return;
                    this.cmb = combination(ary, this.nelem);
                    cmb = this.cmb.next();
                    if (!cmb) return;
                }
                this.per = _permutation(cmb);
                return this.next();
            }
            return (typeof (that._lazyMap) === 'function')?that._lazyMap(result):result;
        }
    });
    addProperties(that, common);
    that.init();
    return (typeof (fun) === 'function') ? that.map(fun) : that;
};

// export
global.permute = permutationCombination

;// /Users/paulfrazee/doubter/mp3/gen.js

var path = require('path')
var fs = require('fs')

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
  var permutations = global.permute(suggestionFiles)
  permutations.forEach(permutation => {
    global.candidatePrograms.push({
      filepaths: permutation.map(p => p.filepath),
      code: permutation.map(p => ('// ' + p.filepath + '\n\n' + p.code)).join('\n\n')
    })
  })
  console.error('generated %d programs from %d suggestions', global.candidatePrograms.length, suggestionFiles.length)
}

;// /Users/paulfrazee/doubter/mp3/sim.js

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

;// /Users/paulfrazee/doubter/mp3/out.js

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

;// /Users/paulfrazee/doubter/mp3/main.js

global.initialize()
global.generatePrograms()
global.simulate()
global.outputBestProgram()
