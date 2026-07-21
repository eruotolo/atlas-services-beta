# Plan de rebranding — Home de Hireeo

**Estado:** plan aprobado para documentacion; pendiente de autorizacion explicita para implementar.

## 1. Objetivo

Convertir la home de Hireeo en una pagina de descubrimiento y contratacion de servicios. La pagina debe comunicar primero la oferta disponible y llevar al usuario a explorar o cotizar, en vez de comportarse como una landing corporativa o un producto SaaS.

La referencia funcional es la logica de marketplace de Mercado Libre y Amazon: busqueda y ubicacion primero, rutas de exploracion despues, y oferta concreta visible antes de cualquier mensaje institucional. No se copiaran sus interfaces ni su densidad visual.

## 2. Diagnostico actual

La composicion actual de la home es:

```text
HeroHireeoSection
FeaturesGridSection
CategoriesGridSection
StatsSection
PricingSection
FinalCtaSection
```

Los tres primeros componentes son una buena base y se conservan. El desajuste comienza despues de `CategoriesGridSection`:

- `StatsSection` agrega informacion institucional, no ayuda a elegir o contratar un servicio.
- `PricingSection` comunica planes para profesionales y pertenece a `/pricing`, no al flujo de una persona que busca contratar.
- `FinalCtaSection` cierra una landing corporativa; en una home de marketplace ese espacio debe continuar la exploracion de la oferta.

Tambien existe una oportunidad funcional inmediata: `CountryHomePage` ya obtiene servicios mediante `getPublicFeaturedServices(country)`, pero hoy no los muestra en la home. El prop `previewServices` llega a `HeroHireeoSection` y no se utiliza.

## 3. Alcance acordado

### Se conserva y se mejora

- `HeroHireeoSection`
- `FeaturesGridSection`
- `CategoriesGridSection`

No se cambia el proposito de estos componentes. Se mejoran su tratamiento visual, fondos, jerarquia y sensacion de producto.

### Sale de la home

- `StatsSection`
- `PricingSection`
- `FinalCtaSection`

### Se agrega a la home

Un bloque de descubrimiento de servicios reales, inmediatamente despues de las categorias. Este bloque reemplaza el tramo corporativo actual.

## 4. Arquitectura de informacion objetivo

```text
Header global
  └─ HeroHireeoSection
       ├─ Buscador principal
       ├─ Pais/ubicacion
       └─ Categorias rapidas

FeaturesGridSection
  └─ Explicacion breve de por que Hireeo es util y seguro

CategoriesGridSection
  └─ Exploracion por necesidades y acceso a todas las categorias

FeaturedServicesSection (nuevo)
  ├─ Servicios reales del pais activo
  ├─ Senales de confianza y contexto local
  └─ Acceso a resultados completos de busqueda

Footer global
```

El flujo esperado es: **buscar → entender brevemente el valor → elegir una necesidad → comparar servicios reales → ver mas resultados o contactar**.

## 5. Contenido de servicios a mostrar

### Fuente y alcance de datos

- Reutilizar la accion existente `getPublicFeaturedServices(country)`.
- Mantener el aislamiento por pais mediante el parametro `country`.
- Mostrar como maximo seis servicios para sostener una lectura mobile-first y no competir con la pagina de busqueda.
- Enlazar el CTA del bloque a `/{country}/search`.

El nombre actual de la accion no garantiza, desde su contrato frontend, que la respuesta venga ordenada por destacamento. Mientras no exista un contrato explicito de ranking en backend, el encabezado debe ser neutral, por ejemplo: **“Servicios para explorar”** o **“Profesionales disponibles”**, y no prometer “destacados” o “mejor evaluados”.

### Tarjeta de servicio

La tarjeta debe responder en segundos: “¿que ofrece, quien lo hace y por que deberia confiar?”. Debe priorizar:

- Imagen real del servicio cuando exista; placeholder sobrio y no promocional cuando no exista.
- Titulo del servicio y nombre del profesional.
- Categoria, comuna/localidad y precio desde.
- Calificacion y cantidad de resenas cuando existan.
- Senal de profesional premium/verificado cuando el dato sea real.
- CTA principal: **Ver perfil** o **Solicitar cotizacion**.

No se presentaran datos de `mockServices` como publicaciones reales. Si no hay servicios disponibles, el estado vacio debe conducir a categorias y a publicar un servicio, con un mensaje transparente.

## 6. Direccion visual: menos “IA”, mas Hireeo

La consulta de `ui-ux-pro-max` valida una direccion de marketplace de servicios basada en confianza, claridad, contexto local y contraste; no en estetica futurista, particulas o efectos decorativos. El referente de color para servicios del hogar combina azul profesional y un acento calido para acciones urgentes, sin obligar a cambiar los tokens globales existentes.

### Principios transversales

- Usar una direccion editorial, humana y local: superficies limpias, jerarquia tipografica clara, detalles visuales relacionados con oficios y necesidades cotidianas.
- Evitar fondos abstractos que sugieran IA: particulas conectadas, tramas tecnicas, halos nebulosos, animaciones continuas y gradientes genericos.
- Favorecer imagenes documentales propias o con licencia y representacion real de oficios. No usar personas sinteticas como prueba de confianza.
- Mantener el azul de marca como ancla de confianza y reservar el acento calido para CTA, disponibilidad o urgencia; no introducir una nueva paleta global sin una decision especifica.
- Respetar `prefers-reduced-motion`, contraste WCAG AA como minimo, foco visible y controles tactiles de al menos 44 x 44 px.

### HeroHireeoSection

Problema actual: `ParticleBackground` y la trama cuadriculada proyectan una estetica de producto de IA y distraen de la busqueda.

Plan visual:

- Retirar el canvas de particulas, sus interacciones con mouse y la cuadricula tecnica.
- Reemplazarlos por una composicion editorial estatica: fondo limpio con bloques cromaticos tenues, un acento calido controlado y, solo si se dispone de una imagen autentica con derechos, una fotografia contextual de un oficio.
- Mantener el buscador como elemento dominante y conservar las categorias rapidas como atajo de exploracion.
- Reducir el movimiento a microinteracciones con proposito; ninguna animacion continua debe competir con la tarea de buscar.

### FeaturesGridSection

Problema actual: la grilla numerada `01–06`, uniforme y sobre fondo plano, se lee como explicacion SaaS/institucional aunque el contenido sea valido.

Plan visual:

- Conservar las seis razones de valor, pero reducir el protagonismo de la numeracion.
- Usar una superficie tonal diferenciada y un ritmo editorial que no parezca una tabla de funcionalidades corporativas.
- Dar peso a beneficios que reducen la incertidumbre de contratar: cercania, seguridad, resenas, comunicacion y formas de pago.
- Mantener iconografia consistente; si se requiere un icono nuevo, consultarlo primero mediante `icons0` conforme a las reglas del repositorio.

### CategoriesGridSection

Problema actual: cumple bien su funcion, pero el fondo plano, los bordes repetidos y las tarjetas oscuras con degradado pueden verse impersonales y duplicar el lenguaje de una grilla administrativa.

Plan visual:

- Conservar la navegacion por categoria y su CTA a resultados filtrados.
- Diferenciar el fondo de la seccion mediante una superficie suave y material, sin textura pesada ni patron tecnologico.
- Hacer que las imagenes existentes de categoria sean protagonistas donde esten disponibles; conservar los iconos como fallback claro y coherente.
- Mantener suficiente contraste sobre las imagenes, evitar overlays excesivamente oscuros y asegurar que el nombre de categoria sea legible.

## 7. Reubicacion del contenido retirado

| Bloque actual | Decision | Destino |
| --- | --- | --- |
| `StatsSection` | Retirar de la home. Solo conservar metricas verificables. | `/about-us` si son institucionales y reales; de lo contrario, no mostrarlas. |
| `PricingSection` | Retirar de la home. | `/pricing`, ya existente, orientado a profesionales. |
| `FinalCtaSection` | Retirar de la home. | Sus CTAs se absorben en el bloque de servicios y en la navegacion global. |

`/about-us` ya contiene una estructura apropiada para principios, equipo y numeros institucionales. No se debe llevar alli contenido orientado a conversion de contratacion.

## 8. Alcance tecnico de implementacion

### Archivos a modificar

- `frontend/src/app/(country)/[country]/(public)/page.tsx`
  - Reordenar las secciones.
  - Eliminar imports y render de los tres bloques que salen de la home.
  - Conectar el nuevo bloque de servicios a los datos ya consultados.

- `frontend/src/features/home/components/HeroHireeoSection/index.tsx`
  - Sustituir el fondo actual de IA por la direccion visual acordada.

- `frontend/src/features/home/components/FeaturesGridSection/index.tsx`
  - Ajustar fondo, jerarquia visual y composicion, sin cambiar su objetivo.

- `frontend/src/features/home/components/CategoriesGridSection/index.tsx`
  - Ajustar superficie, contraste y tratamiento de las imagenes de categoria.

- `frontend/src/features/home/components/index.ts`
  - Exportar el nuevo bloque.

### Nuevo componente

- `frontend/src/features/home/components/FeaturedServicesSection/index.tsx`
  - Componente exclusivo del dominio home; no debe ubicarse en `shared/`.
  - Recibe `country`, `dict` y servicios ya obtenidos desde la pagina.
  - Se apoya en contratos `Service` existentes, sin crear logica de backend ni duplicar consultas.

Antes de crear una tarjeta nueva se revisara si `ProviderRow` u otro componente existente puede reaprovechar estructura y datos sin trasladar una UI de resultados de busqueda a la home de forma forzada. Si no encaja, se creara una tarjeta propia dentro de `features/home`.

### Fuera de alcance

- No se modificara backend, Prisma, contratos API ni configuraciones del proyecto.
- No se alteraran rutas activas, reglas multi-pais ni el sistema global de tokens sin una solicitud separada.
- No se agregaran dependencias.
- No se incorporaran carruseles o promociones invasivas como copia de marketplaces de retail.

## 9. Validacion y criterios de aceptacion

### Funcionales

- La home muestra servicios reales filtrados por el pais de la URL.
- Todas las categorias y CTAs conservan enlaces con el prefijo de pais.
- El estado sin publicaciones no finge oferta ni usa mocks como anuncios reales.
- La informacion de planes no aparece en la home.

### Visuales y UX

- En los primeros scrolls se entiende que Hireeo sirve para encontrar y contratar servicios.
- No hay fondo de particulas, red conectada ni trama tecnica en el hero.
- Las tres secciones conservadas se perciben como partes de un marketplace de servicios, no de una landing de IA.
- La interfaz funciona a 375 px, 768 px, 1024 px y 1440 px sin scroll horizontal.
- Navegacion por teclado, foco visible, contraste y targets tactiles cumplen las reglas de accesibilidad del proyecto.
- Las imagenes usan `next/image` y se reserva espacio para prevenir CLS.

### Tecnicas

Tras cualquier cambio en `frontend/` se ejecutara obligatoriamente:

```bash
pnpm lint && pnpm build
```

Al finalizar la implementacion se actualizara la nota de proyecto en SitesDoc, de acuerdo con las instrucciones permanentes del repositorio.

## 10. Orden de ejecucion propuesto

1. Confirmar la direccion visual editorial/humana y los assets fotograficos permitidos.
2. Crear el bloque de servicios y su estado vacio usando los contratos existentes.
3. Reordenar la pagina y retirar los bloques corporativos posteriores a categorias.
4. Rediseñar los fondos y superficies de Hero, Features y Categories.
5. Revisar en breakpoints desktop y mobile, con y sin servicios disponibles.
6. Ejecutar lint y build.
7. Documentar el cambio implementado en SitesDoc.
