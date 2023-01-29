#!/bin/bash

ECHO_PREFIX="[Gaia Translator - Manifests]"
TRANSLATOR_PATH="./build"
TRANSLATOR_PATH_BACKING=".."
TRANSLATOR_BIN="$TRANSLATOR_PATH/convert-manifests.js"
TRANSLATOR_LOG="translate_manifests-$(date +%FT%H-%M-%S).log"
LANGUAGES="af ga sq it ar ja az kn eu ko bn la be lv bg lt ca mk zh ms mt hr no cs fa da pl nl pt ro eo ru et sr tl sk fi sl fr es gl sw ka sv de ta el te gu th ht tr uk hi ur hu vi is cy id yi"

cd $TRANSLATOR_PATH
npm install
cd $TRANSLATOR_PATH_BACKING

rm -f $TRANSLATOR_LOG
echo "$ECHO_PREFIX This process might take from few minutes so go get a cup of coffee and watch some fun videos to kill time..."

for lang in $LANGUAGES; do
  echo "$ECHO_PREFIX Translating \"en-US\" to \"$lang\"..."
  node $TRANSLATOR_BIN $lang >> $TRANSLATOR_LOG
done
