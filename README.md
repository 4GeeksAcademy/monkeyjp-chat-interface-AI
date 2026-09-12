# Groq AI Chat Interface

Prototipo de interfaz de chat construido con Next.js que se conecta a la API de Groq y muestra métricas de uso de tokens durante la conversación.

## Características

- Chat con un modelo real de Groq
- Uso del modelo `qwen/qwen3.6-27b`
- Historial completo enviado en cada petición
- Métricas de:
  - Prompt Tokens
  - Completion Tokens
  - Total Tokens
  - Modelo utilizado
- Acumulación de métricas durante la sesión
- Persistencia de mensajes y métricas con `localStorage`
- Estado visual de carga mientras la IA responde
- Manejo de errores en la interfaz
- Botón para borrar la conversación

## Tecnologías

- Next.js
- React
- TypeScript
- Tailwind CSS
- Groq API

## Instalación

Clona el repositorio:

```bash
git clone <URL_DEL_REPOSITORIO>
cd <NOMBRE_DEL_REPOSITORIO>
```

Instala las dependencias:

```bash
npm install
```

## Variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
GROQ_API_KEY=tu_api_key_de_groq
```

La API Key puede obtenerse desde la consola de Groq.

> No subas `.env.local` ni tu API Key al repositorio.

## Ejecutar el proyecto

```bash
npm run dev
```

Luego abre:

```text
http://localhost:3000
```

## Build de producción

```bash
npm run build
```

## Arquitectura

El frontend no se conecta directamente con Groq.

La comunicación se realiza mediante una Route Handler de Next.js:

```text
Frontend
   ↓
POST /api/chat
   ↓
Groq API
```

De esta manera, `GROQ_API_KEY` permanece en el servidor y no se expone al navegador.

## Persistencia

La conversación y las métricas se almacenan en `localStorage`, por lo que sobreviven a recargas de página y al cierre de la pestaña.

## Autor

Javier Pestana