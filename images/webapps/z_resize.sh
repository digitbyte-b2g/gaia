#!/bin/bash

for i in $(ls *.svg | sed s/.svg//g); do
  inkscape -w 16 -h 16 $i.svg -o $(echo $i)_16.png
  inkscape -w 32 -h 32 $i.svg -o $(echo $i)_32.png
  inkscape -w 48 -h 48 $i.svg -o $(echo $i)_48.png
  inkscape -w 64 -h 64 $i.svg -o $(echo $i)_64.png
  inkscape -w 128 -h 128 $i.svg -o $(echo $i)_128.png
  inkscape -w 256 -h 256 $i.svg -o $(echo $i)_256.png
done
