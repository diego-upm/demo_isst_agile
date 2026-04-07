**para relacionar los procesos de headhunting con los profesionales senior hay que crear una tabla intermedia. Añade una tabla intermedia candidatura para modelar la relación N:M entre profesional\_senior y proceso\_headhunting, con claves foráneas a ambas tablas, restricción UNIQUE(proceso\_headhunting\_id, profesional\_senior\_id) y un campo estado para guardar el estado del candidato en el proceso (PENDIENTE\_AUTORIZACION, AUTORIZADO, RECHAZADO, SELECCIONADO, DESCARTADO). Genera también los índices y relaciones necesarias.**

**Asegurate de que concuerda con el resto del codigo y no rompe nada**



1- relacionar empresa con perfil de rrhh. A la hora de crear un usuario de rrhh tienes que añadirle una empresa, si no está creada debe aparecer un botón para crearla y lanzar un nuevo formulario

2- relación proceso de headhunting con profesional senior, un proceso -> varios profesionales. Un profesional -> varios procesos



2\. Te falta cerrar de verdad la relación 1:1 suscripción ↔ empresa



En vuestro diseño, EmpresaCliente - Suscripción es 1:1 y además se indica “FK única en Suscripción”.



Pero en tu tabla suscripcion tienes:



empresa\_cliente\_id UUID NOT NULL



con FK, sí, pero sin UNIQUE.



Así que ahora mismo tu base permite que una empresa tenga varias suscripciones.

Si quieres respetar el modelo actual del MVP, deberías añadir:



ALTER TABLE suscripcion

ADD CONSTRAINT uq\_suscripcion\_empresa UNIQUE (empresa\_cliente\_id);



Si quieres guardar historial de suscripciones, entonces no pondría ese UNIQUE simple, pero en ese caso ya te estás separando del modelo del documento.



3\. Te falta cerrar de verdad la relación 1:1 puesto\_tic ↔ proceso\_headhunting



En vuestro SDD también se dice que ProcesoHeadHunting - PuestoTIC es 1:1 y que se implementa con FK única en PuestoTIC.



En tu SQL tienes la FK:



proceso\_headhunting\_id UUID NOT NULL



pero no has puesto UNIQUE.

Ahora mismo un proceso podría tener varios puestos TIC.



Si queréis respetar vuestro modelo:



ALTER TABLE puesto\_tic

ADD CONSTRAINT uq\_puesto\_proceso UNIQUE (proceso\_headhunting\_id);

4\. Falta la parte de comisión por contratación



En el VD se dice que el MVP incluye registro de contratación y que además se genera la comisión correspondiente; incluso aparece la idea de que la comisión se genera solo cuando la empresa confirma formalmente la contratación.



Sin embargo, en tu SQL no veo ninguna tabla para:



comision

ni una relación de contratación final entre proceso y candidato



Así que, si queréis implementar de verdad esa parte del negocio, os faltaría al menos una de estas dos opciones:



Opción simple



meter en candidatura un estado final SELECCIONADO

y una tabla comision con FK a proceso\_headhunting y a esa candidatura



Opción más limpia



tabla contratacion

tabla comision asociada a contratacion

5\. Hay una incoherencia posible en proceso\_headhunting



Esto no es que “falte” una relación, pero sí una restricción de integridad importante.



Tienes:



empresa\_cliente\_id en proceso\_headhunting

responsable\_rrhh\_id en proceso\_headhunting



Eso está bien, porque así sabes qué responsable creó o gestiona el proceso, cosa que en los documentos no estaba bajada a tabla pero tiene sentido funcional.



El problema es que nada impide que metas:



una empresa\_cliente\_id = Empresa A

y un responsable\_rrhh\_id que en realidad pertenece a Empresa B



La BD no lo evita con las FKs actuales.



Eso lo puedes resolver de dos formas:



En aplicación, validándolo en backend.



En base de datos, con una FK compuesta:



en responsable\_rrhh poner UNIQUE(id, empresa\_cliente\_id)

y en proceso\_headhunting referenciar (responsable\_rrhh\_id, empresa\_cliente\_id) contra (id, empresa\_cliente\_id)



Eso te deja blindado.



Resumen claro



Sí, te faltan estas piezas:



tabla intermedia candidatura entre proceso y profesional

UNIQUE en suscripcion.empresa\_cliente\_id si quieres mantener 1:1

UNIQUE en puesto\_tic.proceso\_headhunting\_id si quieres mantener 1:1

tabla de comision si vais a implementar la comisión por éxito

y una restricción que garantice que el responsable RRHH pertenece a la misma empresa del proceso

