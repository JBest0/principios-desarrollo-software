package versionB;

import comun.Item;
import comun.Pedido;

// (S) Responsabilidad unica: calcular el total
public class CalculadoraPedido {
    public double calcularTotal(Pedido pedido, EstrategiaDescuento descuento) {
        double total = 0;
        for (Item item : pedido.getItems()) {
            total += item.getPrecio() * item.getCantidad();
        }
        return descuento.aplicar(total);
    }
}
