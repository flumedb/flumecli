var minimist = require('minimist')
var Stdout = require('pull-stdio').stdout
var Stringify = require('pull-json-doubleline').stringify
var pull = require('pull-stream/pull')
var path = require('path')

var methods = {
  get: 'async',
  append: 'async',
  stream: 'source'
}

function isEmpty (opts) {
  for(var k in opts) return false
  return true
}

//flumedb, array, opts
module.exports = function (db, command, opts, name) {
  if(!command) {
    opts = minimist(process.argv.slice(2))
    var _ = opts._
    command = _.length ? _.shift().split('.') : []
    delete opts._
    if(isEmpty(opts)) opts = _.shift()
  }

  //let database load...
  if(command.length) {

    var method = command.pop()

    var obj = db
    for(var i in command)
      obj = obj[command[i]]

    var type = (obj === db ? methods : obj.methods)[method]

    if(type === 'source') {
      pull(
        obj[method](opts),
        Stringify(),
        Stdout()
      )
    }
    else if(type === 'async')
      obj[method](opts, function (err, data) {
        if(err) throw err
        console.log(JSON.stringify(data, null, 2))
      })
    else if(type === 'sync')
      console.log(JSON.stringify(obj[method](opts)), null, 2)
    else
      throw new Error('expected type=source, async, or sync but got:'+type)

  }
  else {
    name = name || ('node ' + path.relative(process.cwd(), process.argv[1]))

    console.log('usage: '+(name)+' COMMAND {options}')
    console.log('where COMMAND is one of:')
    var lines = []
    for(var key in db) {
      var type = methods[key]
      if(type) console.log(key, '# '+type)
      if(db[key].methods) {
          for(var _key in db[key]) {
            var type = db[key].methods[_key]
            if(type) console.log(key+'.'+_key, '# '+type)
          }
      }
    }
  }
}

