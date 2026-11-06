# Guion de la demo en vivo: GestorPedidos

**Duración:** 7–8 minutos (la Fase 3 es opcional si falta tiempo).
**Dónde va:** justo después de la diapositiva "Solución" del reto de extensión.
**Idea:** "llega un requerimiento nuevo del cliente" y lo aplicamos en vivo en las dos versiones. Después de cada cambio contamos cuánto código existente tuvimos que tocar.

---

## Antes de la clase

1. Verificar que Java funciona: `javac -version` en una terminal (JDK 17 o superior).
2. Abrir la carpeta `demo/` en VS Code y agrandar la letra (`Ctrl` + `+`, unas 3 veces).
3. Ejecutar `correr-a.bat`, `correr-b.bat`, `probar-a.bat` y `probar-b.bat` una vez para confirmar que todo pasa.
4. **Hacer commit del estado inicial de `demo/`.** El contador de la demo (`git status` / `git diff`) compara contra ese commit.
5. Tener abierta una terminal en `demo/` (en VS Code: Terminal → New Terminal).
6. Tener este guion a mano en otra pantalla o impreso.

En Windows se ejecuta con doble clic en los `.bat` o escribiendo `.\correr-a.bat` en la terminal. En Mac/Linux: `sh correr-a.sh`.

**Para volver al estado inicial después de ensayar o al terminar la clase:**
```
git checkout -- demo/
git clean -fd demo/
```
(`git clean` borra los archivos nuevos creados durante la demo; revisen con `git clean -nd demo/` primero si tienen dudas).

---

## Fase 0 — Mismo comportamiento, distinto diseño (1 min)

**Hacer:** ejecutar `correr-a` y luego `correr-b`.

**Salida esperada en ambas:**
```
Guardando pedido P-001
Enviando confirmacion a cliente@correo.com
Total final: 97200.0
```

**Decir:** "Para el usuario las dos versiones son idénticas, y es la misma salida que mostramos en el informe. La diferencia aparece cuando hay que cambiarlas."

Mostrar rápido el explorador de archivos: la Versión A es **un archivo** (`GestorPedidos.java`); la B son **varias clases pequeñas**.

---

## Fase 1 — "Necesitamos un descuento de estudiante" (principio O, 2 min)

### Versión A: el error a propósito

Abrir `versionA/GestorPedidos.java`. **Copiar y pegar** el bloque del VIP encima de sí mismo, cambiar solo el número a `0.85` y **"olvidar" cambiar `"VIP"` por `"ESTUDIANTE"`**:

```java
        if (pedido.getTipoCliente().equals("VIP")) {      // <- pegado, olvidamos cambiar el nombre
            total *= 0.85;
        }
        if (pedido.getTipoCliente().equals("VIP")) {
            total *= 0.9;
        } else if (pedido.getTipoCliente().equals("MAYORISTA")) {
            total *= 0.85;
        }
```

**Hacer:** ejecutar `probar-a`.

**Salida esperada:**
```
[OK]    Cliente normal paga 100
[FALLA] VIP paga 90 (10% desc.)  -> esperado 90.0, obtenido 76.5
[OK]    Mayorista paga 85 (15% desc.)
```

**Decir:** "Queríamos agregar estudiantes y rompimos a los clientes VIP, que ya funcionaban. Y fíjense que el estudiante ni siquiera tiene descuento todavía. Esto pasa porque tuvimos que meter la mano dentro de un método que ya estaba probado."

**Corregir** (borrar el bloque pegado y agregar la rama bien hecha):
```java
        } else if (pedido.getTipoCliente().equals("MAYORISTA")) {
            total *= 0.85;
        } else if (pedido.getTipoCliente().equals("ESTUDIANTE")) {
            total *= 0.85;
        }
```
En `versionA/Main.java` cambiar `"VIP"` por `"ESTUDIANTE"`. Ejecutar `correr-a` → `Total final: 91800.0`.

### Versión B: solo una clase nueva

Crear `versionB/DescuentoEstudiante.java`:
```java
package versionB;

public class DescuentoEstudiante implements EstrategiaDescuento {
    public double aplicar(double total) { return total * 0.85; }
}
```
En `versionB/Main.java` cambiar `new DescuentoVIP()` por `new DescuentoEstudiante()`.
Ejecutar `probar-b` (todo `[OK]`) y `correr-b` → `Total final: 91800.0`.

**Decir:** "Aquí es imposible romper el VIP: ni siquiera abrimos ese archivo."

### Contador
```
git status --short demo/
```
- Versión A: ` M versionA/GestorPedidos.java` → **se modificó la lógica existente**.
- Versión B: `?? versionB/DescuentoEstudiante.java` → **solo un archivo nuevo**.
- (Los dos `Main.java` cambian una palabra: es el código que *usa* el sistema, no la lógica.)

---

## Fase 2 — "Ahora hay que registrar cada pedido en un log" (principio S, 1.5 min)

**Versión A:** en `versionA/GestorPedidos.java`, dentro de `guardarEnBaseDeDatos`, agregar:
```java
        System.out.println("[LOG] pedido " + pedido.getId() + " por " + pedido.getTotal());
```

**Versión B:** la misma línea, pero en `versionB/RepositorioPedidos.java`, dentro de `guardar`.

Ejecutar `correr-a` y `correr-b`: aparece `[LOG] pedido P-001 por 91800.0`.

**Decir (con honestidad):** "Aquí las dos versiones cuestan lo mismo: una línea. La diferencia es **dónde**. En la A volvimos a abrir `GestorPedidos`, el mismo archivo que tiene los descuentos: cualquier cambio, del tema que sea, pasa por ahí. En la B tocamos un archivo que solo se encarga de guardar; los descuentos ni se abren. Eso es tener una sola razón para cambiar."

---

## Fase 3 (opcional) — "El cliente quiere SMS en vez de correo" (principio D, 2–3 min)

### El giro honesto

**Decir:** "Nuestra versión buena tenía un punto débil. `GestorPedidos` recibe un `NotificadorPedido`, que es una **clase concreta**, no una interfaz. Para cambiar a SMS, en la B también hay que modificar código."

**Versión A:** en `enviarConfirmacion`, cambiar el texto a `"Enviando SMS a "`. Una línea.

**Versión B:**

1. Crear `versionB/Notificador.java`:
```java
package versionB;

import comun.Pedido;

public interface Notificador {
    void enviarConfirmacion(Pedido pedido);
}
```
2. En `NotificadorPedido.java`: `public class NotificadorPedido implements Notificador {`
3. En `GestorPedidos.java`, cambiar el tipo `NotificadorPedido` por `Notificador` en el atributo y en el constructor (2 líneas).
4. Crear `versionB/NotificadorSMS.java`:
```java
package versionB;

import comun.Pedido;

public class NotificadorSMS implements Notificador {
    public void enviarConfirmacion(Pedido pedido) {
        System.out.println("Enviando SMS a " + pedido.getCliente());
    }
}
```
5. En `Main.java`: `new NotificadorPedido()` → `new NotificadorSMS()`.

Ejecutar `correr-b` → `Enviando SMS a cliente@correo.com`.

**Decir:** "Esta vez la B costó **más** que la A. Es exactamente la tensión Abierto/Cerrado vs. YAGNI que vimos en la balanza: no creamos la interfaz desde el principio porque no la necesitábamos; la creamos cuando apareció el **segundo caso real**."

### La recompensa

Crear `versionB/NotificadorWhatsApp.java` (copiar `NotificadorSMS` y cambiar el nombre y el texto). Cambiar el `Main` y ejecutar.

**Decir:** "Y ahora cualquier canal nuevo, WhatsApp, Telegram, lo que sea, cuesta **cero** líneas de código existente. En la A, cada canal nuevo es otra vez editar `GestorPedidos` y probablemente otro `if`."

### Bonus si sobra tiempo: probar sin enviar mensajes

Crear `versionB/NotificadorFalso.java`:
```java
package versionB;

import comun.Pedido;

public class NotificadorFalso implements Notificador {
    public int llamadas = 0;

    public void enviarConfirmacion(Pedido pedido) {
        llamadas++;
    }
}
```
En `versionB/Pruebas.java`, antes del último `System.out.println`, agregar:
```java
        NotificadorFalso falso = new NotificadorFalso();
        GestorPedidos gestor = new GestorPedidos(calc, new RepositorioPedidos(), falso);
        gestor.procesarPedido(pedidoDe100(), new DescuentoVIP());
        verificar("Se notifica una vez por pedido", 1, falso.llamadas);
```
Ejecutar `probar-b` → `[OK] Se notifica una vez por pedido`.

**Decir:** "Gracias a depender de una abstracción, podemos probar el `GestorPedidos` completo sin mandarle un correo real a nadie."

---

## Cierre

Pasar a la diapositiva **"Marcador final"**, que resume estos números (medidos al ensayar la demo):

| | Versión A | Versión B |
|---|---|---|
| Fase 1 · estudiante | edita `GestorPedidos` (+2 líneas) y rompe VIP | 1 clase nueva, 0 líneas existentes |
| Fase 2 · log | 1 línea en `GestorPedidos` | 1 línea en `RepositorioPedidos` |
| Fase 3 · SMS | 1 línea en `GestorPedidos` | 2 archivos existentes (3 líneas) + 2 nuevos |
| Canal nuevo (WhatsApp) | editar `GestorPedidos` otra vez | 0 líneas existentes |
| Pruebas rotas durante los cambios | 1 | 0 |

**Mensaje final:** "Un buen diseño no hace que todo cambio sea gratis. Hace que los cambios caigan en un solo lugar y que no rompan lo que ya funcionaba."
