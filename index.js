var minimist = require('minimist')
var Stdout = require('pull-stdio').stdout
var Stringify = require('pull-json-doubleline').stringify
var pull = require('pull-stream/pull')

var methods = {
  get: 'async',
  append: 'async',
  stream: 'source'
}

//flumedb, array, opts
module.exports = function (db, command, opts) {
  if(!command) {
    opts = minimist(process.argv.slice(2))
    console.error(opts)
    command = opts._.length ? opts._.shift().split('.') : []
    delete opts._
  }

  //let database load...
  if(command.length) {

    var method = command.pop()

    var obj = db
    for(var i in command)
      obj = obj[command[i]]

    var type = (obj === db ? methods : obj.methods)[method]

    console.error('apply', command, method, type)

    if(type === 'source') {
      console.error('read source', method, opts)
      pull(
        obj[method](opts),
        pull.through(function (d) {
          console.log('STREAM', d)
        }, function () {
          console.log("END")
        }),
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
    db.since.once(function () {
      console.log(db.since.value)
    })
  }
}


