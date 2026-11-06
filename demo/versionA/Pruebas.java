package versionA;

import comun.Item;
import comun.Pedido;

// Pruebas simples sin librerias: imprimen [OK] o [FALLA]
public class Pruebas {
    private static int fallas = 0;

    public static void main(String[] args) {
        GestorPedidos gestor = new GestorPedidos();

        verificar("Cliente normal paga 100", 100.0, gestor.calcularTotal(pedidoDe100("NORMAL")));
        verificar("VIP paga 90 (10% desc.)", 90.0, gestor.calcularTotal(pedidoDe100("VIP")));
        verificar("Mayorista paga 85 (15% desc.)", 85.0, gestor.calcularTotal(pedidoDe100("MAYORISTA")));

        System.out.println(fallas == 0 ? "\nTodas las pruebas pasan." : "\n" + fallas + " prueba(s) fallan.");
    }

    static Pedido pedidoDe100(String tipo) {
        Pedido p = new Pedido("T-1", "prueba@correo.com", tipo);
        p.agregarItem(new Item("Producto", 100, 1));
        return p;
    }

    static void verificar(String nombre, double esperado, double obtenido) {
        boolean ok = Math.abs(esperado - obtenido) < 0.001;
        if (!ok) fallas++;
        System.out.println((ok ? "[OK]    " : "[FALLA] ") + nombre
                + (ok ? "" : "  -> esperado " + esperado + ", obtenido " + obtenido));
    }
}
