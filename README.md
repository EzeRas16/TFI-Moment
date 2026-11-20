# Moments 

**App web interactiva para casamientos y eventos.** Los organizadores arman su evento, los invitados se suman desde el celular y entre todos construyen un álbum colaborativo con retos fotográficos y encuestas en vivo.

Proyecto desarrollado como Trabajo Final Integrador (TFI) de la Tecnicatura Universitaria en Programación de la UTN - Facultad Regional Mar del Plata.

> *Tu evento, contado por todos los que lo vivieron.*

---

## 📖 ¿Qué es Moments?

Un casamiento pasa en una noche, pero se recuerda toda la vida, y no lo recuerda una sola persona. **Moments** reúne las miradas de todos los invitados en un solo lugar.

- 👰 **El organizador** (los novios) crea el evento, arma las mesas y genera un código QR único para cada una.
- 📱 **Los invitados** escanean el QR de su mesa, se registran con su nombre y un apodo de fiesta, y participan desde el celular, sin instalar nada.
- 📸 **Los retos fotográficos** (por ejemplo, "Una foto con el cotillón") invitan a capturar momentos que luego se reúnen en una galería compartida.

---

## 🛠️ Stack tecnológico (Etapa 1)

| Capa | Tecnología |
|---|---|
| Frontend | Angular 22 (componentes standalone, signals y control flow `@if` / `@for`) |
| Lenguaje | TypeScript |
| Estilos | CSS, con enfoque *mobile-first* |
| Backend simulado | [JSON Server](https://github.com/typicode/json-server) 0.17 (API REST de prueba) |
| Imágenes | Cloudinary, con subida *unsigned* directa desde el navegador |

> [!NOTE]
> **Etapa 2 (proyección):** el frontend está preparado para migrar a una API REST en Java Spring Boot con MySQL. Con ese backend también se podrá eliminar físicamente las imágenes de Cloudinary, algo que hoy no se puede hacer desde el navegador. Por eso, por ahora, las fotos se ocultan con una baja lógica (`estado: 'Oculta'`).

---

## 📋 Requisitos previos

- ✅ [Git](https://git-scm.com/)
- ✅ [Node.js](https://nodejs.org/) y npm, en una versión compatible con Angular 22 (se recomienda la LTS vigente)
- ✅ Un navegador moderno

---

## 🚀 Cómo iniciar el proyecto

El proyecto tiene **dos partes que corren al mismo tiempo**: la API simulada (puerto 3000) y la aplicación Angular (puerto 4200). Necesitás **dos terminales**.

### 1️⃣ Clonar el repositorio

```bash
git clone https://github.com/EzeRas16/TFI-Moment.git
cd TFI-Moment/moment
```

### 2️⃣ Instalar dependencias

Hay dos `package.json`, así que se instala en las dos carpetas:

```bash
# Dentro de TFI-Moment/moment
npm install

# Dentro de TFI-Moment/moment/mock-api
cd mock-api
npm install
cd ..
```

### 3️⃣ Levantar la API simulada (terminal 1)

```bash
cd mock-api
npm run reset   # crea db.json a partir de db.seed.json (solo la primera vez, o para empezar de cero)
npm start       # API en http://localhost:3000
```

Dejá esta terminal abierta.

> [!IMPORTANT]
> `db.json` **no se versiona**: es tu base de datos local y cada integrante tiene la suya. `npm run reset` la pisa con los datos de `db.seed.json`, así que **borra lo que hayas cargado**.

### 4️⃣ Levantar la aplicación (terminal 2)

```bash
# Dentro de TFI-Moment/moment
npm start       # App en http://localhost:4200
```

Abrí <http://localhost:4200> en el navegador.

> [!TIP]
> Para probarla desde el celular con el QR, usá la IP de tu computadora en lugar de `localhost`, estando en la misma red Wi-Fi.

---

## ☁️ Configuración de Cloudinary

Las fotos se suben directo a Cloudinary con un *upload preset* sin firma (*unsigned*). La configuración está en:

```text
moment/src/app/fotos/data-access/cloudinary.config.ts
```

Para usar otra cuenta:

1. En Cloudinary, creá un **upload preset** de tipo *Unsigned* llamado `moment_fotos`, con la carpeta `moment/fotos` y los formatos `jpg` y `png`.
2. Cambiá `cloudName` en el archivo de configuración por el de tu cuenta.

> [!WARNING]
> **Nunca** pongas el *API Secret* ni la *API Key* en el código. El *cloud name* y el nombre del preset no son secretos; las claves sí.

---

## 🗂️ Estructura del proyecto

```text
TFI-Moment/
├── moment/                     # Aplicación Angular
│   ├── src/app/
│   │   ├── autenticacion/      # Inicio de sesión y sesión del usuario
│   │   ├── eventos/            # Alta, modificación, baja y detalle de eventos
│   │   ├── mesas/              # Mesas y códigos QR
│   │   ├── invitados/          # Registro y perfil del invitado
│   │   ├── retos/              # Retos fotográficos y su detalle
│   │   ├── fotos/              # Subida a Cloudinary y galería
│   │   ├── encuestas/          # Gestión y resultados de encuestas
│   │   ├── votos/              # Votación de los invitados
│   │   ├── app.routes.ts       # Rutas principales
│   │   └── app.route.segments.ts  # Constantes de los segmentos de ruta
│   └── mock-api/               # JSON Server (su propio package.json)
│       ├── db.seed.json        # Datos iniciales (versionado)
│       └── db.json             # Base local (ignorado por Git)
└── README.md
```

Cada dominio sigue la misma organización interna, con carpetas y código en español:

- 📦 `data-access/`: modelos, clientes HTTP y *stores*.
- 🖥️ `features/`: pantallas y componentes con lógica.
- 🧩 `ui/`: componentes de presentación reutilizables.

---

## 🧭 Rutas principales

| Ruta | Pantalla |
|---|---|
| `/auth` | Inicio de sesión del organizador |
| `/eventos` | Lista de eventos |
| `/eventos/:id` | Detalle del evento |
| `/eventos/:eventoId/mesas` | Gestión de mesas y QR |
| `/eventos/:eventoId/retos` | Gestión de retos |
| `/eventos/:eventoId/retos/:retoId` | Detalle de un reto (con subida de foto) |
| `/eventos/:eventoId/encuestas` | Gestión de encuestas |
| `/eventos/:eventoId/galeria` | Galería del evento (organizador e invitados) |
| `/unirse?token=...` | Ingreso del invitado desde el QR de su mesa |

---

## ⌨️ Comandos útiles

### Dentro de `moment/`

| Comando | Qué hace |
|---|---|
| `npm start` | Levanta la app en modo desarrollo (`ng serve`) |
| `npm run build` | Compila la app para producción |
| `npm test` | Ejecuta las pruebas |

### Dentro de `moment/mock-api/`

| Comando | Qué hace |
|---|---|
| `npm start` | Levanta la API en el puerto 3000 |
| `npm run reset` | Restaura `db.json` desde `db.seed.json` |

---

## 🔀 Flujo de trabajo en Git

- 🌿 La rama de integración es **`develop`**. No se trabaja directo sobre ella.
- 🔖 Cada tarea se hace en su propia rama: `feature/SCRUM-XX-descripcion-corta`.
- ✏️ Los commits llevan el número del ticket: `SCRUM-XX: descripción en español`.
- 🔀 Todo cambio entra por **Pull Request a `develop`**, revisado por otro integrante.
- 🙈 No se versiona `db.json`. Si hay que cambiar los datos iniciales, se modifica `db.seed.json` y se avisa al equipo, porque cada uno tiene que correr `npm run reset`.
- 🔐 Nunca se suben claves ni secretos.

---

## 🩺 Problemas frecuentes

| Problema | Qué revisar |
|---|---|
| `ERR_CONNECTION_REFUSED` a `localhost:3000` | La API no está levantada. Corré `npm start` dentro de `mock-api/`. |
| No existe `db.json` | Corré `npm run reset` dentro de `mock-api/`. |
| Quiero volver a los datos iniciales | `npm run reset` (borra lo que cargaste localmente). |
| La subida de una foto falla | Abrí las herramientas del navegador (F12, pestaña Network). Si falla `api.cloudinary.com`, revisá el *cloud name* y el preset. Si falla `localhost:3000`, la API está apagada. |
| La galería dice "Todavía no hay fotos" | Revisá que el `eventoId` de la URL coincida con el de las fotos en `http://localhost:3000/fotos` y que tengan `estado: "Visible"`. |
| El puerto 4200 o 3000 está ocupado | Cerrá el proceso anterior o cambiá el puerto. |

---

## 👥 Equipo

- 👤 Ezequiel Ras
- 👤 Matías Rodríguez
- 👤 Francesco Santoro

**UTN - Facultad Regional Mar del Plata** · Tecnicatura Universitaria en Programación
