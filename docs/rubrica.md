Views
1. Vista de Login / Selección de Grupo
• Qué muestra:
o Formulario de login (usuario/email + contraseña).
o Una vez autenticado, lista de grupos/espacios en Dashboard a los que
pertenece el usuario. 
o
• Cómo funciona:
o El usuario se loguea.
o El sistema muestra sus grupos (por ejemplo, “Equipo Dev”, “Soporte”,
“UX”).
o El usuario elige un grupo y entra en el “dashboard” de ese grupo.

2. Vista de Dashboard del Grupo
• Qué muestra:
o Resumen de tickets del grupo: total, por estado (pendiente, en progreso,
hecho, bloqueado).
o Una mini-lista de tickets recientes o asignados al usuario.
• Cómo funciona:
o Al seleccionar el grupo, se cargan los tickets del mismo.
o Se aplican filtros por estado (Kanban) y se muestra claramente cuántos hay
en cada columna.
o Puede tener un botón “Crear ticket” accesible desde aquí.

3. Vista de Tablero (Kanban) de Tickets
• Qué muestra:
o Columnas de estado (por ejemplo: Pendiente, En
progreso, Revisión, Hecho).
o Cada ticket como tarjeta con:
§ Título.
§ Estado.
§ Asignado a.
§ Prioridad (Alta/Media/Baja, opcional).
§ Fecha de creación y/o fecha límite.

• Cómo funciona:
o El usuario arrastra tickets entre columnas para cambiar su estado.

o También puede hacer clic en un ticket para ver/editar detalles (descripción,
asignado, prioridad, etc.). 

4. Vista de Detalle de Ticket
• Qué muestra:
o Campo de título.
o Descripción (texto largo).
o Estado actual.
o Asignado a (usuario del grupo).
o Prioridad.
o Fecha de creación.
o Fecha límite.
o Comentarios/actividad.
o Historial de cambios.
• Cómo funciona:
o Se abre desde el tablero o desde una lista.
o El usuario que creo el ticket puede editar campos, asignarse o re-asignar,
cambiar estado, agregar comentarios, el usuario que tiene asignado el ticket
solo puede cambiar el estado, agregar comentarios.
o Cada cambio se registra en el historial o en la lista de comentarios.

5. Vista de Lista de Tickets (modo “tabla”)
• Qué muestra:
o Tabla con columnas:
§ ID / Título.
§ Estado.
§ Asignado a.
§ Prioridad.
§ Fecha límite.
o Controles de filtrado y ordenamiento.
• Cómo funciona:
o Sirve para ver muchos tickets de golpe, filtrar por estado, prioridad o
asignado.
o Puede ser la vista secundaria al tablero Kanban, útil si el equipo prefiere
listas.

6. Vista de Perfil de Usuario
• Qué muestra:
o Datos del usuario (nombre, email, etc. Todos los campos previamente de
registro).
o Lista de tickets asignados a ese usuario.
o Puede mostrar resumen: cuántos tiene abiertos, en progreso, hechos.
• Cómo funciona:
o Se accede desde un menú desplegable del avatar o desde una sección
“Usuarios”.
o Es útil para ver la carga de trabajo individual.

7. Vista de Gestión de Grupo (Admin básico)
• Qué muestra:
o Lista de usuarios del grupo.
o Opciones para:
§ Añadir usuarios (por email).
§ Eliminar usuario del grupo.
o Configuración básica del grupo:
§ Nombre del grupo.

• Cómo funciona:
o Solo accesible para usuarios con el permiso correspondiente para agregar
(group:add y group:edit, group:delete) del grupo.
o Permite crear, editar y borrar la configuración del espacio de trabajo.

8. Vista de Crear Ticket (mínima)
• Qué muestra:
o Título (obligatorio).
o Descripción (textarea).
o Selector de estado inicial (por defecto Pendiente).
o Asignado a (opcional, puede asignarse el creador al crear).
o Prioridad
o Botón “Crear”.
• Cómo funciona:
o Se abre desde el dashboard o el tablero.
o Al guardar, el ticket se inserta en la base, se muestra en el tablero y se
muestra su detalle.

9. Vista de Filtros rápidos
No es una vista separada, sino un componente común:
• Qué muestra:
o Filtros rápidos sobre el tablero/lista:
§ “Mis tickets”.
§ “Tickets sin asignar”.
§ “Tickets con prioridad alta”.

• Cómo funciona:
o Se aplican en el tablero o en la lista, cargando solo los tickets que coinciden
con el filtro.

10. Vista de Gestión de Usurios
Es una vista donde existe un usuario con todos los permisos existentes, que se llamada
“superAdmin”, en esta vista puede crear y gestionar los perrmisos para cada usuario,
agregar o eliminar permisos, y toda la función CRUD de usuario

Estructura visual mínima
In package.json add autor emmarher
Puedes pensar tu navegación así:
1. Login → 2. Lista de grupos → 3. Dashboard del grupo seleccionado →
Dentro del grupo:
o Tablero Kanban.
o Vista de Lista.
o Vista de Perfil de usuario.
o Vista de Gestión de grupo (solo los que tengan los permisos CRUD de
grupo).
o Vista de Gestión de usuarios (solo los que tengan los permisos CRUD de
usuario)