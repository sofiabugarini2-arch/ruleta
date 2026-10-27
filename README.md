# La Ruleta de la Suerte Bar & Co — proyecto preparado para APK

Este ZIP contiene la demo web dentro de `www/` y la configuración de Capacitor para convertirla en una app Android.

## Importante

**Este paquete todavía no contiene un archivo `.apk` compilado.** La compilación requiere descargar herramientas Android. La computadora de este entorno no tiene instalado el Android SDK y no tiene acceso al registro de paquetes para descargarlo. Para evitar exigirle instalar Android Studio en una PC con 4 GB de RAM, el proyecto incluye una receta de compilación en la nube mediante GitHub Actions.

## Opción recomendada: generar el APK en la nube

1. Descomprimí este ZIP en tu computadora.
2. Entrá en https://github.com/ e iniciá sesión o creá una cuenta.
3. Creá un repositorio nuevo. Podés llamarlo `la-ruleta-de-la-suerte` y dejarlo **privado**.
4. En el repositorio, usá **Add file → Upload files** y subí todo el contenido de esta carpeta, incluida la carpeta oculta `.github` y su archivo `workflows/compilar-apk.yml`. Si Windows oculta las carpetas que empiezan con punto, activá **Ver → Mostrar → Elementos ocultos** en el Explorador.
5. Confirmá la carga con **Commit changes**.
6. Abrí la pestaña **Actions** del repositorio. Si GitHub pide habilitar acciones, aceptá.
7. Entrá en **Compilar APK Android** y tocá **Run workflow**. También se inicia automáticamente al subir cambios a la rama `main`.
8. Cuando termine en verde, abrí esa ejecución, bajá el artefacto **La-Ruleta-de-la-Suerte-APK** y descomprimilo. Adentro estará `app-debug.apk`.
9. Pasá el APK al celular Android y abrilo para instalarlo. Quizás tengas que autorizar la instalación desde esa fuente. Instalá APKs únicamente de proyectos y fuentes que reconozcas.

Los nombres de algunos botones de GitHub pueden variar ligeramente según el idioma de la cuenta.

## Opción local (requiere herramientas de Android)

Necesitás Node.js 22 o superior, Android Studio y Android SDK configurado. Luego, desde esta carpeta, abrí una terminal y ejecutá:

```bat
npm install
npx cap add android
npx cap sync android
cd android
gradlew.bat assembleDebug
```

El APK de prueba se crea en `android/app/build/outputs/apk/debug/app-debug.apk`.

## Qué hace esta versión

Mantiene las pantallas y funciones de la demo web: ruleta, formulario, cupón con código/QR, fecha de vencimiento, panel de encargado y almacenamiento local del navegador.

## Limitaciones que siguen vigentes

- Es una demo: los datos se guardan en el dispositivo y no existe una base central.
- No usar para canjes reales ni para validar premios desde varios dispositivos.
- La librería que dibuja el QR se carga desde internet; hace falta conexión para mostrar el QR. El código manual es una alternativa en la demo.
- No incorpora todavía impresora térmica.
- El APK generado por el flujo de GitHub es de **prueba (debug)**, no una versión de publicación firmada para Play Store.
