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