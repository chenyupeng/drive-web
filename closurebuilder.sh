# export HOME=C:/Users/Administrator

cd src/main/webapp
goodjs/closure-library/closure/bin/build/closurebuilder.py \
  --root=goodjs/closure-library/ \
  --root=goodjs/good/ \
  --root=good/ \
  --namespace="good.drive.init" \
  --output_mode=compiled \
  --compiler_jar=$HOME/.m2/repository/com/goodow/javascript/closure-compiler/v20130603-SNAPSHOT/closure-compiler-v20130603-SNAPSHOT.jar \
  --compiler_flags="--compilation_level=ADVANCED_OPTIMIZATIONS" \
  --compiler_flags="--externs=goodjs/good/realtime/realtime.externs.js" \
  --compiler_flags="--create_source_map=drive.js.map" \
  > drive-compiled.js
echo //@ sourceMappingURL=drive.js.map >> drive-compiled.js

goodjs/closure-library/closure/bin/build/closurebuilder.py \
  --root=goodjs/closure-library/ \
  --root=goodjs/good/ \
  --root=good/ \
  --namespace="good.drive.nav.editpwd" \
  --output_mode=compiled \
  --compiler_jar=$HOME/.m2/repository/com/goodow/javascript/closure-compiler/v20130603-SNAPSHOT/closure-compiler-v20130603-SNAPSHOT.jar \
  --compiler_flags="--compilation_level=ADVANCED_OPTIMIZATIONS" \
  --compiler_flags="--externs=goodjs/good/realtime/realtime.externs.js" \
  --compiler_flags="--create_source_map=editpwd.js.map" \
  > editpwd-compiled.js
echo //@ sourceMappingURL=editpwd.js.map >> editpwd-compiled.js