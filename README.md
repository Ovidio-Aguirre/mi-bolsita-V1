# Mi Bolsita 💰 - App de Finanzas para la Economía Informal

## Descripción 📝

**Mi Bolsita** es una Progressive Web App (PWA) diseñada específicamente para ayudar a pequeños comerciantes y emprendedores de la economía informal en El Salvador a gestionar sus finanzas de manera sencilla y eficiente. Reemplaza el tradicional cuaderno de apuntes con una herramienta digital que automatiza cálculos, genera reportes, controla inventario, gestiona deudas y mucho más, todo desde su teléfono móvil, incluso sin conexión a internet.

El objetivo principal es empoderar a estos negocios con tecnología accesible, brindándoles control total sobre sus finanzas y ayudándoles a tomar mejores decisiones para su crecimiento.

---

## Características Principales ✨

* **Gestión Financiera Completa (CRUD):** Registro, visualización, edición y eliminación de ingresos y gastos.
* **Dashboard Interactivo:** Resumen financiero diario, gráficas de flujo de caja (últimos 7 días) y distribución de gastos por categoría, todo actualizado en tiempo real.
* **Inventario Inteligente (CRUD):** Gestión de productos (nombre, costo, venta, stock), actualización automática de stock con cada venta, escáner de código de barras para añadir productos.
* **Control de Deudas (CRUD):** Administración detallada de "Me Deben" (cuentas por cobrar) y "Yo Debo" (cuentas por pagar), con registro de abonos y cálculo de saldos pendientes.
* **Categorías Personalizables (CRUD):** Creación, renombrado y eliminación de categorías propias para ingresos y gastos.
* **Facturación (Comprobantes no Fiscales):** Generador de recibos de venta internos en formato PDF (tipo ticket), con soporte para múltiples productos por venta, descuentos (fijos o porcentaje), selección de método de pago y cálculo de cambio para efectivo.
* **Reportes Profesionales:** Exportación de datos a PDF y Excel para:
    * Estado de Resultados (Financiero) por período.
    * Reporte de Ventas por período.
    * Reporte de Inventario Actual.
    * Reporte de Deudas Pendientes.
* **Centro de Recordatorios:** Alertas automáticas para productos con bajo stock y deudas próximas a vencer.
* **Perfil del Negocio:** Configuración de datos del comercio (nombre, dirección, teléfono) para personalizar los comprobantes.
* **Funcionamiento Offline:** La mayoría de las funcionalidades están disponibles sin conexión a internet, con sincronización automática al recuperar la señal.
* **Instalable (PWA):** Se puede instalar en el escritorio o pantalla de inicio para una experiencia similar a una app nativa.
* **Interfaz Moderna y Responsiva:** Diseño limpio y adaptable a diferentes tamaños de pantalla (móvil y escritorio) usando Material-UI.

---

## Stack Tecnológico 🛠️

* **Frontend:** React.js + TypeScript + Vite
* **UI Framework:** Material-UI (MUI)
* **Backend & Base de Datos:** Firebase (Authentication, Firestore, Hosting)
* **Generación de PDF:** `jspdf`, `jspdf-autotable`
* **Manejo de Excel:** `xlsx` (SheetJS)
* **Escáner de Código de Barras:** `@zxing/library`
* **Notificaciones:** `react-hot-toast`

---

## Instalación y Configuración Local ⚙️

1.  **Clonar el repositorio:**
    ```bash
    git clone [https://github.com/tu-usuario/mi-bolsita.git](https://github.com/tu-usuario/mi-bolsita.git)
    cd mi-bolsita
    ```
2.  **Instalar dependencias:**
    ```bash
    npm install
    ```
3.  **Configurar Firebase:**
    * Crea un proyecto en [Firebase Console](https://console.firebase.google.com/).
    * Habilita los servicios: Authentication (con proveedor Google y Correo/Contraseña), Firestore Database, Hosting.
    * Registra una aplicación web en la configuración de tu proyecto.
    * Copia tus credenciales de configuración (`firebaseConfig`).
    * Crea el archivo `src/services/firebaseConfig.ts` y pega tus credenciales reemplazando los placeholders:
        ```typescript
        // src/services/firebaseConfig.ts
        import { initializeApp } from "firebase/app";
        import { getAuth } from "firebase/auth";
        import { getFirestore } from "firebase/firestore";
        // import { getStorage } from "firebase/storage"; // Si usaras Storage

        const firebaseConfig = {
          apiKey: "TU_API_KEY",
          authDomain: "TU_AUTH_DOMAIN",
          projectId: "TU_PROJECT_ID",
          storageBucket: "TU_STORAGE_BUCKET",
          messagingSenderId: "TU_MESSAGING_SENDER_ID",
          appId: "TU_APP_ID"
        };

        const app = initializeApp(firebaseConfig);
        export const auth = getAuth(app);
        export const db = getFirestore(app);
        // export const storage = getStorage(app); // Si usaras Storage
        ```
4.  **Ejecutar en modo desarrollo:**
    ```bash
    npm run dev
    ```
    Abre `http://localhost:5173` (o el puerto indicado) en tu navegador.

---

## Uso Básico 🚀

1.  **Registro/Login:** Accede usando tu cuenta de Google.
2.  **Configuración Inicial:** Ve a "Configuración" y rellena el "Perfil del Negocio". Crea tus categorías de Ingreso y Gasto.
3.  **Inventario:** Ve a "Inventario" y añade tus productos manualmente o usando el escáner de código de barras. Puedes importar desde Excel si tienes un archivo con las columnas: `Nombre`, `Costo`, `Venta`, `Stock`, `CodigoBarras`.
4.  **Registrar Movimientos:** Desde la página principal (`/home`), usa los botones flotantes (+) o (-) para registrar ingresos o gastos simples, o ventas de inventario (multi-producto).
5.  **Gestionar Deudas:** Ve a "Deudas" para registrar cuentas por cobrar o pagar. Haz clic en una deuda para añadir abonos o eliminarla.
6.  **Facturación:** Ve a "Facturación" para crear un "Comprobante de Pago" a partir de una venta multi-producto.
7.  **Reportes:** Ve a "Reportes" para generar y descargar análisis en PDF o Excel.
8.  **Recordatorios:** Consulta la sección "Recordatorios" para ver alertas de stock bajo o deudas por vencer.

---

## Despliegue 🌐

La aplicación está configurada para un despliegue sencillo usando **Vercel**:

1.  **Compilar para producción:**
    ```bash
    npm run build
    ```
2.  **Subir a GitHub:** Asegúrate de que tu repositorio esté actualizado.
    ```bash
    git add .
    git commit -m "Preparar para despliegue"
    git push origin main
    ```
3.  **Conectar a Vercel:** Importa tu repositorio de GitHub en Vercel y haz clic en "Deploy". Vercel detectará la configuración de Vite automáticamente.
4.  **Configurar Dominios Autorizados en Firebase:** Añade tu dominio de Vercel (ej: `mi-bolsita.vercel.app`) a la lista de dominios autorizados en la configuración de Authentication en Firebase.
5.  **Añadir `vercel.json`:** Asegúrate de tener el archivo `vercel.json` en la raíz del proyecto para manejar las rutas de la SPA:
    ```json
    {
      "rewrites": [
        {
          "source": "/(.*)",
          "destination": "/index.html"
        }
      ]
    }
    ```

---

## Futuras Mejoras (Roadmap) 🚀

* [ ] Implementar el Módulo de **Metas y Ahorros**.
* [ ] Añadir opción para **Enviar Comprobantes por Correo Electrónico** (vía Cloud Function).
* [ ] Implementar **Presupuestos por Categoría**.
* [ ] Crear un **Directorio de Clientes y Proveedores (Mini-CRM)**.
* [ ] Desarrollar un modo **Punto de Venta (POS) Rápido con Escáner**.
* [ ] Investigar/Implementar **Bot de WhatsApp** para pedidos.
* [ ] Añadir **Análisis Proactivo** en el dashboard.

---
