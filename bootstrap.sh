#!/bin/sh

rm ./mp*.js

echo "DOUBTER bootstrap (master program 3)"
echo "starting..."

echo ""
echo "== Generating master program 1 =="
echo "-- core program --"
node ./mp1/main.js ./mp1/main.js > ./mp1.js

echo ""
echo "== Generating master program 2 =="
echo "-- dividing into multiple patch files --"
node ./mp1.js ./mp2/init.js ./mp2/gen.js ./mp2/sim.js ./mp2/out.js ./mp2/main.js > ./mp2.js

echo ""
echo "== Generating master program 3 =="
echo "-- introducing program permutation --"
node ./mp2.js ./mp3/init.js ./mp3/permute.js ./mp3/gen.js ./mp3/sim.js ./mp3/out.js ./mp3/main.js > ./mp3.js

echo ""
echo "== Self-generating master program 3 =="
echo "-- a simple correctness test --"
node ./mp3.js ./mp3/*.js > ./mp3-self.js
echo "...again..."
node ./mp3-self.js ./mp3/*.js > ./mp3-self.js