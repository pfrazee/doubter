# master program 2

This iteration splits master program 1 into multiple suggestion patch-files, which then lets me iterate on the individual pieces.
To generate the complete master-program2, run this from the project's top direct:

```
node ./mp1/main.js ./mp2/init.js ./mp2/gen.js ./mp2/sim.js ./mp2/out.js ./mp2/main.js > ./mp.js
```

You can then use ./mp.js instad of ./mp1/main.js