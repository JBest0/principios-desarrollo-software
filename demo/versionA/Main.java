package versionA;

import comun.Item;
import comun.Pedido;

public class Main {
    public static void main(String[] args) {
        Pedido pedido = new Pedido("P-001", "cliente@correo.com", "VIP");
        pedido.agregarItem(new Item("Teclado mecanico", 45000, 2));
        pedido.agregarItem(new Item("Mouse inalambrico", 18000, 1));

        GestorPedidos gestor = new GestorPedidos();
        gestor.procesarPedido(pedido);
        System.out.println("Total final: " + pedido.getTotal());
    }
}
