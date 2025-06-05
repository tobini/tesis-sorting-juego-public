Sorting / Tesis
===

Es un juego que consiste en ordenar ascendentemente un conjunto de items. Solo se puede ordenar comparando y swappeando estos items.
Cada acción (compare, swap y submit) se guarda, se loguea y se persiste en una base de datos (hoy, una Realtime DB en Firebase).

Hoy los settings estan hardcodeados en el objeto `settings`. Para cambiarlos simplemente cambiar el código ahí. 

--- 

Setup local:
-----------
 - Instalar dependencias: `npm install`
 - Prender web server local: `npm start`
 - Build de producción (se guardan los archivos en carpeta `public`): `npm run build`


Instrucciones para deploy automático:
-----------
- Ir al repo de Github https://github.com/tobini/tesis-sorting-juego-public
- Ir a Github Actions y darle Run Workflow al job de `Deploy to Firebase Hosting` desde la rama `main`

Instrucciones para deploy manual:
---------------------------------
 - Instalar Firebase CLI:  `npm install -g firebase-tools` 
 - Loguearse a Firebase:  `firebase login` 
 - Deployear (se sube a https://tesis-sorting-juego.web.app/): se debe generar un build de producción y subir el contenido de la carpeta `public` resultante. Para esto correr:  `npm run deploy` 
