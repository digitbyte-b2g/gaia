#!/bin/bash

ECHO_PREFIX="[Gaia Translator]"
TRANSLATOR_PATH="./bin/translator"
TRANSLATOR_PATH_BACKING="../.."
TRANSLATOR_BIN="$TRANSLATOR_PATH/index.js"
TRANSLATOR_LOG="translator.log"
LANGUAGES="af ga sq it ar ja az kn eu ko bn la be lv bg lt ca mk zh-CN ms zh-TW mt hr no cs fa da pl nl pt ro eo ru et sr tl sk fi sl fr es gl sw ka sv de ta el te gu th ht tr iw uk hi ur hu vi is cy id yi"

cd $TRANSLATOR_PATH
npm install
cd $TRANSLATOR_PATH_BACKING

rm -f $TRANSLATOR_LOG
echo "$ECHO_PREFIX This process might take from few minutes up to few hours so go get a cup of coffee and watch some fun videos to kill time..."

for lang in $LANGUAGES; do
  rm -rf "./locales/$lang"
  echo "$ECHO_PREFIX Translating \"en-US\" to \"$lang\"..."
  $TRANSLATOR_BIN $lang >> $TRANSLATOR_LOG
done
