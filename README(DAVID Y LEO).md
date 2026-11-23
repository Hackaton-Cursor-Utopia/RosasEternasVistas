# Imágenes de productos: cómo funcionan (nota para el equipo)

## Resumen en 30 segundos

- Las fotos viven en **Cloudflare R2**, en el bucket `rosas-eternas-media`, en la ruta `products/<UUID>.webp`.
- La base de datos **solo guarda la URL pública** en la columna `image_url` (texto). No guardamos binarios, rutas locales ni la clave interna.
- El front usa esa URL tal cual:

  ```html
  <img src="{{ producto.image_url }}" alt="{{ producto.nombre }}" loading="lazy" class="foto-producto">
  ```

  ```css
  .foto-producto { width: 100%; aspect-ratio: 4 / 5; object-fit: cover; }
  ```

  `loading="lazy"` hace que el navegador solo descargue las fotos que se ven en pantalla. Reservar el espacio con `aspect-ratio` evita que la página "brinque" mientras cargan (las fotos actuales son verticales, ~4:5). No usar `loading="lazy"` en la primera foto visible (el héroe de la portada), para que esa cargue de inmediato.

## Flujo de subida

```
React (form multipart) ──► POST /api/uploads/image ──► Flask ──► storage.upload_image(file) ──► R2
        ▲                                                 │
        └──────────── {"url": ".../products/<UUID>.webp"} ◄┘
Después el formulario manda esa URL en image_url al guardar el arreglo (POST/PUT /api/products).
```

1. Miguel elige la foto en el formulario de arreglo (React); el front la manda como `multipart/form-data` (campo `imagen`) a `POST /api/uploads/image`.
2. Flask (solo con sesión iniciada) recibe `request.files["imagen"]` y llama `storage.upload_image(...)`.
3. `upload_image`:
   - acepta solo **JPG, PNG o WebP** (lo revisa con el contenido real, no con la extensión),
   - rechaza archivos de **más de 5 MB**,
   - reduce a **máximo 1200 px** por lado (nunca agranda) y corrige fotos de celular giradas,
   - la convierte a **WebP**,
   - la sube como `products/<UUID>.webp` con `Content-Type: image/webp` y `Cache-Control: public, max-age=31536000`,
   - devuelve la **URL pública**.
4. Flask responde `{"url": ...}`. El front la muestra como vista previa y, al guardar el arreglo, la manda en `image_url`.

Si la imagen no es válida lanza `storage.ImageValidationError` con un mensaje en español; Flask lo devuelve como `400` con `{"error": "..."}` y el front lo muestra tal cual. Si Miguel sube una foto y no guarda el arreglo, la foto queda huérfana en R2: no estorba y se puede limpiar después.

**¿Por qué no hace falta CORS?** El navegador nunca habla directo con R2 para subir: sube a nuestro Flask, y Flask sube a R2 desde el servidor. Para *mostrar* imágenes con `<img src>` tampoco se necesita CORS. Solo haría falta si algún día subimos directo desde el navegador (URLs prefirmadas) o si leemos la imagen con `fetch()`/canvas.

## Cambiar o borrar una foto

- **Cambiar:** subir la nueva con `upload_image`, guardar la nueva URL y luego `storage.delete_image(url_vieja)`.
- **Borrar producto:** `storage.delete_image(producto.image_url)`.
- Nunca se sobrescribe un archivo: cada subida tiene un UUID nuevo. Por eso el caché de un año es seguro (si cambias la foto, cambia la URL).
- `delete_image` solo borra cosas dentro de `products/` de nuestro bucket; si le pasas otra URL devuelve `False` y no toca nada.

## Ejemplo en Flask (para David)

```python
from flask import request, jsonify
import storage

@app.post("/api/uploads/image")
@login_required                                   # solo Miguel puede subir
def subir_imagen():
    archivo = request.files.get("imagen")
    if not archivo:
        return jsonify(error="Selecciona una imagen."), 400
    try:
        url = storage.upload_image(archivo)       # acepta el FileStorage de Flask directo
    except storage.ImageValidationError as e:
        return jsonify(error=str(e)), 400         # "La imagen supera el máximo de 5 MB.", etc.
    return jsonify(url=url), 201


@app.put("/api/products/<int:pid>")
@login_required
def actualizar_producto(pid):
    datos = request.get_json()
    producto = Producto.query.get_or_404(pid)
    vieja = producto.image_url
    producto.image_url = datos.get("image_url", vieja)
    # ... demás campos
    db.session.commit()
    if vieja and vieja != producto.image_url:
        storage.delete_image(vieja)               # borrar la anterior DESPUÉS del commit
    return jsonify(ok=True)
```

Pon también `app.config["MAX_CONTENT_LENGTH"] = 6 * 1024 * 1024` para que Flask corte peticiones gigantes antes de leerlas.

## Configuración (variables de entorno)

| Variable | Valor |
|---|---|
| `R2_ACCOUNT_ID` | ID de la cuenta de Cloudflare |
| `R2_ACCESS_KEY_ID` | Access Key del token de R2 |
| `R2_SECRET_ACCESS_KEY` | Secret del token de R2 |
| `R2_BUCKET` | `rosas-eternas-media` |
| `R2_PUBLIC_URL` | URL pública del bucket, sin `/` final (p. ej. `https://pub-xxxx.r2.dev`). Se llama así también en Render (no `R2_PUBLIC_BASE_URL`) |

En local van en un archivo `.env` (hay un `.env.example`). **El `.env` nunca se sube a git** (ya está en `.gitignore`). Pide las llaves por un canal privado, no por el chat del equipo.

> El dominio `r2.dev` tiene límite de velocidad y Cloudflare lo recomienda solo para desarrollo. Para la demo está bien; si el proyecto sigue, conectamos un dominio propio al bucket y solo cambia `R2_PUBLIC_URL` (y las URLs ya guardadas, con un `UPDATE ... REPLACE`).

## Desarrollo vs producción

- Desarrollo y staging usan el bucket `rosas-eternas-media` con su propio token. Producción usa **otro bucket con otro token**, que solo viven en las variables de entorno de Render (nadie del equipo los necesita).
- Las URLs guardadas incluyen el dominio del bucket, así que las del CSV de arranque son las del bucket de desarrollo. Para producción se suben de nuevo las fotos al bucket de producción (`python upload_existing_images.py images/ -o imagenes_r2_prod.csv`; con otro nombre de CSV para que no se salte las ya subidas) y ese CSV es el que usa el seed de producción.

## Fotos de arranque (seed)

- `upload_existing_images.py images/` sube todas las fotos de Miguel y genera `imagenes_r2.csv` con columnas `archivo,url`.
- Las fotos ya están renombradas con el nombre del ramo (`ramo-cafe-toffee.jpeg`, etc.), así Ernesto y David pueden cruzar el CSV con el catálogo por nombre.
- **Pendiente (Miguel):** falta la foto real del **Ramo Amatista y Carbón**. La que venía (y la del Excel) es una copia exacta de la de **Lavanda Silvestre**. Quedó aparte en `images/_revisar/` y no se sube.
