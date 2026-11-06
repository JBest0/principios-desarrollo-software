package versionA;

import comun.Item;
import comun.Pedido;

// Version A: una sola clase con tres responsabilidades (viola S y O)
public class GestorPedidos {

    public double calcularTotal(Pedido pedido) {
        double total = 0;
        for (Item item : pedido.getItems()) {
            total += item.getPrecio() * item.getCantidad();
        }
        if (pedido.getTipoCliente().equals("VIP")) {
            total *= 0.9;
        } else if (pedido.getTipoCliente().equals("MAYORISTA")) {
            total *= 0.85;
        }
        return total;
    }

    public void guardarEnBaseDeDatos(Pedido pedido) {
        System.out.println("Guardando pedido " + pedido.getId());
    }

    public void enviarConfirmacion(Pedido pedido) {
        System.out.println("Enviando confirmacion a " + pedido.getCliente());
    }

    public void procesarPedido(Pedido pedido) {
        double total = calcularTotal(pedido);
        pedido.setTotal(total);
        guardarEnBaseDeDatos(pedido);
        enviarConfirmacion(pedido);
    }
}
