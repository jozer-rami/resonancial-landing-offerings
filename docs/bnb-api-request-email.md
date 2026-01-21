# Solicitud de Credenciales API Open Banking - BNB

**Para:** Soporte Open Banking BNB
**De:** Resonancial - Terapia Resonancial
**Asunto:** Solicitud de Credenciales de Sandbox para Integración de Pagos QR

---

## Correo de Solicitud

```
Asunto: Solicitud de Credenciales API Sandbox - Integración Pagos QR Simple

Estimado equipo de Open Banking del Banco Nacional de Bolivia,

Mi nombre es [NOMBRE] y soy desarrollador/a en Resonancial (https://terapiaresonancial.com),
una plataforma de bienestar y coaching espiritual basada en Bolivia.

Estamos desarrollando la integración de pagos mediante QR para nuestra plataforma web,
permitiendo a nuestros clientes pagar por sesiones de coaching, paquetes de servicios
y productos digitales de manera rápida y segura.

## Solicitud

Solicitamos credenciales de acceso al ambiente Sandbox de la API Open Banking para
realizar pruebas de integración. Específicamente necesitamos:

- accountId (ID de cuenta)
- authorizationId (ID de autorización)

## Endpoints que utilizaremos

Basándonos en la documentación del portal de Open Banking, planeamos utilizar
los siguientes endpoints:

### 1. Autenticación
- **Endpoint:** `/ClientAuthentication.API/api/v1/auth/token`
- **Método:** POST
- **Propósito:** Obtener token de acceso para las demás operaciones

### 2. Generación de QR con Monto Fijo
- **Endpoint:** `/DirectDebit/api/Services/GetQRFixedAmount`
- **Método:** POST
- **Propósito:** Generar códigos QR para pagos de monto específico

### 3. Consulta de Estado de QR
- **Endpoint:** `/main/getQRStatusAsync`
- **Método:** GET
- **Propósito:** Verificar si un pago QR fue completado

## Flujo de Pago Propuesto

A continuación, detallo el flujo de integración que implementaremos:

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                        FLUJO DE PAGO QR - RESONANCIAL                        │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ Cliente  │    │ Servidor │    │  BNB API │    │  Banco   │    │ Servidor │
│  (Web)   │    │Resonancial│   │          │    │ Cliente  │    │(Polling) │
└────┬─────┘    └────┬─────┘    └────┬─────┘    └────┬─────┘    └────┬─────┘
     │               │               │               │               │
     │ 1. Selecciona │               │               │               │
     │    producto   │               │               │               │
     │    y paga     │               │               │               │
     │──────────────>│               │               │               │
     │               │               │               │               │
     │               │ 2. Solicita   │               │               │
     │               │    token auth │               │               │
     │               │──────────────>│               │               │
     │               │               │               │               │
     │               │ 3. Token JWT  │               │               │
     │               │<──────────────│               │               │
     │               │               │               │               │
     │               │ 4. Genera QR  │               │               │
     │               │    (monto fijo)               │               │
     │               │──────────────>│               │               │
     │               │               │               │               │
     │               │ 5. QR Image + │               │               │
     │               │    QR ID      │               │               │
     │               │<──────────────│               │               │
     │               │               │               │               │
     │ 6. Muestra QR │               │               │               │
     │    al cliente │               │               │               │
     │<──────────────│               │               │               │
     │               │               │               │               │
     │ 7. Cliente    │               │               │               │
     │    escanea QR │               │               │               │
     │    con app    │               │               │               │
     │    bancaria   │               │               │               │
     │───────────────────────────────────────────────>               │
     │               │               │               │               │
     │               │               │ 8. Procesa    │               │
     │               │               │    pago       │               │
     │               │               │<──────────────│               │
     │               │               │               │               │
     │               │ 9. Polling    │               │               │
     │               │    status QR  │               │               │
     │               │    (cada 5s)  │               │               │
     │               │──────────────>│               │               │
     │               │               │               │               │
     │               │ 10. Status:   │               │               │
     │               │     PAGADO    │               │               │
     │               │<──────────────│               │               │
     │               │               │               │               │
     │ 11. Confirma  │               │               │               │
     │     pago      │               │               │               │
     │<──────────────│               │               │               │
     │               │               │               │               │
     │               │ 12. Entrega   │               │               │
     │               │     producto  │               │               │
     │               │     digital   │               │               │
     │               │──────────────────────────────────────────────>│
     │               │               │               │               │
```

## Detalles Técnicos de la Integración

### Arquitectura
- **Frontend:** React (hospedado en Vercel)
- **Backend:** Node.js/Express (hospedado en Railway)
- **Base de datos:** PostgreSQL (Supabase)

### Moneda Principal
- **BOB (Bolivianos)** - Moneda principal de operación

### Productos a Vender
| Producto | Precio (BOB) | Descripción |
|----------|-------------|-------------|
| Sesión Individual | 200 | Sesión de coaching de bienestar |
| Pack Despertar | 700 | 4 sesiones + guía personalizada |
| Pack Transformación | 1,200 | 8 sesiones + acompañamiento completo |
| Almanaque Ritual 2026 | 150 | Guía astrológica digital |
| Tarjetas de Regalo | Variable | Montos personalizados |

### Formato de Referencia de Pago
Utilizaremos el formato: `RES-YYMMDD-XXXXX`
- Ejemplo: `RES-260120-A3B5K`

### Validaciones Realizadas

Hemos verificado la conectividad con los endpoints del sandbox y confirmamos que:

✅ Endpoint de autenticación responde correctamente (HTTP 200)
   - URL: `http://test.bnb.com.bo/ClientAuthentication.API/api/v1/auth/token`

✅ Endpoints de Direct Debit están disponibles (HTTP 401 - requieren autenticación)
   - URL: `http://test.bnb.com.bo/DirectDebit/api/Services/GetQRFixedAmount`
   - URL: `http://test.bnb.com.bo/DirectDebit/api/Services/GetQRVariableAmount`

## Información de Contacto

**Empresa:** Resonancial - Terapia Resonancial
**Sitio web:** https://terapiaresonancial.com
**Contacto técnico:** [NOMBRE]
**Email:** [EMAIL]
**Teléfono:** [TELÉFONO]
**Ciudad:** [CIUDAD], Bolivia

## Documentación Adicional

Adjunto encontrarán:
1. Diagrama de flujo de integración (incluido arriba)
2. Lista de endpoints a utilizar

Quedamos a su disposición para cualquier información adicional que requieran
o para coordinar una llamada técnica si fuera necesario.

Agradecemos de antemano su atención y apoyo.

Saludos cordiales,

[NOMBRE]
Desarrollador - Resonancial
[EMAIL]
[TELÉFONO]
```

---

## Checklist Antes de Enviar

- [ ] Reemplazar [NOMBRE] con tu nombre completo
- [ ] Reemplazar [EMAIL] con tu correo electrónico de contacto
- [ ] Reemplazar [TELÉFONO] con tu número de teléfono
- [ ] Reemplazar [CIUDAD] con tu ciudad
- [ ] Verificar que la URL del sitio web sea correcta
- [ ] Opcional: Adjuntar NIT o documentación de la empresa si lo requieren

## Canales de Contacto BNB

- **Portal Open Banking:** https://www.bnb.com.bo/PortalBNB/Api/OpenBanking
- **Formulario de contacto:** Disponible en el portal
- **Email general:** (buscar en el portal de Open Banking)

## Notas Adicionales

Una vez que recibas las credenciales, configúralas en tu archivo `.env`:

```bash
BNB_ACCOUNT_ID=tu_account_id_recibido
BNB_AUTHORIZATION_ID=tu_authorization_id_recibido
BNB_API_SANDBOX=true
```

Luego ejecuta el script de prueba:

```bash
npx tsx scripts/test-bnb-api.ts
```
