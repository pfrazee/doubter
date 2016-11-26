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
  // TODO produce more permutations
  // for mp1 we're just going to use the ordering provided, so that prf can properly structure mp2 into multiple files
  var candidateProgram = { filepaths: [], code: '' }
  suggestionFiles.forEach(f => {
    candidateProgram.filepaths.push(f.filepath)
    candidateProgram.code += `\n\n;// ${f.filepath}\n\n` + f.code
  })
  global.candidatePrograms.push(candidateProgram)
}