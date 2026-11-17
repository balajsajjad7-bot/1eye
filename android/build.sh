#!/usr/bin/env bash
# Builds and signs 1EYE.apk without Android Studio.
# Needs: JDK 17+, aapt2, android.jar (API 34), dx or d8, apksigner (or uber-apk-signer).
# Set paths below, run ../desktop/build.sh first, and provide your OWN signing keystore.
set -euo pipefail
cd "$(dirname "$0")"
AAPT2=${AAPT2:-aapt2}; ANDROID_JAR=${ANDROID_JAR:?path to android.jar}; DX_JAR=${DX_JAR:?path to dx.jar}
KEYSTORE=${KEYSTORE:?your keystore}; KS_ALIAS=${KS_ALIAS:?alias}; SIGNER_JAR=${SIGNER_JAR:?uber-apk-signer.jar}
D=../desktop/dist
rm -rf build && mkdir -p build/gen build/classes build/apk/lib/{arm64-v8a,armeabi-v7a,x86_64}
$AAPT2 compile --dir res -o build/res.zip
$AAPT2 link -o build/base.apk -I "$ANDROID_JAR" --manifest AndroidManifest.xml --java build/gen build/res.zip --min-sdk-version 26 --target-sdk-version 34
javac -source 8 -target 8 -bootclasspath "$ANDROID_JAR" -d build/classes $(find build/gen src -name "*.java")
java -cp "$DX_JAR" com.android.dx.command.Main --dex --min-sdk-version=26 --output=build/apk/classes.dex build/classes
cp $D/lib1eye-arm64.so build/apk/lib/arm64-v8a/lib1eye.so
cp $D/lib1eye-arm64-static.so build/apk/lib/arm64-v8a/lib1eyestatic.so
cp $D/lib1eye-arm.so build/apk/lib/armeabi-v7a/lib1eye.so
cp $D/lib1eye-x64.so build/apk/lib/x86_64/lib1eye.so
cp build/base.apk build/unsigned.apk && (cd build/apk && zip -q -9 -D -r ../unsigned.apk classes.dex lib)
java -jar "$SIGNER_JAR" --apks build/unsigned.apk --ks "$KEYSTORE" --ksAlias "$KS_ALIAS" --out build/signed
echo "Signed APK in android/build/signed/"
