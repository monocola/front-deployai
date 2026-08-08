# DeployAI Admin

Panel de administración para gestionar planes, límites y características.

## Requisitos

- Node.js 20+
- Backend `backend-deployai` en ejecución (puerto 8080)
- Usuario con rol `MANAGER` en la base de datos

## Configuración

```bash
cp .env.local.example .env.local
npm install
```

## Asignar rol MANAGER a un usuario

Tras registrar un usuario en la plataforma principal, ejecuta en PostgreSQL:

```sql
UPDATE users SET role = 'MANAGER' WHERE email = 'tu-email@ejemplo.com';
```

## Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3001](http://localhost:3001).

## Login

Usa `POST /api/v1/auth/admin/login` — solo usuarios con `role = MANAGER` pueden acceder.

## API utilizada

- `GET /api/v1/admin/plans` — listar planes
- `GET /api/v1/admin/plans/{id}` — detalle
- `PUT /api/v1/admin/plans/{id}` — actualizar metadatos
- `PUT /api/v1/admin/plans/{id}/limits` — actualizar límites
- `PUT /api/v1/admin/plans/{id}/features` — actualizar características
- `POST /api/v1/admin/plans` — crear plan
- `DELETE /api/v1/admin/plans/{id}` — eliminar plan
# front-devployer-panel--manager
# front-devployer-panel--manager
# front-devployer-panel--manager
