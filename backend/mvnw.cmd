@ECHO OFF
SETLOCAL
SET BASEDIR=%~dp0
IF "%BASEDIR:~-1%"=="\" SET BASEDIR=%BASEDIR:~0,-1%

IF NOT EXIST "%BASEDIR%\.mvn\wrapper\maven-wrapper.jar" (
  IF NOT EXIST "%BASEDIR%\.mvn\wrapper" mkdir "%BASEDIR%\.mvn\wrapper"
  powershell -NoProfile -ExecutionPolicy Bypass -Command ^
    "$u='https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.3.2/maven-wrapper-3.3.2.jar';" ^
    "Invoke-WebRequest -Uri $u -OutFile '%BASEDIR%\.mvn\wrapper\maven-wrapper.jar'"
)

SET JAVA_EXE=java
IF NOT "%JAVA_HOME%"=="" SET JAVA_EXE=%JAVA_HOME%\bin\java

"%JAVA_EXE%" "-Dmaven.multiModuleProjectDirectory=%BASEDIR%" -classpath "%BASEDIR%\.mvn\wrapper\maven-wrapper.jar" org.apache.maven.wrapper.MavenWrapperMain %*

ENDLOCAL

