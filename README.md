# DOUBTER

Run `sh bootstrap.sh`.
You should see output like this:

```
DOUBTER bootstrap (master program 3)
starting...

== Generating master program 1 ==
-- core program --
created new program from 1 suggestions

== Generating master program 2 ==
-- dividing into multiple patch files --
created new program from 5 suggestions

== Generating master program 3 ==
-- introducing program permutation --
created new program from 6 suggestions

== Self-generating master program 3 ==
-- a simple correctness test --
generated 1956 programs from 6 suggestions
445 programs found correct
...again...
```

Currently working on master program 3, which introduces permutation of the output program.
It's not correct right now -- It needs tests to ensure the output program actually does what it should; currently, it considers correct evaluation of the output program to be 'correct'.