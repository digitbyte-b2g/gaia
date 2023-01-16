#!/bin/bash

inkscape -d 96 initlogo.svg -o initlogo.png
inkscape -d 144 initlogo@1.5x.svg -o initlogo@1.5x.png
inkscape -d 192 initlogo@1.5x.svg -o initlogo@2x.png
inkscape -d 216 initlogo@1.5x.svg -o initlogo@2.25x.png

inkscape -d 96 initlogo_large.svg -o initlogo_large.png

inkscape -d 96 logosmall.svg -o logosmall.png
inkscape -d 144 logosmall.svg -o logosmall@1.5x.png
inkscape -d 192 logosmall.svg -o logosmall@2x.png
inkscape -d 216 logosmall.svg -o logosmall@2.25x.png

inkscape -d 96 powered.svg -o powered.png
inkscape -d 144 powered.svg -o powered@1.5x.png
inkscape -d 192 powered.svg -o powered@2x.png
inkscape -d 216 powered.svg -o powered@2.25x.png