# flumecli

create a command line interface for a flumedb.

first create your flumedb with installed views, etc, as shown
on the [flumedb](http://github.com/flumedb/flumedb) readme.
Then, simply pass the db instance to flumecli

``` js
//db.js
var Flume = require('flumedb')
var CLI = require('flumecli')

var db = Flume(log)
  .use(name, view)...

if(!module.parent) CLI(db)
```

currently, flumecli assumes it makes sense to output your data as JSON objects.
flume cli can call any method on your database, including on views.

``` bash
node db.js stream # dump whole stream
node db.js get {seq} # get value at {seq}
node db.js append --foo bar # append an object {"foo": "bar"} (using minimist format)

# also, methods on views can be called!
node db.js {name}.{method}
```

any arguments in [minimist](http://github.com/substack/minimist) format will be parsed,
this is equivalent to javascript, but is also an ordinary command line switch style.


## License

MIT



