# Cómo publicar propiedadesnava.cl

Esta carpeta es tu página web completa. Funciona sola, sin Claude. Los nombres de los menús pueden cambiar un poco con el tiempo; si no encuentras uno, busca una opción parecida.

## 1. GitHub (aquí se guarda la página)
1. Crea una cuenta gratis en github.com con propiedadesnava@gmail.com.
2. Arriba a la derecha toca **+ → New repository**. Nombre: `propiedadesnava` (exactamente así, en minúsculas; el panel ya está configurado para tu usuario `propiedadesnava-art`). Puede ser **Private**. Toca **Create repository**.
3. En el repositorio vacío toca **uploading an existing file**.
4. Descomprime el .zip en tu computador, abre la carpeta `propiedadesnava-web` y **arrastra todo su contenido** (las carpetas y archivos, no la carpeta misma) a la página de GitHub.
5. Abajo toca **Commit changes**.

## 2. Netlify (publica la página gratis)
1. Entra a netlify.com y crea la cuenta con **Sign up with GitHub**.
2. Toca **Add new site → Import an existing project → GitHub** y elige `propiedadesnava`.
3. No cambies nada y toca **Deploy**. En uno o dos minutos tendrás la página en una dirección como `algo.netlify.app`. Ábrela y revisa que se vea bien.

## 3. Conectar tu dominio propiedadesnava.cl
1. En Netlify, dentro del sitio: **Domain management → Add a domain** y escribe `propiedadesnava.cl`.
2. Elige usar **Netlify DNS**. Netlify te mostrará **4 servidores de nombre** (parecidos a `dns1.p01.nsone.net`).
3. Entra a nic.cl con tu cuenta → tu dominio → **modificar servidores de nombre (DNS)** → pega los 4 servidores → guarda.
4. Espera. Puede tardar desde minutos hasta 24–48 horas. Netlify activa el candado de seguridad (https) solo.

## 4. Activar tu panel de administración (propiedadesnava.cl/admin)
1. En GitHub: tu foto → **Settings → Developer settings → OAuth Apps → New OAuth App**.
   - Application name: `Propiedades Nava`
   - Homepage URL: `https://propiedadesnava.cl`
   - Authorization callback URL: `https://api.netlify.com/auth/done`
2. Toca **Register application**. Copia el **Client ID**, toca **Generate a new client secret** y copia ese código también.
3. En Netlify, dentro del sitio: **Site configuration → Access & security → OAuth → Install provider → GitHub** y pega los dos códigos.
4. Entra a `https://propiedadesnava.cl/admin` y toca **Login with GitHub**.

En el panel puedes:
- **Propiedades → Nueva Propiedad**: llenar los datos y subir fotos (la primera es la portada).
- Cambiar el estado a Reservada, Vendida o Arrendada, o desmarcar **Publicada** para ocultarla.
- **Ajustes del sitio**: WhatsApp, correo, redes, textos y el valor de la UF.

Cada vez que tocas **Publicar**, la página se actualiza sola en 1 o 2 minutos.

Consejo: antes de subir fotos, redúcelas (por ejemplo enviándotelas por WhatsApp a ti mismo) para que la página cargue rápido.

## 5. Aparecer en Google
1. **Google Search Console** (search.google.com/search-console): agrega `propiedadesnava.cl`, verifica el dominio y envía el sitemap `https://propiedadesnava.cl/sitemap.xml`.
2. **Google Business Profile** (business.google.com): crea la ficha de Propiedades Nava con tu WhatsApp, tu correo y la dirección de la página para salir en Google Maps.
