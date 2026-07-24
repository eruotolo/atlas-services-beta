# Checklist rápido por país

**Última actualización:** 2026-07-23
Extraído de la matriz de obligación de cada archivo de `country-analysis/`. Para el detalle y las fuentes, ir al archivo de cada país.

## Uruguay (`country-analysis/uruguay.md`)
- [ ] Entidad/razón social/domicilio confirmados (U-Q1, BLOCKING)
- [ ] Región de DB/backups y contratos/DPA con proveedores confirmados (U-Q2, BLOCKING)
- [ ] Modelo de pago (MoR, escrow) definido (U-Q3, BLOCKING)
- [ ] Base de datos de usuarios registrada ante URCDP
- [ ] Desistimiento de 5 días hábiles habilitado
- [ ] Renovación automática sin plazo de preaviso al usuario (Ley 20.212)

## Argentina (`country-analysis/argentina.md`)
- [ ] Entidad/domicilio/representante confirmados (A-Q1, BLOCKING)
- [ ] Región de alojamiento/backups y DPA/CCM con proveedores confirmados (A-Q2, BLOCKING)
- [ ] Modelo de cobro/liquidación (MoR) definido (A-Q3, BLOCKING)
- [ ] Botón de Arrepentimiento visible en primer acceso (Disposición 954/2025)
- [ ] Registro AML ante BCRA/UIF si se retienen fondos (Ley 27.739)

## Chile (`country-analysis/chile.md`)
- [ ] Entidad/RUT/domicilio confirmados (CL-Q1, BLOCKING)
- [ ] Región de PostgreSQL/backups y DPA/transferencias confirmados (CL-Q2, BLOCKING)
- [ ] Modelo de pagos/retención/liquidación definido antes de cobrar (CL-Q3, BLOCKING)
- [ ] Verificación de licencia en oficios regulados (RNII/SEC)
- [ ] Monitorear entrada en vigor de la Ley 21.719 (2026-12-01)

## España / Unión Europea (`country-analysis/spain-eu.md`)
- [ ] Entidad/establecimiento confirmado — determina representante UE art. 27 GDPR (ES-1, BLOCKING)
- [ ] Contrato con Google/Gemini confirmado — entrenamiento, ubicación (ES-2, BLOCKING)
- [ ] Avisos obligatorios del art. 10 LSSI publicados (identidad del prestador)
- [ ] Declaración de accesibilidad (EAA, vigente desde 2025-06-28)
- [ ] Aviso de transparencia de IA (AI Act art. 50, desde 2026-08-02)
- [ ] CMP con bloqueo previo de cookies no esenciales
- [ ] Recolección de datos fiscales de prestadores lista antes de pagos reales (DAC7)

## Estados Unidos (`country-analysis/united-states-federal.md`, `united-states-state-local-matrix.md`)
- [ ] Verificar volumen de usuarios/ingresos contra umbrales estatales de privacidad (CA, CO, CT, VA, UT, TX, OR) antes de asumir aplicabilidad
- [ ] Reconocer Global Privacy Control donde ya es obligatorio (Texas desde 2025-01-01)
- [ ] Confirmar plazo de reporte CSAM a NCMEC si hay mensajería activa
- [ ] Confirmar estado de Proposition 22 (California) con fuente primaria antes de asumir su vigencia — información contradictoria a la fecha de este informe
- [ ] Verificar licenciamiento estatal de oficios (electricista, gas, transporte) por estado antes de habilitar esa categoría
